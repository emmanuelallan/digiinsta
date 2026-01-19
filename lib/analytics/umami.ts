"use client";

/**
 * Umami Analytics Integration
 * 
 * Umami automatically tracks page views when the script is loaded.
 * Use trackEvent() for custom event tracking.
 */

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number>) => void;
    };
  }
}

/**
 * Track a custom event in Umami
 * @param eventName - Name of the event (e.g., "product_view", "add_to_cart")
 * @param eventData - Optional data object to attach to the event
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, string | number>
): void {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(eventName, eventData);
  }
}

/**
 * Track a page view (usually automatic, but can be used for SPA navigation)
 */
export function trackPageView(url?: string): void {
  if (typeof window !== "undefined" && window.umami) {
    // Umami automatically tracks page views, but you can manually trigger
    // by tracking a page_view event if needed
    trackEvent("page_view", url ? { url } : {});
  }
}

/**
 * Track product view
 */
export function trackProductView(productSlug: string, productName: string): void {
  trackEvent("product_view", {
    product_slug: productSlug,
    product_name: productName,
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(
  productSlug: string,
  productName: string,
  price: number
): void {
  trackEvent("add_to_cart", {
    product_slug: productSlug,
    product_name: productName,
    price,
  });
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(productSlug: string): void {
  trackEvent("remove_from_cart", {
    product_slug: productSlug,
  });
}

/**
 * Track checkout start
 */
export function trackCheckoutStart(total: number, itemCount: number): void {
  trackEvent("checkout_start", {
    total,
    item_count: itemCount,
  });
}

/**
 * Track purchase completion
 */
export function trackPurchase(
  orderId: string,
  total: number,
  itemCount: number
): void {
  trackEvent("purchase", {
    order_id: orderId,
    total,
    item_count: itemCount,
  });
}

/**
 * Track category view
 */
export function trackCategoryView(categorySlug: string, categoryName: string): void {
  trackEvent("category_view", {
    category_slug: categorySlug,
    category_name: categoryName,
  });
}

/**
 * Track bundle view
 */
export function trackBundleView(bundleSlug: string, bundleName: string): void {
  trackEvent("bundle_view", {
    bundle_slug: bundleSlug,
    bundle_name: bundleName,
  });
}

/**
 * Track search query
 */
export function trackSearch(query: string, resultCount: number): void {
  trackEvent("search", {
    query,
    result_count: resultCount,
  });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(email: string): void {
  trackEvent("newsletter_signup", {
    email,
  });
}

/**
 * Track contact form submission
 */
export function trackContactForm(): void {
  trackEvent("contact_form_submit");
}
