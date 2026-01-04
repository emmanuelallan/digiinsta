/**
 * Polar Webhook Handler
 * Handles webhook events from Polar for order fulfillment
 */

import { type NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { getPayload } from "payload";
import config from "@payload-config";
import { logger } from "@/lib/logger";
import { sendEmail, emailTemplates } from "@/lib/email";

// Webhook event types we handle
type WebhookEvent = {
  type: string;
  data: Record<string, unknown>;
};

// Parsed item from checkout metadata
interface PurchasedItem {
  productId: number;
  type: "product" | "bundle";
  polarProductId: string;
}

// Order item for database
interface OrderItem {
  type: "product" | "bundle";
  productId?: number;
  bundleId?: number;
  title: string;
  fileKey: string;
  maxDownloads: number;
  downloadsUsed: number;
}

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
  const customerEmail = (data.customer as Record<string, unknown>)?.email as string;

  logger.info({ orderId, customerEmail }, "Order created (pending payment)");
}

/**
 * Handle order.paid event
 * Payment confirmed - create order in database and send emails
 */
async function handleOrderPaid(data: Record<string, unknown>) {
  const polarOrderId = data.id as string;
  const customer = data.customer as Record<string, unknown>;
  const customerEmail = customer?.email as string;
  const metadata = data.metadata as Record<string, string> | undefined;
  const totalAmount = (data.amount as number) ?? 0;
  const currency = (data.currency as string) ?? "usd";

  logger.info({ polarOrderId, customerEmail, totalAmount }, "Order paid - processing fulfillment");

  const payload = await getPayload({ config });

  // Mark checkout as completed (for cart abandonment tracking)
  if (metadata?.checkoutId) {
    try {
      const checkouts = await payload.find({
        collection: "checkouts",
        where: { polarCheckoutId: { equals: metadata.checkoutId } },
        limit: 1,
      });
      const checkout = checkouts.docs[0];
      if (checkout) {
        await payload.update({
          collection: "checkouts",
          id: checkout.id,
          data: { completed: true },
        });
      }
    } catch (e) {
      logger.warn({ error: e }, "Failed to mark checkout as completed");
    }
  }

  // Check if order already exists (idempotency)
  const existingOrder = await payload.find({
    collection: "orders",
    where: { polarOrderId: { equals: polarOrderId } },
    limit: 1,
  });

  if (existingOrder.docs.length > 0) {
    logger.info({ polarOrderId }, "Order already exists, skipping creation");
    return;
  }

  // Parse purchased items from metadata
  let purchasedItems: PurchasedItem[] = [];
  if (metadata?.items) {
    try {
      purchasedItems = JSON.parse(metadata.items);
    } catch (e) {
      logger.error({ error: e, metadata }, "Failed to parse items metadata");
    }
  }

  if (purchasedItems.length === 0) {
    logger.error({ polarOrderId }, "No items found in order metadata");
    return;
  }

  // Build order items with product details
  const orderItems: OrderItem[] = [];
  let primaryCreatorId: number | null = null;

  for (const item of purchasedItems) {
    try {
      if (item.type === "product") {
        const product = await payload.findByID({
          collection: "products",
          id: item.productId,
          depth: 1,
        });

        if (product) {
          // Get file key from the product's file upload
          const file = product.file as { filename?: string } | number | null;
          const fileKey = typeof file === "object" && file?.filename ? file.filename : "";

          orderItems.push({
            type: "product",
            productId: product.id,
            title: product.title,
            fileKey,
            maxDownloads: 5,
            downloadsUsed: 0,
          });

          // Track creator for revenue attribution (use first product's creator)
          if (!primaryCreatorId && product.createdBy) {
            primaryCreatorId =
              typeof product.createdBy === "object"
                ? (product.createdBy as { id: number }).id
                : (product.createdBy as number);
          }
        }
      } else if (item.type === "bundle") {
        const bundle = await payload.findByID({
          collection: "bundles",
          id: item.productId,
          depth: 2,
        });

        if (bundle) {
          // For bundles, add each product as a separate item
          const products = bundle.products as Array<{
            id: number;
            title: string;
            file?: { filename?: string } | number;
            createdBy?: { id: number } | number;
          }>;

          for (const product of products) {
            const file = product.file;
            const fileKey = typeof file === "object" && file?.filename ? file.filename : "";

            orderItems.push({
              type: "bundle",
              bundleId: bundle.id,
              productId: product.id,
              title: product.title,
              fileKey,
              maxDownloads: 5,
              downloadsUsed: 0,
            });
          }

          // Track creator
          if (!primaryCreatorId && bundle.createdBy) {
            primaryCreatorId =
              typeof bundle.createdBy === "object"
                ? (bundle.createdBy as { id: number }).id
                : (bundle.createdBy as number);
          }
        }
      }
    } catch (error) {
      logger.error({ error, item }, "Failed to fetch product/bundle details");
    }
  }

  if (orderItems.length === 0) {
    logger.error({ polarOrderId }, "No valid items found for order");
    return;
  }

  // Create order in database
  try {
    const order = await payload.create({
      collection: "orders",
      data: {
        polarOrderId,
        polarCheckoutId: metadata?.checkoutId || null,
        email: customerEmail,
        status: "completed",
        items: orderItems,
        totalAmount,
        currency,
        fulfilled: false,
        createdBy: primaryCreatorId || undefined,
        expiresAt: null, // No expiration by default
      },
    });

    logger.info({ orderId: order.id, polarOrderId }, "Order created in database");

    // Send emails asynchronously (don't block webhook response)
    sendFulfillmentEmails(order.id, customerEmail, orderItems, totalAmount, currency).catch(
      (error) => {
        logger.error({ error, orderId: order.id }, "Failed to send fulfillment emails");
      }
    );

    // Mark order as fulfilled
    await payload.update({
      collection: "orders",
      id: order.id,
      data: { fulfilled: true },
    });
  } catch (error) {
    logger.error({ error, polarOrderId }, "Failed to create order in database");
    throw error; // Re-throw to trigger webhook retry
  }
}

/**
 * Send fulfillment emails (receipt + download links)
 */
async function sendFulfillmentEmails(
  orderId: number,
  email: string,
  items: OrderItem[],
  totalAmount: number,
  currency: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
    from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`,
  });

  logger.info({ orderId, email }, "Purchase receipt email sent");

  // Send download email with links for each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || !item.fileKey) continue;

    // Generate download URL (points to our secure download endpoint)
    const downloadUrl = `${appUrl}/api/download/${orderId}/${i}?email=${encodeURIComponent(email)}`;

    const downloadTemplate = emailTemplates.downloadEmail(item.title, downloadUrl, "30 days");

    await sendEmail({
      to: email,
      subject: downloadTemplate.subject,
      html: downloadTemplate.html,
      from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`,
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
  const customerEmail = (data.customer as Record<string, unknown>)?.email as string;

  logger.info({ polarOrderId, customerEmail }, "Order refunded");

  const payload = await getPayload({ config });

  // Find and update the order
  const existingOrder = await payload.find({
    collection: "orders",
    where: { polarOrderId: { equals: polarOrderId } },
    limit: 1,
  });

  if (existingOrder.docs.length > 0) {
    const order = existingOrder.docs[0];
    if (!order) return;

    await payload.update({
      collection: "orders",
      id: order.id,
      data: { status: "refunded" },
    });

    logger.info({ orderId: order.id, polarOrderId }, "Order marked as refunded");

    // Send refund notification email
    await sendEmail({
      to: customerEmail,
      subject: `Refund Processed - Order ${order.id}`,
      html: `
        <h1>Refund Processed</h1>
        <p>Your refund for order <strong>${order.id}</strong> has been processed.</p>
        <p>The funds should appear in your account within 5-10 business days.</p>
        <p>If you have any questions, please contact our support team.</p>
      `,
      from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`,
    });
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store";
  const retryUrl = checkoutUrl || `${appUrl}/cart`;

  const failedTemplate = emailTemplates.failedPayment(checkoutId, retryUrl);

  await sendEmail({
    to: customerEmail,
    subject: failedTemplate.subject,
    html: failedTemplate.html,
    from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`,
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store";
  const retryUrl = `${appUrl}/cart`;

  const failedTemplate = emailTemplates.failedPayment(orderId, retryUrl);

  await sendEmail({
    to: customerEmail,
    subject: failedTemplate.subject,
    html: failedTemplate.html,
    from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`,
  });

  logger.info({ orderId, customerEmail }, "Failed order email sent");
}
