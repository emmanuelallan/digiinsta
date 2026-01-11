import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { groq } from "next-sanity";
import {
  generateCanonicalUrl,
  getChangeFrequency,
  getPriority,
  MAX_URLS_PER_SITEMAP,
} from "@/lib/sitemap";

/**
 * URLs per sitemap chunk for sitemap index
 * Using a conservative limit to ensure fast generation
 */
const URLS_PER_SITEMAP = 10000;

/**
 * Sitemap document type for Sanity queries
 */
interface SitemapDocument {
  slug: string;
  _updatedAt: string;
}

/**
 * Generates sitemap index for large catalogs
 * Returns array of sitemap IDs when total URLs exceed URLS_PER_SITEMAP
 * Validates: Requirements 9.4
 */
export async function generateSitemaps(): Promise<{ id: number }[]> {
  // Count total URLs from Sanity
  const countQuery = groq`{
    "products": count(*[_type == "product" && status == "active"]),
    "categories": count(*[_type == "category" && status == "active"]),
    "subcategories": count(*[_type == "subcategory" && status == "active"]),
    "bundles": count(*[_type == "bundle" && status == "active"]),
    "posts": count(*[_type == "post" && status == "published"])
  }`;

  const counts = await sanityClient.fetch<{
    products: number;
    categories: number;
    subcategories: number;
    bundles: number;
    posts: number;
  }>(countQuery);

  // Static pages count (approximately 16 pages)
  const staticPagesCount = 16;

  const totalUrls =
    staticPagesCount +
    counts.products +
    counts.categories +
    counts.subcategories +
    counts.bundles +
    counts.posts;

  // Calculate number of sitemaps needed
  const numSitemaps = Math.ceil(totalUrls / URLS_PER_SITEMAP);

  // Return array of sitemap IDs
  return Array.from({ length: Math.max(1, numSitemaps) }, (_, i) => ({ id: i }));
}

/**
 * Generates the main sitemap with all site URLs
 * Supports pagination for sitemap index
 * Validates: Requirements 9.4
 */
export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Ensure id is a valid number, default to 0
  const sitemapId = typeof id === "number" && !isNaN(id) ? id : 0;

  // Calculate offset for pagination
  const offset = sitemapId * URLS_PER_SITEMAP;

  // Static pages with proper attributes (only include in first sitemap)
  const staticPages: MetadataRoute.Sitemap =
    sitemapId === 0
      ? [
          {
            url: generateCanonicalUrl("/"),
            lastModified: now,
            changeFrequency: "daily",
            priority: getPriority("home"),
          },
          {
            url: generateCanonicalUrl("/categories"),
            lastModified: now,
            changeFrequency: "weekly",
            priority: getPriority("listing"),
          },
          {
            url: generateCanonicalUrl("/products"),
            lastModified: now,
            changeFrequency: "daily",
            priority: getPriority("listing"),
          },
          {
            url: generateCanonicalUrl("/bundles"),
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
          },
          {
            url: generateCanonicalUrl("/blog"),
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
          },
          {
            url: generateCanonicalUrl("/new-arrivals"),
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
          },
          {
            url: generateCanonicalUrl("/best-sellers"),
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
          },
          {
            url: generateCanonicalUrl("/sale"),
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.7,
          },
          {
            url: generateCanonicalUrl("/shop/student"),
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
          },
          {
            url: generateCanonicalUrl("/shop/professional"),
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
          },
          {
            url: generateCanonicalUrl("/shop/couple"),
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
          },
          {
            url: generateCanonicalUrl("/about"),
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
          },
          {
            url: generateCanonicalUrl("/contact"),
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
          },
          {
            url: generateCanonicalUrl("/help/faq"),
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
          },
          {
            url: generateCanonicalUrl("/terms"),
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
          },
          {
            url: generateCanonicalUrl("/privacy"),
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
          },
        ]
      : [];

  // Calculate remaining space after static pages
  const staticPagesCount = staticPages.length;
  const remainingSpace = URLS_PER_SITEMAP - staticPagesCount;

  // Adjust offset for dynamic content (accounting for static pages in first sitemap)
  const dynamicOffset = sitemapId === 0 ? 0 : Math.max(0, offset - 16); // 16 static pages

  // Ensure we have valid integers for GROQ slice
  const startIndex = Math.max(0, Math.floor(dynamicOffset));
  const endIndex = Math.max(startIndex, Math.floor(dynamicOffset + remainingSpace));

  // Fetch all active products from Sanity
  const productsQuery = groq`
    *[_type == "product" && status == "active"] | order(_createdAt desc) [${startIndex}...${endIndex}] {
      "slug": slug.current,
      _updatedAt
    }
  `;
  const products = await sanityClient.fetch<SitemapDocument[]>(productsQuery);

  const productPages: MetadataRoute.Sitemap = products.map((product: SitemapDocument) => ({
    url: generateCanonicalUrl(`/products/${product.slug}`),
    lastModified: new Date(product._updatedAt),
    changeFrequency: getChangeFrequency("product"),
    priority: getPriority("product"),
  }));

  // Fetch all active categories from Sanity
  const categoriesQuery = groq`
    *[_type == "category" && status == "active"] | order(displayOrder asc) {
      "slug": slug.current,
      _updatedAt
    }
  `;
  const categories = await sanityClient.fetch<SitemapDocument[]>(categoriesQuery);

  const categoryPages: MetadataRoute.Sitemap = categories.map((category: SitemapDocument) => ({
    url: generateCanonicalUrl(`/categories/${category.slug}`),
    lastModified: new Date(category._updatedAt),
    changeFrequency: getChangeFrequency("category"),
    priority: getPriority("category"),
  }));

  // Fetch all active subcategories from Sanity
  const subcategoriesQuery = groq`
    *[_type == "subcategory" && status == "active"] | order(title asc) {
      "slug": slug.current,
      _updatedAt
    }
  `;
  const subcategories = await sanityClient.fetch<SitemapDocument[]>(subcategoriesQuery);

  const subcategoryPages: MetadataRoute.Sitemap = subcategories.map(
    (subcategory: SitemapDocument) => ({
      url: generateCanonicalUrl(`/subcategories/${subcategory.slug}`),
      lastModified: new Date(subcategory._updatedAt),
      changeFrequency: getChangeFrequency("category"),
      priority: 0.6,
    })
  );

  // Fetch all active bundles from Sanity
  const bundlesQuery = groq`
    *[_type == "bundle" && status == "active"] | order(_createdAt desc) {
      "slug": slug.current,
      _updatedAt
    }
  `;
  const bundles = await sanityClient.fetch<SitemapDocument[]>(bundlesQuery);

  const bundlePages: MetadataRoute.Sitemap = bundles.map((bundle: SitemapDocument) => ({
    url: generateCanonicalUrl(`/bundles/${bundle.slug}`),
    lastModified: new Date(bundle._updatedAt),
    changeFrequency: getChangeFrequency("bundle"),
    priority: getPriority("bundle"),
  }));

  // Fetch all published blog posts from Sanity
  const postsQuery = groq`
    *[_type == "post" && status == "published"] | order(publishedAt desc) {
      "slug": slug.current,
      _updatedAt
    }
  `;
  const posts = await sanityClient.fetch<SitemapDocument[]>(postsQuery);

  const postPages: MetadataRoute.Sitemap = posts.map((post: SitemapDocument) => ({
    url: generateCanonicalUrl(`/blog/${post.slug}`),
    lastModified: new Date(post._updatedAt),
    changeFrequency: getChangeFrequency("post"),
    priority: getPriority("post"),
  }));

  // Combine all pages
  const allPages = [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...subcategoryPages,
    ...bundlePages,
    ...postPages,
  ];

  // Log warning if sitemap exceeds limit
  if (allPages.length > MAX_URLS_PER_SITEMAP) {
    console.warn(
      `Sitemap ${sitemapId} has ${allPages.length} URLs, exceeding the recommended limit of ${MAX_URLS_PER_SITEMAP}.`
    );
  }

  return allPages;
}
