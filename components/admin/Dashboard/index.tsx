/**
 * Dashboard Components Index
 * Exports all dashboard UI components
 */

// Main dashboard components
export { Dashboard } from "./Dashboard";
export { DashboardClient } from "./DashboardClient";
export { DashboardView } from "./DashboardView";
export { DashboardNavLink } from "./DashboardNavLink";

// Individual dashboard widgets
export { RevenueCard } from "./RevenueCard";
export { GoalProgressCard } from "./GoalProgressCard";
export { OrdersCard } from "./OrdersCard";
export { TopProductsTable } from "./TopProductsTable";
export { RecentOrdersList } from "./RecentOrdersList";
export { DownloadStats } from "./DownloadStats";
export { PeriodSelector } from "./PeriodSelector";

// Type exports
export type { DashboardProps } from "./Dashboard";
export type { DashboardClientProps } from "./DashboardClient";
export type { RevenueCardProps } from "./RevenueCard";
export type { GoalProgressCardProps } from "./GoalProgressCard";
export type { OrdersCardProps } from "./OrdersCard";
export type { TopProductsTableProps } from "./TopProductsTable";
export type { RecentOrdersListProps } from "./RecentOrdersList";
export type { DownloadStatsProps } from "./DownloadStats";
export type { PeriodSelectorProps } from "./PeriodSelector";
