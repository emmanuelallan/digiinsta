/**
 * Path Computation Utilities for Revalidation
 *
 * Computes all paths that need to be revalidated when content changes.
 * Includes direct page paths and parent listing pages.
 *
 * Validates: Requirements 1.1, 1.2, 1.3
 */

/**
 * Subcategory info for path computation
 */
export interface SubcategoryInfo {
  slug: string;
  category?: {
    slug: string;
  } | null;
}

/**
 * Get all paths to revalidate for a product
 *
 * @param slug - Product slug
 * @param subcategory - Optional subcategory with category info
 * @returns Array of paths to revalidate
 */
export function getProductPaths(slug: string, subcategory?: SubcategoryInfo | null): string[] {
  const paths: string[] = [];

  // Direct product page
  paths.push(`/products/${slug}`);

  // Products listing page
  paths.push("/products");

  // Subcategory page if available
  if (subcategory?.slug) {
    paths.push(`/subcategories/${subcategory.slug}`);
  }

  // Category page if available
  if (subcategory?.category?.slug) {
    paths.push(`/categories/${subcategory.category.slug}`);
  }

  // Homepage (products may appear in featured sections)
  paths.push("/");

  // Collection pages
  paths.push("/best-sellers");
  paths.push("/new-arrivals");

  return paths;
}

/**
 * Get all paths to revalidate for a category
 *
 * @param slug - Category slug
 * @returns Array of paths to revalidate
 */
export function getCategoryPaths(slug: string): string[] {
  return [
    // Direct category page
    `/categories/${slug}`,
    // Categories listing page
    "/categories",
    // Homepage (categories may appear in navigation)
    "/",
  ];
}

/**
 * Get all paths to revalidate for a subcategory
 *
 * @param slug - Subcategory slug
 * @param categorySlug - Parent category slug
 * @returns Array of paths to revalidate
 */
export function getSubcategoryPaths(slug: string, categorySlug?: string | null): string[] {
  const paths: string[] = [
    // Direct subcategory page
    `/subcategories/${slug}`,
  ];

  // Parent category page
  if (categorySlug) {
    paths.push(`/categories/${categorySlug}`);
  }

  // Categories listing page
  paths.push("/categories");

  return paths;
}

/**
 * Get all paths to revalidate for a bundle
 *
 * @param slug - Bundle slug
 * @returns Array of paths to revalidate
 */
export function getBundlePaths(slug: string): string[] {
  return [
    // Direct bundle page
    `/bundles/${slug}`,
    // Bundles listing page
    "/bundles",
    // Homepage (bundles may appear in featured sections)
    "/",
  ];
}

/**
 * Get all paths to revalidate for a post
 *
 * @param slug - Post slug
 * @returns Array of paths to revalidate
 */
export function getPostPaths(slug: string): string[] {
  return [
    // Direct post page
    `/blog/${slug}`,
    // Blog listing page
    "/blog",
    // Homepage (posts may appear in featured sections)
    "/",
  ];
}

/**
 * Get listing paths that should be revalidated for collection updates
 * Used when products with special tags are updated
 *
 * @returns Array of collection listing paths
 */
export function getCollectionListingPaths(): string[] {
  return ["/", "/best-sellers", "/new-arrivals", "/products"];
}
