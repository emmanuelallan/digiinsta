import { sanityClient } from "../client";
import { groq } from "next-sanity";
import type { SanityImage } from "./categories";

// Base post category fields projection
const postCategoryFields = groq`
  _id,
  title,
  "slug": slug.current,
  description,
  displayOrder
`;

// Base post fields projection with category expansion
const postFields = groq`
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  content,
  excerpt,
  coverImage,
  author,
  publishedAt,
  metaTitle,
  metaDescription,
  "category": category->{
    ${postCategoryFields}
  }
`;

// Get all published posts ordered by publishedAt
// Note: We use defined(publishedAt) to identify published posts
export const getAllPostsQuery = groq`
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
    ${postFields}
  }
`;

// Get posts with pagination
export const getPostsPaginatedQuery = groq`
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [$start...$end] {
    ${postFields}
  }
`;

// Get total published post count
export const getPostCountQuery = groq`
  count(*[_type == "post" && defined(publishedAt)])
`;

// Get a single post by slug
export const getPostBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${postFields}
  }
`;

// Get posts by category slug with pagination
export const getPostsByCategorySlugQuery = groq`
  *[_type == "post" && category->slug.current == $categorySlug && defined(publishedAt)] | order(publishedAt desc) [$start...$end] {
    ${postFields}
  }
`;

// Get post count by category slug
export const getPostCountByCategorySlugQuery = groq`
  count(*[_type == "post" && category->slug.current == $categorySlug && defined(publishedAt)])
`;

// Get all post categories ordered by displayOrder
export const getAllPostCategoriesQuery = groq`
  *[_type == "postCategory"] | order(displayOrder asc) {
    ${postCategoryFields},
    "postCount": count(*[_type == "post" && references(^._id) && defined(publishedAt)])
  }
`;

// Get a single post category by slug
export const getPostCategoryBySlugQuery = groq`
  *[_type == "postCategory" && slug.current == $slug][0] {
    ${postCategoryFields},
    "postCount": count(*[_type == "post" && references(^._id) && defined(publishedAt)])
  }
`;

// Get recent posts (for sidebar/footer)
export const getRecentPostsQuery = groq`
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...$limit] {
    ${postFields}
  }
`;

// Get related posts (same category, excluding current post)
export const getRelatedPostsQuery = groq`
  *[_type == "post" && defined(publishedAt) && category._ref == $categoryId && _id != $currentPostId] | order(publishedAt desc) [0...$limit] {
    ${postFields}
  }
`;

// Search posts by title or content
export const searchPostsQuery = groq`
  *[_type == "post" && defined(publishedAt) && (
    title match $searchTerm ||
    excerpt match $searchTerm ||
    pt::text(content) match $searchTerm
  )] | order(publishedAt desc) {
    ${postFields}
  }
`;

// Type definitions for query results
export interface SanityPostCategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  displayOrder: number;
  postCount?: number;
}

export interface SanityPost {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: string;
  content: unknown[]; // Block content
  excerpt?: string;
  coverImage?: SanityImage;
  author?: string;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  category?: SanityPostCategory;
}

// Pagination options
export interface PostPaginationOptions {
  page?: number;
  pageSize?: number;
}

// Query execution functions
export async function getAllPosts(): Promise<SanityPost[]> {
  return sanityClient.fetch(getAllPostsQuery);
}

export async function getPostsPaginated(
  options: PostPaginationOptions = {}
): Promise<{ posts: SanityPost[]; total: number }> {
  const { page = 1, pageSize = 10 } = options;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const [posts, total] = await Promise.all([
    sanityClient.fetch<SanityPost[]>(getPostsPaginatedQuery, { start, end }),
    sanityClient.fetch<number>(getPostCountQuery),
  ]);

  return { posts, total };
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  return sanityClient.fetch(getPostBySlugQuery, { slug });
}

export async function getPostsByCategorySlug(
  categorySlug: string,
  options: PostPaginationOptions = {}
): Promise<{ posts: SanityPost[]; total: number }> {
  const { page = 1, pageSize = 10 } = options;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const [posts, total] = await Promise.all([
    sanityClient.fetch<SanityPost[]>(getPostsByCategorySlugQuery, {
      categorySlug,
      start,
      end,
    }),
    sanityClient.fetch<number>(getPostCountByCategorySlugQuery, { categorySlug }),
  ]);

  return { posts, total };
}

export async function getAllPostCategories(): Promise<SanityPostCategory[]> {
  return sanityClient.fetch(getAllPostCategoriesQuery);
}

export async function getPostCategoryBySlug(slug: string): Promise<SanityPostCategory | null> {
  return sanityClient.fetch(getPostCategoryBySlugQuery, { slug });
}

export async function getRecentPosts(limit: number = 5): Promise<SanityPost[]> {
  return sanityClient.fetch(getRecentPostsQuery, { limit });
}

export async function getRelatedPosts(
  categoryId: string,
  currentPostId: string,
  limit: number = 3
): Promise<SanityPost[]> {
  return sanityClient.fetch(getRelatedPostsQuery, { categoryId, currentPostId, limit });
}

export async function searchPosts(searchTerm: string): Promise<SanityPost[]> {
  // Add wildcards for partial matching
  const term = `*${searchTerm}*`;
  return sanityClient.fetch(searchPostsQuery, { searchTerm: term });
}
