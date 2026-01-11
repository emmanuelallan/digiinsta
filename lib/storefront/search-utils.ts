/**
 * Pure Search Utilities
 * Client-side filtering, sorting, and query matching functions
 * These functions have no external dependencies and can be tested in isolation
 */

import type { StorefrontProduct } from "@/types/storefront";

/**
 * Search filters interface
 */
export interface SearchFilters {
  category?: string;
  subcategory?: string;
  priceRange?: { min: number; max: number };
  tags?: string[];
  sortBy?: "newest" | "price-asc" | "price-desc" | "best-selling" | "relevance";
}

/**
 * Apply filters to products (pure function for testing)
 * This is used for client-side filtering and testing
 */
export function applyFiltersToProducts(
  products: StorefrontProduct[],
  filters: SearchFilters
): StorefrontProduct[] {
  let filtered = [...products];

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((p) => p.subcategory?.category?.slug?.current === filters.category);
  }

  // Filter by subcategory
  if (filters.subcategory) {
    filtered = filtered.filter((p) => p.subcategory?.slug?.current === filters.subcategory);
  }

  // Filter by price range
  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    filtered = filtered.filter((p) => {
      const price = p.price ?? 0;
      return price >= min && price <= max;
    });
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    const lowerTags = filters.tags.map((t) => t.toLowerCase());
    filtered = filtered.filter((p) =>
      p.tags?.some((t) => t && lowerTags.includes(t.toLowerCase()))
    );
  }

  return filtered;
}

/**
 * Apply sorting to products (pure function for testing)
 */
export function applySortToProducts(
  products: StorefrontProduct[],
  sortBy: SearchFilters["sortBy"] = "relevance"
): StorefrontProduct[] {
  const sorted = [...products];

  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case "price-asc":
      return sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

    case "price-desc":
      return sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

    case "best-selling":
      // For best-selling, we'd need sales data. For now, prioritize products with "best-seller" tag
      return sorted.sort((a, b) => {
        const aIsBestSeller = a.tags?.some(
          (t) => t?.toLowerCase() === "best-seller" || t?.toLowerCase() === "bestseller"
        )
          ? 1
          : 0;
        const bIsBestSeller = b.tags?.some(
          (t) => t?.toLowerCase() === "best-seller" || t?.toLowerCase() === "bestseller"
        )
          ? 1
          : 0;
        return bIsBestSeller - aIsBestSeller;
      });

    case "relevance":
    default:
      // Keep original order (relevance from search)
      return sorted;
  }
}

/**
 * Check if a product matches a search query
 * Used for testing and client-side filtering
 */
export function productMatchesQuery(product: StorefrontProduct, query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Check title
  if (product.title.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  // Check short description
  if (product.shortDescription?.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  // Check tags
  if (product.tags?.some((t) => t?.toLowerCase().includes(lowerQuery))) {
    return true;
  }

  return false;
}

/**
 * Get available filter options from products
 */
export function getFilterOptions(products: StorefrontProduct[]): {
  categories: Array<{ slug: string; title: string; count: number }>;
  priceRange: { min: number; max: number };
  tags: Array<{ tag: string; count: number }>;
} {
  // Extract unique categories with counts
  const categoryMap = new Map<string, { title: string; count: number }>();
  for (const product of products) {
    const category = product.subcategory?.category;
    if (category) {
      const slug = category.slug?.current ?? "";
      const existing = categoryMap.get(slug);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(slug, { title: category.title, count: 1 });
      }
    }
  }

  // Calculate price range
  const prices = products.map((p) => p.price ?? 0).filter((p) => p > 0);
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0,
  };

  // Extract unique tags with counts
  const tagMap = new Map<string, number>();
  for (const product of products) {
    for (const tagStr of product.tags ?? []) {
      if (tagStr) {
        const tag = tagStr.toLowerCase();
        tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
      }
    }
  }

  return {
    categories: Array.from(categoryMap.entries()).map(([slug, data]) => ({
      slug,
      title: data.title,
      count: data.count,
    })),
    priceRange,
    tags: Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
  };
}
