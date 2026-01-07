/**
 * Property-Based Tests for Canonical URL Generation
 *
 * Feature: comprehensive-site-optimization
 * Property 11: Canonical URLs are correctly formed
 * Validates: Requirements 9.4
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getCanonicalUrl, SITE_URL } from "../../lib/seo";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for valid URL path segments
 */
const pathSegmentArb = fc.stringMatching(/^[a-z0-9-]+$/);

/**
 * Generator for valid URL paths
 */
const validPathArb = fc
  .array(pathSegmentArb, { minLength: 0, maxLength: 5 })
  .map((segments) => "/" + segments.join("/"));

/**
 * Generator for query parameters
 */
const queryParamArb = fc.record({
  key: fc.stringMatching(/^[a-z]+$/),
  value: fc.stringMatching(/^[a-z0-9]+$/),
});

/**
 * Generator for query strings
 */
const queryStringArb = fc
  .array(queryParamArb, { minLength: 1, maxLength: 3 })
  .map((params) => params.map((p) => `${p.key}=${p.value}`).join("&"));

/**
 * Generator for fragment identifiers
 */
const fragmentArb = fc.stringMatching(/^[a-z0-9-]+$/);

describe("Canonical URL Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 11: Canonical URLs are correctly formed
   * Validates: Requirements 9.4
   */
  describe("Property 11: Canonical URLs are correctly formed", () => {
    it("should return absolute URL with SITE_URL prefix", () => {
      fc.assert(
        fc.property(validPathArb, (path) => {
          const canonicalUrl = getCanonicalUrl(path);

          // Property: URL should start with SITE_URL
          expect(canonicalUrl.startsWith(SITE_URL)).toBe(true);
        })
      );
    });

    it("should not contain query parameters", () => {
      fc.assert(
        fc.property(validPathArb, queryStringArb, (path, queryString) => {
          const pathWithQuery = `${path}?${queryString}`;
          const canonicalUrl = getCanonicalUrl(pathWithQuery);

          // Property: URL should not contain query parameters
          expect(canonicalUrl).not.toContain("?");
        })
      );
    });

    it("should not contain fragments", () => {
      fc.assert(
        fc.property(validPathArb, fragmentArb, (path, fragment) => {
          const pathWithFragment = `${path}#${fragment}`;
          const canonicalUrl = getCanonicalUrl(pathWithFragment);

          // Property: URL should not contain fragments
          expect(canonicalUrl).not.toContain("#");
        })
      );
    });

    it("should match pattern {SITE_URL}/{path}", () => {
      fc.assert(
        fc.property(fc.array(pathSegmentArb, { minLength: 1, maxLength: 5 }), (segments) => {
          const path = "/" + segments.join("/");
          const canonicalUrl = getCanonicalUrl(path);

          // Property: URL should match expected pattern
          const expectedUrl = `${SITE_URL}${path}`;
          expect(canonicalUrl).toBe(expectedUrl);
        })
      );
    });

    it("should handle root path correctly", () => {
      const canonicalUrl = getCanonicalUrl("/");

      // Property: Root path should return SITE_URL without trailing slash
      expect(canonicalUrl).toBe(SITE_URL);
    });

    it("should remove trailing slashes except for root", () => {
      fc.assert(
        fc.property(fc.array(pathSegmentArb, { minLength: 1, maxLength: 5 }), (segments) => {
          const pathWithTrailingSlash = "/" + segments.join("/") + "/";
          const canonicalUrl = getCanonicalUrl(pathWithTrailingSlash);

          // Property: URL should not end with trailing slash
          expect(canonicalUrl.endsWith("/")).toBe(false);
        })
      );
    });

    it("should handle paths without leading slash", () => {
      fc.assert(
        fc.property(fc.array(pathSegmentArb, { minLength: 1, maxLength: 5 }), (segments) => {
          const pathWithoutLeadingSlash = segments.join("/");
          const canonicalUrl = getCanonicalUrl(pathWithoutLeadingSlash);

          // Property: URL should be properly formed even without leading slash
          expect(canonicalUrl.startsWith(SITE_URL)).toBe(true);
          expect(canonicalUrl).toBe(`${SITE_URL}/${pathWithoutLeadingSlash}`);
        })
      );
    });

    it("should handle both query parameters and fragments", () => {
      fc.assert(
        fc.property(validPathArb, queryStringArb, fragmentArb, (path, queryString, fragment) => {
          const pathWithBoth = `${path}?${queryString}#${fragment}`;
          const canonicalUrl = getCanonicalUrl(pathWithBoth);

          // Property: URL should not contain query parameters or fragments
          expect(canonicalUrl).not.toContain("?");
          expect(canonicalUrl).not.toContain("#");
        })
      );
    });

    it("should produce valid URL format", () => {
      fc.assert(
        fc.property(validPathArb, (path) => {
          const canonicalUrl = getCanonicalUrl(path);

          // Property: URL should be a valid URL
          expect(() => new URL(canonicalUrl)).not.toThrow();

          // Property: URL should use https protocol
          const url = new URL(canonicalUrl);
          expect(url.protocol).toBe("https:");
        })
      );
    });

    it("should be idempotent", () => {
      fc.assert(
        fc.property(validPathArb, (path) => {
          const firstCall = getCanonicalUrl(path);
          const secondCall = getCanonicalUrl(firstCall.replace(SITE_URL, ""));

          // Property: Calling getCanonicalUrl twice should produce same result
          expect(secondCall).toBe(firstCall);
        })
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle empty path", () => {
      const canonicalUrl = getCanonicalUrl("");

      // Property: Empty path should return SITE_URL
      expect(canonicalUrl).toBe(SITE_URL);
    });

    it("should handle path with only query string", () => {
      const canonicalUrl = getCanonicalUrl("?foo=bar");

      // Property: Path with only query string should return SITE_URL
      expect(canonicalUrl).toBe(SITE_URL);
    });

    it("should handle path with only fragment", () => {
      const canonicalUrl = getCanonicalUrl("#section");

      // Property: Path with only fragment should return SITE_URL
      expect(canonicalUrl).toBe(SITE_URL);
    });

    it("should handle multiple consecutive slashes", () => {
      const canonicalUrl = getCanonicalUrl("//products//my-product//");

      // Property: Multiple slashes should be preserved (URL normalization is separate concern)
      expect(canonicalUrl.startsWith(SITE_URL)).toBe(true);
      expect(canonicalUrl).not.toContain("?");
      expect(canonicalUrl).not.toContain("#");
    });
  });
});
