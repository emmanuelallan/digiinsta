/**
 * API Cache Headers Utility
 * Provides consistent cache headers for API responses
 *
 * Validates: Requirements 4.2, 4.4
 */

export interface CacheOptions {
  /** Max age in seconds (default: 60) */
  maxAge?: number;
  /** Stale-while-revalidate in seconds (default: 30) */
  staleWhileRevalidate?: number;
  /** Whether the response is public (default: true) */
  isPublic?: boolean;
  /** Whether to add Vary headers (default: true) */
  addVary?: boolean;
}

/**
 * Get cache headers for API responses
 */
export function getCacheHeaders(options: CacheOptions = {}): HeadersInit {
  const { maxAge = 60, staleWhileRevalidate = 30, isPublic = true, addVary = true } = options;

  const headers: HeadersInit = {
    "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  };

  if (addVary) {
    headers["Vary"] = "Accept-Encoding, Accept";
  }

  return headers;
}

/**
 * Get no-cache headers for dynamic API responses
 */
export function getNoCacheHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

/**
 * Preset cache configurations for common use cases
 */
export const cachePresets = {
  /** Search results - short cache, quick revalidation */
  search: { maxAge: 60, staleWhileRevalidate: 30 },

  /** Product data - medium cache */
  product: { maxAge: 300, staleWhileRevalidate: 60 },

  /** Category data - longer cache */
  category: { maxAge: 3600, staleWhileRevalidate: 300 },

  /** Static content - long cache */
  static: { maxAge: 86400, staleWhileRevalidate: 3600 },

  /** User-specific data - no cache */
  private: { maxAge: 0, staleWhileRevalidate: 0, isPublic: false },
} as const;
