/**
 * Type definitions for SEO generation functions
 * (Previously imported from @payloadcms/plugin-seo/types)
 */
interface DocWithFields {
  title?: string;
  shortDescription?: string;
  excerpt?: string;
  featuredImage?: string | { id: string };
  heroImage?: string | { id: string };
  images?: Array<{ image?: string | { id: string } }>;
  slug?: string;
}

type GenerateTitle = (args: { doc: DocWithFields }) => string;
type GenerateDescription = (args: { doc: DocWithFields }) => string;
type GenerateImage = (args: { doc: DocWithFields }) => string;
type GenerateURL = (args: { doc: DocWithFields; collectionSlug?: string }) => string;

import type { Metadata } from "next";

/**
 * Site-wide SEO constants
 */
export const SITE_NAME = "DigiInsta";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.digiinsta.store";
export const SITE_DESCRIPTION =
  "Elevate your life with DigiInsta. Shop expert-led digital planners, finance trackers, and SME tools engineered for students, couples, and professionals.";

/**
 * Default Open Graph image
 */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.png`;

/**
 * Generates a canonical URL for a given path
 * Validates: Requirements 9.4
 *
 * @param path - The path to generate a canonical URL for (e.g., "/products/my-product")
 * @returns The full canonical URL without query parameters or fragments
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
 * Generates SEO title in format "DigiInsta — {document title}"
 */
export const generateTitle: GenerateTitle = ({ doc }) => {
  const title = (doc as { title?: string })?.title;
  return `${title || "Untitled"} | ${SITE_NAME}`;
};

/**
 * Generates SEO description from shortDescription (products/bundles) or excerpt (posts)
 */
export const generateDescription: GenerateDescription = ({ doc }) => {
  const document = doc as {
    shortDescription?: string;
    excerpt?: string;
  };
  return document?.shortDescription || document?.excerpt || SITE_DESCRIPTION;
};

/**
 * Generates SEO image from featuredImage, heroImage, or first product image
 * Returns the image ID or relationship object for the plugin
 */
export const generateImage: GenerateImage = ({ doc }) => {
  const document = doc as {
    featuredImage?: string | { id: string };
    heroImage?: string | { id: string };
    images?: Array<{ image?: string | { id: string } }>;
  };

  if (document?.featuredImage) {
    return typeof document.featuredImage === "string"
      ? document.featuredImage
      : document.featuredImage.id;
  }
  if (document?.heroImage) {
    return typeof document.heroImage === "string" ? document.heroImage : document.heroImage.id;
  }
  if (document?.images?.[0]?.image) {
    const firstImage = document.images[0].image;
    return typeof firstImage === "string" ? firstImage : firstImage.id;
  }
  return "";
};

/**
 * Generates preview URL based on collection type
 */
export const generateURL: GenerateURL = ({ doc, collectionSlug }) => {
  const slug = (doc as { slug?: string })?.slug || "";

  const pathMap: Record<string, string> = {
    products: "products",
    posts: "blog",
    bundles: "bundles",
    categories: "categories",
    subcategories: "subcategories",
  };

  const path = pathMap[collectionSlug ?? ""] || collectionSlug;
  return `${SITE_URL}/${path}/${slug}`;
};

/**
 * Base metadata for the site
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Professional Digital Planners & Finance Tools`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "digital planners",
    "notion templates",
    "finance trackers",
    "student planners",
    "couple finance tools",
    "SME tools",
    "productivity templates",
    "digital downloads",
    "budget templates",
    "goal planners",
    "academic planners",
    "wedding planners",
    "business templates",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Professional Digital Planners & Finance Tools`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Premium Digital Products`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Professional Digital Planners & Finance Tools`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    creator: "@digiinsta",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

/**
 * JSON-LD Organization Schema
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description: SITE_DESCRIPTION,
    sameAs: [
      // Add your social media URLs
      // "https://twitter.com/digiinsta",
      // "https://instagram.com/digiinsta",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@digiinsta.store",
    },
  };
}

/**
 * JSON-LD WebSite Schema with SearchAction
 */
export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
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
 * JSON-LD Product Schema
 */
export function getProductSchema(product: {
  title: string;
  slug: string;
  shortDescription?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  images?: Array<{ image?: { url?: string | null } }> | null;
  subcategory?: { title: string; category?: { title: string } };
}) {
  const imageUrl = product.images?.[0]?.image?.url ?? DEFAULT_OG_IMAGE;
  const price = product.price ? (product.price / 100).toFixed(2) : "0.00";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.shortDescription ?? `${product.title} - Premium digital product from ${SITE_NAME}`,
    image: imageUrl,
    url: `${SITE_URL}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    category: product.subcategory?.category?.title ?? "Digital Products",
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

/**
 * JSON-LD BreadcrumbList Schema
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * JSON-LD ItemList Schema for product collections
 */
export function getProductListSchema(
  products: Array<{
    title: string;
    slug: string;
    price?: number;
    images?: Array<{ url?: string | null }> | null;
  }>,
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.title,
        url: `${SITE_URL}/products/${product.slug}`,
        image: product.images?.[0]?.url ?? DEFAULT_OG_IMAGE,
        offers: {
          "@type": "Offer",
          price: product.price ? (product.price / 100).toFixed(2) : "0.00",
          priceCurrency: "USD",
        },
      },
    })),
  };
}

/**
 * JSON-LD FAQPage Schema
 */
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
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

/**
 * JSON-LD Category/CollectionPage Schema
 */
export function getCategorySchema(category: {
  title: string;
  slug: string;
  description?: string | null;
  image?: { url?: string | null } | null;
  productCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description ?? `Browse ${category.title} products at ${SITE_NAME}`,
    url: `${SITE_URL}/categories/${category.slug}`,
    image: category.image?.url ?? DEFAULT_OG_IMAGE,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(category.productCount && {
      numberOfItems: category.productCount,
    }),
  };
}

/**
 * JSON-LD Bundle/ProductGroup Schema
 */
export function getBundleSchema(bundle: {
  title: string;
  slug: string;
  shortDescription?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  heroImage?: { url?: string | null } | null;
  products?: Array<{ title: string; slug: string; price?: number }>;
}) {
  const price = bundle.price ? (bundle.price / 100).toFixed(2) : "0.00";
  const productCount = bundle.products?.length ?? 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bundle.title,
    description: bundle.shortDescription ?? `${bundle.title} - Premium bundle from ${SITE_NAME}`,
    image: bundle.heroImage?.url ?? DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/bundles/${bundle.slug}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    category: "Digital Product Bundle",
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    ...(productCount > 0 && {
      isRelatedTo: bundle.products?.map((product) => ({
        "@type": "Product",
        name: product.title,
        url: `${SITE_URL}/products/${product.slug}`,
      })),
    }),
  };
}

/**
 * JSON-LD Offer Catalog Schema for sale/collection pages
 */
export function getOfferCatalogSchema(
  name: string,
  description: string,
  products: Array<{
    title: string;
    slug: string;
    price?: number;
    images?: Array<{ url?: string | null }> | null;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name,
    description,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "Offer",
      position: index + 1,
      itemOffered: {
        "@type": "Product",
        name: product.title,
        url: `${SITE_URL}/products/${product.slug}`,
        image: product.images?.[0]?.url ?? DEFAULT_OG_IMAGE,
        offers: {
          "@type": "Offer",
          price: product.price ? (product.price / 100).toFixed(2) : "0.00",
          priceCurrency: "USD",
        },
      },
    })),
  };
}

/**
 * Review interface for product reviews
 */
export interface ProductReview {
  author: string;
  reviewBody: string;
  reviewRating: number; // 1-5
  datePublished?: string;
}

/**
 * Enhanced product input interface with optional reviews and sale end date
 */
export interface EnhancedProductInput {
  title: string;
  slug: string;
  shortDescription?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  saleEndDate?: string | null;
  images?: Array<{ image?: { url?: string | null } }> | null;
  subcategory?: { title: string; category?: { title: string } };
  reviews?: ProductReview[] | null;
}

/**
 * JSON-LD Enhanced Product Schema with AggregateRating and Review support
 * Validates: Requirements 6.1, 6.2, 6.3
 */
export function getEnhancedProductSchema(product: EnhancedProductInput) {
  const imageUrl = product.images?.[0]?.image?.url ?? DEFAULT_OG_IMAGE;
  const price = product.price ? (product.price / 100).toFixed(2) : "0.00";
  const hasReviews = product.reviews && product.reviews.length > 0;
  const isOnSale =
    product.compareAtPrice && product.price && product.compareAtPrice > product.price;

  // Calculate aggregate rating if reviews exist
  let aggregateRating = undefined;
  let reviewSchemas = undefined;

  if (hasReviews && product.reviews) {
    const totalRating = product.reviews.reduce((sum, r) => sum + r.reviewRating, 0);
    const avgRating = totalRating / product.reviews.length;

    aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(avgRating.toFixed(1)),
      reviewCount: product.reviews.length,
      bestRating: 5,
      worstRating: 1,
    };

    reviewSchemas = product.reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewBody: review.reviewBody,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.reviewRating,
        bestRating: 5,
        worstRating: 1,
      },
      ...(review.datePublished && { datePublished: review.datePublished }),
    }));
  }

  // Build offer schema with optional priceValidUntil for sale items
  const offerSchema: Record<string, unknown> = {
    "@type": "Offer",
    price: price,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };

  // Add priceValidUntil for sale items with end date (Requirement 6.3)
  if (isOnSale && product.saleEndDate) {
    offerSchema.priceValidUntil = product.saleEndDate;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.shortDescription ?? `${product.title} - Premium digital product from ${SITE_NAME}`,
    image: imageUrl,
    url: `${SITE_URL}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    category: product.subcategory?.category?.title ?? "Digital Products",
    offers: offerSchema,
    ...(aggregateRating && { aggregateRating }),
    ...(reviewSchemas && { review: reviewSchemas }),
  };
}

/**
 * Blog post input interface for article schema
 */
export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null; // Plain text content for word count
  featuredImage?: { url?: string | null } | null;
  category?: { title: string } | null;
  createdBy?: { name?: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Calculate reading time based on word count (200 words per minute)
 */
export function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}

/**
 * Convert minutes to ISO 8601 duration format
 */
export function formatDurationISO8601(minutes: number): string {
  return `PT${minutes}M`;
}

/**
 * Count words in text content
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * JSON-LD Article/BlogPosting Schema
 * Validates: Requirements 8.1, 8.2
 */
export function getArticleSchema(post: BlogPostInput) {
  const imageUrl = post.featuredImage?.url ?? DEFAULT_OG_IMAGE;
  const authorName = post.createdBy?.name ?? SITE_NAME;
  const wordCount = post.content ? countWords(post.content) : 0;
  const readingTimeMinutes = calculateReadingTime(wordCount);
  const timeRequired = formatDurationISO8601(readingTimeMinutes);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? `${post.title} - Blog post from ${SITE_NAME}`,
    image: imageUrl,
    url: `${SITE_URL}/blog/${post.slug}`,
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
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    wordCount: wordCount,
    timeRequired: timeRequired,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    ...(post.category && {
      articleSection: post.category.title,
    }),
  };
}

/**
 * JSON-LD BlogPosting Schema (more specific than Article)
 * Validates: Requirements 8.1, 8.2
 */
export function getBlogPostingSchema(post: BlogPostInput) {
  const articleSchema = getArticleSchema(post);
  return {
    ...articleSchema,
    "@type": "BlogPosting",
  };
}

/**
 * Enhanced Bundle input interface for ProductGroup schema
 */
export interface EnhancedBundleInput {
  title: string;
  slug: string;
  shortDescription?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  heroImage?: { url?: string | null } | null;
  products?: Array<{ title: string; slug: string; price?: number }>;
}

/**
 * JSON-LD ProductGroup Schema for bundles
 * Validates: Requirements 6.4
 */
export function getProductGroupSchema(bundle: EnhancedBundleInput) {
  const price = bundle.price ? (bundle.price / 100).toFixed(2) : "0.00";
  const productCount = bundle.products?.length ?? 0;

  // Build isRelatedTo array with full product URLs
  const relatedProducts = bundle.products?.map((product) => ({
    "@type": "Product",
    name: product.title,
    url: `${SITE_URL}/products/${product.slug}`,
    ...(product.price && {
      offers: {
        "@type": "Offer",
        price: (product.price / 100).toFixed(2),
        priceCurrency: "USD",
      },
    }),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: bundle.title,
    description: bundle.shortDescription ?? `${bundle.title} - Premium bundle from ${SITE_NAME}`,
    image: bundle.heroImage?.url ?? DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/bundles/${bundle.slug}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    productGroupID: bundle.slug,
    hasVariant: relatedProducts,
    variesBy: "https://schema.org/Product",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: price,
      highPrice: price,
      priceCurrency: "USD",
      offerCount: productCount,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    ...(productCount > 0 && {
      isRelatedTo: relatedProducts,
    }),
  };
}
