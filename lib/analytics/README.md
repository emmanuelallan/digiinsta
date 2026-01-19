# Umami Analytics Integration

This directory contains the Umami analytics integration for tracking user behavior and events.

## Setup

1. Add the following environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_UMAMI_WEBSITE_ID="your-website-id"
NEXT_PUBLIC_UMAMI_SCRIPT_URL="https://cloud.umami.is/script.js"
```

**Important:** The `NEXT_PUBLIC_` prefix is required for these variables to be accessible in client components.

2. The Umami script is automatically loaded in the root layout (`app/layout.tsx`).

## Usage

### Automatic Tracking

- **Page views** are automatically tracked by Umami when the script loads
- No additional code needed for basic page view tracking

### Custom Event Tracking

Import the tracking functions and use them in your components:

```tsx
"use client";

import { trackEvent, trackProductView, trackAddToCart } from "@/lib/analytics/umami";

// Track a custom event
trackEvent("button_click", { button_name: "signup" });

// Track product view
trackProductView("motherhood-planner", "Motherhood Planner");

// Track add to cart
trackAddToCart("motherhood-planner", "Motherhood Planner", 29.99);
```

### Available Tracking Functions

- `trackEvent(eventName, eventData?)` - Generic event tracking
- `trackPageView(url?)` - Manual page view tracking
- `trackProductView(slug, name)` - Product page view
- `trackAddToCart(slug, name, price)` - Add to cart event
- `trackRemoveFromCart(slug)` - Remove from cart event
- `trackCheckoutStart(total, itemCount)` - Checkout initiation
- `trackPurchase(orderId, total, itemCount)` - Purchase completion
- `trackCategoryView(slug, name)` - Category page view
- `trackBundleView(slug, name)` - Bundle page view
- `trackSearch(query, resultCount)` - Search query
- `trackNewsletterSignup(email)` - Newsletter signup
- `trackContactForm()` - Contact form submission

## Example: Product Page

```tsx
"use client";

import { useEffect } from "react";
import { trackProductView } from "@/lib/analytics/umami";

export function ProductPage({ product }) {
  useEffect(() => {
    trackProductView(product.slug, product.name);
  }, [product.slug, product.name]);

  return <div>...</div>;
}
```

## Example: Add to Cart Button

```tsx
"use client";

import { trackAddToCart } from "@/lib/analytics/umami";

export function AddToCartButton({ product }) {
  const handleClick = () => {
    trackAddToCart(product.slug, product.name, product.price);
    // ... rest of add to cart logic
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

## Privacy

Umami is privacy-focused and GDPR compliant:
- No cookies used
- No personal data collected
- IP addresses are anonymized
- Compliant with privacy regulations

## Development

In development, the script will only load if the environment variables are set. This allows you to develop without analytics tracking if needed.
