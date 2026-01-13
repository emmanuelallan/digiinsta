/**
 * Bundle Data Fetching Utilities
 * Server-side functions for fetching bundles from Sanity CMS
 *
 * Requirements: 5.2, 5.3 - Bundle data fetching with savings calculation
 */

import {
  getAllBundles as sanityGetAllBundles,
  getBundleBySlug as sanityGetBundleBySlug,
  type SanityBundle,
  type BundleProduct,
} from "@/lib/sanity/queries/bundles";
import { resolveBundlePrice, resolveProductPrice } from "@/lib/pricing/resolver";
import type {
  StorefrontBundle,
  StorefrontBundleDetail,
  StorefrontProductDetail,
} from "@/types/storefront";
import type { BlockContent } from "@/types/sanity";

// ISR revalidation time in seconds (5 minutes)
export const BUNDLE_REVALIDATE = 300;

/**
 * Get all active bundles with resolved prices
 */
export async function getBundles(_options?: { limit?: number; page?: number }): Promise<{
  bundles: StorefrontBundle[];
  totalDocs: number;
  totalPages: number;
}> {
  const result = await sanityGetAllBundles();
  const bundles = result.map(transformBundle);

  return {
    bundles,
    totalDocs: bundles.length,
    totalPages: 1,
  };
}

/**
 * Get a single bundle by slug with resolved price
 * Requirements: 5.3 - SEO-friendly URLs
 */
export async function getBundleBySlug(slug: string): Promise<StorefrontBundleDetail | null> {
  const bundle = await sanityGetBundleBySlug(slug);
  if (!bundle) return null;
  return transformBundleDetail(bundle);
}

/**
 * Get featured bundle for banner
 */
export async function getFeaturedBundle(): Promise<StorefrontBundle | null> {
  const bundles = await sanityGetAllBundles();
  if (bundles.length === 0) return null;
  const firstBundle = bundles[0];
  if (!firstBundle) return null;
  return transformBundle(firstBundle);
}

/**
 * Search bundles by query
 */
export async function searchBundles(query: string, limit = 5): Promise<StorefrontBundle[]> {
  const bundles = await sanityGetAllBundles();
  const lowerQuery = query.toLowerCase();

  return bundles
    .filter(
      (bundle) =>
        bundle.title.toLowerCase().includes(lowerQuery) ||
        bundle.shortDescription?.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit)
    .map(transformBundle);
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform Sanity bundle to storefront bundle with resolved price
 * Requirements: 5.2 - Calculate and show savings amount and percentage
 */
function transformBundle(bundle: SanityBundle): StorefrontBundle {
  const resolvedPrice = resolveBundlePrice({
    price: bundle.price,
    compareAtPrice: bundle.compareAtPrice,
  });

  return {
    _id: bundle._id,
    _createdAt: bundle._createdAt,
    title: bundle.title,
    slug: { _type: "slug", current: bundle.slug },
    shortDescription: bundle.shortDescription,
    heroImage: bundle.heroImage,
    price: bundle.price,
    compareAtPrice: bundle.compareAtPrice,
    productCount: bundle.products?.length ?? 0,
    resolvedPrice,
    // Computed properties for component compatibility
    id: bundle._id,
    products: bundle.products?.map(transformBundleProduct),
  };
}

/**
 * Transform Sanity bundle to full storefront bundle detail
 */
function transformBundleDetail(bundle: SanityBundle): StorefrontBundleDetail {
  const resolvedPrice = resolveBundlePrice({
    price: bundle.price,
    compareAtPrice: bundle.compareAtPrice,
  });

  return {
    _id: bundle._id,
    _type: "bundle",
    _createdAt: bundle._createdAt,
    _updatedAt: bundle._updatedAt,
    _rev: "",
    title: bundle.title,
    slug: { _type: "slug", current: bundle.slug },
    description: bundle.description as BlockContent | undefined,
    shortDescription: bundle.shortDescription,
    polarProductId: bundle.polarProductId,
    price: bundle.price,
    compareAtPrice: bundle.compareAtPrice,
    heroImage: bundle.heroImage,
    metaTitle: bundle.metaTitle,
    metaDescription: bundle.metaDescription,
    products: (bundle.products ?? []).map(transformBundleProduct),
    resolvedPrice,
  };
}

/**
 * Transform bundle product to expanded product format
 */
function transformBundleProduct(product: BundleProduct): StorefrontProductDetail {
  const resolvedPrice = resolveProductPrice(
    {
      customPrice: product.customPrice,
      compareAtPrice: product.compareAtPrice,
    },
    {
      defaultPrice: product.subcategory.defaultPrice,
      compareAtPrice: product.subcategory.compareAtPrice,
    }
  );

  return {
    _id: product._id,
    _type: "product",
    _createdAt: "",
    _updatedAt: "",
    _rev: "",
    title: product.title,
    slug: { _type: "slug", current: product.slug },
    shortDescription: product.shortDescription,
    images: product.images,
    customPrice: product.customPrice,
    compareAtPrice: product.compareAtPrice,
    productFileKey: product.productFileKey,
    productFileName: product.productFileName,
    polarProductId: product.polarProductId ?? "",
    subcategory: {
      _id: product.subcategory._id,
      _type: "subcategory",
      _createdAt: "",
      _updatedAt: "",
      _rev: "",
      title: product.subcategory.title,
      slug: { _type: "slug", current: product.subcategory.slug },
      defaultPrice: product.subcategory.defaultPrice,
      compareAtPrice: product.subcategory.compareAtPrice,
      category: {
        _id: "",
        _type: "category",
        _createdAt: "",
        _updatedAt: "",
        _rev: "",
        title: "",
        slug: { _type: "slug", current: "" },
      },
    },
    creator: product.creator
      ? {
          _id: product.creator._id,
          _type: "creator",
          _createdAt: "",
          _updatedAt: "",
          _rev: "",
          name: product.creator.name,
          email: "",
          slug: { _type: "slug", current: product.creator.slug },
        }
      : undefined,
    resolvedPrice,
    // Computed properties for component compatibility
    id: product._id,
    price: resolvedPrice.price,
    createdAt: "",
  };
}
