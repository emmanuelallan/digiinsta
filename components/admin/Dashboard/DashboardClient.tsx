"use client";

/**
 * DashboardClient - Client wrapper for dashboard interactivity
 * Handles period selection state and triggers data refresh on period change
 * Requirements: 2.2
 */

import { useState, useCallback, useTransition } from "react";
import type { TimePeriod, DashboardData } from "@/lib/analytics/types";
import { RevenueCard } from "./RevenueCard";
import { GoalProgressCard } from "./GoalProgressCard";
import { OrdersCard } from "./OrdersCard";
import { TopProductsTable } from "./TopProductsTable";
import { RecentOrdersList } from "./RecentOrdersList";
import { DownloadStats } from "./DownloadStats";
import { PeriodSelector } from "./PeriodSelector";
import { Button } from "@/components/ui/button";

export interface DashboardClientProps {
  initialData: DashboardData | null;
  initialPeriod: TimePeriod;
  initialError: string | null;
  goalAmount: number;
}

/**
 * DashboardClient - Handles client-side interactivity for the dashboard
 * Manages period selection and data refresh
 */
export function DashboardClient({
  initialData,
  initialPeriod,
  initialError,
  goalAmount,
}: DashboardClientProps) {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [period, setPeriod] = useState<TimePeriod>(initialPeriod);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = useCallback((newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
    setError(null);

    startTransition(() => {
      fetch(`/api/analytics?period=${newPeriod}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          return response.json();
        })
        .then((newData) => {
          setData(newData);
        })
        .catch((e) => {
          console.error("Failed to fetch dashboard data:", e);
          setError("Unable to load data. Please try again.");
        });
    });
  }, []);

  const handleRetry = useCallback(() => {
    handlePeriodChange(period);
  }, [handlePeriodChange, period]);

  // Error state
  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Revenue Dashboard</h1>
          <PeriodSelector value={period} onChange={handlePeriodChange} />
        </div>
        <div className="border-destructive/50 bg-destructive/10 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={handleRetry} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Loading state (only show if no data at all)
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Revenue Dashboard</h1>
          <PeriodSelector value={period} onChange={handlePeriodChange} />
        </div>
        <div className="bg-muted/50 flex items-center justify-center rounded-lg border p-8">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Revenue Dashboard</h1>
        <PeriodSelector value={period} onChange={handlePeriodChange} />
      </div>

      {isPending && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-card rounded-lg p-4 shadow-lg">
            <p className="text-muted-foreground text-sm">Updating...</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Card */}
        <RevenueCard revenue={data.revenue} />

        {/* Orders Card */}
        <OrdersCard orders={data.orders} />

        {/* Goal Progress Card */}
        <GoalProgressCard partners={data.revenue.byPartner} goalAmount={goalAmount} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products Table */}
        <TopProductsTable products={data.topProducts} />

        {/* Recent Orders List */}
        <RecentOrdersList orders={data.recentOrders} />
      </div>

      {/* Download Stats - Full width */}
      <DownloadStats downloads={data.downloads} />
    </div>
  );
}

export default DashboardClient;
