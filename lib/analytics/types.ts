/**
 * Analytics Types
 * Type definitions for the admin revenue & analytics dashboard
 */

/**
 * Time period options for filtering analytics data
 */
export type TimePeriod =
  | "this-month"
  | "last-month"
  | "last-7-days"
  | "last-30-days"
  | "this-year";

/**
 * Date range with start and end dates
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Revenue statistics for a time period
 */
export interface RevenueStats {
  total: number;
  currency: string;
  period: DateRange;
  byPartner: PartnerRevenue[];
}

/**
 * Revenue breakdown for a single partner
 */
export interface PartnerRevenue {
  userId: string;
  email: string;
  name?: string;
  amount: number;
  percentage: number;
  goalProgress: number; // percentage toward $400 goal (0-100)
}

/**
 * Order statistics for a time period
 */
export interface OrderStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  averageOrderValue: number;
}

/**
 * Product performance metrics
 */
export interface ProductPerformance {
  productId: string;
  title: string;
  unitsSold: number;
  revenue: number;
  isBundle: boolean;
}

/**
 * Download statistics
 */
export interface DownloadStats {
  totalDownloads: number;
  averagePerOrder: number;
  byProduct: Array<{
    productId: string;
    title: string;
    downloads: number;
  }>;
}

/**
 * Recent order summary
 */
export interface RecentOrder {
  id: string;
  polarOrderId: string;
  email: string;
  totalAmount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
}

/**
 * Complete dashboard data aggregation
 */
export interface DashboardData {
  revenue: RevenueStats;
  orders: OrderStats;
  topProducts: ProductPerformance[];
  recentOrders: RecentOrder[];
  downloads: DownloadStats;
}

/**
 * Monthly revenue goal per partner in cents
 */
export const PARTNER_REVENUE_GOAL_CENTS = 40000; // $400.00
