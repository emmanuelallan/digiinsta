"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Order Statistics
          </CardTitle>
          <span className="text-sm font-semibold">{orders.total} total</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Completed</span>
            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
              {orders.completed}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Pending</span>
            <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {orders.pending}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Failed</span>
            <span className="text-lg font-semibold text-red-600 dark:text-red-400">
              {orders.failed}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Refunded</span>
            <span className="text-muted-foreground text-lg font-semibold">{orders.refunded}</span>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Average Order Value</span>
            <span className="text-lg font-bold">{formattedAOV}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrdersCard;
