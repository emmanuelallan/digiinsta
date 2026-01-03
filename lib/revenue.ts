"use server";

import { getPayload } from "payload";
import config from "@payload-config";
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
 * Groups revenue by the user who created the products
 */
export async function getRevenueByCreator(
  startDate: Date,
  endDate: Date,
  userId?: string,
): Promise<RevenueStats> {
  const payload = await getPayload({ config });

  try {
    const orders = await payload.find({
      collection: "orders",
      where: {
        status: {
          equals: "completed",
        },
        createdAt: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
        ...(userId ? { createdBy: { equals: userId } } : {}),
      },
      depth: 1, // Get createdBy user details
      limit: 10000,
    });

    let total = 0;
    const byUser: Record<
      string,
      { amount: number; email: string; name?: string }
    > = {};
    const currency = "usd";

    for (const order of orders.docs) {
      const orderData = order as {
        totalAmount: number;
        currency: string;
        createdBy?: { id: string; email: string; name?: string } | string;
      };

      const amount = orderData.totalAmount / 100; // Convert from cents
      total += amount;

      // Get creator info
      const creator = orderData.createdBy;
      if (creator) {
        const creatorId = typeof creator === "string" ? creator : creator.id;
        const creatorEmail =
          typeof creator === "string" ? "Unknown" : creator.email;
        const creatorName =
          typeof creator === "string" ? undefined : creator.name;

        if (!byUser[creatorId]) {
          byUser[creatorId] = {
            amount: 0,
            email: creatorEmail,
            name: creatorName,
          };
        }
        byUser[creatorId].amount += amount;
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
export async function getCurrentMonthRevenue(
  userId?: string,
): Promise<RevenueStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  return getRevenueByCreator(startOfMonth, endOfMonth, userId);
}

/**
 * Get revenue summary for all users
 */
export async function getRevenueSummary(
  startDate: Date,
  endDate: Date,
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

  // Sort by amount descending
  users.sort((a, b) => b.amount - a.amount);

  return {
    total: stats.total,
    users,
  };
}
