"use client";

import { formatCurrency } from "@/lib/analytics/currency-utils";
import type { OrderStats } from "@/lib/analytics/types";

export interface OrdersCardProps {
  orders: OrderStats;
}

/**
 * OrdersCard - Displays order counts by status and average order value
 * Requirements: 3.1, 3.2, 3.3
 */
export function OrdersCard({ orders }: OrdersCardProps) {
  const formattedAOV = formatCurrency(orders.averageOrderValue);

  return (
    <div className="orders-card">
      <div className="orders-card__header">
        <h3 className="orders-card__title">Order Statistics</h3>
        <span className="orders-card__total">{orders.total} total</span>
      </div>

      <div className="orders-card__stats">
        <div className="orders-card__stat">
          <span className="orders-card__stat-label">Completed</span>
          <span className="orders-card__stat-value orders-card__stat-value--completed">
            {orders.completed}
          </span>
        </div>
        <div className="orders-card__stat">
          <span className="orders-card__stat-label">Pending</span>
          <span className="orders-card__stat-value orders-card__stat-value--pending">
            {orders.pending}
          </span>
        </div>
        <div className="orders-card__stat">
          <span className="orders-card__stat-label">Failed</span>
          <span className="orders-card__stat-value orders-card__stat-value--failed">
            {orders.failed}
          </span>
        </div>
        <div className="orders-card__stat">
          <span className="orders-card__stat-label">Refunded</span>
          <span className="orders-card__stat-value orders-card__stat-value--refunded">
            {orders.refunded}
          </span>
        </div>
      </div>

      <div className="orders-card__aov">
        <span className="orders-card__aov-label">Average Order Value</span>
        <span className="orders-card__aov-value">{formattedAOV}</span>
      </div>
    </div>
  );
}

export default OrdersCard;
