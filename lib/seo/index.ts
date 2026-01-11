/**
 * SEO Module
 *
 * Exports SEO utilities for meta generation and JSON-LD structured data.
 */

// JSON-LD generators and constants
export {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE_PATH,
  getImageUrl,
  generateProductJsonLd,
  generateArticleJsonLd,
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
  generateBreadcrumbJsonLd,
  generateBundleJsonLd,
  generateCategoryJsonLd,
  generateFAQJsonLd,
  type ProductJsonLdInput,
  type ArticleJsonLdInput,
  type BreadcrumbItem,
  type BundleJsonLdInput,
  type CategoryJsonLdInput,
  type FAQItem,
} from "./jsonld";

// Meta generation utilities
export {
  DEFAULT_DESCRIPTION,
  getSiteSettings,
  getCanonicalUrl,
  generateMeta,
  generateProductMeta,
  generateCategoryMeta,
  generateBundleMeta,
  generatePostMeta,
  generateSubcategoryMeta,
  clearSiteSettingsCache,
  type SiteSettings,
  type MetaInput,
} from "./meta";
