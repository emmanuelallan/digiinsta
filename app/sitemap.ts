import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/bundles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/best-sellers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/sale`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/shop/student`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/shop/professional`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/shop/couple`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Fetch all active products
  const products = await payload.find({
    collection: "products",
    where: { status: { equals: "active" } },
    limit: 1000,
    select: { slug: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.docs.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Fetch all active categories
  const categories = await payload.find({
    collection: "categories",
    where: { status: { equals: "active" } },
    limit: 100,
    select: { slug: true, updatedAt: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.docs.map((category) => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Fetch all active subcategories
  const subcategories = await payload.find({
    collection: "subcategories",
    where: { status: { equals: "active" } },
    limit: 500,
    select: { slug: true, updatedAt: true },
  });

  const subcategoryPages: MetadataRoute.Sitemap = subcategories.docs.map((subcategory) => ({
    url: `${SITE_URL}/subcategories/${subcategory.slug}`,
    lastModified: new Date(subcategory.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Fetch all active bundles
  const bundles = await payload.find({
    collection: "bundles",
    where: { status: { equals: "active" } },
    limit: 100,
    select: { slug: true, updatedAt: true },
  });

  const bundlePages: MetadataRoute.Sitemap = bundles.docs.map((bundle) => ({
    url: `${SITE_URL}/bundles/${bundle.slug}`,
    lastModified: new Date(bundle.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Fetch all published blog posts
  const posts = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit: 500,
    select: { slug: true, updatedAt: true },
  });

  const postPages: MetadataRoute.Sitemap = posts.docs.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...subcategoryPages,
    ...bundlePages,
    ...postPages,
  ];
}
