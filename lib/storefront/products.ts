/**
 * Product Data Fetching Utilities
 * Server-side functions for fetching products from Payload CMS
 */

import { getPayload } from "payload";
import config from "@payload-config";
import type { StorefrontProduct, StorefrontSubcategory } from "@/types/storefront";
import type { Product, Category, Subcategory, Media } from "@/payload-types";

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
 * Get all active products
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
  const payload = await getPayloadClient();
  const {
    limit = 12,
    page = 1,
    categorySlug,
    subcategorySlug,
    sort = "-createdAt",
  } = options ?? {};

  const where: Record<string, unknown> = {
    status: { equals: "active" },
  };

  // Filter by subcategory if provided
  if (subcategorySlug) {
    const subcategory = await payload.find({
      collection: "subcategories",
      where: { slug: { equals: subcategorySlug } },
      limit: 1,
    });
    if (subcategory.docs[0]) {
      where["subcategory"] = { equals: subcategory.docs[0].id };
    }
  } else if (categorySlug) {
    // Filter by category (get all subcategories for this category)
    const category = await payload.find({
      collection: "categories",
      where: { slug: { equals: categorySlug } },
      limit: 1,
    });
    if (category.docs[0]) {
      const subcategories = await payload.find({
        collection: "subcategories",
        where: { category: { equals: category.docs[0].id } },
      });
      const subcategoryIds = subcategories.docs.map((s) => s.id);
      if (subcategoryIds.length > 0) {
        where["subcategory"] = { in: subcategoryIds };
      }
    }
  }

  const result = await payload.find({
    collection: "products",
    where: where as Parameters<typeof payload.find>[0]["where"],
    limit,
    page,
    sort,
    depth: 3,
  });

  return {
    products: result.docs.map(transformProduct),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  };
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "products",
    where: {
      slug: { equals: slug },
      status: { equals: "active" },
    },
    limit: 1,
    depth: 3,
  });

  if (!result.docs[0]) return null;
  return transformProduct(result.docs[0]);
}

/**
 * Get new arrivals (products with "new-arrival" or "new" tag, fallback to recently created)
 */
export async function getNewArrivals(limit = 8): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "products",
    where: { status: { equals: "active" } },
    sort: "-createdAt",
    limit: limit * 2, // Fetch more to filter
    depth: 3,
  });

  // Filter for products with new-arrival or new tag
  const newArrivals = result.docs.filter((product) =>
    product.tags?.some(
      (t) =>
        t.tag?.toLowerCase() === "new-arrival" ||
        t.tag?.toLowerCase() === "new-arrivals" ||
        t.tag?.toLowerCase() === "new"
    )
  );

  // If not enough tagged, fill with most recent products
  if (newArrivals.length < limit) {
    const remaining = result.docs
      .filter((p) => !newArrivals.includes(p))
      .slice(0, limit - newArrivals.length);
    return [...newArrivals, ...remaining].map(transformProduct);
  }

  return newArrivals.slice(0, limit).map(transformProduct);
}

/**
 * Get featured/editor's pick products
 */
export async function getEditorsPicks(limit = 8): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "products",
    where: {
      status: { equals: "active" },
    },
    sort: "-updatedAt",
    limit,
    depth: 3,
  });

  // Filter for featured products (those with featured tag)
  const featured = result.docs.filter((product) =>
    product.tags?.some(
      (t) => t.tag?.toLowerCase() === "featured" || t.tag?.toLowerCase() === "editors-pick"
    )
  );

  // If not enough featured, fill with recent products
  if (featured.length < limit) {
    const remaining = result.docs
      .filter((p) => !featured.includes(p))
      .slice(0, limit - featured.length);
    return [...featured, ...remaining].map(transformProduct);
  }

  return featured.slice(0, limit).map(transformProduct);
}

/**
 * Get best sellers (products with "best-seller" tag, fallback to recent products)
 */
export async function getBestSellers(limit = 8): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "products",
    where: { status: { equals: "active" } },
    sort: "-createdAt",
    limit: limit * 2, // Fetch more to filter
    depth: 3,
  });

  // Filter for products with best-seller tag
  const bestSellers = result.docs.filter((product) =>
    product.tags?.some(
      (t) =>
        t.tag?.toLowerCase() === "best-seller" ||
        t.tag?.toLowerCase() === "best-sellers" ||
        t.tag?.toLowerCase() === "bestseller"
    )
  );

  // If not enough tagged, fill with recent products
  if (bestSellers.length < limit) {
    const remaining = result.docs
      .filter((p) => !bestSellers.includes(p))
      .slice(0, limit - bestSellers.length);
    return [...bestSellers, ...remaining].map(transformProduct);
  }

  return bestSellers.slice(0, limit).map(transformProduct);
}

/**
 * Get products on sale (products where compareAtPrice > price)
 */
export async function getSaleProducts(limit = 24): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "products",
    where: {
      status: { equals: "active" },
      compareAtPrice: { exists: true },
    },
    sort: "-createdAt",
    limit: limit * 2, // Fetch more to filter
    depth: 3,
  });

  // Filter for products where compareAtPrice > price (actually on sale)
  const saleProducts = result.docs.filter(
    (product) => product.price && product.compareAtPrice && product.compareAtPrice > product.price
  );

  return saleProducts.slice(0, limit).map(transformProduct);
}

/**
 * Get related products for a given product (same subcategory)
 */
export async function getRelatedProducts(
  productId: number,
  subcategoryId: number,
  limit = 4
): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "products",
    where: {
      status: { equals: "active" },
      id: { not_equals: productId },
      subcategory: { equals: subcategoryId },
    },
    limit,
    depth: 3,
  });

  return result.docs.map(transformProduct);
}

/**
 * Search products by query
 */
export async function searchProducts(query: string, limit = 10): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "products",
    where: {
      status: { equals: "active" },
      or: [{ title: { contains: query } }, { shortDescription: { contains: query } }],
    },
    limit,
    depth: 3,
  });

  return result.docs.map(transformProduct);
}

/**
 * Get products by category slug (via subcategories)
 */
export async function getProductsByCategory(
  categorySlug: string,
  limit = 50
): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  // Get category ID from slug
  const category = await payload.find({
    collection: "categories",
    where: {
      slug: { equals: categorySlug },
      status: { equals: "active" },
    },
    limit: 1,
  });

  if (!category.docs[0]) return [];

  // Get subcategories for this category
  const subcategories = await payload.find({
    collection: "subcategories",
    where: {
      category: { equals: category.docs[0].id },
      status: { equals: "active" },
    },
  });

  const subcategoryIds = subcategories.docs.map((s) => s.id);
  if (subcategoryIds.length === 0) return [];

  const result = await payload.find({
    collection: "products",
    where: {
      status: { equals: "active" },
      subcategory: { in: subcategoryIds },
    },
    sort: "-createdAt",
    limit,
    depth: 3,
  });

  return result.docs.map(transformProduct);
}

/**
 * Get products by subcategory slug
 */
export async function getProductsBySubcategory(
  subcategorySlug: string,
  limit = 50
): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  // Get subcategory ID from slug
  const subcategory = await payload.find({
    collection: "subcategories",
    where: {
      slug: { equals: subcategorySlug },
      status: { equals: "active" },
    },
    limit: 1,
  });

  if (!subcategory.docs[0]) return [];

  const result = await payload.find({
    collection: "products",
    where: {
      status: { equals: "active" },
      subcategory: { equals: subcategory.docs[0].id },
    },
    sort: "-createdAt",
    limit,
    depth: 3,
  });

  return result.docs.map(transformProduct);
}

/**
 * Get products by persona (category slugs)
 */
export async function getProductsByPersona(
  categorySlugs: string[],
  limit = 8
): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  // Get category IDs from slugs
  const categories = await payload.find({
    collection: "categories",
    where: {
      slug: { in: categorySlugs },
      status: { equals: "active" },
    },
  });

  const categoryIds = categories.docs.map((c) => c.id);
  if (categoryIds.length === 0) return [];

  // Get subcategories for these categories
  const subcategories = await payload.find({
    collection: "subcategories",
    where: {
      category: { in: categoryIds },
      status: { equals: "active" },
    },
  });

  const subcategoryIds = subcategories.docs.map((s) => s.id);
  if (subcategoryIds.length === 0) return [];

  const result = await payload.find({
    collection: "products",
    where: {
      status: { equals: "active" },
      subcategory: { in: subcategoryIds },
    },
    limit,
    depth: 3,
  });

  return result.docs.map(transformProduct);
}

/**
 * Get products grouped by subcategory for a category
 */
export async function getProductsGroupedBySubcategory(
  categorySlug: string,
  productsPerSubcategory = 12
): Promise<
  {
    subcategory: StorefrontSubcategory;
    products: StorefrontProduct[];
    totalProducts: number;
  }[]
> {
  const payload = await getPayloadClient();

  // Get category ID from slug
  const category = await payload.find({
    collection: "categories",
    where: {
      slug: { equals: categorySlug },
      status: { equals: "active" },
    },
    limit: 1,
  });

  if (!category.docs[0]) return [];

  // Get subcategories for this category
  const subcategories = await payload.find({
    collection: "subcategories",
    where: {
      category: { equals: category.docs[0].id },
      status: { equals: "active" },
    },
    sort: "title",
    depth: 2,
  });

  const result: {
    subcategory: StorefrontSubcategory;
    products: StorefrontProduct[];
    totalProducts: number;
  }[] = [];

  for (const subcategory of subcategories.docs) {
    // Get products for this subcategory
    const products = await payload.find({
      collection: "products",
      where: {
        status: { equals: "active" },
        subcategory: { equals: subcategory.id },
      },
      sort: "-createdAt",
      limit: productsPerSubcategory,
      depth: 3,
    });

    // Get total count
    const totalCount = await payload.count({
      collection: "products",
      where: {
        status: { equals: "active" },
        subcategory: { equals: subcategory.id },
      },
    });

    if (products.docs.length > 0) {
      result.push({
        subcategory: transformSubcategory(subcategory),
        products: products.docs.map(transformProduct),
        totalProducts: totalCount.totalDocs,
      });
    }
  }

  return result;
}
