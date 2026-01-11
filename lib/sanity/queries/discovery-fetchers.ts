import { sanityClient } from "../client";
import type { SanityProduct } from "./products";
import {
  getNewArrivalsQuery,
  getNewArrivalsCountQuery,
  getRelatedBySubcategoryQuery,
  getRelatedByTagsQuery,
  getRelatedProductsQuery,
  getOnSaleProductsQuery,
  getOnSaleProductsCountQuery,
  getFeaturedProductsQuery,
  getAllTargetGroupsQuery,
  getTargetGroupBySlugQuery,
} from "./discovery";

/**
 * Target group type for persona pages
 */
export interface SanityTargetGroupExpanded {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: string;
  description?: string;
  tagline?: string;
  icon?: string;
  image?: {
    _type: "image";
    asset: { _ref: string; _type: "reference" };
  };
  gradient?: string;
  relatedCategories?: Array<{
    _id: string;
    title: string;
    slug: string;
    description?: string;
    gradient?: string;
  }>;
}

/**
 * Get new arrivals - products created within the last 30 days
 * Validates: Requirements 6.5, 11.3
 */
export async function getNewArrivals(limit: number = 12): Promise<SanityProduct[]> {
  return sanityClient.fetch(getNewArrivalsQuery, { limit });
}

/**
 * Get count of new arrivals
 */
export async function getNewArrivalsCount(): Promise<number> {
  return sanityClient.fetch(getNewArrivalsCountQuery);
}

/**
 * Get related products by subcategory
 * Validates: Requirements 11.2
 */
export async function getRelatedBySubcategory(
  subcategoryId: string,
  currentProductId: string,
  limit: number = 4
): Promise<SanityProduct[]> {
  return sanityClient.fetch(getRelatedBySubcategoryQuery, {
    subcategoryId,
    currentProductId,
    limit,
  });
}

/**
 * Get related products by tags
 * Validates: Requirements 11.2
 */
export async function getRelatedByTags(
  tags: string[],
  currentProductId: string,
  limit: number = 4
): Promise<SanityProduct[]> {
  if (!tags || tags.length === 0) {
    return [];
  }
  return sanityClient.fetch(getRelatedByTagsQuery, {
    tags,
    currentProductId,
    limit,
  });
}

/**
 * Get related products by subcategory OR tags (combined)
 * Validates: Requirements 11.2
 */
export async function getRelatedProducts(
  subcategoryId: string,
  tags: string[],
  currentProductId: string,
  limit: number = 4
): Promise<SanityProduct[]> {
  return sanityClient.fetch(getRelatedProductsQuery, {
    subcategoryId,
    tags: tags || [],
    currentProductId,
    limit,
  });
}

/**
 * Get products on sale
 * Validates: Requirements 11.5
 */
export async function getOnSaleProducts(limit: number = 12): Promise<SanityProduct[]> {
  return sanityClient.fetch(getOnSaleProductsQuery, { limit });
}

/**
 * Get count of products on sale
 */
export async function getOnSaleProductsCount(): Promise<number> {
  return sanityClient.fetch(getOnSaleProductsCountQuery);
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 8): Promise<SanityProduct[]> {
  return sanityClient.fetch(getFeaturedProductsQuery, { limit });
}

/**
 * Get all target groups (personas)
 * Validates: Requirements 10.1, 10.3
 */
export async function getAllTargetGroups(): Promise<SanityTargetGroupExpanded[]> {
  return sanityClient.fetch(getAllTargetGroupsQuery);
}

/**
 * Get a single target group by slug
 * Validates: Requirements 10.3, 10.4
 */
export async function getTargetGroupBySlug(
  slug: string
): Promise<SanityTargetGroupExpanded | null> {
  return sanityClient.fetch(getTargetGroupBySlugQuery, { slug });
}
