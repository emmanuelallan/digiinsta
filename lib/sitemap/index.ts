/**
 * Sitemap Module
 *
 * Exports sitemap utility functions and types.
 */

export {
  MAX_URLS_PER_SITEMAP,
  validateSitemapEntry,
  generateCanonicalUrl,
  getChangeFrequency,
  getPriority,
  createSitemapEntry,
  type SitemapEntry,
  type ChangeFrequency,
} from "./utils";
