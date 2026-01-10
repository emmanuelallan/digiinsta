/**
 * Cache Tag Constants and Utilities
 *
 * Defines the tagging strategy for on-demand cache invalidation.
 * Tags are used with Next.js revalidateTag() for granular cache control.
 *
 * Validates: Requirements 2.1, 2.2, 2.3
 */

/**
 * Tag prefixes for each content type
 */
export const TAG_PREFIXES = {
  product: "product",
  category: "category",
  subcategory: "subcategory",
  bundle: "bundle",
  post: "post",
  collection: "collection",
} as const;

/**
 * Collection tags for listing pages
 */
export const COLLECTION_TAGS = {
  homepage: "collection:homepage",
  bestSellers: "collection:best-sellers",
  newArrivals: "collection:new-arrivals",
  editorsPicks: "collection:editors-picks",
  allProducts: "collection:all-products",
  allCategories: "collection:all-categories",
  allBundles: "collection:all-bundles",
  allPosts: "collection:all-posts",
} as const;

/**
 * Product tag values that map to collection pages
 */
const PRODUCT_TAG_TO_COLLECTION: Record<string, string> = {
  "best-seller": COLLECTION_TAGS.bestSellers,
  bestseller: COLLECTION_TAGS.bestSellers,
  "new-arrival": COLLECTION_TAGS.newArrivals,
  "new arrival": COLLECTION_TAGS.newArrivals,
  featured: COLLECTION_TAGS.editorsPicks,
  "editors-pick": COLLECTION_TAGS.editorsPicks,
  "editor's pick": COLLECTION_TAGS.editorsPicks,
};

/**
 * Generate cache tags for a product
 *
 * @param slug - Product slug
 * @param subcategorySlug - Optional subcategory slug
 * @param categorySlug - Optional category slug
 * @returns Array of cache tags for the product
 */
export function getProductTags(
  slug: string,
  subcategorySlug?: string | null,
  categorySlug?: string | null
): string[] {
  const tags: string[] = [];

  // Product's own tag
  tags.push(`${TAG_PREFIXES.product}:${slug}`);

  // Subcategory tag if available
  if (subcategorySlug) {
    tags.push(`${TAG_PREFIXES.subcategory}:${subcategorySlug}`);
  }

  // Category tag if available
  if (categorySlug) {
    tags.push(`${TAG_PREFIXES.category}:${categorySlug}`);
  }

  // Always include all-products collection tag
  tags.push(COLLECTION_TAGS.allProducts);

  return tags;
}

/**
 * Generate cache tags for a category
 *
 * @param slug - Category slug
 * @returns Array of cache tags for the category
 */
export function getCategoryTags(slug: string): string[] {
  return [`${TAG_PREFIXES.category}:${slug}`, COLLECTION_TAGS.allCategories];
}

/**
 * Generate cache tags for a subcategory
 *
 * @param slug - Subcategory slug
 * @param categorySlug - Parent category slug
 * @returns Array of cache tags for the subcategory
 */
export function getSubcategoryTags(slug: string, categorySlug?: string | null): string[] {
  const tags: string[] = [`${TAG_PREFIXES.subcategory}:${slug}`];

  if (categorySlug) {
    tags.push(`${TAG_PREFIXES.category}:${categorySlug}`);
  }

  return tags;
}

/**
 * Generate cache tags for a bundle
 *
 * @param slug - Bundle slug
 * @returns Array of cache tags for the bundle
 */
export function getBundleTags(slug: string): string[] {
  return [`${TAG_PREFIXES.bundle}:${slug}`, COLLECTION_TAGS.allBundles];
}

/**
 * Generate cache tags for a post
 *
 * @param slug - Post slug
 * @param categorySlug - Optional category slug
 * @returns Array of cache tags for the post
 */
export function getPostTags(slug: string, categorySlug?: string | null): string[] {
  const tags: string[] = [`${TAG_PREFIXES.post}:${slug}`, COLLECTION_TAGS.allPosts];

  if (categorySlug) {
    tags.push(`${TAG_PREFIXES.category}:${categorySlug}`);
  }

  return tags;
}

/**
 * Map product tags to collection tags for listing page invalidation
 *
 * @param productTags - Array of product tag objects with tag property
 * @returns Array of collection tags that should be invalidated
 */
export function getCollectionTagsForProduct(
  productTags?: Array<{ tag?: string | null }> | null
): string[] {
  if (!productTags || productTags.length === 0) {
    return [];
  }

  const collectionTags = new Set<string>();

  for (const tagObj of productTags) {
    if (!tagObj.tag) continue;

    const normalizedTag = tagObj.tag.toLowerCase().trim();
    const collectionTag = PRODUCT_TAG_TO_COLLECTION[normalizedTag];

    if (collectionTag) {
      collectionTags.add(collectionTag);
    }
  }

  return Array.from(collectionTags);
}

/**
 * Type exports for external use
 */
export type TagPrefix = (typeof TAG_PREFIXES)[keyof typeof TAG_PREFIXES];
export type CollectionTag = (typeof COLLECTION_TAGS)[keyof typeof COLLECTION_TAGS];
