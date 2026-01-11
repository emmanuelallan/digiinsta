"use server";

import { sql } from "./db/client";
import { logger } from "./logger";

export interface RevenueStats {
  total: number;
  byUser: Record<string, { amount: number; email: string; name?: string }>;
  currency: string;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Calculate revenue by creator for a given period
 * Uses Neon PostgreSQL orders table
 */
export async function getRevenueByCreator(
  startDate: Date,
  endDate: Date,
  _userId?: string
): Promise<RevenueStats> {
  try {
    const orders = await sql`
      SELECT 
        o.id,
        o.total_amount,
        o.currency,
        o.created_at,
        oi.creator_sanity_id,
        oi.price
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed'
        AND o.created_at >= ${startDate.toISOString()}
        AND o.created_at <= ${endDate.toISOString()}
    `;

    let total = 0;
    const byUser: Record<string, { amount: number; email: string; name?: string }> = {};
    const currency = "usd";

    for (const order of orders) {
      const amount = (order.total_amount as number) / 100;
      total += amount;

      const creatorId = order.creator_sanity_id as string | null;
      if (creatorId) {
        if (!byUser[creatorId]) {
          byUser[creatorId] = {
            amount: 0,
            email: "creator@example.com",
            name: undefined,
          };
        }
        byUser[creatorId].amount += ((order.price as number) / 100) * 0.5; // 50% creator share
      }
    }

    return {
      total,
      byUser,
      currency,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  } catch (error) {
    logger.error({ error, startDate, endDate }, "Failed to calculate revenue");
    throw error;
  }
}

/**
 * Get monthly revenue for current month
 */
export async function getCurrentMonthRevenue(_userId?: string): Promise<RevenueStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return getRevenueByCreator(startOfMonth, endOfMonth, _userId);
}

/**
 * Get revenue summary for all users
 */
export async function getRevenueSummary(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  users: Array<{
    id: string;
    email: string;
    name?: string;
    amount: number;
    percentage: number;
  }>;
}> {
  const stats = await getRevenueByCreator(startDate, endDate);

  const users = Object.entries(stats.byUser).map(([id, data]) => ({
    id,
    email: data.email,
    name: data.name,
    amount: data.amount,
    percentage: stats.total > 0 ? (data.amount / stats.total) * 100 : 0,
  }));

  users.sort((a, b) => b.amount - a.amount);

  return {
    total: stats.total,
    users,
  };
}
