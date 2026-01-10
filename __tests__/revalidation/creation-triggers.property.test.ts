/**
 * Property-Based Tests for Creation Triggers
 *
 * Feature: cache-revalidation-fix
 * Property 5: Creation Triggers New Arrivals
 * Validates: Requirements 5.3
 *
 * Tests that newly created products always trigger new arrivals revalidation
 * regardless of the product's tags.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { computeTagsToInvalidate, type RevalidationContext } from "../../lib/revalidation/service";
import { COLLECTION_TAGS } from "../../lib/revalidation/tags";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for valid URL slugs
 */
const slugArb = fc
  .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .filter((s) => s.length >= 1 && s.length <= 50);

/**
 * Generator for subcategory with optional category
 */
const subcategoryArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
  category: fc.option(
    fc.record({
      id: fc.integer({ min: 1, max: 10000 }),
      slug: slugArb,
    }),
    { nil: null }
  ),
});

/**
 * Generator for product tag objects (any tag, not just special ones)
 */
const productTagArb = fc.record({
  tag: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
});

/**
 * Generator for product document with any tags
 */
const productDocArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
  status: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  previousStatus: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  tags: fc.option(fc.array(productTagArb, { minLength: 0, maxLength: 5 }), { nil: null }),
  subcategory: fc.option(subcategoryArb, { nil: null }),
  category: fc.constant(null),
});

describe("Creation Triggers Property Tests", () => {
  /**
   * Feature: cache-revalidation-fix
   * Property 5: Creation Triggers New Arrivals
   * Validates: Requirements 5.3
   */
  describe("Property 5: Creation Triggers New Arrivals", () => {
    it("should always trigger new-arrivals collection tag for newly created products", () => {
      fc.assert(
        fc.property(productDocArb, (doc) => {
          const context: RevalidationContext = {
            collection: "products",
            operation: "create",
            doc,
          };

          const invalidatedTags = computeTagsToInvalidate(context);

          // Property: New products must ALWAYS trigger new-arrivals collection
          expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
        })
      );
    });

    it("should trigger new-arrivals for products with no tags", () => {
      fc.assert(
        fc.property(slugArb, fc.option(subcategoryArb, { nil: null }), (slug, subcategory) => {
          const doc = {
            id: 1,
            slug,
            status: "active" as const,
            previousStatus: null,
            tags: null,
            subcategory,
            category: null,
          };

          const context: RevalidationContext = {
            collection: "products",
            operation: "create",
            doc,
          };

          const invalidatedTags = computeTagsToInvalidate(context);

          // Property: Even products with no tags must trigger new-arrivals on creation
          expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
        })
      );
    });

    it("should trigger new-arrivals for products with empty tags array", () => {
      fc.assert(
        fc.property(slugArb, fc.option(subcategoryArb, { nil: null }), (slug, subcategory) => {
          const doc = {
            id: 1,
            slug,
            status: "active" as const,
            previousStatus: null,
            tags: [] as Array<{ tag?: string | null }>,
            subcategory,
            category: null,
          };

          const context: RevalidationContext = {
            collection: "products",
            operation: "create",
            doc,
          };

          const invalidatedTags = computeTagsToInvalidate(context);

          // Property: Products with empty tags array must trigger new-arrivals on creation
          expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
        })
      );
    });

    it("should trigger new-arrivals for products with unrecognized tags", () => {
      fc.assert(
        fc.property(
          slugArb,
          fc.option(subcategoryArb, { nil: null }),
          fc.array(
            fc.record({
              tag: fc.stringMatching(/^[a-z]+-random-[0-9]+$/),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (slug, subcategory, randomTags) => {
            const doc = {
              id: 1,
              slug,
              status: "active" as const,
              previousStatus: null,
              tags: randomTags,
              subcategory,
              category: null,
            };

            const context: RevalidationContext = {
              collection: "products",
              operation: "create",
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: Products with unrecognized tags must still trigger new-arrivals on creation
            expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
          }
        )
      );
    });

    it("should trigger new-arrivals regardless of product status", () => {
      fc.assert(
        fc.property(
          slugArb,
          fc.constantFrom("active", "draft", "archived", null, undefined),
          (slug, status) => {
            const doc = {
              id: 1,
              slug,
              status: status as string | null | undefined,
              previousStatus: null,
              tags: null,
              subcategory: null,
              category: null,
            };

            const context: RevalidationContext = {
              collection: "products",
              operation: "create",
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: New products must trigger new-arrivals regardless of status
            expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
          }
        )
      );
    });

    describe("Comparison with update and delete operations", () => {
      it("should NOT automatically trigger new-arrivals for update operations (unless product has new-arrival tag)", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            // Product without new-arrival tag
            const doc = {
              id: 1,
              slug,
              status: "active" as const,
              previousStatus: "active" as const,
              tags: [{ tag: "regular" }],
              subcategory: null,
              category: null,
            };

            const context: RevalidationContext = {
              collection: "products",
              operation: "update",
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: Update operations should NOT trigger new-arrivals unless product has new-arrival tag
            expect(invalidatedTags).not.toContain(COLLECTION_TAGS.newArrivals);
          })
        );
      });

      it("should NOT automatically trigger new-arrivals for delete operations (unless product has new-arrival tag)", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            // Product without new-arrival tag
            const doc = {
              id: 1,
              slug,
              status: "active" as const,
              previousStatus: "active" as const,
              tags: [{ tag: "regular" }],
              subcategory: null,
              category: null,
            };

            const context: RevalidationContext = {
              collection: "products",
              operation: "delete",
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: Delete operations should NOT trigger new-arrivals unless product has new-arrival tag
            expect(invalidatedTags).not.toContain(COLLECTION_TAGS.newArrivals);
          })
        );
      });
    });
  });
});
