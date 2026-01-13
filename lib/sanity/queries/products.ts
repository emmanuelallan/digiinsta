import { sanityClient } from "../client";
import { groq } from "next-sanity";
import type { SanityImage } from "./categories";

/**
 * Product Queries
 *
 * Note: We use Sanity's native draft/published system instead of a custom status field.
 * The sanityClient is configured with `perspective: "published"` which only returns
 * published documents. Draft documents are automatically filtered out.
 */

// Base product fields projection with subcategory expansion for price resolution
const productFields = groq`
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  shortDescription,
  polarProductId,
  customPrice,
  compareAtPrice,
  images,
  productFileKey,
  productFileName,
  productFileSize,
  tags,
  metaTitle,
  metaDescription,
  "subcategory": subcategory->{
    _id,
    title,
    "slug": slug.current,
    defaultPrice,
    compareAtPrice,
    "category": category->{
      _id,
      title,
      "slug": slug.current
    }
  },
  "creator": creator->{
    _id,
    name,
    "slug": slug.current,
    bio
  },
  "targetGroups": targetGroups[]->{
    _id,
    title,
    "slug": slug.current
  }
`;

// Get all products (published only via client perspective)
export const getAllProductsQuery = groq`
  *[_type == "product" && defined(subcategory)] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products with pagination
export const getProductsPaginatedQuery = groq`
  *[_type == "product" && defined(subcategory)] | order(_createdAt desc) [$start...$end] {
    ${productFields}
  }
`;

// Get total product count
export const getProductCountQuery = groq`
  count(*[_type == "product" && defined(subcategory)])
`;

// Get a single product by slug
export const getProductBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    ${productFields}
  }
`;

// Get products by subcategory slug
export const getProductsBySubcategorySlugQuery = groq`
  *[_type == "product" && subcategory->slug.current == $subcategorySlug && defined(subcategory)] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by category slug
export const getProductsByCategorySlugQuery = groq`
  *[_type == "product" && subcategory->category->slug.current == $categorySlug && defined(subcategory)] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by target group slug
export const getProductsByTargetGroupSlugQuery = groq`
  *[_type == "product" && defined(subcategory) && $targetGroupSlug in targetGroups[]->slug.current] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by tag
export const getProductsByTagQuery = groq`
  *[_type == "product" && defined(subcategory) && $tagValue in tags] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by multiple tags (any match)
export const getProductsByTagsQuery = groq`
  *[_type == "product" && defined(subcategory) && count((tags)[@ in $tags]) > 0] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by creator slug
export const getProductsByCreatorSlugQuery = groq`
  *[_type == "product" && creator->slug.current == $creatorSlug && defined(subcategory)] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products on sale (compareAtPrice > effective price)
export const getProductsOnSaleQuery = groq`
  *[_type == "product" && defined(subcategory) && (
    (defined(customPrice) && defined(compareAtPrice) && compareAtPrice > customPrice) ||
    (!defined(customPrice) && defined(subcategory->compareAtPrice) && subcategory->compareAtPrice > subcategory->defaultPrice)
  )] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Search products by title or description
export const searchProductsQuery = groq`
  *[_type == "product" && defined(subcategory) && (
    title match $searchTerm ||
    shortDescription match $searchTerm ||
    pt::text(description) match $searchTerm
  )] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get new arrivals (most recent products)
export const getNewArrivalsQuery = groq`
  *[_type == "product" && defined(subcategory)] | order(_createdAt desc) [0...$limit] {
    ${productFields}
  }
`;

// Type definitions for query results
export interface SanityCreator {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
}

export interface SanityTargetGroup {
  _id: string;
  title: string;
  slug: string;
}

export interface SanityProduct {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: string;
  description?: unknown[]; // Block content
  shortDescription?: string;
  polarProductId: string;
  customPrice?: number;
  compareAtPrice?: number;
  images?: SanityImage[];
  productFileKey?: string;
  productFileName?: string;
  productFileSize?: number;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  subcategory: {
    _id: string;
    title: string;
    slug: string;
    defaultPrice: number;
    compareAtPrice?: number;
    category: {
      _id: string;
      title: string;
      slug: string;
    };
  };
  creator?: SanityCreator;
  targetGroups?: SanityTargetGroup[];
}

// Pagination options
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

// Query execution functions
export async function getAllProducts(): Promise<SanityProduct[]> {
  return sanityClient.fetch(getAllProductsQuery);
}

export async function getProductsPaginated(
  options: PaginationOptions = {}
): Promise<{ products: SanityProduct[]; total: number }> {
  const { page = 1, pageSize = 12 } = options;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const [products, total] = await Promise.all([
    sanityClient.fetch<SanityProduct[]>(getProductsPaginatedQuery, { start, end }),
    sanityClient.fetch<number>(getProductCountQuery),
  ]);

  return { products, total };
}

export async function getProductBySlug(slug: string): Promise<SanityProduct | null> {
  return sanityClient.fetch(getProductBySlugQuery, { slug });
}

export async function getProductsBySubcategorySlug(
  subcategorySlug: string
): Promise<SanityProduct[]> {
  return sanityClient.fetch(getProductsBySubcategorySlugQuery, { subcategorySlug });
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<SanityProduct[]> {
  return sanityClient.fetch(getProductsByCategorySlugQuery, { categorySlug });
}

export async function getProductsByTargetGroupSlug(
  targetGroupSlug: string
): Promise<SanityProduct[]> {
  return sanityClient.fetch(getProductsByTargetGroupSlugQuery, { targetGroupSlug });
}

export async function getProductsByTag(tag: string): Promise<SanityProduct[]> {
  return sanityClient.fetch<SanityProduct[]>(getProductsByTagQuery, { tagValue: tag });
}

export async function getProductsByTags(tags: string[]): Promise<SanityProduct[]> {
  return sanityClient.fetch(getProductsByTagsQuery, { tags });
}

export async function getProductsByCreatorSlug(creatorSlug: string): Promise<SanityProduct[]> {
  return sanityClient.fetch(getProductsByCreatorSlugQuery, { creatorSlug });
}

export async function getProductsOnSale(): Promise<SanityProduct[]> {
  return sanityClient.fetch(getProductsOnSaleQuery);
}

export async function searchProducts(searchTerm: string): Promise<SanityProduct[]> {
  // Add wildcards for partial matching
  const term = `*${searchTerm}*`;
  return sanityClient.fetch(searchProductsQuery, { searchTerm: term });
}

export async function getNewArrivals(limit = 8): Promise<SanityProduct[]> {
  return sanityClient.fetch(getNewArrivalsQuery, { limit });
}
