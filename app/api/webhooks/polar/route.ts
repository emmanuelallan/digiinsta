import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import crypto from "crypto";
import { logger } from "@/lib/logger";
import { sendEmail, emailTemplates } from "@/lib/email";
import { env } from "@/lib/env";

/**
 * Polar.sh webhook handler
 * Handles checkout.completed and checkout.failed events
 * Creates orders in Payload CMS
 * Triggers fulfillment (async, non-blocking)
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const body = await request.text();
    const signature = request.headers.get("polar-signature");

    if (!signature) {
      logger.warn("Polar webhook missing signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Verify webhook signature using validated env
    const expectedSignature = crypto
      .createHmac("sha256", env.POLAR_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      logger.warn("Polar webhook signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    logger.info(
      { eventType: event.type, eventId: event.id },
      "Polar webhook received",
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.completed": {
        await handleCheckoutCompleted(event, payload);
        break;
      }
      case "checkout.failed": {
        await handleCheckoutFailed(event, payload);
        break;
      }
      default: {
        logger.info({ eventType: event.type }, "Unhandled Polar event type");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ error }, "Polar webhook error");
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

interface PolarCheckoutEvent {
  type: string;
  id: string;
  data: {
    id: string;
    order?: {
      id: string;
    };
    customer?: {
      email: string;
    };
    amount: number;
    currency?: string;
    product?: {
      id: string;
      name?: string;
    };
    bundle?: {
      id: string;
      name?: string;
    };
    metadata?: {
      user_id?: string;
      product_ids?: string;
      bundle_id?: string;
      [key: string]: unknown;
    };
  };
}

// Payload instance type - using any to avoid type issues until Payload types are generated
type PayloadInstance = Awaited<ReturnType<typeof getPayload>>;

/**
 * Handle successful checkout
 * Creates order and triggers fulfillment
 */
async function handleCheckoutCompleted(
  event: PolarCheckoutEvent,
  payload: PayloadInstance,
) {
  const { data } = event;
  const checkoutId = data.id;
  const orderId = data.order?.id;
  const customerEmail = data.customer?.email;
  const amount = data.amount;
  const currency = data.currency || "usd";
  // Extract user_id from Polar metadata (set during checkout creation)
  // This should be the Payload user ID if user was authenticated
  const userId = (data.metadata?.user_id as string) || null;

  if (!orderId || !customerEmail) {
    logger.error({ event }, "Missing required fields in checkout.completed");
    return;
  }

  // Check if order already exists (idempotency)
  const existingOrder = await payload.find({
    collection: "orders" as any,
    where: {
      polarOrderId: {
        equals: orderId,
      },
    },
    limit: 1,
  });

  if (existingOrder.docs.length > 0) {
    logger.info({ orderId }, "Order already exists, skipping");
    return;
  }

  // Extract purchased items from Polar order
  // Note: Polar order structure may vary - adjust based on actual API
  const items = await extractOrderItems(data, payload);

  // Calculate owner attribution based on products purchased
  const ownerAttribution = calculateOwnerAttribution(items, payload);

  // Create order in Payload
  const order = await payload.create({
    collection: "orders" as any,
    data: {
      polarOrderId: orderId,
      polarCheckoutId: checkoutId,
      email: customerEmail,
      user: userId || undefined, // Payload relationship field
      status: "completed",
      items,
      totalAmount: amount,
      currency: currency.toLowerCase(),
      fulfilled: false,
      ownerAttribution,
    },
  });

  logger.info({ orderId: order.id, polarOrderId: orderId }, "Order created");

  // Trigger fulfillment asynchronously (don't block webhook)
  fulfillOrder(order.id, customerEmail, items).catch((error) => {
    logger.error({ error, orderId: order.id }, "Fulfillment failed");
  });
}

/**
 * Handle failed checkout
 * Creates failed order record and sends notification
 */
async function handleCheckoutFailed(
  event: PolarCheckoutEvent,
  payload: PayloadInstance,
) {
  const { data } = event;
  const checkoutId = data.id;
  const customerEmail = data.customer?.email;
  const amount = data.amount;
  const currency = data.currency || "usd";

  if (!customerEmail) {
    logger.error({ event }, "Missing email in checkout.failed");
    return;
  }

  // Create failed order record
  await payload.create({
    collection: "orders" as any,
    data: {
      polarOrderId: `failed-${checkoutId}`,
      polarCheckoutId: checkoutId,
      email: customerEmail,
      status: "failed",
      items: [],
      totalAmount: amount,
      currency: currency.toLowerCase(),
      fulfilled: false,
    },
  });

  // Send failure notification (async, non-blocking)
  const retryUrl = `${env.PAYLOAD_PUBLIC_SERVER_URL}/checkout?retry=${checkoutId}`;
  sendEmail({
    to: customerEmail,
    ...emailTemplates.failedPayment(`failed-${checkoutId}`, retryUrl),
  }).catch((error) => {
    logger.error({ error }, "Failed to send payment failure email");
  });
}

interface OrderItem {
  type: "product" | "bundle";
  productId?: string;
  bundleId?: string;
  title: string;
  fileKey: string;
  maxDownloads: number;
  downloadsUsed: number;
}

/**
 * Extract order items from Polar checkout data
 * Maps Polar products to Payload products/bundles
 * For bundles, expands to individual products
 */
async function extractOrderItems(
  checkoutData: PolarCheckoutEvent["data"],
  payload: PayloadInstance,
): Promise<OrderItem[]> {
  const items: OrderItem[] = [];

  // Extract product IDs from metadata (set during checkout creation)
  const productIds = checkoutData.metadata?.product_ids
    ? JSON.parse(checkoutData.metadata.product_ids as string)
    : [];

  // Fetch products from Payload
  for (const productId of productIds) {
    try {
      const product = (await payload.findByID({
        collection: "products" as any,
        id: productId,
      })) as { id: string; title: string; fileKey: string };

      items.push({
        type: "product",
        productId: product.id,
        title: product.title,
        fileKey: product.fileKey,
        maxDownloads: 5,
        downloadsUsed: 0,
      });
    } catch (error) {
      logger.error({ error, productId }, "Failed to fetch product for order");
    }
  }

  // Handle bundle purchases (expand to individual products)
  const bundleId = checkoutData.metadata?.bundle_id;
  if (bundleId) {
    try {
      const bundle = (await payload.findByID({
        collection: "bundles" as any,
        id: bundleId,
      })) as { id: string; title: string; products: string[] };

      // Fetch all products in the bundle
      for (const productId of bundle.products) {
        const product = (await payload.findByID({
          collection: "products" as any,
          id: productId,
        })) as { id: string; title: string; fileKey: string };

        items.push({
          type: "product",
          productId: product.id,
          title: product.title,
          fileKey: product.fileKey,
          maxDownloads: 5,
          downloadsUsed: 0,
        });
      }
    } catch (error) {
      logger.error({ error, bundleId }, "Failed to fetch bundle for order");
    }
  }

  return items;
}

/**
 * Calculate owner attribution based on products purchased
 * If all products belong to one owner, attribute to that owner
 * If mixed, attribute to the owner with the highest value
 */
async function calculateOwnerAttribution(
  items: OrderItem[],
  payload: PayloadInstance,
): Promise<"ME" | "PARTNER"> {
  const ownerCounts: { ME: number; PARTNER: number } = { ME: 0, PARTNER: 0 };

  for (const item of items) {
    if (item.type === "product" && item.productId) {
      try {
        const product = (await payload.findByID({
          collection: "products" as any,
          id: item.productId,
        })) as unknown as { owner: "ME" | "PARTNER" };

        ownerCounts[product.owner]++;
      } catch (error) {
        logger.error(
          { error, productId: item.productId },
          "Failed to fetch product owner",
        );
      }
    }
  }

  // If all products belong to one owner, use that owner
  if (ownerCounts.ME > 0 && ownerCounts.PARTNER === 0) {
    return "ME";
  }
  if (ownerCounts.PARTNER > 0 && ownerCounts.ME === 0) {
    return "PARTNER";
  }

  // If mixed, attribute to the owner with more products
  return ownerCounts.PARTNER > ownerCounts.ME ? "PARTNER" : "ME";
}

/**
 * Fulfill order: send download emails
 * Async, non-blocking
 */
async function fulfillOrder(
  orderId: string,
  email: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _items: OrderItem[],
): Promise<void> {
  const payload = await getPayload({ config });

  // Fetch order to get full item details
  const order = (await payload.findByID({
    collection: "orders" as any,
    id: orderId,
  })) as {
    id: string;
    fulfilled: boolean;
    items: OrderItem[];
    polarOrderId?: string;
    totalAmount?: number;
    currency?: string;
  };

  if (!order || order.fulfilled) {
    return;
  }

  // Send download emails for each item
  const orderItems = (order.items as OrderItem[]) || [];
  for (let index = 0; index < orderItems.length; index++) {
    const item = orderItems[index];
    if (!item) continue;

    // Generate download links using index (items in Payload arrays don't have IDs)
    const downloadUrl = `${env.PAYLOAD_PUBLIC_SERVER_URL}/download/${orderId}/${index}`;

    await sendEmail({
      to: email,
      ...emailTemplates.downloadEmail(item.title, downloadUrl, "24 hours"),
    });
  }

  // Mark order as fulfilled
  await payload.update({
    collection: "orders" as any,
    id: orderId,
    data: {
      fulfilled: true,
    },
  });

  // Send purchase receipt
  const itemTitles = orderItems.map((item) => item.title);
  await sendEmail({
    to: email,
    ...emailTemplates.purchaseReceipt(
      (order.polarOrderId as string) || orderId,
      itemTitles,
      `${((order.totalAmount as number) / 100).toFixed(2)} ${((order.currency as string) || "usd").toUpperCase()}`,
    ),
  });

  logger.info({ orderId }, "Order fulfilled");
}
