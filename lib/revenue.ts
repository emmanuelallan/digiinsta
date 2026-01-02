"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { logger } from "./logger";

export interface RevenueStats {
  total: number;
  me: number;
  partner: number;
  currency: string;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Calculate revenue by owner for a given period
 * Used for tracking $400/month goal
 */
export async function getRevenueByOwner(
  startDate: Date,
  endDate: Date,
  _owner?: "ME" | "PARTNER",
): Promise<RevenueStats> {
  const payload = await getPayload({ config });

  try {
    const orders = await payload.find({
      collection: "orders" as const,
      where: {
        status: {
          equals: "completed",
        },
        createdAt: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
        ...(_owner ? { ownerAttribution: { equals: _owner } } : {}),
      },
      limit: 10000,
    });

    let total = 0;
    let me = 0;
    let partner = 0;
    const currency = "usd"; // Default, could be dynamic

    for (const order of orders.docs) {
      const orderData = order as {
        totalAmount: number;
        currency: string;
        ownerAttribution: "ME" | "PARTNER";
      };

      const amount = orderData.totalAmount / 100; // Convert from cents

      total += amount;

      if (orderData.ownerAttribution === "ME") {
        me += amount;
      } else {
        partner += amount;
      }
    }

    return {
      total,
      me,
      partner,
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
  owner?: "ME" | "PARTNER",
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

  return getRevenueByOwner(startOfMonth, endOfMonth, owner);
}

/**
 * Get revenue by product owner (who created the product)
 * This tracks which products are selling, not just who gets the revenue
 */
export async function getRevenueByProductOwner(
  startDate: Date,
  endDate: Date,
): Promise<{ ME: number; PARTNER: number }> {
  const payload = await getPayload({ config });

  try {
    const orders = await payload.find({
      collection: "orders" as any,
      where: {
        status: {
          equals: "completed",
        },
        createdAt: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
      },
      limit: 10000,
    });

    const revenue: { ME: number; PARTNER: number } = { ME: 0, PARTNER: 0 };

    for (const order of orders.docs) {
      const orderData = order as {
        items: Array<{
          productId?: string;
          type: string;
        }>;
        totalAmount: number;
      };

      // Calculate per-item revenue (simple average for now)
      const itemCount = orderData.items.length;
      const amountPerItem = orderData.totalAmount / 100 / itemCount;

      for (const item of orderData.items) {
        if (item.type === "product" && item.productId) {
          try {
            const product = (await payload.findByID({
              collection: "products" as any,
              id: item.productId,
            })) as unknown as { owner: "ME" | "PARTNER" };

            revenue[product.owner] += amountPerItem;
          } catch (error) {
            logger.error(
              { error, productId: item.productId },
              "Failed to fetch product owner",
            );
          }
        }
      }
    }

    return revenue;
  } catch (error) {
    logger.error({ error }, "Failed to calculate revenue by product owner");
    throw error;
  }
}
