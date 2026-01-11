/**
 * Price Resolution Service
 *
 * Handles price inheritance from subcategory to product,
 * custom price overrides, and sale detection.
 *
 * Requirements: 2.3, 3.2, 3.3 - Price inheritance and override logic
 */

/**
 * Result of price resolution
 */
export interface PriceResult {
  /** The effective price in cents */
  price: number;
  /** The original/compare-at price in cents, if on sale */
  compareAtPrice: number | null;
  /** Whether the item is currently on sale */
  isOnSale: boolean;
  /** The savings amount in cents, if on sale */
  savings: number | null;
  /** The savings percentage (0-100), if on sale */
  savingsPercentage: number | null;
}

/**
 * Product price input
 */
export interface ProductPriceInput {
  /** Custom price override in cents (optional) */
  customPrice?: number | null;
  /** Compare-at price in cents for sale display (optional) */
  compareAtPrice?: number | null;
}

/**
 * Subcategory price input
 */
export interface SubcategoryPriceInput {
  /** Default price in cents for products in this subcategory */
  defaultPrice: number;
  /** Compare-at price in cents for sale display (optional) */
  compareAtPrice?: number | null;
}

/**
 * Resolve the effective price for a product
 *
 * Price resolution rules:
 * 1. If product has customPrice, use it; otherwise use subcategory.defaultPrice
 * 2. If product has compareAtPrice, use it; otherwise use subcategory.compareAtPrice
 * 3. Item is on sale if compareAtPrice > effectivePrice
 * 4. Calculate savings and percentage when on sale
 *
 * @param product - Product price data
 * @param subcategory - Subcategory price data
 * @returns Resolved price information
 */
export function resolveProductPrice(
  product: ProductPriceInput,
  subcategory: SubcategoryPriceInput
): PriceResult {
  // Resolve effective price: customPrice takes precedence over subcategory default
  const price =
    product.customPrice !== undefined && product.customPrice !== null
      ? product.customPrice
      : subcategory.defaultPrice;

  // Resolve compare-at price: product compareAtPrice takes precedence
  const compareAtPrice =
    product.compareAtPrice !== undefined && product.compareAtPrice !== null
      ? product.compareAtPrice
      : (subcategory.compareAtPrice ?? null);

  // Determine if on sale: compareAtPrice must be greater than effective price
  const isOnSale = compareAtPrice !== null && compareAtPrice > price;

  // Calculate savings when on sale
  const savings = isOnSale ? compareAtPrice - price : null;

  // Calculate savings percentage when on sale
  const savingsPercentage =
    isOnSale && compareAtPrice > 0 ? Math.round((savings! / compareAtPrice) * 100) : null;

  return {
    price,
    compareAtPrice,
    isOnSale,
    savings,
    savingsPercentage,
  };
}

/**
 * Bundle price input
 */
export interface BundlePriceInput {
  /** Bundle price in cents */
  price: number;
  /** Compare-at price in cents (usually sum of individual prices) */
  compareAtPrice?: number | null;
}

/**
 * Resolve the effective price for a bundle
 *
 * Bundle pricing is simpler - no inheritance, just direct price and compare-at
 *
 * @param bundle - Bundle price data
 * @returns Resolved price information
 */
export function resolveBundlePrice(bundle: BundlePriceInput): PriceResult {
  const { price, compareAtPrice } = bundle;

  // Determine if on sale: compareAtPrice must be greater than price
  const isOnSale =
    compareAtPrice !== undefined && compareAtPrice !== null && compareAtPrice > price;

  // Calculate savings when on sale
  const savings = isOnSale ? compareAtPrice - price : null;

  // Calculate savings percentage when on sale
  const savingsPercentage =
    isOnSale && compareAtPrice > 0 ? Math.round((savings! / compareAtPrice) * 100) : null;

  return {
    price,
    compareAtPrice: compareAtPrice ?? null,
    isOnSale,
    savings,
    savingsPercentage,
  };
}

/**
 * Format price in cents to display string
 *
 * @param cents - Price in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(cents: number, currency: string = "USD"): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(dollars);
}
