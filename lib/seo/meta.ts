/**
 * SEO Meta Generation Utilities
 *
 * Generates meta tags, Open Graph tags, and Twitter cards for all content types.
 * Handles fallbacks to SiteSettings when page-specific values are not set.
 *
 * Validates: Requirements 9.2, 9.5, 15.2
 */

import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { groq } from "next-sanity";
import type { SanityImage } from "@/lib/sanity/queries/categories";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE_PATH } from "./jsonld";

/**
 * Default description for the site
 */
export const DEFAULT_DESCRIPTION =
  "Elevate your life with DigiInsta. Shop expert-led digital planners, finance trackers, and SME tools engineered for students, couples, and professionals.";

/**
 * SiteSettings type from Sanity
 */
export interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  defaultMetaImage?: SanityImage;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  contactEmail?: string;
  footerText?: string;
}

/**
 * Cached site settings to avoid repeated queries
 */
let cachedSiteSettings: SiteSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

/**
 * Fetches site settings from Sanity with caching
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now();

  // Return cached settings if still valid
  if (cachedSiteSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSiteSettings;
  }

  const query = groq`*[_type == "siteSettings"][0] {
    siteName,
    siteDescription,
    defaultMetaImage,
    socialLinks,
    contactEmail,
    footerText
  }`;

  try {
    const settings = await sanityClient.fetch<SiteSettings | null>(query);
    cachedSiteSettings = settings ?? {};
    cacheTimestamp = now;
    return cachedSiteSettings;
  } catch {
    // Return empty settings on error
    return {};
  }
}

/**
 * Input for generating meta tags
 */
export interface MetaInput {
  title?: string;
  description?: string;
  image?: SanityImage | string | null;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  availability?: "in stock" | "out of stock";
  noIndex?: boolean;
}

/**
 * Gets the image URL from various input types
 */
export function getImageUrl(
  image: SanityImage | string | null | undefined,
  defaultImage?: SanityImage | null
): string {
  if (!image && !defaultImage) {
    return `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
  }

  const imageSource = image ?? defaultImage;

  if (typeof imageSource === "string") {
    // If it's already a URL, return it
    if (imageSource.startsWith("http")) {
      return imageSource;
    }
    // If it's a path, prepend SITE_URL
    return `${SITE_URL}${imageSource.startsWith("/") ? "" : "/"}${imageSource}`;
  }

  // It's a Sanity image, generate URL
  if (imageSource && "asset" in imageSource) {
    return urlFor(imageSource).width(1200).height(630).fit("crop").url();
  }

  return `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
}

/**
 * Generates canonical URL for a given path
 */
export function getCanonicalUrl(path: string): string {
  // Remove any query parameters or fragments
  const pathWithoutQuery = path.split("?")[0] ?? "";
  const cleanPath = pathWithoutQuery.split("#")[0] ?? "";

  // Ensure path starts with /
  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  // Remove trailing slash except for root
  const finalPath =
    normalizedPath.length > 1 && normalizedPath.endsWith("/")
      ? normalizedPath.slice(0, -1)
      : normalizedPath;

  return `${SITE_URL}${finalPath === "/" ? "" : finalPath}`;
}

/**
 * Generates complete metadata for a page with fallbacks to SiteSettings
 *
 * Validates: Requirements 9.2, 9.5, 15.2
 */
export async function generateMeta(input: MetaInput): Promise<Metadata> {
  const siteSettings = await getSiteSettings();

  // Resolve values with fallbacks
  const siteName = siteSettings.siteName ?? SITE_NAME;
  const title = input.title ?? siteName;
  const description = input.description ?? siteSettings.siteDescription ?? DEFAULT_DESCRIPTION;
  const imageUrl = getImageUrl(input.image, siteSettings.defaultMetaImage);
  const canonicalUrl = getCanonicalUrl(input.path);

  // Build base metadata
  const metadata: Metadata = {
    title: input.title ? `${input.title} | ${siteName}` : siteName,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: input.type ?? "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };

  // Add robots directive if noIndex is set
  if (input.noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  // Add article-specific metadata
  if (input.type === "article" && metadata.openGraph) {
    const ogArticle = metadata.openGraph as Record<string, unknown>;
    if (input.publishedTime) {
      ogArticle.publishedTime = input.publishedTime;
    }
    if (input.modifiedTime) {
      ogArticle.modifiedTime = input.modifiedTime;
    }
    if (input.author) {
      ogArticle.authors = [input.author];
    }
    if (input.section) {
      ogArticle.section = input.section;
    }
    if (input.tags && input.tags.length > 0) {
      ogArticle.tags = input.tags;
    }
  }

  return metadata;
}

/**
 * Generates metadata for a product page
 *
 * Validates: Requirements 9.2, 9.5
 */
export async function generateProductMeta(product: {
  title: string;
  slug: string;
  shortDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  images?: SanityImage[] | null;
  price?: number;
  compareAtPrice?: number | null;
}): Promise<Metadata> {
  const title = product.metaTitle ?? product.title;
  const description =
    product.metaDescription ??
    product.shortDescription ??
    `${product.title} - Premium digital product from DigiInsta`;
  const image = product.images?.[0] ?? null;

  return generateMeta({
    title,
    description,
    image,
    path: `/products/${product.slug}`,
    type: "website",
    price: product.price,
    currency: "USD",
    availability: "in stock",
  });
}

/**
 * Generates metadata for a category page
 *
 * Validates: Requirements 9.2, 9.5
 */
export async function generateCategoryMeta(category: {
  title: string;
  slug: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  image?: SanityImage | null;
}): Promise<Metadata> {
  const title = category.metaTitle ?? category.title;
  const description =
    category.metaDescription ??
    category.description ??
    `Browse ${category.title} products at DigiInsta`;

  return generateMeta({
    title,
    description,
    image: category.image,
    path: `/categories/${category.slug}`,
  });
}

/**
 * Generates metadata for a bundle page
 *
 * Validates: Requirements 9.2, 9.5
 */
export async function generateBundleMeta(bundle: {
  title: string;
  slug: string;
  shortDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroImage?: SanityImage | null;
  price?: number;
  compareAtPrice?: number | null;
}): Promise<Metadata> {
  const title = bundle.metaTitle ?? bundle.title;
  const description =
    bundle.metaDescription ??
    bundle.shortDescription ??
    `${bundle.title} - Premium bundle from DigiInsta`;

  return generateMeta({
    title,
    description,
    image: bundle.heroImage,
    path: `/bundles/${bundle.slug}`,
    type: "website",
    price: bundle.price,
    currency: "USD",
    availability: "in stock",
  });
}

/**
 * Generates metadata for a blog post
 *
 * Validates: Requirements 7.5, 9.2, 9.5
 */
export async function generatePostMeta(post: {
  title: string;
  slug: string;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  coverImage?: SanityImage | null;
  author?: string | null;
  publishedAt?: string | null;
  _updatedAt?: string;
  category?: { title: string } | null;
  tags?: string[];
}): Promise<Metadata> {
  const title = post.metaTitle ?? post.title;
  const description =
    post.metaDescription ?? post.excerpt ?? `${post.title} - Blog post from DigiInsta`;

  return generateMeta({
    title,
    description,
    image: post.coverImage,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt ?? undefined,
    modifiedTime: post._updatedAt,
    author: post.author ?? undefined,
    section: post.category?.title,
    tags: post.tags,
  });
}

/**
 * Generates metadata for a subcategory page
 *
 * Validates: Requirements 9.2, 9.5
 */
export async function generateSubcategoryMeta(subcategory: {
  title: string;
  slug: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  category?: { title: string; slug: string } | null;
}): Promise<Metadata> {
  const title = subcategory.metaTitle ?? subcategory.title;
  const description =
    subcategory.metaDescription ??
    subcategory.description ??
    `Browse ${subcategory.title} products at DigiInsta`;

  return generateMeta({
    title,
    description,
    image: null,
    path: `/subcategories/${subcategory.slug}`,
  });
}

/**
 * Clears the site settings cache (useful for testing or after updates)
 */
export function clearSiteSettingsCache(): void {
  cachedSiteSettings = null;
  cacheTimestamp = 0;
}
