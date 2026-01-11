/**
 * Analytics Service
 * Server-side functions for calculating and aggregating business metrics
 * Uses Neon PostgreSQL for transactional data
 */

import { sql } from "@/lib/db/client";
import type {
  TimePeriod,
  RevenueStats,
  PartnerRevenue,
  OrderStats,
  ProductPerformance,
  DownloadStats,
  RecentOrder,
  DashboardData,
} from "./types";
import { PARTNER_REVENUE_GOAL_CENTS } from "./types";
import { getDateRangeForPeriod } from "./date-utils";
import { calculateGoalProgress, calculatePercentage } from "./currency-utils";

/**
 * Get revenue statistics for a time period
 * Aggregates revenue by creator and calculates goal progress
 *
 * @param period - Time period to calculate stats for
 * @returns Revenue statistics with creator breakdown
 */
export async function getRevenueStats(period: TimePeriod): Promise<RevenueStats> {
  const dateRange = getDateRangeForPeriod(period);

  // Query completed orders within the date range
  const ordersResult = await sql`
    SELECT total_amount
    FROM orders
    WHERE status = 'completed'
      AND created_at >= ${dateRange.start.toISOString()}
      AND created_at <= ${dateRange.end.toISOString()}
  `;

  // Calculate total revenue
  let totalRevenue = 0;
  for (const row of ordersResult) {
    totalRevenue += Number(row.total_amount) || 0;
  }

  // Query revenue by creator from order_items
  const creatorRevenueResult = await sql`
    SELECT 
      oi.creator_sanity_id,
      SUM(oi.price) as total_amount
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed'
      AND o.created_at >= ${dateRange.start.toISOString()}
      AND o.created_at <= ${dateRange.end.toISOString()}
      AND oi.creator_sanity_id IS NOT NULL
    GROUP BY oi.creator_sanity_id
    ORDER BY total_amount DESC
  `;

  // Convert to PartnerRevenue array
  const byPartner: PartnerRevenue[] = creatorRevenueResult.map((row) => {
    const amount = Number(row.total_amount) || 0;
    return {
      userId: String(row.creator_sanity_id || "unknown"),
      email: "creator",
      name: undefined,
      amount,
      percentage: calculatePercentage(amount, totalRevenue),
      goalProgress: calculateGoalProgress(amount, PARTNER_REVENUE_GOAL_CENTS),
    };
  });

  return {
    total: totalRevenue,
    currency: "USD",
    period: dateRange,
    byPartner,
  };
}

/**
 * Get order statistics for a time period
 * Counts orders by status and calculates average order value
 *
 * @param period - Time period to calculate stats for
 * @returns Order statistics with status breakdown
 */
export async function getOrderStats(period: TimePeriod): Promise<OrderStats> {
  const dateRange = getDateRangeForPeriod(period);

  // Query order counts by status
  const statusResult = await sql`
    SELECT 
      status,
      COUNT(*) as count,
      SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as completed_revenue
    FROM orders
    WHERE created_at >= ${dateRange.start.toISOString()}
      AND created_at <= ${dateRange.end.toISOString()}
    GROUP BY status
  `;

  let total = 0;
  let completed = 0;
  let pending = 0;
  let failed = 0;
  let refunded = 0;
  let totalCompletedRevenue = 0;

  for (const row of statusResult) {
    const count = Number(row.count) || 0;
    total += count;

    switch (row.status) {
      case "completed":
        completed = count;
        totalCompletedRevenue = Number(row.completed_revenue) || 0;
        break;
      case "pending":
        pending = count;
        break;
      case "failed":
        failed = count;
        break;
      case "refunded":
        refunded = count;
        break;
    }
  }

  // Calculate average order value (only from completed orders)
  const averageOrderValue = completed > 0 ? Math.round(totalCompletedRevenue / completed) : 0;

  return {
    total,
    completed,
    pending,
    failed,
    refunded,
    averageOrderValue,
  };
}

/**
 * Get top-selling products for a time period
 * Aggregates product sales from order items
 *
 * @param period - Time period to calculate stats for
 * @param limit - Maximum number of products to return (default: 5)
 * @returns Array of product performance metrics sorted by revenue
 */
export async function getTopProducts(
  period: TimePeriod,
  limit: number = 5
): Promise<ProductPerformance[]> {
  const dateRange = getDateRangeForPeriod(period);

  // Query top products by revenue
  const result = await sql`
    SELECT 
      oi.sanity_id as product_id,
      oi.title,
      oi.item_type,
      COUNT(*) as units_sold,
      SUM(oi.price) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed'
      AND o.created_at >= ${dateRange.start.toISOString()}
      AND o.created_at <= ${dateRange.end.toISOString()}
    GROUP BY oi.sanity_id, oi.title, oi.item_type
    ORDER BY revenue DESC
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    productId: String(row.product_id),
    title: String(row.title || "Unknown Product"),
    unitsSold: Number(row.units_sold) || 0,
    revenue: Number(row.revenue) || 0,
    isBundle: row.item_type === "bundle",
  }));
}

/**
 * Get recent orders
 * Returns the most recent orders sorted by creation date
 *
 * @param limit - Maximum number of orders to return (default: 5)
 * @returns Array of recent orders
 */
export async function getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
  const result = await sql`
    SELECT 
      id,
      polar_order_id,
      email,
      total_amount,
      currency,
      status,
      created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    id: String(row.id),
    polarOrderId: String(row.polar_order_id),
    email: String(row.email),
    totalAmount: Number(row.total_amount) || 0,
    currency: String(row.currency || "USD"),
    status: row.status as RecentOrder["status"],
    createdAt: String(row.created_at),
  }));
}

/**
 * Get download statistics for a time period
 * Aggregates download counts from order items
 *
 * @param period - Time period to calculate stats for
 * @returns Download statistics with product breakdown
 */
export async function getDownloadStats(period: TimePeriod): Promise<DownloadStats> {
  const dateRange = getDateRangeForPeriod(period);

  // Query download statistics
  const result = await sql`
    SELECT 
      oi.sanity_id as product_id,
      oi.title,
      SUM(oi.downloads_used) as downloads
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= ${dateRange.start.toISOString()}
      AND o.created_at <= ${dateRange.end.toISOString()}
      AND oi.downloads_used > 0
    GROUP BY oi.sanity_id, oi.title
    ORDER BY downloads DESC
  `;

  // Calculate totals
  const totalResult = await sql`
    SELECT 
      SUM(oi.downloads_used) as total_downloads,
      COUNT(DISTINCT o.id) as orders_with_downloads
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= ${dateRange.start.toISOString()}
      AND o.created_at <= ${dateRange.end.toISOString()}
      AND oi.downloads_used > 0
  `;

  const totalDownloads = Number(totalResult[0]?.total_downloads) || 0;
  const ordersWithDownloads = Number(totalResult[0]?.orders_with_downloads) || 0;
  const averagePerOrder =
    ordersWithDownloads > 0 ? Math.round((totalDownloads / ordersWithDownloads) * 100) / 100 : 0;

  const byProduct = result.map((row) => ({
    productId: String(row.product_id),
    title: String(row.title || "Unknown Product"),
    downloads: Number(row.downloads) || 0,
  }));

  return {
    totalDownloads,
    averagePerOrder,
    byProduct,
  };
}

/**
 * Get all dashboard data for a time period
 * Aggregates all analytics into a single response
 *
 * @param period - Time period to calculate stats for
 * @returns Complete dashboard data
 */
export async function getDashboardData(period: TimePeriod): Promise<DashboardData> {
  // Fetch all data in parallel for better performance
  const [revenue, orders, topProducts, recentOrders, downloads] = await Promise.all([
    getRevenueStats(period),
    getOrderStats(period),
    getTopProducts(period, 5),
    getRecentOrders(5),
    getDownloadStats(period),
  ]);

  return {
    revenue,
    orders,
    topProducts,
    recentOrders,
    downloads,
  };
}
