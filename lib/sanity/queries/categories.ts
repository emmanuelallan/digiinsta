import { sanityClient } from "../client";
import { groq } from "next-sanity";

/**
 * Category Queries
 *
 * Note: We use Sanity's native draft/published system instead of a custom status field.
 * The sanityClient is configured with `perspective: "published"` which only returns
 * published documents. Draft documents are automatically filtered out.
 *
 * Categories and subcategories no longer use status filtering - all published
 * documents are shown.
 */

// Base category fields projection
const categoryFields = groq`
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  image,
  icon,
  gradient,
  displayOrder,
  metaTitle,
  metaDescription
`;

// Base subcategory fields projection
const subcategoryFields = groq`
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  defaultPrice,
  compareAtPrice,
  metaTitle,
  metaDescription,
  "category": category->{
    _id,
    title,
    "slug": slug.current
  }
`;

// Get all categories ordered by displayOrder
export const getAllCategoriesQuery = groq`
  *[_type == "category"] | order(displayOrder asc) {
    ${categoryFields},
    "subcategoryCount": count(*[_type == "subcategory" && references(^._id)]),
    "productCount": count(*[_type == "product" && defined(subcategory) && subcategory->category._ref == ^._id])
  }
`;

// Get a single category by slug with its subcategories
export const getCategoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    ${categoryFields},
    "subcategories": *[_type == "subcategory" && references(^._id)] | order(title asc) {
      ${subcategoryFields},
      "productCount": count(*[_type == "product" && references(^._id) && defined(subcategory)])
    }
  }
`;

// Get all subcategories ordered by category and title
export const getAllSubcategoriesQuery = groq`
  *[_type == "subcategory"] | order(category->displayOrder asc, title asc) {
    ${subcategoryFields},
    "productCount": count(*[_type == "product" && references(^._id) && defined(subcategory)])
  }
`;

// Get a single subcategory by slug with product count
export const getSubcategoryBySlugQuery = groq`
  *[_type == "subcategory" && slug.current == $slug][0] {
    ${subcategoryFields},
    "productCount": count(*[_type == "product" && references(^._id) && defined(subcategory)])
  }
`;

// Get subcategories by category slug
export const getSubcategoriesByCategorySlugQuery = groq`
  *[_type == "subcategory" && category->slug.current == $categorySlug] | order(title asc) {
    ${subcategoryFields},
    "productCount": count(*[_type == "product" && references(^._id) && defined(subcategory)])
  }
`;

// Type definitions for query results
export interface SanityCategory {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: string;
  description?: string;
  image?: SanityImage;
  icon?: string;
  gradient?: string;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  subcategoryCount?: number;
  productCount?: number;
  subcategories?: SanitySubcategory[];
}

export interface SanitySubcategory {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: string;
  description?: string;
  defaultPrice: number;
  compareAtPrice?: number;
  metaTitle?: string;
  metaDescription?: string;
  category: {
    _id: string;
    title: string;
    slug: string;
  };
  productCount?: number;
}

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

// Query execution functions
export async function getAllCategories(): Promise<SanityCategory[]> {
  return sanityClient.fetch(getAllCategoriesQuery);
}

export async function getCategoryBySlug(slug: string): Promise<SanityCategory | null> {
  return sanityClient.fetch(getCategoryBySlugQuery, { slug });
}

export async function getAllSubcategories(): Promise<SanitySubcategory[]> {
  return sanityClient.fetch(getAllSubcategoriesQuery);
}

export async function getSubcategoryBySlug(slug: string): Promise<SanitySubcategory | null> {
  return sanityClient.fetch(getSubcategoryBySlugQuery, { slug });
}

export async function getSubcategoriesByCategorySlug(
  categorySlug: string
): Promise<SanitySubcategory[]> {
  return sanityClient.fetch(getSubcategoriesByCategorySlugQuery, { categorySlug });
}
