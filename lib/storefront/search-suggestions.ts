/**
 * Search Suggestions Service
 * Provides autocomplete suggestions for search queries
 * Requirements: 15.1
 */

import type { StorefrontProduct, StorefrontCategory } from "@/types/storefront";
import { searchProducts } from "./products";
import { searchCategories } from "./categories";

/**
 * Search suggestion type
 */
export interface SearchSuggestion {
  type: "product" | "category" | "query";
  title: string;
  slug?: string;
  image?: string;
}

/**
 * Recent search query storage key
 */
const RECENT_SEARCHES_KEY = "digiinsta_recent_searches";
const MAX_RECENT_SEARCHES = 10;

/**
 * Get recent search queries from localStorage (client-side only)
 * Returns empty array on server-side
 */
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save a search query to recent searches (client-side only)
 */
export function saveRecentSearch(query: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery.length < 2) return;

  try {
    const recent = getRecentSearches();
    // Remove if already exists (to move to front)
    const filtered = recent.filter((q) => q.toLowerCase() !== trimmedQuery);
    // Add to front
    const updated = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear recent search history (client-side only)
 */
export function clearRecentSearches(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Transform a product to a search suggestion
 */
function productToSuggestion(product: StorefrontProduct): SearchSuggestion {
  const firstImage = product.images?.[0];
  return {
    type: "product",
    title: product.title,
    slug: product.slug,
    image: firstImage?.url ?? undefined,
  };
}

/**
 * Transform a category to a search suggestion
 */
function categoryToSuggestion(category: StorefrontCategory): SearchSuggestion {
  return {
    type: "category",
    title: category.title,
    slug: category.slug.current,
    image: category.image?.url ?? undefined,
  };
}

/**
 * Filter recent queries that match the current query
 */
function filterRecentQueries(query: string, recentSearches: string[]): SearchSuggestion[] {
  const lowerQuery = query.toLowerCase();
  return recentSearches
    .filter((q) => q.toLowerCase().includes(lowerQuery) && q.toLowerCase() !== lowerQuery)
    .slice(0, 3)
    .map((q) => ({
      type: "query" as const,
      title: q,
    }));
}

/**
 * Get search suggestions for a query
 * Returns matching products, categories, and recent queries
 * Requirements: 15.1
 *
 * @param query - The search query (minimum 2 characters)
 * @param options - Optional configuration
 * @returns Array of search suggestions
 */
export async function getSearchSuggestions(
  query: string,
  options?: {
    productLimit?: number;
    categoryLimit?: number;
    includeRecentQueries?: boolean;
  }
): Promise<SearchSuggestion[]> {
  const { productLimit = 4, categoryLimit = 2, includeRecentQueries = true } = options ?? {};

  // Require minimum 2 characters for suggestions
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    return [];
  }

  const suggestions: SearchSuggestion[] = [];

  // Get recent queries that match (client-side only, will be empty on server)
  if (includeRecentQueries) {
    const recentSearches = getRecentSearches();
    const recentSuggestions = filterRecentQueries(trimmedQuery, recentSearches);
    suggestions.push(...recentSuggestions);
  }

  // Fetch products and categories in parallel
  const [products, categories] = await Promise.all([
    searchProducts(trimmedQuery, productLimit),
    searchCategories(trimmedQuery, categoryLimit),
  ]);

  // Add category suggestions
  const categorySuggestions = categories.map(categoryToSuggestion);
  suggestions.push(...categorySuggestions);

  // Add product suggestions
  const productSuggestions = products.map(productToSuggestion);
  suggestions.push(...productSuggestions);

  return suggestions;
}

/**
 * Get popular search suggestions (for empty search state)
 * Returns popular categories and best-selling products
 */
export async function getPopularSuggestions(options?: {
  productLimit?: number;
  categoryLimit?: number;
}): Promise<SearchSuggestion[]> {
  const { productLimit = 4, categoryLimit = 3 } = options ?? {};

  // Import dynamically to avoid circular dependencies
  const { getCategories } = await import("./categories");
  const { getBestSellers } = await import("./products");

  const [categories, products] = await Promise.all([getCategories(), getBestSellers(productLimit)]);

  const suggestions: SearchSuggestion[] = [];

  // Add top categories
  const categorySuggestions = categories.slice(0, categoryLimit).map(categoryToSuggestion);
  suggestions.push(...categorySuggestions);

  // Add best-selling products
  const productSuggestions = products.map(productToSuggestion);
  suggestions.push(...productSuggestions);

  return suggestions;
}

/**
 * Check if a suggestion matches a query (for testing/validation)
 * A suggestion matches if the query string appears in the title (case-insensitive)
 */
export function suggestionMatchesQuery(suggestion: SearchSuggestion, query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return suggestion.title.toLowerCase().includes(lowerQuery);
}
