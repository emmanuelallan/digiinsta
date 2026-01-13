/**
 * Product Data Fetching Utilities
 * Server-side functions for fetching products from Sanity CMS
 *
 * Requirements: 3.5 - Product data fetching with price resolution
 */

import {
  getAllProducts as sanityGetAllProducts,
  getProductBySlug as sanityGetProductBySlug,
  getProductsBySubcategorySlug,
  getProductsByCategorySlug,
  getProductsByTargetGroupSlug,
  searchProducts as sanitySearchProducts,
  type SanityProduct,
} from "@/lib/sanity/queries/products";
import {
  getNewArrivals as sanityGetNewArrivals,
  getRelatedProducts as sanityGetRelatedProducts,
  getOnSaleProducts as sanityGetOnSaleProducts,
} from "@/lib/sanity/queries/discovery-fetchers";
import { resolveProductPrice } from "@/lib/pricing/resolver";
import { urlFor } from "@/lib/sanity/image";
import type { StorefrontProduct, StorefrontProductDetail } from "@/types/storefront";
import type { BlockContent, SanityImage } from "@/types/sanity";

// ISR revalidation time in seconds (5 minutes)
export const PRODUCT_REVALIDATE = 300;

/**
 * Get all active products with resolved prices
 */
export async function getProducts(options?: {
  limit?: number;
  page?: number;
  categorySlug?: string;
  subcategorySlug?: string;
  sort?: string;
}): Promise<{
  products: StorefrontProduct[];
  totalDocs: number;
  totalPages: number;
}> {
  const { categorySlug, subcategorySlug } = options ?? {};

  let products: SanityProduct[];

  if (subcategorySlug) {
    products = await getProductsBySubcategorySlug(subcategorySlug);
  } else if (categorySlug) {
    products = await getProductsByCategorySlug(categorySlug);
  } else {
    products = await sanityGetAllProducts();
  }

  const transformedProducts = products.map(transformProduct);

  return {
    products: transformedProducts,
    totalDocs: transformedProducts.length,
    totalPages: 1,
  };
}

/**
 * Get a single product by slug with resolved price
 * Requirements: 3.5 - SEO-friendly URLs
 */
export async function getProductBySlug(slug: string): Promise<StorefrontProductDetail | null> {
  const product = await sanityGetProductBySlug(slug);
  if (!product) return null;
  return transformProductDetail(product);
}

/**
 * Get new arrivals (products created within last 30 days)
 * Requirements: 6.5, 11.3 - New arrivals sorted by createdAt descending
 */
export async function getNewArrivals(limit = 8): Promise<StorefrontProduct[]> {
  const products = await sanityGetNewArrivals(limit);
  return products.map(transformProduct);
}

/**
 * Get featured/editor's pick products
 */
export async function getEditorsPicks(limit = 8): Promise<StorefrontProduct[]> {
  // For now, return most recent products as editors picks
  const products = await sanityGetAllProducts();
  return products.slice(0, limit).map(transformProduct);
}

/**
 * Get best sellers (products with highest sales count)
 * Requirements: 6.4, 11.4 - Best sellers sorted by sales count
 */
export async function getBestSellers(limit = 8): Promise<StorefrontProduct[]> {
  // This will be enhanced with actual sales data from analytics
  // For now, return recent products
  const products = await sanityGetAllProducts();
  return products.slice(0, limit).map(transformProduct);
}

/**
 * Get products on sale (compareAtPrice > effective price)
 * Requirements: 6.6, 11.5 - Products where compareAtPrice > currentPrice
 */
export async function getSaleProducts(limit = 24): Promise<StorefrontProduct[]> {
  const products = await sanityGetOnSaleProducts(limit);
  return products.map(transformProduct);
}

/**
 * Get related products for a given product
 * Requirements: 11.2 - Related products by same subcategory or tags
 */
export async function getRelatedProducts(
  productId: string,
  subcategoryId: string,
  tags: string[] = [],
  limit = 4
): Promise<StorefrontProduct[]> {
  const products = await sanityGetRelatedProducts(subcategoryId, tags, productId, limit);
  return products.map(transformProduct);
}

/**
 * Search products by query
 */
export async function searchProducts(query: string, limit = 10): Promise<StorefrontProduct[]> {
  const products = await sanitySearchProducts(query);
  return products.slice(0, limit).map(transformProduct);
}

/**
 * Search filters interface
 */
interface SearchFilters {
  category?: string;
  subcategory?: string;
  priceRange?: { min: number; max: number };
  tags?: string[];
  sortBy?: "newest" | "price-asc" | "price-desc" | "best-selling" | "relevance";
}

/**
 * Search products with filters and sorting
 */
export async function searchProductsWithFilters(
  query: string,
  filters: SearchFilters = {},
  _options?: { limit?: number; page?: number }
): Promise<{
  products: StorefrontProduct[];
  totalDocs: number;
  totalPages: number;
}> {
  let products: SanityProduct[];

  // Get base products based on filters
  if (filters.subcategory) {
    products = await getProductsBySubcategorySlug(filters.subcategory);
  } else if (filters.category) {
    products = await getProductsByCategorySlug(filters.category);
  } else if (query && query.trim().length > 0) {
    products = await sanitySearchProducts(query);
  } else {
    products = await sanityGetAllProducts();
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    const lowerTags = filters.tags.map((t) => t.toLowerCase());
    products = products.filter((p) => p.tags?.some((tag) => lowerTags.includes(tag.toLowerCase())));
  }

  // Transform and resolve prices
  let transformedProducts = products.map(transformProduct);

  // Filter by price range
  if (filters.priceRange) {
    transformedProducts = transformedProducts.filter((p) => {
      const price = p.resolvedPrice.price;
      return (
        (!filters.priceRange!.min || price >= filters.priceRange!.min) &&
        (!filters.priceRange!.max || price <= filters.priceRange!.max)
      );
    });
  }

  // Sort products
  switch (filters.sortBy) {
    case "newest":
      transformedProducts.sort(
        (a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
      );
      break;
    case "price-asc":
      transformedProducts.sort((a, b) => a.resolvedPrice.price - b.resolvedPrice.price);
      break;
    case "price-desc":
      transformedProducts.sort((a, b) => b.resolvedPrice.price - a.resolvedPrice.price);
      break;
    case "best-selling":
    case "relevance":
    default:
      // Keep default order
      break;
  }

  return {
    products: transformedProducts,
    totalDocs: transformedProducts.length,
    totalPages: 1,
  };
}

/**
 * Get products by category slug
 */
export async function getProductsByCategory(
  categorySlug: string,
  limit = 50
): Promise<StorefrontProduct[]> {
  const products = await getProductsByCategorySlug(categorySlug);
  return products.slice(0, limit).map(transformProduct);
}

/**
 * Get products by subcategory slug
 */
export async function getProductsBySubcategory(
  subcategorySlug: string,
  limit = 50
): Promise<StorefrontProduct[]> {
  const products = await getProductsBySubcategorySlug(subcategorySlug);
  return products.slice(0, limit).map(transformProduct);
}

/**
 * Get products by persona (target group slug)
 */
export async function getProductsByPersona(
  targetGroupSlug: string,
  limit = 8
): Promise<StorefrontProduct[]> {
  const products = await getProductsByTargetGroupSlug(targetGroupSlug);
  return products.slice(0, limit).map(transformProduct);
}

/**
 * Get products grouped by subcategory for a category
 */
export async function getProductsGroupedBySubcategory(
  categorySlug: string,
  productsPerSubcategory = 12
): Promise<
  {
    subcategory: {
      _id: string;
      title: string;
      slug: string;
    };
    products: StorefrontProduct[];
    totalProducts: number;
  }[]
> {
  const products = await getProductsByCategorySlug(categorySlug);
  const transformedProducts = products.map(transformProduct);

  // Group by subcategory
  const grouped = new Map<
    string,
    {
      subcategory: { _id: string; title: string; slug: string };
      products: StorefrontProduct[];
    }
  >();

  for (const product of transformedProducts) {
    const subcatId = product.subcategory._id;
    if (!grouped.has(subcatId)) {
      grouped.set(subcatId, {
        subcategory: {
          _id: product.subcategory._id,
          title: product.subcategory.title,
          slug: product.subcategory.slug.current,
        },
        products: [],
      });
    }
    grouped.get(subcatId)!.products.push(product);
  }

  return Array.from(grouped.values()).map((group) => ({
    subcategory: group.subcategory,
    products: group.products.slice(0, productsPerSubcategory),
    totalProducts: group.products.length,
  }));
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform Sanity image to include URL
 * Converts Sanity image reference to include the actual URL for display
 */
function transformImage(image: SanityImage): SanityImage & { url: string } {
  if (!image?.asset) {
    return { ...image, url: "/images/placeholder-product.jpg" };
  }
  try {
    const url = urlFor(image).width(800).height(600).fit("crop").url();
    return { ...image, url };
  } catch {
    return { ...image, url: "/images/placeholder-product.jpg" };
  }
}

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

  // Transform images to include URLs
  const transformedImages = product.images?.map(transformImage);

  return {
    _id: product._id,
    _createdAt: product._createdAt,
    title: product.title,
    shortDescription: product.shortDescription,
    images: transformedImages,
    tags: product.tags,
    customPrice: product.customPrice,
    compareAtPrice: product.compareAtPrice,
    polarProductId: product.polarProductId,
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

/**
 * Transform Sanity product to full storefront product detail
 */
function transformProductDetail(product: SanityProduct): StorefrontProductDetail {
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

  // Transform images to include URLs
  const transformedImages = product.images?.map(transformImage);

  return {
    _id: product._id,
    _type: "product",
    _createdAt: product._createdAt,
    _updatedAt: product._updatedAt,
    _rev: "",
    title: product.title,
    slug: { _type: "slug", current: product.slug },
    description: product.description as BlockContent | undefined,
    shortDescription: product.shortDescription,
    polarProductId: product.polarProductId,
    customPrice: product.customPrice,
    compareAtPrice: product.compareAtPrice,
    images: transformedImages,
    productFileKey: product.productFileKey,
    productFileName: product.productFileName,
    productFileSize: product.productFileSize,
    tags: product.tags,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
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
        _id: product.subcategory.category._id,
        _type: "category",
        _createdAt: "",
        _updatedAt: "",
        _rev: "",
        title: product.subcategory.category.title,
        slug: { _type: "slug", current: product.subcategory.category.slug },
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
          bio: product.creator.bio,
        }
      : undefined,
    targetGroups: product.targetGroups?.map((tg) => ({
      _id: tg._id,
      _type: "targetGroup" as const,
      _createdAt: "",
      _updatedAt: "",
      _rev: "",
      title: tg.title,
      slug: { _type: "slug" as const, current: tg.slug },
    })),
    resolvedPrice,
  };
}
