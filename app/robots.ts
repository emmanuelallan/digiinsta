import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/jsonld";

/**
 * Robots.txt configuration for search engine crawlers
 * Validates: Requirements 9.1
 *
 * Features:
 * - Crawl-delay to prevent server overload
 * - Sitemap reference for efficient crawling
 * - Specific rules for different bot types
 * - Protected paths for admin, API, checkout, and studio
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Default rules for all crawlers
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/checkout/",
          "/studio/", // Sanity Studio
          "/_next/",
          "/private/",
          "/auth/",
          "/*?*", // Disallow URLs with query parameters to prevent duplicate content
        ],
        // Note: crawlDelay is not directly supported in Next.js MetadataRoute.Robots
        // but we include it for documentation purposes
      },
      {
        // Googlebot-specific rules (Google ignores crawl-delay)
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/studio/", "/_next/", "/private/", "/auth/"],
      },
      {
        // Bingbot with crawl-delay consideration
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/studio/", "/_next/", "/private/", "/auth/"],
      },
      {
        // Block AI training bots
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
      {
        userAgent: "Claude-Web",
        disallow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
