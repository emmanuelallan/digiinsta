/**
 * Discovery Data Fetching Utilities
 * Server-side functions for product discovery features
 *
 * Requirements: 6.5, 11.1-11.5 - Discovery features including new arrivals,
 * best sellers, on sale, related products, and frequently bought together
 * Requirements: 10.3, 10.4 - Target group (persona) pages
 */

import {
  getNewArrivals as sanityGetNewArrivals,
  getNewArrivalsCount,
  getRelatedProducts as sanityGetRelatedProducts,
  getOnSaleProducts as sanityGetOnSaleProducts,
  getOnSaleProductsCount,
  getAllTargetGroups as sanityGetAllTargetGroups,
  getTargetGroupBySlug as sanityGetTargetGroupBySlug,
  type SanityTargetGroupExpanded,
} from "@/lib/sanity/queries/discovery-fetchers";
import {
  getAllProducts as sanityGetAllProducts,
  type SanityProduct,
} from "@/lib/sanity/queries/products";
import { getBestSellingProducts } from "@/lib/analytics/bestsellers";
import { getFrequentlyBoughtTogether as analyticsGetFBT } from "@/lib/analytics/fbt";
import { resolveProductPrice } from "@/lib/pricing/resolver";
import type {
  StorefrontProduct,
  NewArrivalsResult,
  BestSellersResult,
  OnSaleResult,
  RelatedProductsResult,
  FrequentlyBoughtTogetherResult,
} from "@/types/storefront";

// Re-export target group type
export type { SanityTargetGroupExpanded };

// ISR revalidation time in seconds (5 minutes)
export const DISCOVERY_REVALIDATE = 300;

/**
 * Get new arrivals - products created within the last 30 days
 * Requirements: 6.5, 11.3 - New arrivals sorted by createdAt descending
 */
export async function getNewArrivals(limit = 12): Promise<NewArrivalsResult> {
  const [products, total] = await Promise.all([sanityGetNewArrivals(limit), getNewArrivalsCount()]);

  return {
    products: products.map(transformProduct),
    total,
  };
}

/**
 * Get best sellers - products sorted by sales count from analytics
 * Requirements: 6.4, 11.4 - Best sellers sorted by sales count
 */
export async function getBestSellers(limit = 12): Promise<BestSellersResult> {
  // Get best selling product IDs from analytics
  const bestSellerItems = await getBestSellingProducts(limit);

  if (bestSellerItems.length === 0) {
    // Fallback to recent products if no sales data
    const products = await sanityGetAllProducts();
    return {
      products: products.slice(0, limit).map(transformProduct),
      total: products.length,
    };
  }

  // Get full product data from Sanity for the best sellers
  const allProducts = await sanityGetAllProducts();
  const productMap = new Map(allProducts.map((p) => [p._id, p]));

  // Map best seller IDs to full products, maintaining sales order
  const bestSellerProducts: StorefrontProduct[] = [];
  for (const item of bestSellerItems) {
    const product = productMap.get(item.sanityId);
    if (product) {
      bestSellerProducts.push(transformProduct(product));
    }
  }

  return {
    products: bestSellerProducts,
    total: bestSellerProducts.length,
  };
}

/**
 * Get products on sale - products where compareAtPrice > currentPrice
 * Requirements: 6.6, 11.5 - Products on sale
 */
export async function getOnSale(limit = 24): Promise<OnSaleResult> {
  const [products, total] = await Promise.all([
    sanityGetOnSaleProducts(limit),
    getOnSaleProductsCount(),
  ]);

  return {
    products: products.map(transformProduct),
    bundles: [], // Bundles on sale can be added later if needed
    total,
  };
}

/**
 * Get related products - products by same subcategory or tags
 * Requirements: 11.2 - Related products by same subcategory or tags
 */
export async function getRelatedProducts(
  productId: string,
  subcategoryId: string,
  tags: string[] = [],
  limit = 4
): Promise<RelatedProductsResult> {
  const products = await sanityGetRelatedProducts(subcategoryId, tags, productId, limit);

  return {
    products: products.map(transformProduct),
  };
}

/**
 * Get frequently bought together - based on order history analysis
 * Requirements: 11.1 - Frequently bought together recommendations
 */
export async function getFrequentlyBoughtTogether(
  productId: string,
  limit = 5
): Promise<FrequentlyBoughtTogetherResult> {
  // Get co-purchased items from analytics
  const coPurchasedItems = await analyticsGetFBT(productId, {
    limit,
    productsOnly: true,
  });

  if (coPurchasedItems.length === 0) {
    return { products: [] };
  }

  // Get full product data from Sanity for the co-purchased items
  const allProducts = await sanityGetAllProducts();
  const productMap = new Map(allProducts.map((p) => [p._id, p]));

  // Map co-purchased IDs to full products, maintaining co-occurrence order
  const fbtProducts: StorefrontProduct[] = [];
  for (const item of coPurchasedItems) {
    const product = productMap.get(item.sanityId);
    if (product) {
      fbtProducts.push(transformProduct(product));
    }
  }

  return {
    products: fbtProducts,
  };
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform Sanity product to storefront product with resolved price
 */
function transformProduct(product: SanityProduct): StorefrontProduct {
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
    _createdAt: product._createdAt,
    title: product.title,
    shortDescription: product.shortDescription,
    images: product.images,
    status: product.status,
    tags: product.tags,
    customPrice: product.customPrice,
    compareAtPrice: product.compareAtPrice,
    subcategory: {
      _id: product.subcategory._id,
      title: product.subcategory.title,
      slug: { _type: "slug", current: product.subcategory.slug },
      defaultPrice: product.subcategory.defaultPrice,
      compareAtPrice: product.subcategory.compareAtPrice,
      category: {
        _id: product.subcategory.category._id,
        title: product.subcategory.category.title,
        slug: { _type: "slug", current: product.subcategory.category.slug },
      },
    },
    creator: product.creator
      ? {
          _id: product.creator._id,
          name: product.creator.name,
          slug: { _type: "slug", current: product.creator.slug },
        }
      : undefined,
    resolvedPrice,
    // Computed properties for component compatibility
    id: product._id,
    slug: product.slug,
    price: resolvedPrice.price,
    createdAt: product._createdAt,
  };
}

// ============================================================================
// Target Group (Persona) Functions
// ============================================================================

/**
 * Get all target groups (personas)
 * Requirements: 10.1, 10.3 - Target group listing for "Shop by Persona"
 */
export async function getAllTargetGroups(): Promise<SanityTargetGroupExpanded[]> {
  return sanityGetAllTargetGroups();
}

/**
 * Get a single target group by slug
 * Requirements: 10.3, 10.4 - Target group page with filtered products
 */
export async function getTargetGroupBySlug(
  slug: string
): Promise<SanityTargetGroupExpanded | null> {
  return sanityGetTargetGroupBySlug(slug);
}
