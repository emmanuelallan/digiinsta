/**
 * Creator Revenue Calculator
 *
 * Calculates revenue share for creators based on orders.
 * Creators receive 50% of the item price for products.
 * For bundles, revenue is split proportionally among product creators.
 *
 * Requirements: 4.3, 5.4 - Creator revenue share calculation
 */

/**
 * Revenue share percentage for creators (50%)
 */
export const CREATOR_REVENUE_SHARE = 0.5;

/**
 * Order item for revenue calculation
 */
export interface OrderItem {
  /** Type of item */
  type: "product" | "bundle";
  /** Price in cents */
  price: number;
  /** Creator's Sanity ID (for products) */
  creatorSanityId?: string | null;
  /** Products in bundle (for bundles) */
  bundleProducts?: BundleProduct[];
}

/**
 * Product within a bundle
 */
export interface BundleProduct {
  /** Product's Sanity ID */
  sanityId: string;
  /** Creator's Sanity ID */
  creatorSanityId?: string | null;
  /** Individual product price in cents (for proportional calculation) */
  price: number;
}

/**
 * Creator revenue result
 */
export interface CreatorRevenue {
  /** Creator's Sanity ID */
  creatorSanityId: string;
  /** Revenue amount in cents */
  amount: number;
}

/**
 * Order revenue calculation result
 */
export interface OrderRevenueResult {
  /** Total order amount in cents */
  orderTotal: number;
  /** Total creator payout in cents */
  totalCreatorPayout: number;
  /** Revenue breakdown by creator */
  creatorRevenues: CreatorRevenue[];
  /** Platform revenue in cents (order total - creator payouts) */
  platformRevenue: number;
}

/**
 * Calculate creator revenue for a single product
 *
 * @param price - Product price in cents
 * @param creatorSanityId - Creator's Sanity ID (optional)
 * @returns Creator revenue in cents, or 0 if no creator
 */
export function calculateProductCreatorRevenue(
  price: number,
  creatorSanityId?: string | null
): number {
  if (!creatorSanityId) {
    return 0;
  }
  return Math.floor(price * CREATOR_REVENUE_SHARE);
}

/**
 * Calculate creator revenue for a bundle
 *
 * Revenue is split proportionally among product creators based on
 * each product's price relative to the total bundle value.
 *
 * @param bundlePrice - Bundle price in cents
 * @param products - Products in the bundle with their prices and creators
 * @returns Array of creator revenues
 */
export function calculateBundleCreatorRevenue(
  bundlePrice: number,
  products: BundleProduct[]
): CreatorRevenue[] {
  if (!products || products.length === 0) {
    return [];
  }

  // Calculate total value of all products in bundle
  const totalProductValue = products.reduce((sum, p) => sum + p.price, 0);

  if (totalProductValue === 0) {
    return [];
  }

  // Group products by creator and calculate proportional revenue
  const creatorRevenueMap = new Map<string, number>();

  for (const product of products) {
    if (!product.creatorSanityId) {
      continue;
    }

    // Calculate this product's proportion of the bundle
    const proportion = product.price / totalProductValue;

    // Calculate creator's share of the bundle price
    const creatorShare = Math.floor(bundlePrice * proportion * CREATOR_REVENUE_SHARE);

    // Add to creator's total
    const currentAmount = creatorRevenueMap.get(product.creatorSanityId) || 0;
    creatorRevenueMap.set(product.creatorSanityId, currentAmount + creatorShare);
  }

  // Convert map to array
  return Array.from(creatorRevenueMap.entries()).map(([creatorSanityId, amount]) => ({
    creatorSanityId,
    amount,
  }));
}

/**
 * Calculate creator revenue for an entire order
 *
 * @param items - Order items (products and bundles)
 * @returns Order revenue calculation result
 */
export function calculateOrderCreatorRevenue(items: OrderItem[]): OrderRevenueResult {
  const orderTotal = items.reduce((sum, item) => sum + item.price, 0);
  const creatorRevenueMap = new Map<string, number>();

  for (const item of items) {
    if (item.type === "product") {
      // Single product - 50% to creator
      if (item.creatorSanityId) {
        const revenue = calculateProductCreatorRevenue(item.price, item.creatorSanityId);
        const currentAmount = creatorRevenueMap.get(item.creatorSanityId) || 0;
        creatorRevenueMap.set(item.creatorSanityId, currentAmount + revenue);
      }
    } else if (item.type === "bundle" && item.bundleProducts) {
      // Bundle - proportional split among creators
      const bundleRevenues = calculateBundleCreatorRevenue(item.price, item.bundleProducts);
      for (const { creatorSanityId, amount } of bundleRevenues) {
        const currentAmount = creatorRevenueMap.get(creatorSanityId) || 0;
        creatorRevenueMap.set(creatorSanityId, currentAmount + amount);
      }
    }
  }

  // Convert map to array
  const creatorRevenues = Array.from(creatorRevenueMap.entries()).map(
    ([creatorSanityId, amount]) => ({
      creatorSanityId,
      amount,
    })
  );

  // Calculate total creator payout
  const totalCreatorPayout = creatorRevenues.reduce((sum, cr) => sum + cr.amount, 0);

  // Platform revenue is the remainder
  const platformRevenue = orderTotal - totalCreatorPayout;

  return {
    orderTotal,
    totalCreatorPayout,
    creatorRevenues,
    platformRevenue,
  };
}

/**
 * Validate that total creator payouts never exceed 50% of order total
 *
 * @param result - Order revenue calculation result
 * @returns True if valid, false otherwise
 */
export function validateCreatorPayouts(result: OrderRevenueResult): boolean {
  const maxPayout = Math.floor(result.orderTotal * CREATOR_REVENUE_SHARE);
  return result.totalCreatorPayout <= maxPayout;
}
