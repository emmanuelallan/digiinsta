/**
 * Search Utilities
 * Combined search across products, categories, and bundles with filtering and sorting
 */

import type { SearchResult, StorefrontCategory, StorefrontBundle } from "@/types/storefront";
import { searchProducts, searchProductsWithFilters } from "./products";
import { searchCategories } from "./categories";
import { searchBundles } from "./bundles";

// Re-export pure utilities for backward compatibility
export {
  applyFiltersToProducts,
  applySortToProducts,
  productMatchesQuery,
  getFilterOptions,
  type SearchFilters,
} from "./search-utils";

import type { SearchFilters } from "./search-utils";

/**
 * Enhanced search result with pagination
 */
export interface EnhancedSearchResult extends SearchResult {
  filters?: SearchFilters;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Search across all content types (basic search)
 */
export async function search(
  query: string,
  options?: {
    productLimit?: number;
    categoryLimit?: number;
    bundleLimit?: number;
  }
): Promise<SearchResult> {
  const { productLimit = 6, categoryLimit = 3, bundleLimit = 3 } = options ?? {};

  // Run searches in parallel
  const [products, categories, bundles] = await Promise.all([
    searchProducts(query, productLimit),
    searchCategories(query, categoryLimit),
    searchBundles(query, bundleLimit),
  ]);

  return {
    products,
    categories,
    bundles,
    totalResults: products.length + categories.length + bundles.length,
  };
}

/**
 * Enhanced search with filters and sorting
 * Requirements: 15.2, 15.3
 */
export async function searchWithFilters(
  query: string,
  filters: SearchFilters = {},
  options?: {
    limit?: number;
    page?: number;
  }
): Promise<EnhancedSearchResult> {
  const { limit = 12, page = 1 } = options ?? {};

  // Search products with filters
  const productResult = await searchProductsWithFilters(query, filters, { limit, page });

  // For filtered search, we focus on products
  // Categories and bundles are only included for unfiltered searches
  const hasFilters = !!(
    filters.category ||
    filters.subcategory ||
    filters.priceRange ||
    (filters.tags && filters.tags.length > 0)
  );

  let categories: StorefrontCategory[] = [];
  let bundles: StorefrontBundle[] = [];

  if (!hasFilters && page === 1) {
    // Only fetch categories and bundles on first page without filters
    [categories, bundles] = await Promise.all([
      searchCategories(query, 3),
      searchBundles(query, 3),
    ]);
  }

  return {
    products: productResult.products,
    categories,
    bundles,
    totalResults: productResult.totalDocs + categories.length + bundles.length,
    filters,
    pagination: {
      page,
      limit,
      totalPages: productResult.totalPages,
    },
  };
}
