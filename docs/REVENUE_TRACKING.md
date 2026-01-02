# Revenue Tracking & Attribution System

## Overview

The system tracks revenue attribution for two owners (ME and PARTNER) to support the $400/month goal tracking. Revenue is attributed based on which products are purchased.

## Key Concepts

### 1. Product Owner (`products.owner`)
- **ME**: Products created by you
- **PARTNER**: Products created by your partner
- Set when creating/editing products in Payload CMS

### 2. Order Owner Attribution (`orders.ownerAttribution`)
- Calculated automatically when order is created via Polar webhook
- Logic:
  - If all products belong to one owner → that owner gets credit
  - If mixed products → owner with more products gets credit
  - Used for revenue reporting

### 3. Revenue Calculation

Revenue is calculated from **completed orders only**:
- `orders.status = "completed"`
- `orders.totalAmount` (in cents, converted to dollars)
- `orders.ownerAttribution` determines who gets credit

## Usage

### Get Current Month Revenue

```typescript
import { getCurrentMonthRevenue } from "@/lib/revenue";

// Get total revenue for current month
const stats = await getCurrentMonthRevenue();
console.log(`Total: $${stats.total}`);
console.log(`ME: $${stats.me}`);
console.log(`Partner: $${stats.partner}`);

// Get only your revenue
const myStats = await getCurrentMonthRevenue("ME");
console.log(`My revenue: $${myStats.me}`);

// Get only partner revenue
const partnerStats = await getCurrentMonthRevenue("PARTNER");
console.log(`Partner revenue: $${partnerStats.partner}`);
```

### Get Revenue for Custom Period

```typescript
import { getRevenueByOwner } from "@/lib/revenue";

const startDate = new Date("2026-01-01");
const endDate = new Date("2026-01-31");

const stats = await getRevenueByOwner(startDate, endDate);
```

### Get Revenue by Product Creator

This shows which products are selling, regardless of order attribution:

```typescript
import { getRevenueByProductOwner } from "@/lib/revenue";

const startDate = new Date("2026-01-01");
const endDate = new Date("2026-01-31");

const revenue = await getRevenueByProductOwner(startDate, endDate);
console.log(`Products I created: $${revenue.ME}`);
console.log(`Products partner created: $${revenue.PARTNER}`);
```

## Revenue Attribution Logic

When an order is created via Polar webhook:

1. **Extract products** from order items
2. **Fetch product owners** from Payload
3. **Calculate attribution**:
   - Count products per owner
   - If all same owner → use that owner
   - If mixed → use owner with more products
   - If equal → default to "ME"

This happens in `app/api/webhooks/polar/route.ts` → `calculateOwnerAttribution()`

## Bundle Handling

When a bundle is purchased:
- Bundle is expanded to individual products
- Each product's owner is checked
- Attribution calculated based on all products

**Important**: Users own **products**, not bundles. Bundles are just pricing shortcuts.

## Dashboard Integration

To build a revenue dashboard:

```typescript
// app/(admin)/dashboard/revenue/page.tsx
import { getCurrentMonthRevenue } from "@/lib/revenue";

export default async function RevenuePage() {
  const stats = await getCurrentMonthRevenue();
  const goal = 400; // $400/month goal
  const progress = (stats.partner / goal) * 100;

  return (
    <div>
      <h1>Revenue Dashboard</h1>
      <div>
        <h2>Partner Progress</h2>
        <p>${stats.partner} / ${goal}</p>
        <progress value={progress} max={100} />
        <p>{progress.toFixed(1)}% to goal</p>
      </div>
      <div>
        <h2>Total Revenue</h2>
        <p>ME: ${stats.me}</p>
        <p>Partner: ${stats.partner}</p>
        <p>Total: ${stats.total}</p>
      </div>
    </div>
  );
}
```

## Notes

- Revenue is in **dollars** (converted from cents)
- Only **completed** orders count
- Attribution is set **at purchase time** (doesn't change if product owner changes later)
- Supports **guest checkout** (userId can be null)

