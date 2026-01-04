import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { generateSignedDownloadUrl } from "@/lib/download";
import { logger } from "@/lib/logger";

/**
 * Secure file download endpoint
 * Verifies ownership, expiration, and download limits
 * Generates signed R2 URL and redirects
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string; itemId: string }> },
) {
  try {
    const { orderId, itemId } = await params;

    // Validate params exist
    if (!orderId || !itemId) {
      return NextResponse.json(
        { error: "Invalid request - missing orderId or itemId" },
        { status: 400 },
      );
    }

    // Validate orderId format (basic check)
    if (orderId.length < 1 || orderId.length > 100) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config });

    // Get user from Payload auth or email from query (for guest checkout)
    const { getCurrentUser } = await import("@/lib/auth/payload");
    const user = await getCurrentUser();
    const emailFromQuery = request.nextUrl.searchParams.get("email");

    // For authenticated users, use their email
    // For guests, require email in query
    const email = user?.email || emailFromQuery;
    if (!email) {
      return NextResponse.json(
        { error: "Authentication required or email must be provided" },
        { status: 401 },
      );
    }

    // Fetch order
    // Note: Type assertion needed until Payload types are generated (run dev first)
    const orderDoc = await payload.findByID({
      collection: "orders" as any,
      id: orderId,
    });

    // Type assertion - Payload types will be generated after first dev run
    const order = orderDoc as unknown as {
      id: string;
      email: string;
      status: string;
      expiresAt?: string | null;
      items: Array<{
        id?: string;
        fileKey: string;
        downloadsUsed: number;
        maxDownloads: number;
        title: string;
      }>;
    };

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    if (order.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify order status
    if (order.status !== "completed") {
      return NextResponse.json(
        { error: "Order not completed" },
        { status: 400 },
      );
    }

    // Check expiration
    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Order has expired" }, { status: 400 });
    }

    // Find the item by index or ID
    // Items in Payload arrays don't have IDs, so we use index
    const itemIndex = parseInt(itemId, 10);
    if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= order.items.length) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = order.items[itemIndex];

    // Safety check (should never happen after bounds check above)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check download limits
    if (item.downloadsUsed >= item.maxDownloads) {
      return NextResponse.json(
        { error: "Download limit exceeded" },
        { status: 400 },
      );
    }

    // Generate signed URL
    const signedUrl = await generateSignedDownloadUrl(item.fileKey, 3600); // 1 hour expiry

    if (!signedUrl) {
      logger.error(
        { orderId, itemId, fileKey: item.fileKey },
        "Failed to generate signed URL",
      );
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 },
      );
    }

    // Increment download counter (async, don't block)
    payload
      .update({
        collection: "orders" as any,
        id: orderId,
        data: {
          items: order.items.map((i, index: number) => {
            if (index === itemIndex) {
              return {
                ...i,
                downloadsUsed: (i.downloadsUsed || 0) + 1,
              };
            }
            return i;
          }),
        },
      })
      .catch((error) => {
        logger.error(
          { error, orderId, itemId },
          "Failed to increment download counter",
        );
      });

    logger.info(
      { orderId, itemId, email, userId: user?.id || "guest" },
      "Download generated",
    );

    // Redirect to signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    logger.error({ error }, "Download error");
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
