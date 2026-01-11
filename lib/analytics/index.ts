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

// Event tracking (Neon-based)
export type {
  AnalyticsEventType,
  AnalyticsItemType,
  TrackEventParams,
  TrackEventResult,
} from "./tracker";

export { trackEvent, trackView, trackAddToCart, trackPurchase, getEventCounts } from "./tracker";

// Best sellers (Neon-based)
export type { BestSellerItem, BestSellersOptions } from "./bestsellers";

export {
  getBestSellers,
  getBestSellingProducts,
  getBestSellingBundles,
  getSalesCount,
  getSalesCountsBatch,
} from "./bestsellers";

// Frequently bought together (Neon-based)
export type { CoPurchasedItem, FBTOptions } from "./fbt";

export {
  getFrequentlyBoughtTogether,
  getTopProductPairs,
  areFrequentlyBoughtTogether,
} from "./fbt";
