/**
 * Category Data Fetching Utilities
 * Server-side functions for fetching categories and subcategories from Payload CMS
 */

import { getPayload } from "payload";
import config from "@payload-config";
import type {
  StorefrontCategory,
  StorefrontSubcategory,
  MegaMenuCategory,
  StorefrontProduct,
} from "@/types/storefront";
import type { Category, Subcategory, Media } from "@/payload-types";

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
  return {
    ...subcategory,
    category: transformCategory(subcategory.category as Category),
  };
}

/**
 * Get all active categories
 */
export async function getCategories(): Promise<StorefrontCategory[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "categories",
    where: { status: { equals: "active" } },
    sort: "title",
    limit: 100,
    depth: 1,
  });

  return result.docs.map(transformCategory);
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<StorefrontCategory | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "categories",
    where: {
      slug: { equals: slug },
      status: { equals: "active" },
    },
    limit: 1,
    depth: 1,
  });

  if (!result.docs[0]) return null;

  const category = transformCategory(result.docs[0]);

  // Get subcategories for this category
  const subcategories = await payload.find({
    collection: "subcategories",
    where: {
      category: { equals: result.docs[0].id },
      status: { equals: "active" },
    },
    sort: "title",
    depth: 1,
  });

  category.subcategories = subcategories.docs.map(transformSubcategory);

  return category;
}

/**
 * Get all active subcategories
 */
export async function getSubcategories(): Promise<StorefrontSubcategory[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "subcategories",
    where: { status: { equals: "active" } },
    sort: "title",
    limit: 100,
    depth: 2,
  });

  return result.docs.map(transformSubcategory);
}

/**
 * Get subcategory by slug
 */
export async function getSubcategoryBySlug(
  slug: string,
): Promise<StorefrontSubcategory | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "subcategories",
    where: {
      slug: { equals: slug },
      status: { equals: "active" },
    },
    limit: 1,
    depth: 2,
  });

  if (!result.docs[0]) return null;
  return transformSubcategory(result.docs[0]);
}

/**
 * Get subcategories for a category
 */
export async function getSubcategoriesByCategory(
  categoryId: number,
): Promise<StorefrontSubcategory[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "subcategories",
    where: {
      category: { equals: categoryId },
      status: { equals: "active" },
    },
    sort: "title",
    depth: 2,
  });

  return result.docs.map(transformSubcategory);
}

/**
 * Get categories with their subcategories for mega menu
 */
export async function getCategoriesForMegaMenu(): Promise<MegaMenuCategory[]> {
  const payload = await getPayloadClient();

  // Get all active categories
  const categories = await payload.find({
    collection: "categories",
    where: { status: { equals: "active" } },
    sort: "title",
    limit: 10,
    depth: 1,
  });

  const megaMenuCategories: MegaMenuCategory[] = [];

  for (const category of categories.docs) {
    // Get subcategories for this category
    const subcategories = await payload.find({
      collection: "subcategories",
      where: {
        category: { equals: category.id },
        status: { equals: "active" },
      },
      sort: "title",
      depth: 0,
    });

    // Get subcategory IDs for product query
    const subcategoryIds = subcategories.docs.map((s) => s.id);

    // Get featured products for this category (via subcategories)
    let featuredProducts: StorefrontProduct[] = [];
    if (subcategoryIds.length > 0) {
      const products = await payload.find({
        collection: "products",
        where: {
          subcategory: { in: subcategoryIds },
          status: { equals: "active" },
        },
        limit: 2,
        depth: 3,
      });

      featuredProducts = products.docs.map((p) => ({
        ...p,
        subcategory: transformSubcategory(p.subcategory as Subcategory),
        images:
          p.images?.map((img) => ({
            ...img,
            image: img.image as Media,
          })) ?? null,
        file: p.file as Media,
      })) as StorefrontProduct[];
    }

    megaMenuCategories.push({
      title: category.title,
      slug: category.slug,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      href: `/categories/${category.slug}`,
      subcategories: subcategories.docs.map((sub) => ({
        title: sub.title,
        slug: sub.slug,
        href: `/subcategories/${sub.slug}`,
      })),
      featuredProducts,
    });
  }

  return megaMenuCategories;
}

/**
 * Get product count for a category (via subcategories)
 */
export async function getCategoryProductCount(
  categoryId: number,
): Promise<number> {
  const payload = await getPayloadClient();

  // Get subcategory IDs for this category
  const subcategories = await payload.find({
    collection: "subcategories",
    where: {
      category: { equals: categoryId },
      status: { equals: "active" },
    },
    depth: 0,
  });

  const subcategoryIds = subcategories.docs.map((s) => s.id);

  if (subcategoryIds.length === 0) return 0;

  const result = await payload.count({
    collection: "products",
    where: {
      subcategory: { in: subcategoryIds },
      status: { equals: "active" },
    },
  });

  return result.totalDocs;
}

/**
 * Get product count for a subcategory
 */
export async function getSubcategoryProductCount(
  subcategoryId: number,
): Promise<number> {
  const payload = await getPayloadClient();

  const result = await payload.count({
    collection: "products",
    where: {
      subcategory: { equals: subcategoryId },
      status: { equals: "active" },
    },
  });

  return result.totalDocs;
}

/**
 * Get all categories with product counts
 */
export async function getCategoriesWithCounts(): Promise<StorefrontCategory[]> {
  const payload = await getPayloadClient();

  const categories = await payload.find({
    collection: "categories",
    where: { status: { equals: "active" } },
    sort: "title",
    limit: 100,
    depth: 1,
  });

  const categoriesWithCounts: StorefrontCategory[] = [];

  for (const category of categories.docs) {
    const count = await getCategoryProductCount(category.id);
    categoriesWithCounts.push({
      ...transformCategory(category),
      productCount: count,
    });
  }

  return categoriesWithCounts;
}

/**
 * Search categories by query
 */
export async function searchCategories(
  query: string,
  limit = 5,
): Promise<StorefrontCategory[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "categories",
    where: {
      status: { equals: "active" },
      or: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    limit,
    depth: 1,
  });

  return result.docs.map(transformCategory);
}

/**
 * Search subcategories by query
 */
export async function searchSubcategories(
  query: string,
  limit = 5,
): Promise<StorefrontSubcategory[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "subcategories",
    where: {
      status: { equals: "active" },
      or: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    limit,
    depth: 2,
  });

  return result.docs.map(transformSubcategory);
}
