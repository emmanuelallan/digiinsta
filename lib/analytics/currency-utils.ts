/**
 * Currency Formatting Utilities
 * Functions for formatting and parsing currency values
 */

/**
 * Format an amount in cents to a display string
 *
 * @param cents - Amount in cents (e.g., 12345 = $123.45)
 * @param currency - Currency code (default: "USD")
 * @returns Formatted currency string (e.g., "$123.45")
 */
export function formatCurrency(
  cents: number,
  currency: string = "USD",
): string {
  const dollars = cents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Parse a currency display string back to cents
 *
 * @param value - Formatted currency string (e.g., "$123.45" or "123.45")
 * @returns Amount in cents (e.g., 12345)
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const dollars = parseFloat(cleaned);

  if (isNaN(dollars)) {
    return 0;
  }

  // Convert to cents and round to avoid floating point issues
  return Math.round(dollars * 100);
}

/**
 * Format cents as a compact currency string for large values
 *
 * @param cents - Amount in cents
 * @param currency - Currency code (default: "USD")
 * @returns Compact formatted string (e.g., "$1.2K", "$1.5M")
 */
export function formatCurrencyCompact(
  cents: number,
  currency: string = "USD",
): string {
  const dollars = cents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(dollars);
}

/**
 * Calculate percentage with bounds checking
 *
 * @param value - Current value
 * @param total - Total/goal value
 * @param maxPercent - Maximum percentage to return (default: 100)
 * @returns Percentage value between 0 and maxPercent
 */
export function calculatePercentage(
  value: number,
  total: number,
  maxPercent: number = 100,
): number {
  if (total <= 0) return 0;
  if (value < 0) return 0;

  const percentage = (value / total) * 100;
  return Math.min(percentage, maxPercent);
}

/**
 * Calculate goal progress for a partner
 * Returns percentage toward the $400 monthly goal (capped at 100%)
 *
 * @param revenueCents - Partner's revenue in cents
 * @param goalCents - Goal amount in cents (default: 40000 = $400)
 * @returns Progress percentage (0-100)
 */
export function calculateGoalProgress(
  revenueCents: number,
  goalCents: number = 40000,
): number {
  return calculatePercentage(revenueCents, goalCents, 100);
}
