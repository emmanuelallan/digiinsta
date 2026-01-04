"use client";

import Script from "next/script";

const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

/**
 * Analytics component
 * Supports Plausible or DataFast
 */
export function Analytics() {
  if (!ANALYTICS_ID) {
    return null;
  }

  // Determine if it's Plausible or DataFast based on domain
  const isPlausible = ANALYTICS_ID.includes("plausible") || ANALYTICS_ID.includes("js");

  if (isPlausible) {
    return <Script defer data-domain={ANALYTICS_ID} src="https://plausible.io/js/script.js" />;
  }

  // DataFast - include queue script for reliable tracking
  return (
    <>
      {/* DataFast queue script - ensures events are captured before main script loads */}
      <Script id="datafast-queue" strategy="afterInteractive">
        {`window.datafast = window.datafast || function() {
          window.datafast.q = window.datafast.q || [];
          window.datafast.q.push(arguments);
        };`}
      </Script>
      <Script
        data-website-id={ANALYTICS_ID}
        data-domain="digiinsta.store"
        src="https://datafa.st/js/script.js"
        strategy="afterInteractive"
      />
    </>
  );
}

/**
 * Goal names for DataFast tracking
 * Following the user journey from README:
 * - Product view tracking
 * - Checkout funnel tracking
 * - Download event tracking
 */
export const ANALYTICS_GOALS = {
  // Product discovery
  PRODUCT_VIEW: "product_view",
  BUNDLE_VIEW: "bundle_view",
  CATEGORY_VIEW: "category_view",
  SEARCH: "search",

  // Cart actions
  ADD_TO_CART: "add_to_cart",
  REMOVE_FROM_CART: "remove_from_cart",
  VIEW_CART: "view_cart",

  // Checkout funnel
  INITIATE_CHECKOUT: "initiate_checkout",
  CHECKOUT_SUCCESS: "checkout_success",

  // Post-purchase
  DOWNLOAD_START: "download_start",
  DOWNLOAD_COMPLETE: "download_complete",

  // Engagement
  CONTACT_FORM_SUBMIT: "contact_form_submit",
  NEWSLETTER_SIGNUP: "newsletter_signup",
  BLOG_VIEW: "blog_view",
} as const;

type GoalName = (typeof ANALYTICS_GOALS)[keyof typeof ANALYTICS_GOALS];

/**
 * Track custom goals/events
 * Works with both Plausible and DataFast
 */
export function trackGoal(
  goalName: GoalName | string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !ANALYTICS_ID) {
    return;
  }

  const isPlausible = ANALYTICS_ID.includes("plausible") || ANALYTICS_ID.includes("js");

  // Plausible
  if (isPlausible && window.plausible) {
    window.plausible(goalName, { props });
    return;
  }

  // DataFast - call with goal name and optional props
  if (window.datafast) {
    if (props) {
      window.datafast(goalName, props);
    } else {
      window.datafast(goalName);
    }
    return;
  }

  // Fallback for Plausible: use fetch API
  if (isPlausible) {
    fetch("https://plausible.io/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: goalName,
        url: window.location.href,
        domain: ANALYTICS_ID,
        props,
      }),
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Track product view
 */
export function trackProductView(product: {
  id: number | string;
  title: string;
  price?: number;
  category?: string;
}) {
  trackGoal(ANALYTICS_GOALS.PRODUCT_VIEW, {
    product_id: String(product.id),
    product_title: product.title,
    ...(product.price && { price: String(product.price / 100) }),
    ...(product.category && { category: product.category }),
  });
}

/**
 * Track bundle view
 */
export function trackBundleView(bundle: {
  id: number | string;
  title: string;
  price?: number;
  product_count?: number;
}) {
  trackGoal(ANALYTICS_GOALS.BUNDLE_VIEW, {
    bundle_id: String(bundle.id),
    bundle_title: bundle.title,
    ...(bundle.price && { price: String(bundle.price / 100) }),
    ...(bundle.product_count && { product_count: String(bundle.product_count) }),
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(item: {
  id: number | string;
  title: string;
  price: number;
  type: "product" | "bundle";
}) {
  trackGoal(ANALYTICS_GOALS.ADD_TO_CART, {
    item_id: String(item.id),
    item_title: item.title,
    price: String(item.price / 100),
    item_type: item.type,
  });
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(item: {
  id: number | string;
  title: string;
  type: "product" | "bundle";
}) {
  trackGoal(ANALYTICS_GOALS.REMOVE_FROM_CART, {
    item_id: String(item.id),
    item_title: item.title,
    item_type: item.type,
  });
}

/**
 * Track checkout initiation
 */
export function trackInitiateCheckout(data: {
  item_count: number;
  total: number;
  currency?: string;
}) {
  trackGoal(ANALYTICS_GOALS.INITIATE_CHECKOUT, {
    item_count: String(data.item_count),
    total: String(data.total / 100),
    currency: data.currency ?? "USD",
  });
}

/**
 * Track successful checkout
 * Note: Revenue attribution is handled separately via Polar webhook integration
 */
export function trackCheckoutSuccess(data: { order_id?: string; item_count: number }) {
  trackGoal(ANALYTICS_GOALS.CHECKOUT_SUCCESS, {
    ...(data.order_id && { order_id: data.order_id }),
    item_count: String(data.item_count),
  });
}

/**
 * Track download start
 */
export function trackDownloadStart(item: { order_id: string | number; product_title: string }) {
  trackGoal(ANALYTICS_GOALS.DOWNLOAD_START, {
    order_id: String(item.order_id),
    product_title: item.product_title,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, results_count?: number) {
  trackGoal(ANALYTICS_GOALS.SEARCH, {
    query,
    ...(results_count !== undefined && { results_count: String(results_count) }),
  });
}

// Legacy export for backwards compatibility
export const trackEvent = trackGoal;

// TypeScript declarations
declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
    datafast?: (goalName: string, props?: Record<string, string | number | boolean>) => void;
  }
}
