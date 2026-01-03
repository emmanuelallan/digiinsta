/**
 * Analytics Service
 * Server-side functions for calculating and aggregating business metrics
 */

import { getPayload } from "payload";
import config from "@/payload.config";
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
 * Aggregates revenue by partner and calculates goal progress
 *
 * @param period - Time period to calculate stats for
 * @returns Revenue statistics with partner breakdown
 */
export async function getRevenueStats(
  period: TimePeriod,
): Promise<RevenueStats> {
  const payload = await getPayload({ config });
  const dateRange = getDateRangeForPeriod(period);

  // Query completed orders within the date range
  const orders = await payload.find({
    collection: "orders",
    where: {
      and: [
        { status: { equals: "completed" } },
        { createdAt: { greater_than_equal: dateRange.start.toISOString() } },
        { createdAt: { less_than_equal: dateRange.end.toISOString() } },
      ],
    },
    limit: 0, // Get all matching orders
    depth: 1, // Include related user data
  });

  // Aggregate revenue by partner
  const partnerMap = new Map<
    string,
    { email: string; name?: string; amount: number }
  >();
  let totalRevenue = 0;

  for (const order of orders.docs) {
    const amount = order.totalAmount ?? 0;
    totalRevenue += amount;

    // Get partner info from createdBy relationship
    const createdBy = order.createdBy;
    if (createdBy && typeof createdBy === "object") {
      const userId = String(createdBy.id);
      const existing = partnerMap.get(userId);
      if (existing) {
        existing.amount += amount;
      } else {
        partnerMap.set(userId, {
          email: createdBy.email ?? "unknown",
          name: createdBy.name ?? undefined,
          amount,
        });
      }
    }
  }

  // Convert to PartnerRevenue array with percentages and goal progress
  const byPartner: PartnerRevenue[] = Array.from(partnerMap.entries()).map(
    ([userId, data]) => ({
      userId,
      email: data.email,
      name: data.name,
      amount: data.amount,
      percentage: calculatePercentage(data.amount, totalRevenue),
      goalProgress: calculateGoalProgress(
        data.amount,
        PARTNER_REVENUE_GOAL_CENTS,
      ),
    }),
  );

  // Sort by amount descending
  byPartner.sort((a, b) => b.amount - a.amount);

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
  const payload = await getPayload({ config });
  const dateRange = getDateRangeForPeriod(period);

  // Query all orders within the date range
  const orders = await payload.find({
    collection: "orders",
    where: {
      and: [
        { createdAt: { greater_than_equal: dateRange.start.toISOString() } },
        { createdAt: { less_than_equal: dateRange.end.toISOString() } },
      ],
    },
    limit: 0, // Get all matching orders
  });

  // Count by status
  let completed = 0;
  let pending = 0;
  let failed = 0;
  let refunded = 0;
  let totalCompletedRevenue = 0;

  for (const order of orders.docs) {
    switch (order.status) {
      case "completed":
        completed++;
        totalCompletedRevenue += order.totalAmount || 0;
        break;
      case "pending":
        pending++;
        break;
      case "failed":
        failed++;
        break;
      case "refunded":
        refunded++;
        break;
    }
  }

  // Calculate average order value (only from completed orders)
  const averageOrderValue =
    completed > 0 ? Math.round(totalCompletedRevenue / completed) : 0;

  return {
    total: orders.docs.length,
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
  limit: number = 5,
): Promise<ProductPerformance[]> {
  const payload = await getPayload({ config });
  const dateRange = getDateRangeForPeriod(period);

  // Query completed orders within the date range
  const orders = await payload.find({
    collection: "orders",
    where: {
      and: [
        { status: { equals: "completed" } },
        { createdAt: { greater_than_equal: dateRange.start.toISOString() } },
        { createdAt: { less_than_equal: dateRange.end.toISOString() } },
      ],
    },
    limit: 0,
    depth: 2, // Include product/bundle relationships
  });

  // Aggregate sales by product/bundle
  const productMap = new Map<string, ProductPerformance>();

  for (const order of orders.docs) {
    const items = order.items;
    // Calculate per-item revenue (split order total evenly among items)
    const itemCount = items.length || 1;
    const perItemRevenue = Math.round((order.totalAmount ?? 0) / itemCount);

    for (const item of items) {
      const isBundle = item.type === "bundle";
      const rawProductId = isBundle
        ? typeof item.bundleId === "object"
          ? item.bundleId?.id
          : item.bundleId
        : typeof item.productId === "object"
          ? item.productId?.id
          : item.productId;

      if (!rawProductId) continue;
      const productId = String(rawProductId);

      const existing = productMap.get(productId);
      if (existing) {
        existing.unitsSold++;
        existing.revenue += perItemRevenue;
      } else {
        productMap.set(productId, {
          productId,
          title: item.title ?? "Unknown Product",
          unitsSold: 1,
          revenue: perItemRevenue,
          isBundle,
        });
      }
    }
  }

  // Convert to array, sort by revenue descending, and limit
  const products = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return products;
}

/**
 * Get recent orders
 * Returns the most recent orders sorted by creation date
 *
 * @param limit - Maximum number of orders to return (default: 5)
 * @returns Array of recent orders
 */
export async function getRecentOrders(
  limit: number = 5,
): Promise<RecentOrder[]> {
  const payload = await getPayload({ config });

  const orders = await payload.find({
    collection: "orders",
    sort: "-createdAt", // Sort by createdAt descending (newest first)
    limit,
  });

  return orders.docs.map((order) => ({
    id: String(order.id),
    polarOrderId: order.polarOrderId,
    email: order.email,
    totalAmount: order.totalAmount ?? 0,
    currency: order.currency ?? "USD",
    status: order.status as RecentOrder["status"],
    createdAt: order.createdAt,
  }));
}

/**
 * Get download statistics for a time period
 * Aggregates download counts from order items
 *
 * @param period - Time period to calculate stats for
 * @returns Download statistics with product breakdown
 */
export async function getDownloadStats(
  period: TimePeriod,
): Promise<DownloadStats> {
  const payload = await getPayload({ config });
  const dateRange = getDateRangeForPeriod(period);

  // Query all orders within the date range (include all statuses for download tracking)
  const orders = await payload.find({
    collection: "orders",
    where: {
      and: [
        { createdAt: { greater_than_equal: dateRange.start.toISOString() } },
        { createdAt: { less_than_equal: dateRange.end.toISOString() } },
      ],
    },
    limit: 0,
  });

  // Aggregate downloads by product
  const productDownloads = new Map<
    string,
    { title: string; downloads: number }
  >();
  let totalDownloads = 0;
  let ordersWithDownloads = 0;

  for (const order of orders.docs) {
    const items = order.items;
    let orderHasDownloads = false;

    for (const item of items) {
      const downloads = item.downloadsUsed ?? 0;
      if (downloads > 0) {
        orderHasDownloads = true;
        totalDownloads += downloads;

        const rawProductId =
          item.type === "bundle"
            ? typeof item.bundleId === "object"
              ? item.bundleId?.id
              : item.bundleId
            : typeof item.productId === "object"
              ? item.productId?.id
              : item.productId;

        if (rawProductId) {
          const productId = String(rawProductId);
          const existing = productDownloads.get(productId);
          if (existing) {
            existing.downloads += downloads;
          } else {
            productDownloads.set(productId, {
              title: item.title ?? "Unknown Product",
              downloads,
            });
          }
        }
      }
    }

    if (orderHasDownloads) {
      ordersWithDownloads++;
    }
  }

  // Calculate average downloads per order
  const averagePerOrder =
    ordersWithDownloads > 0
      ? Math.round((totalDownloads / ordersWithDownloads) * 100) / 100
      : 0;

  // Convert to array sorted by downloads descending
  const byProduct = Array.from(productDownloads.entries())
    .map(([productId, data]) => ({
      productId,
      title: data.title,
      downloads: data.downloads,
    }))
    .sort((a, b) => b.downloads - a.downloads);

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
export async function getDashboardData(
  period: TimePeriod,
): Promise<DashboardData> {
  // Fetch all data in parallel for better performance
  const [revenue, orders, topProducts, recentOrders, downloads] =
    await Promise.all([
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
