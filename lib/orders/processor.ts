/**
 * Order Processing Service
 *
 * Handles order creation from Polar webhooks, including:
 * - Creating order records in Neon PostgreSQL
 * - Creating order items with creator attribution
 * - Tracking analytics events for purchases
 *
 * Requirements: 6.1, 6.2, 4.2
 */

import { sql } from "@/lib/db/client";
import { sanityClient } from "@/lib/sanity/client";
import { groq } from "next-sanity";
import { trackPurchase } from "@/lib/analytics/tracker";
import { logger } from "@/lib/logger";
import { resolveProductPrice } from "@/lib/pricing/resolver";

/**
 * Polar order data from webhook
 */
export interface PolarOrderData {
  id: string;
  checkoutId?: string;
  customer: {
    email: string;
  };
  amount: number;
  currency: string;
  metadata?: {
    items?: string;
    checkoutId?: string;
  };
}

/**
 * Purchased item from checkout metadata
 */
export interface PurchasedItem {
  sanityId: string;
  type: "product" | "bundle";
  polarProductId: string;
}

/**
 * Order item to be created in database
 */
export interface OrderItemData {
  itemType: "product" | "bundle";
  sanityId: string;
  title: string;
  price: number;
  creatorSanityId: string | null;
  fileKey: string | null;
  maxDownloads: number;
}

/**
 * Result of order processing
 */
export interface ProcessOrderResult {
  success: boolean;
  orderId?: number;
  error?: string;
  alreadyExists?: boolean;
}

/**
 * Sanity product data for order processing
 */
interface SanityProductForOrder {
  _id: string;
  title: string;
  customPrice?: number;
  productFileKey?: string;
  subcategory: {
    defaultPrice: number;
  };
  creator?: {
    _id: string;
  };
}

/**
 * Sanity bundle data for order processing
 */
interface SanityBundleForOrder {
  _id: string;
  title: string;
  price: number;
  products: Array<{
    _id: string;
    title: string;
    customPrice?: number;
    productFileKey?: string;
    subcategory: {
      defaultPrice: number;
    };
    creator?: {
      _id: string;
    };
  }>;
}

// GROQ query to fetch product data for order processing
const productForOrderQuery = groq`
  *[_type == "product" && _id == $id][0] {
    _id,
    title,
    customPrice,
    productFileKey,
    "subcategory": subcategory->{
      defaultPrice
    },
    "creator": creator->{
      _id
    }
  }
`;

// GROQ query to fetch bundle data for order processing
const bundleForOrderQuery = groq`
  *[_type == "bundle" && _id == $id][0] {
    _id,
    title,
    price,
    "products": products[]->{
      _id,
      title,
      customPrice,
      productFileKey,
      "subcategory": subcategory->{
        defaultPrice
      },
      "creator": creator->{
        _id
      }
    }
  }
`;

/**
 * Check if an order already exists (idempotency check)
 */
export async function orderExists(polarOrderId: string): Promise<boolean> {
  const result = await sql`
    SELECT id FROM orders WHERE polar_order_id = ${polarOrderId} LIMIT 1
  `;
  return result.length > 0;
}

/**
 * Create an order record in the database
 */
async function createOrderRecord(
  polarOrderId: string,
  polarCheckoutId: string | null,
  email: string,
  totalAmount: number,
  currency: string
): Promise<number> {
  const result = await sql`
    INSERT INTO orders (polar_order_id, polar_checkout_id, email, status, total_amount, currency, fulfilled)
    VALUES (${polarOrderId}, ${polarCheckoutId}, ${email}, 'completed', ${totalAmount}, ${currency}, false)
    RETURNING id
  `;

  if (!result[0]) {
    throw new Error("Failed to create order record");
  }

  return result[0].id as number;
}

/**
 * Create order items in the database
 */
async function createOrderItems(orderId: number, items: OrderItemData[]): Promise<void> {
  for (const item of items) {
    await sql`
      INSERT INTO order_items (order_id, item_type, sanity_id, title, price, creator_sanity_id, file_key, max_downloads, downloads_used)
      VALUES (${orderId}, ${item.itemType}, ${item.sanityId}, ${item.title}, ${item.price}, ${item.creatorSanityId}, ${item.fileKey}, ${item.maxDownloads}, 0)
    `;
  }
}

/**
 * Mark order as fulfilled
 */
async function markOrderFulfilled(orderId: number): Promise<void> {
  await sql`
    UPDATE orders SET fulfilled = true, updated_at = NOW() WHERE id = ${orderId}
  `;
}

/**
 * Fetch product data from Sanity
 */
async function fetchProductFromSanity(sanityId: string): Promise<SanityProductForOrder | null> {
  return sanityClient.fetch<SanityProductForOrder | null>(productForOrderQuery, { id: sanityId });
}

/**
 * Fetch bundle data from Sanity
 */
async function fetchBundleFromSanity(sanityId: string): Promise<SanityBundleForOrder | null> {
  return sanityClient.fetch<SanityBundleForOrder | null>(bundleForOrderQuery, { id: sanityId });
}

/**
 * Build order items from purchased items
 */
async function buildOrderItems(purchasedItems: PurchasedItem[]): Promise<OrderItemData[]> {
  const orderItems: OrderItemData[] = [];

  for (const item of purchasedItems) {
    try {
      if (item.type === "product") {
        const product = await fetchProductFromSanity(item.sanityId);
        if (product) {
          // Resolve the effective price
          const priceResult = resolveProductPrice(
            { customPrice: product.customPrice },
            { defaultPrice: product.subcategory?.defaultPrice ?? 0 }
          );

          orderItems.push({
            itemType: "product",
            sanityId: product._id,
            title: product.title,
            price: priceResult.price,
            creatorSanityId: product.creator?._id ?? null,
            fileKey: product.productFileKey ?? null,
            maxDownloads: 5,
          });
        }
      } else if (item.type === "bundle") {
        const bundle = await fetchBundleFromSanity(item.sanityId);
        if (bundle && bundle.products) {
          // For bundles, add each product as a separate order item
          // Calculate proportional price for each product
          const totalProductValue = bundle.products.reduce((sum, p) => {
            const price = resolveProductPrice(
              { customPrice: p.customPrice },
              { defaultPrice: p.subcategory?.defaultPrice ?? 0 }
            ).price;
            return sum + price;
          }, 0);

          for (const product of bundle.products) {
            const productPrice = resolveProductPrice(
              { customPrice: product.customPrice },
              { defaultPrice: product.subcategory?.defaultPrice ?? 0 }
            ).price;

            // Calculate proportional price from bundle price
            const proportionalPrice =
              totalProductValue > 0
                ? Math.round((productPrice / totalProductValue) * bundle.price)
                : Math.round(bundle.price / bundle.products.length);

            orderItems.push({
              itemType: "bundle",
              sanityId: product._id,
              title: `${product.title} (from ${bundle.title})`,
              price: proportionalPrice,
              creatorSanityId: product.creator?._id ?? null,
              fileKey: product.productFileKey ?? null,
              maxDownloads: 5,
            });
          }
        }
      }
    } catch (error) {
      logger.error({ error, item }, "Failed to fetch product/bundle details for order item");
    }
  }

  return orderItems;
}

/**
 * Track purchase analytics for all order items
 */
async function trackPurchaseAnalytics(items: OrderItemData[]): Promise<void> {
  for (const item of items) {
    try {
      await trackPurchase(item.sanityId, item.itemType);
    } catch (error) {
      logger.warn({ error, sanityId: item.sanityId }, "Failed to track purchase analytics");
    }
  }
}

/**
 * Process an order from Polar webhook
 *
 * This function:
 * 1. Checks for idempotency (order already exists)
 * 2. Parses purchased items from metadata
 * 3. Fetches product/bundle details from Sanity
 * 4. Creates order record in Neon
 * 5. Creates order items with creator attribution
 * 6. Tracks purchase analytics events
 * 7. Marks order as fulfilled
 *
 * @param orderData - Order data from Polar webhook
 * @returns Result indicating success or failure
 */
export async function processOrder(orderData: PolarOrderData): Promise<ProcessOrderResult> {
  const { id: polarOrderId, customer, amount, currency, metadata } = orderData;
  const email = customer.email;
  const polarCheckoutId = metadata?.checkoutId ?? null;

  logger.info({ polarOrderId, email, amount }, "Processing order");

  // Check idempotency - order may have already been processed
  const exists = await orderExists(polarOrderId);
  if (exists) {
    logger.info({ polarOrderId }, "Order already exists, skipping creation");
    return { success: true, alreadyExists: true };
  }

  // Parse purchased items from metadata
  let purchasedItems: PurchasedItem[] = [];
  if (metadata?.items) {
    try {
      purchasedItems = JSON.parse(metadata.items);
    } catch (error) {
      logger.error({ error, metadata }, "Failed to parse items metadata");
      return { success: false, error: "Failed to parse items metadata" };
    }
  }

  if (purchasedItems.length === 0) {
    logger.error({ polarOrderId }, "No items found in order metadata");
    return { success: false, error: "No items found in order metadata" };
  }

  // Build order items from Sanity data
  const orderItems = await buildOrderItems(purchasedItems);

  if (orderItems.length === 0) {
    logger.error({ polarOrderId }, "No valid items found for order");
    return { success: false, error: "No valid items found for order" };
  }

  try {
    // Create order record
    const orderId = await createOrderRecord(polarOrderId, polarCheckoutId, email, amount, currency);
    logger.info({ orderId, polarOrderId }, "Order record created");

    // Create order items
    await createOrderItems(orderId, orderItems);
    logger.info({ orderId, itemCount: orderItems.length }, "Order items created");

    // Track purchase analytics (async, don't block)
    trackPurchaseAnalytics(orderItems).catch((error) => {
      logger.warn({ error, orderId }, "Failed to track some purchase analytics");
    });

    // Mark order as fulfilled
    await markOrderFulfilled(orderId);
    logger.info({ orderId }, "Order marked as fulfilled");

    return { success: true, orderId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error, polarOrderId }, "Failed to process order");
    return { success: false, error: `Failed to process order: ${errorMessage}` };
  }
}

/**
 * Get order by Polar order ID
 */
export async function getOrderByPolarId(
  polarOrderId: string
): Promise<{ id: number; email: string; status: string } | null> {
  const result = await sql`
    SELECT id, email, status FROM orders WHERE polar_order_id = ${polarOrderId} LIMIT 1
  `;
  return result.length > 0 ? (result[0] as { id: number; email: string; status: string }) : null;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  await sql`
    UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${orderId}
  `;
}

/**
 * Get order items for an order
 */
export async function getOrderItems(orderId: number): Promise<
  Array<{
    id: number;
    itemType: string;
    sanityId: string;
    title: string;
    price: number;
    fileKey: string | null;
    maxDownloads: number;
    downloadsUsed: number;
  }>
> {
  const result = await sql`
    SELECT id, item_type as "itemType", sanity_id as "sanityId", title, price, 
           file_key as "fileKey", max_downloads as "maxDownloads", downloads_used as "downloadsUsed"
    FROM order_items 
    WHERE order_id = ${orderId}
  `;
  return result as Array<{
    id: number;
    itemType: string;
    sanityId: string;
    title: string;
    price: number;
    fileKey: string | null;
    maxDownloads: number;
    downloadsUsed: number;
  }>;
}
