import { type NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

/**
 * Checkout endpoint
 * Creates a Polar checkout session for the cart items
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitResponse = await checkRateLimit(rateLimiters.checkout, ip);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { items, email, successUrl } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 });
    }

    // Create Polar checkout
    const checkout = await polar.checkouts.create({
      products: items.map((item: { polarProductId: string }) => item.polarProductId),
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
      customerEmail: email,
    });

    return NextResponse.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
