/**
 * Polar Webhook Handler
 * Handles webhook events from Polar for order fulfillment
 */

import { type NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";

// Webhook event types we handle
type WebhookEvent = {
  type: string;
  data: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("POLAR_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    // Get the raw body for signature verification
    const body = await request.text();

    // Validate the webhook signature
    let event: WebhookEvent;
    try {
      event = validateEvent(body, Object.fromEntries(request.headers), webhookSecret);
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error("Webhook signature verification failed:", error.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      throw error;
    }

    console.log(`Received Polar webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.updated":
        await handleCheckoutUpdated(event.data);
        break;

      case "order.created":
        await handleOrderCreated(event.data);
        break;

      case "order.paid":
        await handleOrderPaid(event.data);
        break;

      case "order.refunded":
        await handleOrderRefunded(event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Handle checkout.updated event
 * Track checkout progress and abandoned carts
 */
async function handleCheckoutUpdated(data: Record<string, unknown>) {
  const checkoutId = data.id as string;
  const status = data.status as string;

  console.log(`Checkout ${checkoutId} updated to status: ${status}`);

  // You can track checkout status for analytics
  // Status can be: open, expired, confirmed, succeeded
}

/**
 * Handle order.created event
 * Order has been created but not yet paid
 */
async function handleOrderCreated(data: Record<string, unknown>) {
  const orderId = data.id as string;
  const customerEmail = (data.customer as Record<string, unknown>)?.email as string;

  console.log(`Order ${orderId} created for ${customerEmail}`);

  // You can create a pending order record in your database
}

/**
 * Handle order.paid event
 * This is the main event - payment confirmed, deliver the product
 */
async function handleOrderPaid(data: Record<string, unknown>) {
  const orderId = data.id as string;
  const customer = data.customer as Record<string, unknown>;
  const customerEmail = customer?.email as string;
  const metadata = data.metadata as Record<string, string> | undefined;

  console.log(`Order ${orderId} paid by ${customerEmail}`);

  // Parse the items from metadata (we stored this during checkout)
  let purchasedItems: Array<{
    productId: number;
    type: "product" | "bundle";
    polarProductId: string;
  }> = [];

  if (metadata?.items) {
    try {
      purchasedItems = JSON.parse(metadata.items);
    } catch (e) {
      console.error("Failed to parse items metadata:", e);
    }
  }

  // TODO: Implement your fulfillment logic here
  // Options:
  // 1. Send download links via email using Resend
  // 2. Grant access in your database
  // 3. Create license keys
  // 4. Polar handles file delivery automatically if you've set up benefits

  console.log("Purchased items:", purchasedItems);

  // Example: Send confirmation email with download links
  // await sendOrderConfirmationEmail({
  //   to: customerEmail,
  //   orderId,
  //   items: purchasedItems,
  // });
}

/**
 * Handle order.refunded event
 * Revoke access if needed
 */
async function handleOrderRefunded(data: Record<string, unknown>) {
  const orderId = data.id as string;
  const customerEmail = (data.customer as Record<string, unknown>)?.email as string;

  console.log(`Order ${orderId} refunded for ${customerEmail}`);

  // TODO: Implement refund logic
  // - Revoke download access
  // - Update order status in your database
  // - Send refund confirmation email
}
