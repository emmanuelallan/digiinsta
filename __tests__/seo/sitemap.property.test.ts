/**
 * Property-Based Tests for Sitemap Generation
 *
 * Feature: comprehensive-site-optimization
 * Property 10: Sitemap entries include required attributes
 * Validates: Requirements 9.1
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  validateSitemapEntry,
  generateCanonicalUrl,
  createSitemapEntry,
  MAX_URLS_PER_SITEMAP,
  type SitemapEntry,
} from "../../lib/sitemap";
import { SITE_URL } from "../../lib/seo";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for valid URL paths
 */
const validPathArb = fc
  .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 0, maxLength: 5 })
  .map((segments) => "/" + segments.join("/"));

/**
 * Generator for valid change frequencies
 */
const changeFrequencyArb = fc.constantFrom(
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never"
) as fc.Arbitrary<SitemapEntry["changeFrequency"]>;

/**
 * Generator for valid priority values (0.0 to 1.0)
 */
const priorityArb = fc.double({ min: 0, max: 1, noNaN: true });

/**
 * Generator for valid dates (ensuring no NaN dates)
 */
const dateArb = fc
  .integer({ min: 1577836800000, max: 1924905600000 }) // 2020-01-01 to 2030-12-31 in ms
  .map((ts) => new Date(ts));

/**
 * Generator for valid sitemap entries
 */
const sitemapEntryArb: fc.Arbitrary<SitemapEntry> = fc.record({
  url: validPathArb.map((path) => generateCanonicalUrl(path)),
  lastModified: dateArb,
  changeFrequency: changeFrequencyArb,
  priority: priorityArb,
});

describe("Sitemap Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 10: Sitemap entries include required attributes
   * Validates: Requirements 9.1
   */
  describe("Property 10: Sitemap entries include required attributes", () => {
    it("should validate entries with all required attributes", () => {
      fc.assert(
        fc.property(sitemapEntryArb, (entry) => {
          // Property: Valid entries should pass validation
          const isValid = validateSitemapEntry(entry);
          expect(isValid).toBe(true);
        })
      );
    });

    it("should have url as valid absolute URL starting with http", () => {
      fc.assert(
        fc.property(sitemapEntryArb, (entry) => {
          // Property: URL must be absolute and start with http(s)
          expect(entry.url).toMatch(/^https?:\/\//);
          expect(entry.url.startsWith(SITE_URL)).toBe(true);
        })
      );
    });

    it("should have lastModified as valid Date", () => {
      fc.assert(
        fc.property(sitemapEntryArb, (entry) => {
          // Property: lastModified must be a valid Date
          expect(entry.lastModified instanceof Date).toBe(true);
          expect(isNaN(entry.lastModified.getTime())).toBe(false);
        })
      );
    });

    it("should have changeFrequency as valid value", () => {
      fc.assert(
        fc.property(sitemapEntryArb, (entry) => {
          // Property: changeFrequency must be one of the valid values
          const validFrequencies = [
            "always",
            "hourly",
            "daily",
            "weekly",
            "monthly",
            "yearly",
            "never",
          ];
          expect(validFrequencies).toContain(entry.changeFrequency);
        })
      );
    });

    it("should have priority between 0.0 and 1.0", () => {
      fc.assert(
        fc.property(sitemapEntryArb, (entry) => {
          // Property: priority must be between 0.0 and 1.0
          expect(entry.priority).toBeGreaterThanOrEqual(0);
          expect(entry.priority).toBeLessThanOrEqual(1);
        })
      );
    });

    it("should reject entries with invalid URL", () => {
      const invalidEntry: SitemapEntry = {
        url: "not-a-valid-url",
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.5,
      };

      // Property: Invalid URL should fail validation
      expect(validateSitemapEntry(invalidEntry)).toBe(false);
    });

    it("should reject entries with invalid Date", () => {
      const invalidEntry: SitemapEntry = {
        url: `${SITE_URL}/test`,
        lastModified: new Date("invalid"),
        changeFrequency: "daily",
        priority: 0.5,
      };

      // Property: Invalid Date should fail validation
      expect(validateSitemapEntry(invalidEntry)).toBe(false);
    });

    it("should reject entries with priority out of range", () => {
      const invalidEntryHigh: SitemapEntry = {
        url: `${SITE_URL}/test`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.5,
      };

      const invalidEntryLow: SitemapEntry = {
        url: `${SITE_URL}/test`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: -0.5,
      };

      // Property: Priority out of range should fail validation
      expect(validateSitemapEntry(invalidEntryHigh)).toBe(false);
      expect(validateSitemapEntry(invalidEntryLow)).toBe(false);
    });
  });

  describe("generateCanonicalUrl", () => {
    it("should generate absolute URLs with SITE_URL prefix", () => {
      fc.assert(
        fc.property(validPathArb, (path) => {
          const url = generateCanonicalUrl(path);

          // Property: URL should start with SITE_URL
          expect(url.startsWith(SITE_URL)).toBe(true);
        })
      );
    });

    it("should remove query parameters from URLs", () => {
      fc.assert(
        fc.property(
          validPathArb,
          fc.string({ minLength: 1, maxLength: 50 }),
          (path, queryParam) => {
            const pathWithQuery = `${path}?param=${queryParam}`;
            const url = generateCanonicalUrl(pathWithQuery);

            // Property: URL should not contain query parameters
            expect(url).not.toContain("?");
          }
        )
      );
    });

    it("should remove fragments from URLs", () => {
      fc.assert(
        fc.property(validPathArb, fc.string({ minLength: 1, maxLength: 50 }), (path, fragment) => {
          const pathWithFragment = `${path}#${fragment}`;
          const url = generateCanonicalUrl(pathWithFragment);

          // Property: URL should not contain fragments
          expect(url).not.toContain("#");
        })
      );
    });

    it("should handle root path correctly", () => {
      const rootUrl = generateCanonicalUrl("/");

      // Property: Root path should return SITE_URL without trailing slash
      expect(rootUrl).toBe(SITE_URL);
    });

    it("should remove trailing slashes except for root", () => {
      fc.assert(
        fc.property(
          fc.array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 1, maxLength: 5 }),
          (segments) => {
            const pathWithTrailingSlash = "/" + segments.join("/") + "/";
            const url = generateCanonicalUrl(pathWithTrailingSlash);

            // Property: URL should not end with trailing slash (except root)
            expect(url.endsWith("/")).toBe(false);
          }
        )
      );
    });
  });

  describe("createSitemapEntry", () => {
    it("should create valid sitemap entries", () => {
      fc.assert(
        fc.property(
          validPathArb,
          dateArb,
          changeFrequencyArb,
          priorityArb,
          (path, date, freq, priority) => {
            const entry = createSitemapEntry(path, date, freq, priority);

            // Property: Created entry should be valid
            expect(validateSitemapEntry(entry)).toBe(true);
          }
        )
      );
    });

    it("should use generateCanonicalUrl for URL", () => {
      fc.assert(
        fc.property(
          validPathArb,
          dateArb,
          changeFrequencyArb,
          priorityArb,
          (path, date, freq, priority) => {
            const entry = createSitemapEntry(path, date, freq, priority);
            const expectedUrl = generateCanonicalUrl(path);

            // Property: Entry URL should match canonical URL
            expect(entry.url).toBe(expectedUrl);
          }
        )
      );
    });
  });

  describe("MAX_URLS_PER_SITEMAP constant", () => {
    it("should be set to 50000 as per Google's limit", () => {
      // Property: MAX_URLS_PER_SITEMAP should be 50000
      expect(MAX_URLS_PER_SITEMAP).toBe(50000);
    });
  });
});
