import type {
  GenerateTitle,
  GenerateDescription,
  GenerateImage,
  GenerateURL,
} from "@payloadcms/plugin-seo/types";

/**
 * Generates SEO title in format "DigiInsta — {document title}"
 */
export const generateTitle: GenerateTitle = ({ doc }) => {
  const title = (doc as { title?: string })?.title;
  return `DigiInsta — ${title || "Untitled"}`;
};

/**
 * Generates SEO description from shortDescription (products/bundles) or excerpt (posts)
 */
export const generateDescription: GenerateDescription = ({ doc }) => {
  const document = doc as {
    shortDescription?: string;
    excerpt?: string;
  };
  return document?.shortDescription || document?.excerpt || "";
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
    return typeof document.heroImage === "string"
      ? document.heroImage
      : document.heroImage.id;
  }
  if (document?.images?.[0]?.image) {
    const firstImage = document.images[0].image;
    return typeof firstImage === "string" ? firstImage : firstImage.id;
  }
  // Return empty string when no image found (plugin expects non-undefined)
  return "";
};

/**
 * Generates preview URL based on collection type
 * - products: /products/{slug}
 * - posts: /blog/{slug}
 * - bundles: /bundles/{slug}
 */
export const generateURL: GenerateURL = ({ doc, collectionSlug }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.com";
  const slug = (doc as { slug?: string })?.slug || "";

  const pathMap: Record<string, string> = {
    products: "products",
    posts: "blog",
    bundles: "bundles",
  };

  const path = pathMap[collectionSlug ?? ""] || collectionSlug;
  return `${baseUrl}/${path}/${slug}`;
};
