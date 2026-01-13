import { sanityClient } from "../client";
import { groq } from "next-sanity";
import type { SanityImage } from "./categories";

// Product fields for bundle expansion
const bundleProductFields = groq`
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  images,
  customPrice,
  compareAtPrice,
  productFileKey,
  productFileName,
  polarProductId,
  "subcategory": subcategory->{
    _id,
    title,
    "slug": slug.current,
    defaultPrice,
    compareAtPrice
  },
  "creator": creator->{
    _id,
    name,
    "slug": slug.current
  }
`;

// Base bundle fields projection with products array expansion
const bundleFields = groq`
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  shortDescription,
  polarProductId,
  price,
  compareAtPrice,
  heroImage,
  metaTitle,
  metaDescription,
  "products": products[]->{
    ${bundleProductFields}
  }
`;

// Get all bundles (uses Sanity's native draft/published system)
export const getAllBundlesQuery = groq`
  *[_type == "bundle"] | order(_createdAt desc) {
    ${bundleFields}
  }
`;

// Get bundles with pagination
export const getBundlesPaginatedQuery = groq`
  *[_type == "bundle"] | order(_createdAt desc) [$start...$end] {
    ${bundleFields}
  }
`;

// Get total bundle count
export const getBundleCountQuery = groq`
  count(*[_type == "bundle"])
`;

// Get a single bundle by slug
export const getBundleBySlugQuery = groq`
  *[_type == "bundle" && slug.current == $slug][0] {
    ${bundleFields}
  }
`;

// Get bundles containing a specific product
export const getBundlesContainingProductQuery = groq`
  *[_type == "bundle" && $productId in products[]._ref] | order(_createdAt desc) {
    ${bundleFields}
  }
`;

// Get bundles on sale (compareAtPrice > price)
export const getBundlesOnSaleQuery = groq`
  *[_type == "bundle" && defined(compareAtPrice) && compareAtPrice > price] | order(_createdAt desc) {
    ${bundleFields}
  }
`;

// Type definitions for query results
export interface BundleProduct {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  images?: SanityImage[];
  customPrice?: number;
  compareAtPrice?: number;
  productFileKey?: string;
  productFileName?: string;
  polarProductId?: string;
  subcategory: {
    _id: string;
    title: string;
    slug: string;
    defaultPrice: number;
    compareAtPrice?: number;
  };
  creator?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface SanityBundle {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: string;
  description?: unknown[]; // Block content
  shortDescription?: string;
  polarProductId: string;
  price: number;
  compareAtPrice?: number;
  heroImage?: SanityImage;
  metaTitle?: string;
  metaDescription?: string;
  products: BundleProduct[];
}

// Pagination options
export interface BundlePaginationOptions {
  page?: number;
  pageSize?: number;
}

// Query execution functions
export async function getAllBundles(): Promise<SanityBundle[]> {
  return sanityClient.fetch(getAllBundlesQuery);
}

export async function getBundlesPaginated(
  options: BundlePaginationOptions = {}
): Promise<{ bundles: SanityBundle[]; total: number }> {
  const { page = 1, pageSize = 12 } = options;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const [bundles, total] = await Promise.all([
    sanityClient.fetch<SanityBundle[]>(getBundlesPaginatedQuery, { start, end }),
    sanityClient.fetch<number>(getBundleCountQuery),
  ]);

  return { bundles, total };
}

export async function getBundleBySlug(slug: string): Promise<SanityBundle | null> {
  return sanityClient.fetch(getBundleBySlugQuery, { slug });
}

export async function getBundlesContainingProduct(productId: string): Promise<SanityBundle[]> {
  return sanityClient.fetch(getBundlesContainingProductQuery, { productId });
}

export async function getBundlesOnSale(): Promise<SanityBundle[]> {
  return sanityClient.fetch(getBundlesOnSaleQuery);
}

// Helper function to calculate bundle savings
export function calculateBundleSavings(bundle: SanityBundle): {
  savings: number | null;
  savingsPercentage: number | null;
  isOnSale: boolean;
} {
  if (!bundle.compareAtPrice || bundle.compareAtPrice <= bundle.price) {
    return { savings: null, savingsPercentage: null, isOnSale: false };
  }

  const savings = bundle.compareAtPrice - bundle.price;
  const savingsPercentage = Math.round((savings / bundle.compareAtPrice) * 100);

  return { savings, savingsPercentage, isOnSale: true };
}
