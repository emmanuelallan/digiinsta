/**
 * Polar Webhook Handler
 *
 * Handles webhook events from Polar for order fulfillment.
 * Migrated from Payload CMS to Sanity CMS with Neon PostgreSQL.
 *
 * Requirements: 6.1 - Order creation from Polar webhooks
 */

import { type NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { logger } from "@/lib/logger";
import { sendEmail, emailTemplates } from "@/lib/email";
import {
  processOrder,
  getOrderByPolarId,
  updateOrderStatus,
  getOrderItems,
  type PolarOrderData,
} from "@/lib/orders/processor";

// Webhook event types we handle
type WebhookEvent = {
  type: string;
  data: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("POLAR_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    const body = await request.text();

    // Validate the webhook signature
    let event: WebhookEvent;
    try {
      event = validateEvent(body, Object.fromEntries(request.headers), webhookSecret);
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        logger.error({ error: error.message }, "Webhook signature verification failed");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      throw error;
    }

    logger.info({ eventType: event.type }, "Received Polar webhook");

    // Handle different event types
    switch (event.type) {
      case "checkout.updated":
        await handleCheckoutUpdated(event.data);
        break;

      case "checkout.failed":
        await handleCheckoutFailed(event.data);
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

      case "order.failed":
        await handleOrderFailed(event.data);
        break;

      default:
        logger.info({ eventType: event.type }, "Unhandled event type");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ error }, "Webhook processing error");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Handle checkout.updated event
 * Track checkout progress for analytics
 */
async function handleCheckoutUpdated(data: Record<string, unknown>) {
  const checkoutId = data.id as string;
  const status = data.status as string;

  logger.info({ checkoutId, status }, "Checkout updated");

  // Track for analytics - could store in a checkouts collection for abandonment tracking
}

/**
 * Handle order.created event
 * Order has been created but not yet paid
 */
async function handleOrderCreated(data: Record<string, unknown>) {
  const orderId = data.id as string;
  const customer = data.customer as Record<string, unknown> | undefined;
  const customerEmail = customer?.email as string;

  logger.info({ orderId, customerEmail }, "Order created (pending payment)");
}

/**
 * Handle order.paid event
 * Payment confirmed - create order in database and send emails
 */
async function handleOrderPaid(data: Record<string, unknown>) {
  const polarOrderId = data.id as string;
  const customer = data.customer as Record<string, unknown> | undefined;
  const customerEmail = customer?.email as string;
  const metadata = data.metadata as Record<string, string> | undefined;
  const totalAmount = (data.amount as number | undefined) ?? 0;
  const currency = (data.currency as string | undefined) ?? "usd";

  logger.info({ polarOrderId, customerEmail, totalAmount }, "Order paid - processing fulfillment");

  // Build order data for processing
  const orderData: PolarOrderData = {
    id: polarOrderId,
    checkoutId: metadata?.checkoutId,
    customer: { email: customerEmail },
    amount: totalAmount,
    currency,
    metadata,
  };

  // Process the order (creates records in Neon, tracks analytics)
  const result = await processOrder(orderData);

  if (!result.success) {
    logger.error({ polarOrderId, error: result.error }, "Failed to process order");
    throw new Error(result.error);
  }

  if (result.alreadyExists) {
    logger.info({ polarOrderId }, "Order already processed, skipping emails");
    return;
  }

  // Get order items for email
  if (result.orderId) {
    const orderItems = await getOrderItems(result.orderId);

    // Send emails asynchronously (don't block webhook response)
    sendFulfillmentEmails(result.orderId, customerEmail, orderItems, totalAmount, currency).catch(
      (error) => {
        logger.error({ error, orderId: result.orderId }, "Failed to send fulfillment emails");
      }
    );
  }
}

/**
 * Send fulfillment emails (receipt + download links)
 */
async function sendFulfillmentEmails(
  orderId: number,
  email: string,
  items: Array<{
    id: number;
    title: string;
    fileKey: string | null;
  }>,
  totalAmount: number,
  currency: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.digiinsta.store";
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(totalAmount / 100);

  // Send purchase receipt
  const receiptTemplate = emailTemplates.purchaseReceipt(
    String(orderId),
    items.map((item) => item.title),
    formattedTotal
  );

  await sendEmail({
    to: email,
    subject: receiptTemplate.subject,
    html: receiptTemplate.html,
    from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "notifications.digiinsta.store"}>`,
  });

  logger.info({ orderId, email }, "Purchase receipt email sent");

  // Send download email with links for each item that has a file
  for (const item of items) {
    if (!item.fileKey) continue;

    // Generate download URL (points to our secure download endpoint)
    const downloadUrl = `${appUrl}/api/download/${orderId}/${item.id}?email=${encodeURIComponent(email)}`;

    const downloadTemplate = emailTemplates.downloadEmail(item.title, downloadUrl, "30 days");

    await sendEmail({
      to: email,
      subject: downloadTemplate.subject,
      html: downloadTemplate.html,
      from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "notifications.digiinsta.store"}>`,
    });

    logger.info({ orderId, email, itemTitle: item.title }, "Download email sent");
  }
}

/**
 * Handle order.refunded event
 * Update order status and notify customer
 */
async function handleOrderRefunded(data: Record<string, unknown>) {
  const polarOrderId = data.id as string;
  const customer = data.customer as Record<string, unknown> | undefined;
  const customerEmail = customer?.email as string;

  logger.info({ polarOrderId, customerEmail }, "Order refunded");

  // Find and update the order
  const order = await getOrderByPolarId(polarOrderId);

  if (order) {
    await updateOrderStatus(order.id, "refunded");
    logger.info({ orderId: order.id, polarOrderId }, "Order marked as refunded");

    // Send refund notification email
    const refundTemplate = emailTemplates.refundProcessed(order.id);

    await sendEmail({
      to: customerEmail,
      subject: refundTemplate.subject,
      html: refundTemplate.html,
      from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "notifications.digiinsta.store"}>`,
    });

    logger.info({ orderId: order.id, email: customerEmail }, "Refund notification email sent");
  }
}

/**
 * Handle checkout.failed event
 * Payment failed during checkout - send retry email
 */
async function handleCheckoutFailed(data: Record<string, unknown>) {
  const checkoutId = data.id as string;
  const customer = data.customer as Record<string, unknown> | undefined;
  const customerEmail = customer?.email as string | undefined;
  const checkoutUrl = data.url as string | undefined;

  logger.info({ checkoutId, customerEmail }, "Checkout failed");

  if (!customerEmail) {
    logger.warn({ checkoutId }, "No customer email for failed checkout");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.digiinsta.store";
  const retryUrl = checkoutUrl ?? `${appUrl}/cart`;

  const failedTemplate = emailTemplates.failedPayment(checkoutId, retryUrl);

  await sendEmail({
    to: customerEmail,
    subject: failedTemplate.subject,
    html: failedTemplate.html,
    from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "notifications.digiinsta.store"}>`,
  });

  logger.info({ checkoutId, customerEmail }, "Failed payment email sent");
}

/**
 * Handle order.failed event
 * Order payment failed - send retry email
 */
async function handleOrderFailed(data: Record<string, unknown>) {
  const orderId = data.id as string;
  const customer = data.customer as Record<string, unknown> | undefined;
  const customerEmail = customer?.email as string | undefined;

  logger.info({ orderId, customerEmail }, "Order failed");

  if (!customerEmail) {
    logger.warn({ orderId }, "No customer email for failed order");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.digiinsta.store";
  const retryUrl = `${appUrl}/cart`;

  const failedTemplate = emailTemplates.failedPayment(orderId, retryUrl);

  await sendEmail({
    to: customerEmail,
    subject: failedTemplate.subject,
    html: failedTemplate.html,
    from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "notifications.digiinsta.store"}>`,
  });

  logger.info({ orderId, customerEmail }, "Failed order email sent");
}
