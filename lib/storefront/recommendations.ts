/**
 * Product Recommendations Service
 * Server-side functions for fetching product recommendations
 */

import { getPayload } from "payload";
import config from "@payload-config";
import type {
  StorefrontProduct,
  StorefrontSubcategory,
  StorefrontCategory,
} from "@/types/storefront";
import type { Product, Category, Subcategory, Media } from "@/payload-types";

/**
 * Get Payload instance
 */
async function getPayloadClient() {
  return getPayload({ config });
}

/**
 * Transform Payload category to storefront category
 */
function transformCategory(category: Category): StorefrontCategory {
  return {
    ...category,
    image: category.image as Media | null,
  };
}

/**
 * Transform Payload subcategory to storefront subcategory
 */
function transformSubcategory(subcategory: Subcategory): StorefrontSubcategory {
  const category = subcategory.category as Category;
  return {
    ...subcategory,
    category: transformCategory(category),
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
 * Get frequently bought together products
 * Returns products from the same subcategory that complement the source product
 *
 * @param productId - The source product ID to find recommendations for
 * @param limit - Maximum number of products to return (default: 4)
 * @returns Array of recommended products, excluding the source product
 */
export async function getFrequentlyBoughtTogether(
  productId: number,
  limit = 4
): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  // First, get the source product to find its subcategory
  const sourceProduct = await payload.findByID({
    collection: "products",
    id: productId,
    depth: 2,
  });

  if (!sourceProduct) {
    return [];
  }

  const subcategory = sourceProduct.subcategory as Subcategory;
  const subcategoryId = typeof subcategory === "number" ? subcategory : subcategory.id;

  // Get products from the same subcategory, excluding the source product
  const result = await payload.find({
    collection: "products",
    where: {
      status: { equals: "active" },
      id: { not_equals: productId },
      subcategory: { equals: subcategoryId },
    },
    limit,
    depth: 3,
    sort: "-createdAt",
  });

  return result.docs.map(transformProduct);
}

/**
 * Get customers also viewed products
 * Returns products from the same category (via sibling subcategories) or related categories
 *
 * @param productId - The source product ID to find recommendations for
 * @param categoryId - The category ID to find related products from
 * @param limit - Maximum number of products to return (default: 4)
 * @returns Array of recommended products, excluding the source product
 */
export async function getCustomersAlsoViewed(
  productId: number,
  categoryId: number,
  limit = 4
): Promise<StorefrontProduct[]> {
  const payload = await getPayloadClient();

  // Get all subcategories for this category
  const subcategories = await payload.find({
    collection: "subcategories",
    where: {
      category: { equals: categoryId },
      status: { equals: "active" },
    },
    depth: 0,
  });

  const subcategoryIds = subcategories.docs.map((s) => s.id);

  if (subcategoryIds.length === 0) {
    return [];
  }

  // Get products from the same category (any subcategory), excluding the source product
  const result = await payload.find({
    collection: "products",
    where: {
      status: { equals: "active" },
      id: { not_equals: productId },
      subcategory: { in: subcategoryIds },
    },
    limit,
    depth: 3,
    sort: "-createdAt",
  });

  return result.docs.map(transformProduct);
}

/**
 * Get related categories (sibling categories and parent category info)
 *
 * @param categoryId - The current category ID
 * @param limit - Maximum number of sibling categories to return (default: 4)
 * @returns Object containing parent category and sibling categories
 */
export async function getRelatedCategories(
  categoryId: number,
  limit = 4
): Promise<{
  siblings: StorefrontCategory[];
  current: StorefrontCategory | null;
}> {
  const payload = await getPayloadClient();

  // Get the current category
  const currentCategory = await payload.findByID({
    collection: "categories",
    id: categoryId,
    depth: 1,
  });

  if (!currentCategory) {
    return { siblings: [], current: null };
  }

  // Get sibling categories (other active categories)
  const siblings = await payload.find({
    collection: "categories",
    where: {
      status: { equals: "active" },
      id: { not_equals: categoryId },
    },
    limit,
    depth: 1,
    sort: "title",
  });

  return {
    current: transformCategory(currentCategory),
    siblings: siblings.docs.map(transformCategory),
  };
}

/**
 * Get subcategories for a category (for internal linking)
 *
 * @param categoryId - The category ID to get subcategories for
 * @returns Array of subcategories with product counts
 */
export async function getSubcategoriesWithCounts(
  categoryId: number
): Promise<Array<StorefrontSubcategory & { productCount: number }>> {
  const payload = await getPayloadClient();

  // Get subcategories for this category
  const subcategories = await payload.find({
    collection: "subcategories",
    where: {
      category: { equals: categoryId },
      status: { equals: "active" },
    },
    depth: 2,
    sort: "title",
  });

  // Get product counts for each subcategory
  const subcategoriesWithCounts = await Promise.all(
    subcategories.docs.map(async (subcategory) => {
      const count = await payload.count({
        collection: "products",
        where: {
          subcategory: { equals: subcategory.id },
          status: { equals: "active" },
        },
      });

      return {
        ...transformSubcategory(subcategory),
        productCount: count.totalDocs,
      };
    })
  );

  return subcategoriesWithCounts;
}
