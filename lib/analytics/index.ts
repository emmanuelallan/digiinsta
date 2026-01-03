/**
 * Analytics Module
 * Exports all analytics types and utilities
 */

// Types
export type {
  TimePeriod,
  DateRange,
  RevenueStats,
  PartnerRevenue,
  OrderStats,
  ProductPerformance,
  DownloadStats,
  RecentOrder,
  DashboardData,
} from "./types";

export { PARTNER_REVENUE_GOAL_CENTS } from "./types";

// Date utilities
export {
  getDateRangeForPeriod,
  formatDateRange,
  isDateInRange,
  ALL_TIME_PERIODS,
} from "./date-utils";

// Currency utilities
export {
  formatCurrency,
  parseCurrency,
  formatCurrencyCompact,
  calculatePercentage,
  calculateGoalProgress,
} from "./currency-utils";

// Analytics service functions
export {
  getRevenueStats,
  getOrderStats,
  getTopProducts,
  getRecentOrders,
  getDownloadStats,
  getDashboardData,
} from "./service";
