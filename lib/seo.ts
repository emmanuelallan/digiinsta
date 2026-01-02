import type { Metadata } from "next";

export interface SEOData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "category";
  publishedTime?: string;
  modifiedTime?: string;
  price?: {
    amount: string;
    currency: string;
  };
  category?: string;
}

/**
 * Generate metadata for pages
 */
export function generateMetadata(data: SEOData, defaults?: Partial<SEOData>): Metadata {
  const title = data.title || defaults?.title || "Digital Products";
  const description = data.description || defaults?.description || "";
  const image = data.image || defaults?.image || "";
  const url = data.url || defaults?.url || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Digital Products",
      images: image ? [{ url: image }] : [],
      type: (data.type === "product" || data.type === "category" ? "website" : data.type) || "website",
      ...(data.publishedTime && { publishedTime: data.publishedTime }),
      ...(data.modifiedTime && { modifiedTime: data.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate JSON-LD structured data
 */
interface ProductData {
  name: string;
  description: string;
  image: string;
  price?: {
    amount: string;
    currency: string;
  };
  category?: string;
}

interface CategoryData {
  name: string;
  description: string;
}

interface BreadcrumbData {
  items: Array<{ name: string; url: string }>;
}

export function generateJsonLd(data: {
  type: "Product";
  data: ProductData;
} | {
  type: "Category";
  data: CategoryData;
} | {
  type: "BreadcrumbList";
  data: BreadcrumbData;
}): object {
  switch (data.type) {
    case "Product": {
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: data.data.name,
        description: data.data.description,
        image: data.data.image,
        ...(data.data.price && {
          offers: {
            "@type": "Offer",
            price: data.data.price.amount,
            priceCurrency: data.data.price.currency,
            availability: "https://schema.org/InStock",
          },
        }),
        ...(data.data.category && {
          category: data.data.category,
        }),
      };
    }
    case "Category": {
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: data.data.name,
        description: data.data.description,
      };
    }
    case "BreadcrumbList": {
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: data.data.items.map((item: { name: string; url: string }, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
    }
    default:
      return {};
  }
}

