import { sanityClient } from "../client";
import { groq } from "next-sanity";
import type { SanityImage } from "./categories";

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
  status,
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
    bio,
    status
  },
  "targetGroups": targetGroups[]->{
    _id,
    title,
    "slug": slug.current
  }
`;

// Get all active products
export const getAllProductsQuery = groq`
  *[_type == "product" && status == "active"] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products with pagination
export const getProductsPaginatedQuery = groq`
  *[_type == "product" && status == "active"] | order(_createdAt desc) [$start...$end] {
    ${productFields}
  }
`;

// Get total product count
export const getProductCountQuery = groq`
  count(*[_type == "product" && status == "active"])
`;

// Get a single product by slug
export const getProductBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    ${productFields}
  }
`;

// Get products by subcategory slug
export const getProductsBySubcategorySlugQuery = groq`
  *[_type == "product" && subcategory->slug.current == $subcategorySlug && status == "active"] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by category slug
export const getProductsByCategorySlugQuery = groq`
  *[_type == "product" && subcategory->category->slug.current == $categorySlug && status == "active"] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by target group slug
export const getProductsByTargetGroupSlugQuery = groq`
  *[_type == "product" && status == "active" && $targetGroupSlug in targetGroups[]->slug.current] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by tag
export const getProductsByTagQuery = groq`
  *[_type == "product" && status == "active" && $tagValue in tags] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by multiple tags (any match)
export const getProductsByTagsQuery = groq`
  *[_type == "product" && status == "active" && count((tags)[@ in $tags]) > 0] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products by creator slug
export const getProductsByCreatorSlugQuery = groq`
  *[_type == "product" && creator->slug.current == $creatorSlug && status == "active"] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Get products on sale (compareAtPrice > effective price)
export const getProductsOnSaleQuery = groq`
  *[_type == "product" && status == "active" && (
    (defined(customPrice) && defined(compareAtPrice) && compareAtPrice > customPrice) ||
    (!defined(customPrice) && defined(subcategory->compareAtPrice) && subcategory->compareAtPrice > subcategory->defaultPrice)
  )] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Search products by title or description
export const searchProductsQuery = groq`
  *[_type == "product" && status == "active" && (
    title match $searchTerm ||
    shortDescription match $searchTerm ||
    pt::text(description) match $searchTerm
  )] | order(_createdAt desc) {
    ${productFields}
  }
`;

// Type definitions for query results
export interface SanityCreator {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  status: "active" | "inactive";
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
  status: "active" | "draft" | "archived";
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

// Filter options for product queries
export interface ProductFilterOptions {
  status?: "active" | "draft" | "archived";
  subcategorySlug?: string;
  categorySlug?: string;
  targetGroupSlug?: string;
  tags?: string[];
  creatorSlug?: string;
  onSale?: boolean;
  searchTerm?: string;
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
