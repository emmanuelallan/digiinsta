# Implementation Plan: Admin Revenue & Analytics Dashboard

## Overview

This implementation plan covers building a custom admin dashboard for DigiInsta using Payload CMS 3.0's custom views system. The dashboard provides revenue tracking, partner attribution, order statistics, and product performance metrics.

## Tasks

- [x] 1. Set up analytics types and utilities
  - [x] 1.1 Create analytics types file with all interfaces
    - Create `lib/analytics/types.ts` with TimePeriod, DateRange, RevenueStats, OrderStats, etc.
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_
  - [x] 1.2 Create date range utility functions
    - Implement `getDateRangeForPeriod()` for all period types
    - _Requirements: 2.2, 2.3_
  - [x] 1.3 Write property test for date range validity
    - **Property 3: Date range validity**
    - **Validates: Requirements 2.3**
  - [x] 1.4 Create currency formatting utilities
    - Implement `formatCurrency()` and `parseCurrency()` functions
    - _Requirements: 1.4_
  - [x] 1.5 Write property test for currency formatting round-trip
    - **Property 8: Currency formatting round-trip**
    - **Validates: Requirements 1.4**

- [x] 2. Implement analytics service functions
  - [x] 2.1 Implement getRevenueStats function
    - Query orders collection, aggregate by partner
    - Calculate goal progress for each partner
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.2 Write property test for revenue sum consistency
    - **Property 1: Revenue sum consistency**
    - **Validates: Requirements 1.2**
  - [x] 2.3 Write property test for goal progress calculation
    - **Property 4: Goal progress calculation bounds**
    - **Validates: Requirements 1.3**
  - [x] 2.4 Implement getOrderStats function
    - Query orders, count by status, calculate AOV
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 2.5 Write property test for order status counts
    - **Property 2: Order status counts sum to total**
    - **Validates: Requirements 3.2**
  - [x] 2.6 Write property test for average order value
    - **Property 7: Average order value calculation**
    - **Validates: Requirements 3.3**
  - [x] 2.7 Implement getTopProducts function
    - Aggregate product sales from order items
    - Sort by revenue descending, limit to 5
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 2.8 Write property test for top products ordering
    - **Property 5: Top products ordering by revenue**
    - **Validates: Requirements 4.3**
  - [x] 2.9 Implement getRecentOrders function
    - Query orders sorted by createdAt descending, limit 5
    - _Requirements: 5.1, 5.2_
  - [x] 2.10 Write property test for recent orders ordering
    - **Property 6: Recent orders ordering by date**
    - **Validates: Requirements 5.1**
  - [x] 2.11 Implement getDownloadStats function
    - Aggregate downloadsUsed from order items
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 2.12 Implement getDashboardData aggregator function
    - Combine all stats into single DashboardData response
    - _Requirements: 1.1, 3.1, 4.1, 5.1, 6.1_

- [ ] 3. Checkpoint - Ensure analytics service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create dashboard UI components
  - [x] 4.1 Create StatCard shared component
    - Reusable card with title, value, subtitle, optional trend
    - Use Payload admin styling
    - _Requirements: 1.1, 3.1_
  - [x] 4.2 Create RevenueCard component
    - Display total revenue with currency formatting
    - _Requirements: 1.1, 1.4_
  - [x] 4.3 Create GoalProgressCard component
    - Display partner breakdown with progress bars toward $400 goal
    - _Requirements: 1.2, 1.3_
  - [x] 4.4 Create OrdersCard component
    - Display order counts by status and AOV
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 4.5 Create TopProductsTable component
    - Display top 5 products with title, units, revenue
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 4.6 Create RecentOrdersList component
    - Display 5 recent orders with links to detail view
    - Handle empty state
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 4.7 Create DownloadStats component
    - Display total downloads and average per order
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 4.8 Create PeriodSelector component
    - Dropdown with period options, triggers data refresh
    - _Requirements: 2.1, 2.2, 2.4_

- [x] 5. Create main dashboard view
  - [x] 5.1 Create Dashboard server component
    - Fetch initial data with getDashboardData
    - Compose all dashboard components
    - _Requirements: 1.1, 1.5, 2.4_
  - [x] 5.2 Create DashboardClient wrapper for interactivity
    - Handle period selection state
    - Trigger data refresh on period change
    - _Requirements: 2.2_
  - [x] 5.3 Add dashboard styles to custom.scss
    - Grid layout for cards
    - Responsive design
    - _Requirements: 1.1_

- [x] 6. Integrate dashboard into Payload admin
  - [x] 6.1 Configure custom admin view in payload.config.ts
    - Add dashboard as custom view component
    - Set up route for /admin/dashboard
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 6.2 Add dashboard link to admin navigation
    - Add nav item pointing to dashboard view
    - _Requirements: 7.2_
  - [x] 6.3 Implement access control for dashboard
    - Verify admin role before rendering
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks including property-based tests are required for comprehensive validation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Dashboard uses Payload's built-in styling system, not shadcn (shadcn reserved for storefront)
