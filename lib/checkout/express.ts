/**
 * Express Checkout Service
 * Handles one-click checkout flow with customer preference persistence
 *
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4
 */

const CUSTOMER_PREFS_KEY = "digiinsta_customer_prefs";

export interface CustomerPreferences {
  email?: string;
  lastCheckoutAt?: string;
  version: number;
}

export interface ExpressCheckoutConfig {
  skipCart: boolean;
  prefillEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface ExpressCheckoutItem {
  polarProductId: string;
  productId: number;
  type: "product" | "bundle";
  title?: string;
  price?: number;
}

export interface ExpressCheckoutResult {
  checkoutUrl: string;
  checkoutId: string;
}

/**
 * Load customer preferences from localStorage
 */
export function loadCustomerPreferences(): CustomerPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(CUSTOMER_PREFS_KEY);
    if (stored) {
      const prefs = JSON.parse(stored) as CustomerPreferences;
      return prefs;
    }
  } catch (error) {
    console.error("Failed to load customer preferences:", error);
  }

  return null;
}

/**
 * Save customer preferences to localStorage
 */
export function saveCustomerPreferences(prefs: Partial<CustomerPreferences>): void {
  if (typeof window === "undefined") return;

  try {
    const existing = loadCustomerPreferences();
    const updated: CustomerPreferences = {
      ...existing,
      ...prefs,
      version: 1,
    };
    localStorage.setItem(CUSTOMER_PREFS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save customer preferences:", error);
  }
}

/**
 * Get saved customer email for pre-filling checkout
 */
export function getSavedEmail(): string | undefined {
  const prefs = loadCustomerPreferences();
  return prefs?.email;
}

/**
 * Save customer email after successful checkout
 */
export function saveCustomerEmail(email: string): void {
  saveCustomerPreferences({
    email,
    lastCheckoutAt: new Date().toISOString(),
  });
}

/**
 * Clear customer preferences
 */
export function clearCustomerPreferences(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CUSTOMER_PREFS_KEY);
  } catch (error) {
    console.error("Failed to clear customer preferences:", error);
  }
}

/**
 * Initiate express checkout for a single item
 * Skips cart and goes directly to Polar checkout
 */
export async function initiateExpressCheckout(
  item: ExpressCheckoutItem,
  config: ExpressCheckoutConfig = { skipCart: true }
): Promise<ExpressCheckoutResult> {
  // Get saved email if not provided
  const customerEmail = config.prefillEmail || getSavedEmail();

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [item],
      customerEmail,
      metadata: {
        expressCheckout: "true",
        skipCart: config.skipCart ? "true" : "false",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create checkout" }));
    throw new Error(error.error || "Failed to create checkout");
  }

  const data = await response.json();

  return {
    checkoutUrl: data.checkoutUrl,
    checkoutId: data.checkoutId,
  };
}

/**
 * Initiate express checkout for multiple items
 */
export async function initiateMultiItemExpressCheckout(
  items: ExpressCheckoutItem[],
  config: ExpressCheckoutConfig = { skipCart: true }
): Promise<ExpressCheckoutResult> {
  const customerEmail = config.prefillEmail || getSavedEmail();

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      customerEmail,
      metadata: {
        expressCheckout: "true",
        skipCart: config.skipCart ? "true" : "false",
        itemCount: items.length.toString(),
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create checkout" }));
    throw new Error(error.error || "Failed to create checkout");
  }

  const data = await response.json();

  return {
    checkoutUrl: data.checkoutUrl,
    checkoutId: data.checkoutId,
  };
}
