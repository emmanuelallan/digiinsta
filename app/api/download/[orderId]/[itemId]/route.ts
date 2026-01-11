/**
 * Secure File Download API Route
 *
 * Verifies order ownership, checks download limits, and generates
 * presigned R2 URLs for secure file downloads.
 *
 * Requirements: 12.2, 12.4
 */

import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { generateDownloadUrl } from "@/lib/storage/download";
import { trackDownload, canDownload } from "@/lib/downloads/tracker";
import { logger } from "@/lib/logger";

interface OrderWithItem {
  orderId: number;
  orderEmail: string;
  orderStatus: string;
  itemId: number;
  fileKey: string | null;
  title: string;
  downloadsUsed: number;
  maxDownloads: number;
}

/**
 * GET /api/download/[orderId]/[itemId]
 *
 * Downloads a purchased file. Requires email verification via query param.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string; itemId: string }> }
) {
  try {
    const { orderId, itemId } = await params;

    // Validate params exist
    if (!orderId || !itemId) {
      return NextResponse.json(
        { error: "Invalid request - missing orderId or itemId" },
        { status: 400 }
      );
    }

    // Parse IDs
    const orderIdNum = parseInt(orderId, 10);
    const itemIdNum = parseInt(itemId, 10);

    if (isNaN(orderIdNum) || isNaN(itemIdNum)) {
      return NextResponse.json({ error: "Invalid order or item ID format" }, { status: 400 });
    }

    // Get email from query param (for guest checkout verification)
    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for download verification" },
        { status: 401 }
      );
    }

    // Fetch order and item in a single query
    const result = await sql`
      SELECT 
        o.id as order_id,
        o.email as order_email,
        o.status as order_status,
        oi.id as item_id,
        oi.file_key,
        oi.title,
        oi.downloads_used,
        oi.max_downloads
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ${orderIdNum}
        AND oi.id = ${itemIdNum}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Order or item not found" }, { status: 404 });
    }

    const row = result[0] as {
      order_id: number;
      order_email: string;
      order_status: string;
      item_id: number;
      file_key: string | null;
      title: string;
      downloads_used: number;
      max_downloads: number;
    };

    const orderData: OrderWithItem = {
      orderId: row.order_id,
      orderEmail: row.order_email,
      orderStatus: row.order_status,
      itemId: row.item_id,
      fileKey: row.file_key,
      title: row.title,
      downloadsUsed: row.downloads_used,
      maxDownloads: row.max_downloads,
    };

    // Verify ownership (case-insensitive email comparison)
    if (orderData.orderEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify order status
    if (orderData.orderStatus !== "completed") {
      return NextResponse.json({ error: "Order not completed" }, { status: 400 });
    }

    // Check if file exists
    if (!orderData.fileKey) {
      return NextResponse.json({ error: "No file associated with this item" }, { status: 404 });
    }

    // Check download limits
    const eligibility = await canDownload(itemIdNum);

    if (!eligibility.canDownload) {
      return NextResponse.json(
        {
          error: eligibility.reason || "Download limit exceeded",
          downloadsUsed: eligibility.downloadsUsed,
          maxDownloads: eligibility.maxDownloads,
        },
        { status: 400 }
      );
    }

    // Generate presigned download URL (1 hour expiration)
    const downloadResult = await generateDownloadUrl(orderData.fileKey);

    // Track the download (increment counter)
    const trackResult = await trackDownload(itemIdNum);

    logger.info(
      {
        orderId: orderIdNum,
        itemId: itemIdNum,
        email,
        fileKey: orderData.fileKey,
        downloadsUsed: trackResult.downloadsUsed,
        maxDownloads: trackResult.maxDownloads,
      },
      "Download generated"
    );

    // Return download URL and metadata
    return NextResponse.json({
      downloadUrl: downloadResult.presignedUrl,
      expiresAt: downloadResult.expiresAt.toISOString(),
      title: orderData.title,
      downloadsUsed: trackResult.downloadsUsed,
      maxDownloads: trackResult.maxDownloads,
      remainingDownloads: trackResult.remainingDownloads,
    });
  } catch (error) {
    logger.error({ error }, "Download error");
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
