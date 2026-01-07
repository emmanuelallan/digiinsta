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
      <div className="admin-dashboard">
        <div className="admin-dashboard__header">
          <h1 className="admin-dashboard__title">Revenue Dashboard</h1>
          <PeriodSelector value={period} onChange={handlePeriodChange} />
        </div>
        <div className="admin-dashboard__error">
          <p>{error}</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      </div>
    );
  }

  // Loading state (only show if no data at all)
  if (!data) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard__header">
          <h1 className="admin-dashboard__title">Revenue Dashboard</h1>
          <PeriodSelector value={period} onChange={handlePeriodChange} />
        </div>
        <div className="admin-dashboard__loading">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Revenue Dashboard</h1>
        <PeriodSelector value={period} onChange={handlePeriodChange} />
      </div>

      {isPending && <div className="admin-dashboard__loading-overlay">Updating...</div>}

      <div className="admin-dashboard__grid">
        {/* Revenue Card - spans 4 columns */}
        <div className="admin-dashboard__col admin-dashboard__col--4">
          <RevenueCard revenue={data.revenue} />
        </div>

        {/* Orders Card - spans 4 columns */}
        <div className="admin-dashboard__col admin-dashboard__col--4">
          <OrdersCard orders={data.orders} />
        </div>

        {/* Goal Progress Card - spans 4 columns */}
        <div className="admin-dashboard__col admin-dashboard__col--4">
          <GoalProgressCard partners={data.revenue.byPartner} goalAmount={goalAmount} />
        </div>

        {/* Top Products Table - spans 6 columns */}
        <div className="admin-dashboard__col admin-dashboard__col--6">
          <TopProductsTable products={data.topProducts} />
        </div>

        {/* Recent Orders List - spans 6 columns */}
        <div className="admin-dashboard__col admin-dashboard__col--6">
          <RecentOrdersList orders={data.recentOrders} />
        </div>

        {/* Download Stats - spans 12 columns (full width) */}
        <div className="admin-dashboard__col admin-dashboard__col--12">
          <DownloadStats downloads={data.downloads} />
        </div>
      </div>
    </div>
  );
}

export default DashboardClient;
