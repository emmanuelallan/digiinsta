"use client";

import { formatCurrency } from "@/lib/analytics/currency-utils";
import type { RecentOrder } from "@/lib/analytics/types";

export interface RecentOrdersListProps {
  orders: RecentOrder[];
}

/**
 * RecentOrdersList - Displays 5 recent orders with links to detail view
 * Handles empty state with friendly message
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  const getStatusClass = (status: RecentOrder["status"]) => {
    switch (status) {
      case "completed":
        return "recent-orders-list__status--completed";
      case "pending":
        return "recent-orders-list__status--pending";
      case "failed":
        return "recent-orders-list__status--failed";
      case "refunded":
        return "recent-orders-list__status--refunded";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="recent-orders-list">
      <div className="recent-orders-list__header">
        <h3 className="recent-orders-list__title">Recent Orders</h3>
      </div>

      {orders.length === 0 ? (
        <div className="recent-orders-list__empty">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p>No orders yet</p>
          <span>Orders will appear here once customers make purchases</span>
        </div>
      ) : (
        <ul className="recent-orders-list__list">
          {orders.map((order) => (
            <li key={order.id} className="recent-orders-list__item">
              <a
                href={`/admin/collections/orders/${order.id}`}
                className="recent-orders-list__link"
              >
                <div className="recent-orders-list__order-info">
                  <span className="recent-orders-list__order-id">
                    #{order.polarOrderId.slice(-8)}
                  </span>
                  <span className="recent-orders-list__email">
                    {order.email}
                  </span>
                </div>
                <div className="recent-orders-list__order-meta">
                  <span className="recent-orders-list__amount">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </span>
                  <span
                    className={`recent-orders-list__status ${getStatusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                  <span className="recent-orders-list__date">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentOrdersList;
