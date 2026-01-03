/**
 * Cart Utilities
 * Helper functions for cart operations
 */

/**
 * Format price from cents to display string
 * @param cents - Price in cents (e.g., 999)
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string (e.g., "$9.99")
 */
export function formatPrice(cents: number, currency = "USD"): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Calculate savings percentage
 * @param originalPrice - Original price in cents
 * @param salePrice - Sale price in cents
 * @returns Percentage saved (e.g., 25 for 25% off)
 */
export function calculateSavingsPercent(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Check if a product is on sale
 * @param price - Current price in cents
 * @param compareAtPrice - Original price in cents (optional)
 * @returns True if product is on sale
 */
export function isOnSale(price: number, compareAtPrice?: number | null): boolean {
  return !!compareAtPrice && compareAtPrice > price;
}
