/**
 * JSON-LD Structured Data Generators
 *
 * Generates schema.org compliant JSON-LD for products, articles, and organization.
 * Follows schema.org specifications for rich search results.
 *
 * Validates: Requirements 9.3
 */

import type { SanityImage } from "@/lib/sanity/queries/categories";

/**
 * Site-wide SEO constants (duplicated to avoid circular dependency with meta.ts)
 */
export const SITE_NAME = "DigiInsta";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.digiinsta.store";
export const DEFAULT_OG_IMAGE_PATH = "/images/og-default.png";

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

  const imageSource = image || defaultImage;

  if (typeof imageSource === "string") {
    // If it's already a URL, return it
    if (imageSource.startsWith("http")) {
      return imageSource;
    }
    // If it's a path, prepend SITE_URL
    return `${SITE_URL}${imageSource.startsWith("/") ? "" : "/"}${imageSource}`;
  }

  // For Sanity images, we need to use the urlFor helper
  // But since we can't import it here without circular deps, return default
  // The actual URL generation happens in meta.ts
  return `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
}

/**
 * Input for Product JSON-LD
 */
export interface ProductJsonLdInput {
  title: string;
  slug: string;
  shortDescription?: string | null;
  images?: SanityImage[] | null;
  price?: number;
  compareAtPrice?: number | null;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  category?: string | null;
  brand?: string | null;
  sku?: string | null;
  gtin?: string | null;
  reviews?: Array<{
    author: string;
    rating: number;
    reviewBody?: string;
    datePublished?: string;
  }> | null;
}

/**
 * Generates Product JSON-LD schema
 *
 * Validates: Requirements 9.3
 */
export function generateProductJsonLd(product: ProductJsonLdInput): Record<string, unknown> {
  const imageUrl = product.images?.[0]
    ? getImageUrl(product.images[0])
    : `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
  const price = product.price ? (product.price / 100).toFixed(2) : "0.00";
  const productUrl = `${SITE_URL}/products/${product.slug}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.shortDescription ?? `${product.title} - Premium digital product from ${SITE_NAME}`,
    image: imageUrl,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: product.brand ?? SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: product.currency ?? "USD",
      availability: `https://schema.org/${product.availability ?? "InStock"}`,
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };

  // Add category if provided
  if (product.category) {
    jsonLd.category = product.category;
  }

  // Add SKU if provided
  if (product.sku) {
    jsonLd.sku = product.sku;
  }

  // Add GTIN if provided
  if (product.gtin) {
    jsonLd.gtin = product.gtin;
  }

  // Add reviews and aggregate rating if provided
  if (product.reviews && product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / product.reviews.length;

    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(avgRating.toFixed(1)),
      reviewCount: product.reviews.length,
      bestRating: 5,
      worstRating: 1,
    };

    jsonLd.review = product.reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      ...(review.reviewBody && { reviewBody: review.reviewBody }),
      ...(review.datePublished && { datePublished: review.datePublished }),
    }));
  }

  return jsonLd;
}

/**
 * Input for Article JSON-LD
 */
export interface ArticleJsonLdInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: SanityImage | null;
  author?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  category?: string | null;
  tags?: string[] | null;
  wordCount?: number;
}

/**
 * Calculates word count from text content
 */
function countWords(text: string | null | undefined): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculates reading time in minutes (200 words per minute)
 */
function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Formats duration in ISO 8601 format
 */
function formatDurationISO8601(minutes: number): string {
  return `PT${minutes}M`;
}

/**
 * Generates Article/BlogPosting JSON-LD schema
 *
 * Validates: Requirements 9.3
 */
export function generateArticleJsonLd(article: ArticleJsonLdInput): Record<string, unknown> {
  const imageUrl = article.coverImage
    ? getImageUrl(article.coverImage)
    : `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
  const articleUrl = `${SITE_URL}/blog/${article.slug}`;
  const authorName = article.author ?? SITE_NAME;
  const wordCount = article.wordCount ?? countWords(article.content);
  const readingTime = calculateReadingTime(wordCount);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? `${article.title} - Blog post from ${SITE_NAME}`,
    image: imageUrl,
    url: articleUrl,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    wordCount,
    timeRequired: formatDurationISO8601(readingTime),
  };

  // Add dates if provided
  if (article.publishedAt) {
    jsonLd.datePublished = article.publishedAt;
  }
  if (article.updatedAt) {
    jsonLd.dateModified = article.updatedAt;
  }

  // Add category if provided
  if (article.category) {
    jsonLd.articleSection = article.category;
  }

  // Add tags if provided
  if (article.tags && article.tags.length > 0) {
    jsonLd.keywords = article.tags.join(", ");
  }

  return jsonLd;
}

/**
 * Generates Organization JSON-LD schema
 *
 * Validates: Requirements 9.3
 */
export function generateOrganizationJsonLd(options?: {
  socialLinks?: string[];
  contactEmail?: string;
}): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      "Elevate your life with DigiInsta. Shop expert-led digital planners, finance trackers, and SME tools.",
  };

  // Add social links if provided
  if (options?.socialLinks && options.socialLinks.length > 0) {
    jsonLd.sameAs = options.socialLinks;
  }

  // Add contact point if email provided
  if (options?.contactEmail) {
    jsonLd.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: options.contactEmail,
    };
  }

  return jsonLd;
}

/**
 * Generates WebSite JSON-LD schema with SearchAction
 *
 * Validates: Requirements 9.3
 */
export function generateWebsiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Elevate your life with DigiInsta. Shop expert-led digital planners, finance trackers, and SME tools.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Breadcrumb item type
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generates BreadcrumbList JSON-LD schema
 *
 * Validates: Requirements 9.3
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Input for Bundle JSON-LD
 */
export interface BundleJsonLdInput {
  title: string;
  slug: string;
  shortDescription?: string | null;
  heroImage?: SanityImage | null;
  price?: number;
  compareAtPrice?: number | null;
  currency?: string;
  products?: Array<{
    title: string;
    slug: string;
    price?: number;
  }> | null;
}

/**
 * Generates Bundle/ProductGroup JSON-LD schema
 *
 * Validates: Requirements 9.3
 */
export function generateBundleJsonLd(bundle: BundleJsonLdInput): Record<string, unknown> {
  const imageUrl = bundle.heroImage
    ? getImageUrl(bundle.heroImage)
    : `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
  const price = bundle.price ? (bundle.price / 100).toFixed(2) : "0.00";
  const bundleUrl = `${SITE_URL}/bundles/${bundle.slug}`;
  const productCount = bundle.products?.length ?? 0;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bundle.title,
    description: bundle.shortDescription ?? `${bundle.title} - Premium bundle from ${SITE_NAME}`,
    image: imageUrl,
    url: bundleUrl,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    category: "Digital Product Bundle",
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: bundle.currency ?? "USD",
      availability: "https://schema.org/InStock",
      url: bundleUrl,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };

  // Add related products if provided
  if (bundle.products && productCount > 0) {
    jsonLd.isRelatedTo = bundle.products.map((product) => ({
      "@type": "Product",
      name: product.title,
      url: `${SITE_URL}/products/${product.slug}`,
      ...(product.price && {
        offers: {
          "@type": "Offer",
          price: (product.price / 100).toFixed(2),
          priceCurrency: bundle.currency ?? "USD",
        },
      }),
    }));
  }

  return jsonLd;
}

/**
 * Input for Category JSON-LD
 */
export interface CategoryJsonLdInput {
  title: string;
  slug: string;
  description?: string | null;
  image?: SanityImage | null;
  productCount?: number;
}

/**
 * Generates Category/CollectionPage JSON-LD schema
 *
 * Validates: Requirements 9.3
 */
export function generateCategoryJsonLd(category: CategoryJsonLdInput): Record<string, unknown> {
  const imageUrl = category.image
    ? getImageUrl(category.image)
    : `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
  const categoryUrl = `${SITE_URL}/categories/${category.slug}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description ?? `Browse ${category.title} products at ${SITE_NAME}`,
    url: categoryUrl,
    image: imageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  // Add product count if provided
  if (category.productCount !== undefined) {
    jsonLd.numberOfItems = category.productCount;
  }

  return jsonLd;
}

/**
 * FAQ item type
 */
export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generates FAQPage JSON-LD schema
 *
 * Validates: Requirements 9.3
 */
export function generateFAQJsonLd(faqs: FAQItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
