import type { Metadata } from "next";

const SITE_NAME = "DigiInsta Store";
const SITE_DESCRIPTION =
  "Premium digital products including planners, templates, and resources for faith, family, business, and personal growth.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store";
const TWITTER_HANDLE = "@digiinsta"; // Update if you have a Twitter handle

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noindex?: boolean;
  keywords?: string[];
}

/**
 * Generate comprehensive metadata for Next.js 16
 * Uses the Metadata API for optimal SEO
 */
export function generateMetadata(options: SEOOptions = {}): Metadata {
  const {
    title,
    description,
    image = "/og-image.png",
    url,
    type = "website",
    noindex = false,
    keywords = [],
  } = options;

  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Premium Digital Products`;

  const fullDescription = description || SITE_DESCRIPTION;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      type,
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: TWITTER_HANDLE,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    verification: {
      // Add verification codes when available
      // google: "your-google-verification-code",
      // yandex: "your-yandex-verification-code",
      // bing: "your-bing-verification-code",
    },
  };
}

/**
 * Generate product-specific metadata
 */
export function generateProductMetadata(product: {
  name: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  shortDescription?: string | null;
  slug: string;
  imageUrl?: string | null;
  price: string;
}): Metadata {
  const title = product.seoTitle || product.name;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `Purchase ${product.name} - Premium digital product from ${SITE_NAME}`;

  const image = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${SITE_URL}${product.imageUrl}`
    : `${SITE_URL}/og-image.png`;

  return generateMetadata({
    title,
    description,
    image,
    url: `/products/${product.slug}`,
    type: "website",
    keywords: [
      product.name,
      "digital product",
      "digital download",
      "planner",
      "template",
    ],
  });
}

/**
 * Generate category-specific metadata
 */
export function generateCategoryMetadata(category: {
  name: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  description?: string | null;
  slug: string;
  imageUrl?: string | null;
}): Metadata {
  const title = category.seoTitle || `${category.name} | ${SITE_NAME}`;
  const description =
    category.seoDescription ||
    category.description ||
    `Browse ${category.name} digital products and resources`;

  const image = category.imageUrl
    ? category.imageUrl.startsWith("http")
      ? category.imageUrl
      : `${SITE_URL}${category.imageUrl}`
    : `${SITE_URL}/og-image.png`;

  return generateMetadata({
    title,
    description,
    image,
    url: `/categories/${category.slug}`,
    type: "website",
    keywords: [category.name, "digital products", "downloads"],
  });
}

/**
 * Generate bundle-specific metadata
 */
export function generateBundleMetadata(bundle: {
  name: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  shortDescription?: string | null;
  slug: string;
  imageUrl?: string | null;
}): Metadata {
  const title = bundle.seoTitle || bundle.name;
  const description =
    bundle.seoDescription ||
    bundle.shortDescription ||
    `Purchase ${bundle.name} bundle - Premium digital products from ${SITE_NAME}`;

  const image = bundle.imageUrl
    ? bundle.imageUrl.startsWith("http")
      ? bundle.imageUrl
      : `${SITE_URL}${bundle.imageUrl}`
    : `${SITE_URL}/og-image.png`;

  return generateMetadata({
    title,
    description,
    image,
    url: `/bundles/${bundle.slug}`,
    type: "website",
    keywords: [bundle.name, "bundle", "digital products", "downloads"],
  });
}

/**
 * Generate structured data (JSON-LD) for products
 */
export function generateProductStructuredData(product: {
  name: string;
  description: string;
  price: string;
  imageUrl?: string | null;
  slug: string;
  category?: string;
}) {
  const image = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${SITE_URL}${product.imageUrl}`
    : `${SITE_URL}/og-image.png`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: image,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    category: product.category,
  };
}

/**
 * Generate structured data for organization
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    sameAs: [
      // Add social media links when available
      // "https://twitter.com/digiinsta",
      // "https://facebook.com/digiinsta",
    ],
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
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
