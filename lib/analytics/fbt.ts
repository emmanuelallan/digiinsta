/**
 * Frequently Bought Together (FBT) Analytics
 * Analyzes co-occurrence of products in orders to find related purchases
 */

import { sql } from "@/lib/db/client";

/**
 * Co-purchased item with occurrence count
 */
export interface CoPurchasedItem {
  sanityId: string;
  title: string;
  itemType: "product" | "bundle";
  coOccurrenceCount: number;
}

/**
 * Options for querying frequently bought together items
 */
export interface FBTOptions {
  /** Maximum number of items to return (default: 5) */
  limit?: number;
  /** Only include orders from this date onwards */
  since?: Date;
  /** Exclude bundles from results */
  productsOnly?: boolean;
}

/**
 * Get items frequently bought together with a specific product
 * Analyzes co-occurrence in orders to find related purchases
 *
 * @param sanityId - The Sanity ID of the source product
 * @param options - Query options
 * @returns Array of co-purchased items sorted by co-occurrence count
 */
export async function getFrequentlyBoughtTogether(
  sanityId: string,
  options: FBTOptions = {}
): Promise<CoPurchasedItem[]> {
  const { limit = 5, since, productsOnly = false } = options;

  // Find all orders containing the source product, then find other items in those orders
  let result;

  if (since && productsOnly) {
    result = await sql`
      SELECT 
        oi2.sanity_id,
        oi2.title,
        oi2.item_type,
        COUNT(DISTINCT oi2.order_id) as co_occurrence_count
      FROM order_items oi1
      INNER JOIN order_items oi2 ON oi1.order_id = oi2.order_id
      INNER JOIN orders o ON oi1.order_id = o.id
      WHERE oi1.sanity_id = ${sanityId}
        AND oi2.sanity_id != ${sanityId}
        AND o.status = 'completed'
        AND o.created_at >= ${since.toISOString()}
        AND oi2.item_type = 'product'
      GROUP BY oi2.sanity_id, oi2.title, oi2.item_type
      ORDER BY co_occurrence_count DESC
      LIMIT ${limit}
    `;
  } else if (since) {
    result = await sql`
      SELECT 
        oi2.sanity_id,
        oi2.title,
        oi2.item_type,
        COUNT(DISTINCT oi2.order_id) as co_occurrence_count
      FROM order_items oi1
      INNER JOIN order_items oi2 ON oi1.order_id = oi2.order_id
      INNER JOIN orders o ON oi1.order_id = o.id
      WHERE oi1.sanity_id = ${sanityId}
        AND oi2.sanity_id != ${sanityId}
        AND o.status = 'completed'
        AND o.created_at >= ${since.toISOString()}
      GROUP BY oi2.sanity_id, oi2.title, oi2.item_type
      ORDER BY co_occurrence_count DESC
      LIMIT ${limit}
    `;
  } else if (productsOnly) {
    result = await sql`
      SELECT 
        oi2.sanity_id,
        oi2.title,
        oi2.item_type,
        COUNT(DISTINCT oi2.order_id) as co_occurrence_count
      FROM order_items oi1
      INNER JOIN order_items oi2 ON oi1.order_id = oi2.order_id
      INNER JOIN orders o ON oi1.order_id = o.id
      WHERE oi1.sanity_id = ${sanityId}
        AND oi2.sanity_id != ${sanityId}
        AND o.status = 'completed'
        AND oi2.item_type = 'product'
      GROUP BY oi2.sanity_id, oi2.title, oi2.item_type
      ORDER BY co_occurrence_count DESC
      LIMIT ${limit}
    `;
  } else {
    result = await sql`
      SELECT 
        oi2.sanity_id,
        oi2.title,
        oi2.item_type,
        COUNT(DISTINCT oi2.order_id) as co_occurrence_count
      FROM order_items oi1
      INNER JOIN order_items oi2 ON oi1.order_id = oi2.order_id
      INNER JOIN orders o ON oi1.order_id = o.id
      WHERE oi1.sanity_id = ${sanityId}
        AND oi2.sanity_id != ${sanityId}
        AND o.status = 'completed'
      GROUP BY oi2.sanity_id, oi2.title, oi2.item_type
      ORDER BY co_occurrence_count DESC
      LIMIT ${limit}
    `;
  }

  return result.map((row) => ({
    sanityId: row.sanity_id,
    title: row.title,
    itemType: row.item_type as "product" | "bundle",
    coOccurrenceCount: Number(row.co_occurrence_count),
  }));
}

/**
 * Get top product pairs that are frequently bought together
 * Returns pairs of products that appear together most often
 *
 * @param limit - Maximum number of pairs to return (default: 10)
 * @returns Array of product pairs with co-occurrence counts
 */
export async function getTopProductPairs(
  limit: number = 10
): Promise<Array<{ product1: string; product2: string; count: number }>> {
  const result = await sql`
    SELECT 
      oi1.sanity_id as product1,
      oi2.sanity_id as product2,
      COUNT(DISTINCT oi1.order_id) as pair_count
    FROM order_items oi1
    INNER JOIN order_items oi2 ON oi1.order_id = oi2.order_id
    INNER JOIN orders o ON oi1.order_id = o.id
    WHERE oi1.sanity_id < oi2.sanity_id
      AND o.status = 'completed'
      AND oi1.item_type = 'product'
      AND oi2.item_type = 'product'
    GROUP BY oi1.sanity_id, oi2.sanity_id
    HAVING COUNT(DISTINCT oi1.order_id) > 1
    ORDER BY pair_count DESC
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    product1: row.product1,
    product2: row.product2,
    count: Number(row.pair_count),
  }));
}

/**
 * Check if two products are frequently bought together
 * Returns true if they appear together in at least minOccurrences orders
 */
export async function areFrequentlyBoughtTogether(
  sanityId1: string,
  sanityId2: string,
  minOccurrences: number = 2
): Promise<boolean> {
  const result = await sql`
    SELECT COUNT(DISTINCT oi1.order_id) as count
    FROM order_items oi1
    INNER JOIN order_items oi2 ON oi1.order_id = oi2.order_id
    INNER JOIN orders o ON oi1.order_id = o.id
    WHERE oi1.sanity_id = ${sanityId1}
      AND oi2.sanity_id = ${sanityId2}
      AND o.status = 'completed'
  `;

  return Number(result[0]?.count ?? 0) >= minOccurrences;
}
