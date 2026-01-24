/**
 * Formatting utility functions for Digital Love Storefront
 */

/**
 * Formats a number as USD currency
 * @param price - Price in dollars
 * @returns Formatted price string (e.g., "$19.99")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}
