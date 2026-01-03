# Design Document: Admin Revenue & Analytics Dashboard

## Overview

This design document outlines the implementation of a custom admin dashboard for DigiInsta using Payload CMS 3.0's custom views system. The dashboard will provide real-time revenue tracking, partner attribution, order statistics, and product performance metrics directly within the Payload admin panel.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Payload Admin Panel                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Custom Dashboard View                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │ Revenue Card │  │ Orders Card  │  │ Goal Card │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  │  ┌──────────────────────┐  ┌─────────────────────┐  │   │
│  │  │ Top Products Table   │  │ Recent Orders List  │  │   │
│  │  └──────────────────────┘  └─────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │           Partner Revenue Breakdown           │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Analytics Service Layer                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐  │
│  │ getRevenueStats │  │ getOrderStats   │  │ getTopProd │  │
│  └─────────────────┘  └─────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Payload Collections                       │
│         Orders    │    Products    │    Users                │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
components/admin/
├── Dashboard/
│   ├── index.tsx              # Main dashboard component
│   ├── RevenueCard.tsx        # Revenue summary card
│   ├── OrdersCard.tsx         # Order statistics card
│   ├── GoalProgressCard.tsx   # Partner goal progress
│   ├── TopProductsTable.tsx   # Top selling products
│   ├── RecentOrdersList.tsx   # Recent orders list
│   ├── PartnerBreakdown.tsx   # Revenue by partner
│   ├── PeriodSelector.tsx     # Time period dropdown
│   └── DownloadStats.tsx      # Download analytics
└── shared/
    ├── StatCard.tsx           # Reusable stat card
    └── DataTable.tsx          # Reusable data table
```

## Components and Interfaces

### Data Types

```typescript
// lib/analytics/types.ts

export type TimePeriod =
  | "this-month"
  | "last-month"
  | "last-7-days"
  | "last-30-days"
  | "this-year";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface RevenueStats {
  total: number;
  currency: string;
  period: DateRange;
  byPartner: PartnerRevenue[];
}

export interface PartnerRevenue {
  userId: string;
  email: string;
  name?: string;
  amount: number;
  percentage: number;
  goalProgress: number; // percentage toward $400 goal
}

export interface OrderStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  averageOrderValue: number;
}

export interface ProductPerformance {
  productId: string;
  title: string;
  unitsSold: number;
  revenue: number;
  isBundle: boolean;
}

export interface DownloadStats {
  totalDownloads: number;
  averagePerOrder: number;
  byProduct: Array<{
    productId: string;
    title: string;
    downloads: number;
  }>;
}

export interface RecentOrder {
  id: string;
  polarOrderId: string;
  email: string;
  totalAmount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
}

export interface DashboardData {
  revenue: RevenueStats;
  orders: OrderStats;
  topProducts: ProductPerformance[];
  recentOrders: RecentOrder[];
  downloads: DownloadStats;
}
```

### Analytics Service

```typescript
// lib/analytics/index.ts

export async function getDashboardData(
  period: TimePeriod,
): Promise<DashboardData>;
export async function getRevenueStats(
  period: TimePeriod,
): Promise<RevenueStats>;
export async function getOrderStats(period: TimePeriod): Promise<OrderStats>;
export async function getTopProducts(
  period: TimePeriod,
  limit?: number,
): Promise<ProductPerformance[]>;
export async function getRecentOrders(limit?: number): Promise<RecentOrder[]>;
export async function getDownloadStats(
  period: TimePeriod,
): Promise<DownloadStats>;
export function getDateRangeForPeriod(period: TimePeriod): DateRange;
```

### Dashboard Component Props

```typescript
// Main Dashboard
interface DashboardProps {
  initialData: DashboardData;
  initialPeriod: TimePeriod;
}

// Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

// Goal Progress Card
interface GoalProgressCardProps {
  partners: PartnerRevenue[];
  goalAmount: number; // $400
}

// Period Selector
interface PeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}
```

## Data Models

The dashboard uses existing Payload collections:

### Orders Collection (existing)

- `polarOrderId`: string
- `email`: string
- `status`: 'pending' | 'completed' | 'failed' | 'refunded'
- `totalAmount`: number (cents)
- `currency`: string
- `items`: array with `downloadsUsed` tracking
- `createdBy`: relationship to users (revenue attribution)
- `createdAt`: timestamp

### Products Collection (existing)

- `id`: string
- `title`: string
- `createdBy`: relationship to users

### Users Collection (existing)

- `id`: string
- `email`: string
- `name`: string
- `role`: 'admin' | 'customer'

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Revenue sum consistency

_For any_ set of completed orders with partner attribution, the sum of all individual partner revenue amounts SHALL equal the total revenue amount.
**Validates: Requirements 1.2**

### Property 2: Order status counts sum to total

_For any_ set of orders in a time period, the sum of orders by status (completed + pending + failed + refunded) SHALL equal the total order count.
**Validates: Requirements 3.2**

### Property 3: Date range validity

_For any_ time period selection, the generated date range SHALL have a start date that is before or equal to the end date.
**Validates: Requirements 2.3**

### Property 4: Goal progress calculation bounds

_For any_ partner revenue amount (non-negative), the goal progress percentage SHALL equal min((amount / 400) \* 100, 100), always between 0 and 100 inclusive.
**Validates: Requirements 1.3**

### Property 5: Top products ordering by revenue

_For any_ list of top products returned by the analytics service, products SHALL be sorted by revenue in strictly descending order (highest first).
**Validates: Requirements 4.3**

### Property 6: Recent orders ordering by date

_For any_ list of recent orders returned by the analytics service, orders SHALL be sorted by creation timestamp in strictly descending order (newest first).
**Validates: Requirements 5.1**

### Property 7: Average order value calculation

_For any_ set of completed orders with total revenue R and count N (where N > 0), the average order value SHALL equal R / N.
**Validates: Requirements 3.3**

### Property 8: Currency formatting round-trip

_For any_ valid USD amount in cents, formatting to display string and parsing back SHALL preserve the original value (within rounding tolerance).
**Validates: Requirements 1.4**

## Error Handling

### Database Query Errors

- Log error with Pino logger
- Display user-friendly error message in dashboard
- Show "Unable to load data" with retry option

### Empty Data States

- Display appropriate empty state messages
- "No orders yet" for empty orders
- "No products sold" for empty product performance

### Access Control Errors

- Redirect non-admin users to admin login
- Use Payload's built-in access control

## Testing Strategy

### Unit Tests

- Test date range calculations for each period type
- Test revenue aggregation logic
- Test goal progress percentage calculation
- Test currency formatting

### Property-Based Tests

- Property 1: Revenue sum consistency
- Property 2: Order status count consistency
- Property 4: Goal progress calculation bounds

### Integration Tests

- Test dashboard data fetching with mock Payload
- Test period switching updates data correctly
- Test access control denies non-admin users

### Testing Framework

- Vitest for unit and property tests
- fast-check for property-based testing
- Minimum 100 iterations per property test

## Implementation Notes

### Payload Custom Views

Payload 3.0 supports custom admin views via the `admin.components.views` configuration. We'll add a custom dashboard view that replaces or supplements the default admin dashboard.

### Server Components

The dashboard will use React Server Components for initial data fetching, with client components for interactivity (period selection).

### Styling

Use Payload's built-in SCSS variables and design system for consistent styling with the admin panel. Custom styles in `app/(payload)/custom.scss`.

### Performance

- Server-side data fetching on initial load
- Client-side period switching with loading states
- Limit queries (top 5 products, 5 recent orders)
- Use Payload's query optimization
