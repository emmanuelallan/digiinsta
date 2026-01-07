import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
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
 * Generates sitemap index for large catalogs
 * Returns array of sitemap IDs when total URLs exceed URLS_PER_SITEMAP
 * Validates: Requirements 9.2
 */
export async function generateSitemaps(): Promise<{ id: number }[]> {
  const payload = await getPayload({ config });

  // Count total URLs
  const [productsCount, categoriesCount, subcategoriesCount, bundlesCount, postsCount] =
    await Promise.all([
      payload.count({
        collection: "products",
        where: { status: { equals: "active" } },
      }),
      payload.count({
        collection: "categories",
        where: { status: { equals: "active" } },
      }),
      payload.count({
        collection: "subcategories",
        where: { status: { equals: "active" } },
      }),
      payload.count({
        collection: "bundles",
        where: { status: { equals: "active" } },
      }),
      payload.count({
        collection: "posts",
        where: { status: { equals: "published" } },
      }),
    ]);

  // Static pages count (approximately 16 pages)
  const staticPagesCount = 16;

  const totalUrls =
    staticPagesCount +
    productsCount.totalDocs +
    categoriesCount.totalDocs +
    subcategoriesCount.totalDocs +
    bundlesCount.totalDocs +
    postsCount.totalDocs;

  // Calculate number of sitemaps needed
  const numSitemaps = Math.ceil(totalUrls / URLS_PER_SITEMAP);

  // Return array of sitemap IDs
  return Array.from({ length: Math.max(1, numSitemaps) }, (_, i) => ({ id: i }));
}

/**
 * Generates the main sitemap with all site URLs
 * Supports pagination for sitemap index
 * Validates: Requirements 9.1, 9.2
 */
export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });
  const now = new Date();

  // Calculate offset for pagination
  const offset = id * URLS_PER_SITEMAP;

  // Static pages with proper attributes (only include in first sitemap)
  const staticPages: MetadataRoute.Sitemap =
    id === 0
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
  const dynamicOffset = id === 0 ? 0 : offset - 16; // 16 static pages

  // Fetch all active products with pagination
  const products = await payload.find({
    collection: "products",
    where: { status: { equals: "active" } },
    limit: remainingSpace,
    page: Math.floor(dynamicOffset / remainingSpace) + 1,
    select: { slug: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.docs.map((product) => ({
    url: generateCanonicalUrl(`/products/${product.slug}`),
    lastModified: new Date(product.updatedAt),
    changeFrequency: getChangeFrequency("product"),
    priority: getPriority("product"),
  }));

  // Fetch all active categories
  const categories = await payload.find({
    collection: "categories",
    where: { status: { equals: "active" } },
    limit: 1000,
    select: { slug: true, updatedAt: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.docs.map((category) => ({
    url: generateCanonicalUrl(`/categories/${category.slug}`),
    lastModified: new Date(category.updatedAt),
    changeFrequency: getChangeFrequency("category"),
    priority: getPriority("category"),
  }));

  // Fetch all active subcategories
  const subcategories = await payload.find({
    collection: "subcategories",
    where: { status: { equals: "active" } },
    limit: 5000,
    select: { slug: true, updatedAt: true },
  });

  const subcategoryPages: MetadataRoute.Sitemap = subcategories.docs.map((subcategory) => ({
    url: generateCanonicalUrl(`/subcategories/${subcategory.slug}`),
    lastModified: new Date(subcategory.updatedAt),
    changeFrequency: getChangeFrequency("category"),
    priority: 0.6,
  }));

  // Fetch all active bundles
  const bundles = await payload.find({
    collection: "bundles",
    where: { status: { equals: "active" } },
    limit: 1000,
    select: { slug: true, updatedAt: true },
  });

  const bundlePages: MetadataRoute.Sitemap = bundles.docs.map((bundle) => ({
    url: generateCanonicalUrl(`/bundles/${bundle.slug}`),
    lastModified: new Date(bundle.updatedAt),
    changeFrequency: getChangeFrequency("bundle"),
    priority: getPriority("bundle"),
  }));

  // Fetch all published blog posts
  const posts = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit: 5000,
    select: { slug: true, updatedAt: true },
  });

  const postPages: MetadataRoute.Sitemap = posts.docs.map((post) => ({
    url: generateCanonicalUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updatedAt),
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
      `Sitemap ${id} has ${allPages.length} URLs, exceeding the recommended limit of ${MAX_URLS_PER_SITEMAP}.`
    );
  }

  return allPages;
}
