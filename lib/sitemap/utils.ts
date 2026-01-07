/**
 * Sitemap Utility Functions
 *
 * Provides helper functions for sitemap generation and validation.
 * Validates: Requirements 9.1, 9.4
 */

import { SITE_URL } from "@/lib/seo";

/**
 * Maximum URLs per sitemap (Google's limit is 50,000)
 * We use a lower limit to ensure fast generation and avoid memory issues
 */
export const MAX_URLS_PER_SITEMAP = 50000;

/**
 * Valid change frequency values for sitemap entries
 */
export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/**
 * Sitemap entry interface with all required attributes
 * Validates: Requirements 9.1
 */
export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
}

/**
 * Validates a sitemap entry has all required attributes
 * Used for property testing
 */
export function validateSitemapEntry(entry: SitemapEntry): boolean {
  // URL must be a valid absolute URL
  if (!entry.url || !entry.url.startsWith("http")) return false;

  // lastModified must be a valid Date
  if (!(entry.lastModified instanceof Date) || isNaN(entry.lastModified.getTime())) return false;

  // changeFrequency must be a valid value
  const validFrequencies: ChangeFrequency[] = [
    "always",
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "never",
  ];
  if (!validFrequencies.includes(entry.changeFrequency)) return false;

  // priority must be between 0.0 and 1.0
  if (typeof entry.priority !== "number" || entry.priority < 0 || entry.priority > 1) return false;

  return true;
}

/**
 * Generates canonical URL for a given path
 * Validates: Requirements 9.4
 */
export function generateCanonicalUrl(path: string): string {
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
 * Determines change frequency based on content type
 */
export function getChangeFrequency(
  type: "static" | "product" | "category" | "bundle" | "post"
): ChangeFrequency {
  switch (type) {
    case "static":
      return "daily";
    case "product":
      return "weekly";
    case "category":
      return "weekly";
    case "bundle":
      return "weekly";
    case "post":
      return "monthly";
    default:
      return "weekly";
  }
}

/**
 * Determines priority based on content type and importance
 */
export function getPriority(
  type: "home" | "listing" | "product" | "category" | "bundle" | "post"
): number {
  switch (type) {
    case "home":
      return 1.0;
    case "listing":
      return 0.9;
    case "product":
      return 0.8;
    case "category":
      return 0.7;
    case "bundle":
      return 0.7;
    case "post":
      return 0.6;
    default:
      return 0.5;
  }
}

/**
 * Creates a sitemap entry with all required attributes
 */
export function createSitemapEntry(
  path: string,
  lastModified: Date,
  changeFrequency: ChangeFrequency,
  priority: number
): SitemapEntry {
  return {
    url: generateCanonicalUrl(path),
    lastModified,
    changeFrequency,
    priority,
  };
}
