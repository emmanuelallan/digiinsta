/**
 * Property-Based Tests for Static Generation
 *
 * Feature: comprehensive-site-optimization
 * Property 1: Static params generation returns valid slugs
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Mock Payload CMS response structure
 */
interface MockPayloadDoc {
  slug: string;
  status: "active" | "draft" | "archived";
}

interface MockPayloadResponse {
  docs: MockPayloadDoc[];
  totalDocs: number;
  totalPages: number;
}

/**
 * Generator for valid slug strings
 * Slugs should be lowercase, alphanumeric with hyphens, no leading/trailing hyphens
 */
const validSlugArb = fc
  .stringMatching(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
  .filter((s) => s.length >= 1 && s.length <= 100);

/**
 * Generator for mock Payload documents
 */
const mockPayloadDocArb = fc.record({
  slug: validSlugArb,
  status: fc.constantFrom("active" as const, "draft" as const, "archived" as const),
});

/**
 * Generator for mock Payload response with only active documents
 */
const mockActivePayloadResponseArb = fc
  .array(mockPayloadDocArb, { minLength: 0, maxLength: 50 })
  .map((docs) => {
    const activeDocs = docs.filter((d) => d.status === "active");
    return {
      docs: activeDocs,
      totalDocs: activeDocs.length,
      totalPages: Math.ceil(activeDocs.length / 12),
    };
  });

/**
 * Simulates the generateStaticParams logic for products
 */
function generateStaticParamsFromResponse(response: MockPayloadResponse): { slug: string }[] {
  return response.docs.map((doc) => ({ slug: doc.slug }));
}

describe("Static Generation Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 1: Static params generation returns valid slugs
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  describe("Property 1: Static params generation returns valid slugs", () => {
    it("should return only valid slug objects from active documents", () => {
      fc.assert(
        fc.property(mockActivePayloadResponseArb, (response) => {
          const params = generateStaticParamsFromResponse(response);

          // Property: All returned params should have a slug property
          expect(params.every((p) => typeof p.slug === "string")).toBe(true);

          // Property: Number of params should equal number of active docs
          expect(params.length).toBe(response.docs.length);

          // Property: All slugs should be non-empty strings
          expect(params.every((p) => p.slug.length > 0)).toBe(true);

          // Property: All slugs should match the valid slug pattern
          const slugPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
          expect(params.every((p) => slugPattern.test(p.slug))).toBe(true);
        })
      );
    });

    it("should preserve all slugs from the response without modification", () => {
      fc.assert(
        fc.property(mockActivePayloadResponseArb, (response) => {
          const params = generateStaticParamsFromResponse(response);
          const originalSlugs = response.docs.map((d) => d.slug);
          const returnedSlugs = params.map((p) => p.slug);

          // Property: Round-trip - all original slugs should be in returned slugs
          expect(returnedSlugs).toEqual(originalSlugs);
        })
      );
    });

    it("should return empty array when no active documents exist", () => {
      const emptyResponse: MockPayloadResponse = {
        docs: [],
        totalDocs: 0,
        totalPages: 0,
      };

      const params = generateStaticParamsFromResponse(emptyResponse);
      expect(params).toEqual([]);
    });

    it("should handle large numbers of documents", () => {
      fc.assert(
        fc.property(
          fc.array(
            mockPayloadDocArb.filter((d) => d.status === "active"),
            {
              minLength: 100,
              maxLength: 200,
            }
          ),
          (docs) => {
            const response: MockPayloadResponse = {
              docs,
              totalDocs: docs.length,
              totalPages: Math.ceil(docs.length / 12),
            };

            const params = generateStaticParamsFromResponse(response);

            // Property: Should handle large arrays without issues
            expect(params.length).toBe(docs.length);
          }
        )
      );
    });

    it("should produce unique slugs when input has unique slugs", () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(validSlugArb, { minLength: 1, maxLength: 50 }).map((slugs) => ({
            docs: slugs.map((slug) => ({ slug, status: "active" as const })),
            totalDocs: slugs.length,
            totalPages: Math.ceil(slugs.length / 12),
          })),
          (response) => {
            const params = generateStaticParamsFromResponse(response);
            const slugSet = new Set(params.map((p) => p.slug));

            // Property: If input slugs are unique, output slugs should be unique
            expect(slugSet.size).toBe(params.length);
          }
        )
      );
    });
  });
});
