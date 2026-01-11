import { sanityClient } from "../client";
import { groq } from "next-sanity";

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
  status,
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
  status,
  metaTitle,
  metaDescription,
  "category": category->{
    _id,
    title,
    "slug": slug.current
  }
`;

// Get all active categories ordered by displayOrder
export const getAllCategoriesQuery = groq`
  *[_type == "category" && status == "active"] | order(displayOrder asc) {
    ${categoryFields},
    "subcategoryCount": count(*[_type == "subcategory" && references(^._id) && status == "active"]),
    "productCount": count(*[_type == "product" && status == "active" && subcategory->category._ref == ^._id])
  }
`;

// Get a single category by slug with its subcategories
export const getCategoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    ${categoryFields},
    "subcategories": *[_type == "subcategory" && references(^._id) && status == "active"] | order(title asc) {
      ${subcategoryFields},
      "productCount": count(*[_type == "product" && references(^._id) && status == "active"])
    }
  }
`;

// Get all active subcategories ordered by category and title
export const getAllSubcategoriesQuery = groq`
  *[_type == "subcategory" && status == "active"] | order(category->displayOrder asc, title asc) {
    ${subcategoryFields},
    "productCount": count(*[_type == "product" && references(^._id) && status == "active"])
  }
`;

// Get a single subcategory by slug with product count
export const getSubcategoryBySlugQuery = groq`
  *[_type == "subcategory" && slug.current == $slug][0] {
    ${subcategoryFields},
    "productCount": count(*[_type == "product" && references(^._id) && status == "active"])
  }
`;

// Get subcategories by category slug
export const getSubcategoriesByCategorySlugQuery = groq`
  *[_type == "subcategory" && category->slug.current == $categorySlug && status == "active"] | order(title asc) {
    ${subcategoryFields},
    "productCount": count(*[_type == "product" && references(^._id) && status == "active"])
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
  displayOrder: number;
  status: "active" | "archived";
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
  status: "active" | "archived";
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
