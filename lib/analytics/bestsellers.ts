/**
 * Best Sellers Analytics
 * Queries order_items to determine best-selling products and bundles
 */

import { sql } from "@/lib/db/client";

/**
 * Best seller item with sales count
 */
export interface BestSellerItem {
  sanityId: string;
  title: string;
  itemType: "product" | "bundle";
  salesCount: number;
  totalRevenue: number;
}

/**
 * Options for querying best sellers
 */
export interface BestSellersOptions {
  /** Maximum number of items to return (default: 10) */
  limit?: number;
  /** Filter by item type ('product' or 'bundle') */
  itemType?: "product" | "bundle";
  /** Only include sales from this date onwards */
  since?: Date;
}

/**
 * Get best-selling items based on order_items count
 * Sorted by sales count descending
 *
 * @param options - Query options
 * @returns Array of best seller items sorted by sales count
 */
export async function getBestSellers(options: BestSellersOptions = {}): Promise<BestSellerItem[]> {
  const { limit = 10, itemType, since } = options;

  // Build the query based on options
  let result;

  if (itemType && since) {
    result = await sql`
      SELECT 
        oi.sanity_id,
        oi.title,
        oi.item_type,
        COUNT(*) as sales_count,
        SUM(oi.price) as total_revenue
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
        AND oi.item_type = ${itemType}
        AND o.created_at >= ${since.toISOString()}
      GROUP BY oi.sanity_id, oi.title, oi.item_type
      ORDER BY sales_count DESC, total_revenue DESC
      LIMIT ${limit}
    `;
  } else if (itemType) {
    result = await sql`
      SELECT 
        oi.sanity_id,
        oi.title,
        oi.item_type,
        COUNT(*) as sales_count,
        SUM(oi.price) as total_revenue
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
        AND oi.item_type = ${itemType}
      GROUP BY oi.sanity_id, oi.title, oi.item_type
      ORDER BY sales_count DESC, total_revenue DESC
      LIMIT ${limit}
    `;
  } else if (since) {
    result = await sql`
      SELECT 
        oi.sanity_id,
        oi.title,
        oi.item_type,
        COUNT(*) as sales_count,
        SUM(oi.price) as total_revenue
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
        AND o.created_at >= ${since.toISOString()}
      GROUP BY oi.sanity_id, oi.title, oi.item_type
      ORDER BY sales_count DESC, total_revenue DESC
      LIMIT ${limit}
    `;
  } else {
    result = await sql`
      SELECT 
        oi.sanity_id,
        oi.title,
        oi.item_type,
        COUNT(*) as sales_count,
        SUM(oi.price) as total_revenue
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY oi.sanity_id, oi.title, oi.item_type
      ORDER BY sales_count DESC, total_revenue DESC
      LIMIT ${limit}
    `;
  }

  return result.map((row) => ({
    sanityId: row.sanity_id,
    title: row.title,
    itemType: row.item_type as "product" | "bundle",
    salesCount: Number(row.sales_count),
    totalRevenue: Number(row.total_revenue),
  }));
}

/**
 * Get best-selling products only
 */
export async function getBestSellingProducts(
  limit: number = 10,
  since?: Date
): Promise<BestSellerItem[]> {
  return getBestSellers({ limit, itemType: "product", since });
}

/**
 * Get best-selling bundles only
 */
export async function getBestSellingBundles(
  limit: number = 10,
  since?: Date
): Promise<BestSellerItem[]> {
  return getBestSellers({ limit, itemType: "bundle", since });
}

/**
 * Get sales count for a specific item
 */
export async function getSalesCount(sanityId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE oi.sanity_id = ${sanityId}
      AND o.status = 'completed'
  `;

  return Number(result[0]?.count ?? 0);
}

/**
 * Get sales counts for multiple items at once
 */
export async function getSalesCountsBatch(sanityIds: string[]): Promise<Map<string, number>> {
  if (sanityIds.length === 0) {
    return new Map();
  }

  const result = await sql`
    SELECT 
      oi.sanity_id,
      COUNT(*) as count
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE oi.sanity_id = ANY(${sanityIds})
      AND o.status = 'completed'
    GROUP BY oi.sanity_id
  `;

  const counts = new Map<string, number>();
  for (const row of result) {
    counts.set(row.sanity_id, Number(row.count));
  }

  return counts;
}
