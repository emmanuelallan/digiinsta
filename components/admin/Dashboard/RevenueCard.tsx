"use client";

import { StatCard } from "../shared/StatCard";
import { formatCurrency } from "@/lib/analytics/currency-utils";
import type { RevenueStats } from "@/lib/analytics/types";

export interface RevenueCardProps {
  revenue: RevenueStats;
}

/**
 * RevenueCard - Displays total revenue with currency formatting
 * Requirements: 1.1, 1.4
 */
export function RevenueCard({ revenue }: RevenueCardProps) {
  const formattedTotal = formatCurrency(revenue.total, revenue.currency);

  // Format the date range for subtitle
  const startDate = new Date(revenue.period.start).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endDate = new Date(revenue.period.end).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const periodLabel = `${startDate} - ${endDate}`;

  return (
    <StatCard
      title="Total Revenue"
      value={formattedTotal}
      subtitle={periodLabel}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      }
    />
  );
}

export default RevenueCard;
