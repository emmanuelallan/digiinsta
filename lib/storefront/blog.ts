/**
 * Blog Data Fetching Utilities
 * Server-side functions for fetching blog posts from Payload CMS
 */

import { getPayload } from "payload";
import config from "@payload-config";
import type { Post, Media, Category, User } from "@/payload-types";

/**
 * Blog post with populated relations for display
 */
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: Post["content"];
  excerpt?: string | null;
  featuredImage?: Media | null;
  category?: Category | null;
  author: {
    id: number;
    name?: string | null;
    email: string;
  };
  status: Post["status"];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get Payload instance
 */
async function getPayloadClient() {
  return getPayload({ config });
}

/**
 * Transform Payload post to blog post
 */
function transformPost(post: Post): BlogPost {
  const author = post.createdBy as User;
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage as Media | null,
    category: post.category as Category | null,
    author: {
      id: author.id,
      name: author.name,
      email: author.email,
    },
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

/**
 * Get all published blog posts
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
  const payload = await getPayloadClient();
  const { limit = 12, page = 1, categorySlug } = options ?? {};

  const where: Record<string, unknown> = {
    status: { equals: "published" },
  };

  // Filter by category if provided
  if (categorySlug) {
    const category = await payload.find({
      collection: "categories",
      where: { slug: { equals: categorySlug } },
      limit: 1,
    });
    if (category.docs[0]) {
      where["category"] = { equals: category.docs[0].id };
    }
  }

  const result = await payload.find({
    collection: "posts",
    where: where as Parameters<typeof payload.find>[0]["where"],
    limit,
    page,
    sort: "-createdAt",
    depth: 2,
  });

  return {
    posts: result.docs.map(transformPost),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  };
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "posts",
    where: {
      slug: { equals: slug },
      status: { equals: "published" },
    },
    limit: 1,
    depth: 2,
  });

  if (!result.docs[0]) return null;
  return transformPost(result.docs[0]);
}

/**
 * Get recent blog posts
 */
export async function getRecentPosts(limit = 5): Promise<BlogPost[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    sort: "-createdAt",
    limit,
    depth: 2,
  });

  return result.docs.map(transformPost);
}

/**
 * Get related posts (same category, excluding current post)
 */
export async function getRelatedPosts(
  postId: number,
  categoryId: number | null,
  limit = 3
): Promise<BlogPost[]> {
  const payload = await getPayloadClient();

  const where: Record<string, unknown> = {
    status: { equals: "published" },
    id: { not_equals: postId },
  };

  if (categoryId) {
    where["category"] = { equals: categoryId };
  }

  const result = await payload.find({
    collection: "posts",
    where: where as Parameters<typeof payload.find>[0]["where"],
    sort: "-createdAt",
    limit,
    depth: 2,
  });

  return result.docs.map(transformPost);
}

/**
 * Get featured/latest post for hero
 */
export async function getFeaturedPost(): Promise<BlogPost | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    sort: "-createdAt",
    limit: 1,
    depth: 2,
  });

  if (!result.docs[0]) return null;
  return transformPost(result.docs[0]);
}

/**
 * Get all categories that have published posts
 */
export async function getBlogCategories(): Promise<Category[]> {
  const payload = await getPayloadClient();

  // Get all published posts with categories
  const posts = await payload.find({
    collection: "posts",
    where: {
      status: { equals: "published" },
      category: { exists: true },
    },
    depth: 1,
  });

  // Extract unique categories
  const categoryMap = new Map<number, Category>();
  for (const post of posts.docs) {
    const category = post.category as Category | null;
    if (category && !categoryMap.has(category.id)) {
      categoryMap.set(category.id, category);
    }
  }

  return Array.from(categoryMap.values());
}
