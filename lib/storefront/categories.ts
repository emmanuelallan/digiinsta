/**
 * Category Data Fetching Utilities
 * Server-side functions for fetching categories and subcategories from Sanity CMS
 */

import {
  getAllCategories as sanityGetAllCategories,
  getCategoryBySlug as sanityGetCategoryBySlug,
  getAllSubcategories as sanityGetAllSubcategories,
  getSubcategoryBySlug as sanityGetSubcategoryBySlug,
  getSubcategoriesByCategorySlug,
  type SanityCategory,
  type SanitySubcategory,
} from "@/lib/sanity/queries/categories";
import type {
  StorefrontCategory,
  StorefrontSubcategory,
  MegaMenuCategory,
} from "@/types/storefront";
import type { SanitySubcategory as SanitySubcategoryType } from "@/types/sanity";

export const CATEGORY_REVALIDATE = 300;

export async function getCategories(): Promise<StorefrontCategory[]> {
  const categories = await sanityGetAllCategories();
  return categories.map(transformCategory);
}

export async function getCategoryBySlug(slug: string): Promise<StorefrontCategory | null> {
  const category = await sanityGetCategoryBySlug(slug);
  if (!category) return null;
  const transformed = transformCategory(category);
  if (category.subcategories) {
    transformed.subcategories = category.subcategories.map(transformSubcategoryToSanity);
  }
  return transformed;
}

export async function getSubcategories(): Promise<StorefrontSubcategory[]> {
  const subcategories = await sanityGetAllSubcategories();
  return subcategories.map(transformSubcategory);
}

export async function getSubcategoryBySlug(slug: string): Promise<StorefrontSubcategory | null> {
  const subcategory = await sanityGetSubcategoryBySlug(slug);
  if (!subcategory) return null;
  return transformSubcategory(subcategory);
}

export async function getSubcategoriesByCategory(
  categorySlug: string
): Promise<StorefrontSubcategory[]> {
  const subcategories = await getSubcategoriesByCategorySlug(categorySlug);
  return subcategories.map(transformSubcategory);
}

export async function getCategoriesForMegaMenu(): Promise<MegaMenuCategory[]> {
  const categories = await sanityGetAllCategories();
  const megaMenuCategories: MegaMenuCategory[] = [];
  for (const category of categories) {
    const subcategories = await getSubcategoriesByCategorySlug(category.slug);
    megaMenuCategories.push({
      title: category.title,
      slug: category.slug,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      href: `/categories/${category.slug}`,
      subcategories: subcategories.map((sub) => ({
        title: sub.title,
        slug: sub.slug,
        href: `/subcategories/${sub.slug}`,
      })),
    });
  }
  return megaMenuCategories;
}

export async function getCategoryProductCount(categoryId: string): Promise<number> {
  const categories = await sanityGetAllCategories();
  const category = categories.find((c) => c._id === categoryId);
  return category?.productCount ?? 0;
}

export async function getSubcategoryProductCount(subcategoryId: string): Promise<number> {
  const subcategories = await sanityGetAllSubcategories();
  const subcategory = subcategories.find((s) => s._id === subcategoryId);
  return subcategory?.productCount ?? 0;
}

export async function getCategoriesWithCounts(): Promise<StorefrontCategory[]> {
  const categories = await sanityGetAllCategories();
  return categories.map((category) => ({
    ...transformCategory(category),
    productCount: category.productCount ?? 0,
  }));
}

export async function searchCategories(query: string, limit = 5): Promise<StorefrontCategory[]> {
  const categories = await sanityGetAllCategories();
  const lowerQuery = query.toLowerCase();
  return categories
    .filter(
      (category) =>
        category.title.toLowerCase().includes(lowerQuery) ||
        category.description?.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit)
    .map(transformCategory);
}

export async function searchSubcategories(
  query: string,
  limit = 5
): Promise<StorefrontSubcategory[]> {
  const subcategories = await sanityGetAllSubcategories();
  const lowerQuery = query.toLowerCase();
  return subcategories
    .filter(
      (subcategory) =>
        subcategory.title.toLowerCase().includes(lowerQuery) ||
        subcategory.description?.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit)
    .map(transformSubcategory);
}

function transformCategory(category: SanityCategory): StorefrontCategory {
  return {
    _id: category._id,
    _type: "category",
    _createdAt: category._createdAt,
    _updatedAt: category._updatedAt,
    _rev: "",
    title: category.title,
    slug: { _type: "slug", current: category.slug },
    description: category.description,
    image: category.image,
    icon: category.icon as StorefrontCategory["icon"],
    gradient: category.gradient,
    displayOrder: category.displayOrder,
    status: category.status,
    metaTitle: category.metaTitle,
    metaDescription: category.metaDescription,
    productCount: category.productCount,
    id: category._id,
  };
}

function transformSubcategoryToSanity(subcategory: SanitySubcategory): SanitySubcategoryType {
  return {
    _id: subcategory._id,
    _type: "subcategory",
    _createdAt: subcategory._createdAt,
    _updatedAt: subcategory._updatedAt,
    _rev: "",
    title: subcategory.title,
    slug: { _type: "slug", current: subcategory.slug },
    description: subcategory.description,
    defaultPrice: subcategory.defaultPrice,
    compareAtPrice: subcategory.compareAtPrice,
    status: subcategory.status,
    metaTitle: subcategory.metaTitle,
    metaDescription: subcategory.metaDescription,
    category: { _ref: subcategory.category._id, _type: "reference" },
  };
}

function transformSubcategory(subcategory: SanitySubcategory): StorefrontSubcategory {
  return {
    _id: subcategory._id,
    _type: "subcategory",
    _createdAt: subcategory._createdAt,
    _updatedAt: subcategory._updatedAt,
    _rev: "",
    title: subcategory.title,
    slug: { _type: "slug", current: subcategory.slug },
    description: subcategory.description,
    defaultPrice: subcategory.defaultPrice,
    compareAtPrice: subcategory.compareAtPrice,
    status: subcategory.status,
    metaTitle: subcategory.metaTitle,
    metaDescription: subcategory.metaDescription,
    productCount: subcategory.productCount,
    category: {
      _id: subcategory.category._id,
      _type: "category",
      _createdAt: "",
      _updatedAt: "",
      _rev: "",
      title: subcategory.category.title,
      slug: { _type: "slug", current: subcategory.category.slug },
    },
  };
}
