/**
 * Blog Data Fetching Utilities
 * Server-side functions for fetching blog posts from Sanity CMS
 *
 * Requirements: 7.3, 7.4 - Blog data fetching with category filtering
 */

import {
  getAllPosts as sanityGetAllPosts,
  getPostBySlug as sanityGetPostBySlug,
  getPostsByCategorySlug,
  getAllPostCategories as sanityGetAllPostCategories,
  getRecentPosts as sanityGetRecentPosts,
  getRelatedPosts as sanityGetRelatedPosts,
  type SanityPost,
  type SanityPostCategory,
} from "@/lib/sanity/queries/posts";
import { urlFor } from "@/lib/sanity/image";
import type { StorefrontPostCategory } from "@/types/storefront";
import type { BlockContent, SanityImage } from "@/types/sanity";

// ISR revalidation time in seconds (5 minutes)
export const BLOG_REVALIDATE = 300;

/**
 * Blog post author information
 */
export interface BlogPostAuthor {
  name: string | null;
}

/**
 * Blog post with populated relations for display
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: BlockContent;
  excerpt?: string | null;
  /** Original Sanity image reference */
  coverImage?: SanityImage | null;
  /** Transformed image with URL for display */
  featuredImage?: {
    url: string;
    alt?: string;
  } | null;
  category?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  author: BlogPostAuthor;
  publishedAt?: string | null;
  status: "published" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
  /** SEO fields */
  metaTitle?: string | null;
  metaDescription?: string | null;
}

/**
 * Get all published blog posts
 * Requirements: 7.3 - SEO-friendly URLs
 */
export async function getBlogPosts(options?: {
  limit?: number;
  page?: number;
  categorySlug?: string;
}): Promise<{
  posts: BlogPost[];
  totalDocs: number;
  totalPages: number;
}> {
  const { categorySlug } = options ?? {};

  let posts: SanityPost[];

  if (categorySlug) {
    const result = await getPostsByCategorySlug(categorySlug);
    posts = result.posts;
  } else {
    posts = await sanityGetAllPosts();
  }

  const transformedPosts = posts.map(transformPost);

  return {
    posts: transformedPosts,
    totalDocs: transformedPosts.length,
    totalPages: 1,
  };
}

/**
 * Get a single blog post by slug
 * Requirements: 7.3 - SEO-friendly URLs
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await sanityGetPostBySlug(slug);
  if (!post) return null;
  return transformPost(post);
}

/**
 * Get recent blog posts
 */
export async function getRecentPosts(limit = 5): Promise<BlogPost[]> {
  const posts = await sanityGetRecentPosts(limit);
  return posts.map(transformPost);
}

/**
 * Get related posts (same category, excluding current post)
 */
export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  limit = 3
): Promise<BlogPost[]> {
  if (!categoryId) return [];
  const posts = await sanityGetRelatedPosts(categoryId, postId, limit);
  return posts.map(transformPost);
}

/**
 * Get featured/latest post for hero
 */
export async function getFeaturedPost(): Promise<BlogPost | null> {
  const posts = await sanityGetRecentPosts(1);
  if (posts.length === 0) return null;
  const firstPost = posts[0];
  if (!firstPost) return null;
  return transformPost(firstPost);
}

/**
 * Get all categories that have published posts
 * Requirements: 7.4 - Support filtering by category
 */
export async function getBlogCategories(): Promise<StorefrontPostCategory[]> {
  const categories = await sanityGetAllPostCategories();
  return categories.map(transformCategory);
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Generate image URL from Sanity image reference
 */
function getImageUrl(image: SanityImage | null | undefined): string | null {
  if (!image?.asset?._ref) return null;
  try {
    return urlFor(image).width(1200).height(630).url();
  } catch {
    return null;
  }
}

/**
 * Transform Sanity post to blog post
 */
function transformPost(post: SanityPost): BlogPost {
  const imageUrl = getImageUrl(post.coverImage);

  return {
    id: post._id,
    title: post.title,
    slug: post.slug,
    content: post.content as BlockContent,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    featuredImage: imageUrl ? { url: imageUrl, alt: post.title } : null,
    category: post.category
      ? {
          id: post.category._id,
          title: post.category.title,
          slug: post.category.slug,
        }
      : null,
    author: { name: post.author ?? null },
    publishedAt: post.publishedAt,
    status: post.publishedAt ? "published" : "draft",
    createdAt: post._createdAt,
    updatedAt: post._updatedAt,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
  };
}

/**
 * Transform Sanity post category to storefront post category
 */
function transformCategory(category: SanityPostCategory): StorefrontPostCategory {
  return {
    _id: category._id,
    _type: "postCategory",
    _createdAt: "",
    _updatedAt: "",
    _rev: "",
    title: category.title,
    slug: { _type: "slug", current: category.slug },
    description: category.description,
    displayOrder: category.displayOrder,
    postCount: category.postCount,
  };
}
