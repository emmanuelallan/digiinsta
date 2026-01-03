/**
 * Bundle Data Fetching Utilities
 * Server-side functions for fetching bundles from Payload CMS
 */

import { getPayload } from "payload";
import config from "@payload-config";
import type {
  StorefrontBundle,
  StorefrontProduct,
  StorefrontSubcategory,
} from "@/types/storefront";
import type { Bundle, Product, Category, Subcategory, Media } from "@/payload-types";

/**
 * Get Payload instance
 */
async function getPayloadClient() {
  return getPayload({ config });
}

/**
 * Transform Payload subcategory to storefront subcategory
 */
function transformSubcategory(subcategory: Subcategory): StorefrontSubcategory {
  const category = subcategory.category as Category;
  return {
    ...subcategory,
    category: {
      ...category,
      image: category.image as Media | null,
    },
  };
}

/**
 * Transform Payload product to storefront product
 */
function transformProduct(product: Product): StorefrontProduct {
  return {
    ...product,
    subcategory: transformSubcategory(product.subcategory as Subcategory),
    images:
      product.images?.map((img) => ({
        ...img,
        image: img.image as Media,
      })) ?? null,
    file: product.file as Media,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
  };
}

/**
 * Transform Payload bundle to storefront bundle
 */
function transformBundle(bundle: Bundle): StorefrontBundle {
  const products = (bundle.products as Product[]).map(transformProduct);

  return {
    ...bundle,
    products,
    heroImage: bundle.heroImage as Media | null,
    price: bundle.price,
    compareAtPrice: bundle.compareAtPrice ?? undefined,
  };
}

/**
 * Get all active bundles
 */
export async function getBundles(options?: { limit?: number; page?: number }): Promise<{
  bundles: StorefrontBundle[];
  totalDocs: number;
  totalPages: number;
}> {
  const payload = await getPayloadClient();
  const { limit = 12, page = 1 } = options ?? {};

  const result = await payload.find({
    collection: "bundles",
    where: { status: { equals: "active" } },
    limit,
    page,
    sort: "-createdAt",
    depth: 3,
  });

  return {
    bundles: result.docs.map(transformBundle),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  };
}

/**
 * Get a single bundle by slug
 */
export async function getBundleBySlug(slug: string): Promise<StorefrontBundle | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "bundles",
    where: {
      slug: { equals: slug },
      status: { equals: "active" },
    },
    limit: 1,
    depth: 3,
  });

  if (!result.docs[0]) return null;
  return transformBundle(result.docs[0]);
}

/**
 * Get featured bundle for banner
 */
export async function getFeaturedBundle(): Promise<StorefrontBundle | null> {
  const payload = await getPayloadClient();

  // Get the most recent active bundle
  const result = await payload.find({
    collection: "bundles",
    where: { status: { equals: "active" } },
    sort: "-createdAt",
    limit: 1,
    depth: 3,
  });

  if (!result.docs[0]) return null;
  return transformBundle(result.docs[0]);
}

/**
 * Search bundles by query
 */
export async function searchBundles(query: string, limit = 5): Promise<StorefrontBundle[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "bundles",
    where: {
      status: { equals: "active" },
      or: [{ title: { contains: query } }, { shortDescription: { contains: query } }],
    },
    limit,
    depth: 3,
  });

  return result.docs.map(transformBundle);
}
