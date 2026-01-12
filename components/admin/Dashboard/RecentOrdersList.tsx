"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const getStatusVariant = (status: RecentOrder["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "refunded":
        return "outline";
      default:
        return "secondary";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
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
              className="text-muted-foreground/50"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p className="mt-4 font-medium">No orders yet</p>
            <span className="text-muted-foreground mt-1 text-sm">
              Orders will appear here once customers make purchases
            </span>
          </div>
        ) : (
          <ul className="divide-y">
            {orders.map((order) => (
              <li key={order.id}>
                <a
                  href={`/admin/collections/orders/${order.id}`}
                  className="hover:bg-muted/50 -mx-2 flex items-center justify-between rounded-md px-2 py-3 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-sm font-medium">
                      #{order.polarOrderId.slice(-8)}
                    </span>
                    <span className="text-muted-foreground max-w-[180px] truncate text-xs">
                      {order.email}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-medium tabular-nums">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className="text-xs capitalize"
                      >
                        {order.status}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentOrdersList;
