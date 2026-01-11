/**
 * Pure utility functions for discovery features
 * These functions don't require Sanity client and can be used in tests
 */

/**
 * Check if a product is a new arrival (created within last 30 days)
 * This is a pure function for testing purposes
 *
 * @param createdAt - ISO date string of when the product was created
 * @param referenceDate - Reference date to compare against (defaults to now)
 * @returns true if the product was created within the last 30 days
 */
export function isNewArrival(createdAt: string, referenceDate: Date = new Date()): boolean {
  const createdDate = new Date(createdAt);
  const thirtyDaysAgo = new Date(referenceDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return createdDate > thirtyDaysAgo;
}

/**
 * Product type for related product checking
 */
export interface RelatedProductInput {
  _id: string;
  subcategory: { _id: string };
  tags?: string[];
  status?: "active" | "draft" | "archived";
}

/**
 * Check if a product is related to another product
 * Related means: same subcategory OR has overlapping tags
 * This is a pure function for testing purposes
 *
 * @param product - The product to check
 * @param sourceProduct - The source product to compare against
 * @returns true if the products are related
 */
export function isRelatedProduct(
  product: RelatedProductInput,
  sourceProduct: RelatedProductInput
): boolean {
  // Cannot be related to itself
  if (product._id === sourceProduct._id) {
    return false;
  }

  // Same subcategory
  if (product.subcategory._id === sourceProduct.subcategory._id) {
    return true;
  }

  // Overlapping tags
  const productTags = product.tags || [];
  const sourceTags = sourceProduct.tags || [];

  if (productTags.length > 0 && sourceTags.length > 0) {
    return productTags.some((tag) => sourceTags.includes(tag));
  }

  return false;
}

/**
 * Filter products to get only related ones
 * Excludes the source product and only includes active products
 *
 * @param products - Array of products to filter
 * @param sourceProduct - The source product to find related products for
 * @returns Array of related products
 */
export function filterRelatedProducts(
  products: RelatedProductInput[],
  sourceProduct: RelatedProductInput
): RelatedProductInput[] {
  return products.filter(
    (product) =>
      product._id !== sourceProduct._id &&
      product.status === "active" &&
      isRelatedProduct(product, sourceProduct)
  );
}
