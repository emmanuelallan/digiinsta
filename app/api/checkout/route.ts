/**
 * Checkout API Route
 * Creates Polar checkout sessions for cart items
 */

import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Polar } from "@polar-sh/sdk";
import { getPayload } from "payload";
import config from "@payload-config";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";

// Initialize Polar client
function getPolarClient() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured");
  }

  return new Polar({
    accessToken,
    server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  });
}

interface CheckoutItem {
  polarProductId: string;
  productId: number;
  type: "product" | "bundle";
  title?: string;
  price?: number;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(rateLimiters.checkout, ip);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: CheckoutRequest = await request.json();
    const { items, customerEmail, metadata } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Validate Polar product IDs
    const invalidItems = items.filter((item) => !item.polarProductId);
    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: "Some items are missing Polar product IDs" },
        { status: 400 }
      );
    }

    // Get Polar client
    const polar = getPolarClient();

    // Get DataFast tracking cookies for revenue attribution
    const cookieStore = await cookies();
    const datafastVisitorId = cookieStore.get("datafast_visitor_id")?.value;
    const datafastSessionId = cookieStore.get("datafast_session_id")?.value;

    // Extract Polar product IDs
    const productIds = items.map((item) => item.polarProductId);

    // Build metadata for webhook processing
    const checkoutMetadata: Record<string, string> = {
      ...metadata,
      // Store product info for webhook processing
      items: JSON.stringify(
        items.map((item) => ({
          productId: item.productId,
          type: item.type,
          polarProductId: item.polarProductId,
        }))
      ),
      // DataFast tracking for revenue attribution
      ...(datafastVisitorId && { datafast_visitor_id: datafastVisitorId }),
      ...(datafastSessionId && { datafast_session_id: datafastSessionId }),
    };

    // Get success URL - use www subdomain to avoid redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.digiinsta.store";

    // Create Polar checkout session
    const checkout = await polar.checkouts.create({
      products: productIds,
      customerEmail,
      metadata: checkoutMetadata,
      successUrl: `${appUrl}/checkout/success?checkout_id={CHECKOUT_ID}`,
    });

    // Track checkout for cart abandonment emails
    try {
      const payload = await getPayload({ config });
      const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);

      await payload.create({
        collection: "checkouts" as const,
        data: {
          polarCheckoutId: checkout.id,
          email: customerEmail || undefined,
          items: items.map((item) => ({
            type: item.type as "product" | "bundle",
            productId: item.productId,
            title: item.title || `Product ${item.productId}`,
            price: item.price || 0,
          })),
          totalAmount,
          completed: false,
          abandonmentEmailSent: false,
          checkoutUrl: checkout.url,
        },
      });
    } catch (trackingError) {
      // Don't fail checkout if tracking fails
      console.error("Failed to track checkout for abandonment:", trackingError);
    }

    return NextResponse.json({
      checkoutId: checkout.id,
      checkoutUrl: checkout.url,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for auth errors
      if (error.message.includes("401") || error.message.includes("invalid_token")) {
        return NextResponse.json(
          { error: "Payment service authentication failed. Please contact support." },
          { status: 503 }
        );
      }

      // Check for missing config
      if (error.message.includes("POLAR_ACCESS_TOKEN")) {
        return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
