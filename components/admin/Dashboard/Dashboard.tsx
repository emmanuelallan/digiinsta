/**
 * Dashboard Server Component
 * Main dashboard view that fetches initial data and composes all dashboard components
 * Requirements: 1.1, 1.5, 2.4
 */

import { getDashboardData, PARTNER_REVENUE_GOAL_CENTS } from "@/lib/analytics";
import type { TimePeriod, DashboardData } from "@/lib/analytics/types";
import { DashboardClient } from "./DashboardClient";

export interface DashboardProps {
  initialPeriod?: TimePeriod;
}

/**
 * Dashboard - Server component that fetches initial data
 * Defaults to "this-month" period on initial load (Requirement 2.4)
 * Updates data on each page load without manual refresh (Requirement 1.5)
 */
export async function Dashboard({
  initialPeriod = "this-month",
}: DashboardProps) {
  let initialData: DashboardData | null = null;
  let error: string | null = null;

  try {
    initialData = await getDashboardData(initialPeriod);
  } catch (e) {
    console.error("Failed to fetch dashboard data:", e);
    error = "Unable to load dashboard data. Please try again.";
  }

  return (
    <DashboardClient
      initialData={initialData}
      initialPeriod={initialPeriod}
      initialError={error}
      goalAmount={PARTNER_REVENUE_GOAL_CENTS}
    />
  );
}

export default Dashboard;
