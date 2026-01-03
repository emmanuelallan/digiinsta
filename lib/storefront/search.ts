/**
 * Search Utilities
 * Combined search across products, categories, and bundles
 */

import type { SearchResult } from "@/types/storefront";
import { searchProducts } from "./products";
import { searchCategories } from "./categories";
import { searchBundles } from "./bundles";

/**
 * Search across all content types
 */
export async function search(
  query: string,
  options?: {
    productLimit?: number;
    categoryLimit?: number;
    bundleLimit?: number;
  },
): Promise<SearchResult> {
  const {
    productLimit = 6,
    categoryLimit = 3,
    bundleLimit = 3,
  } = options ?? {};

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
