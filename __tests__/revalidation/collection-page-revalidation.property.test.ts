/**
 * Property-Based Tests for Collection Page Revalidation
 *
 * Feature: cache-revalidation-fix
 * Property 4: Collection Page Revalidation
 * Validates: Requirements 5.1, 5.2
 *
 * Tests that products with special tags (best-seller, new-arrival, featured)
 * trigger the corresponding collection page tags in the invalidation set.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  computeTagsToInvalidate,
  type RevalidationContext,
  type OperationType,
} from "../../lib/revalidation/service";
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
 * Generator for operation types
 */
const operationTypeArb = fc.constantFrom<OperationType>("create", "update", "delete");

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
 * Generator for base product document (without tags)
 */
const baseProductDocArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
  status: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  previousStatus: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  subcategory: fc.option(subcategoryArb, { nil: null }),
  category: fc.constant(null),
});

describe("Collection Page Revalidation Property Tests", () => {
  /**
   * Feature: cache-revalidation-fix
   * Property 4: Collection Page Revalidation
   * Validates: Requirements 5.1, 5.2
   */
  describe("Property 4: Collection Page Revalidation", () => {
    describe("Best Sellers Collection", () => {
      it("should trigger best-sellers collection tag for products with best-seller tag", () => {
        fc.assert(
          fc.property(operationTypeArb, baseProductDocArb, (operation, baseDoc) => {
            // Create product with best-seller tag
            const doc = {
              ...baseDoc,
              tags: [{ tag: "best-seller" }],
            };

            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: Best-seller products must trigger best-sellers collection
            expect(invalidatedTags).toContain(COLLECTION_TAGS.bestSellers);
          })
        );
      });

      it("should trigger best-sellers collection tag for products with bestseller tag (alternate spelling)", () => {
        fc.assert(
          fc.property(operationTypeArb, baseProductDocArb, (operation, baseDoc) => {
            // Create product with bestseller tag (no hyphen)
            const doc = {
              ...baseDoc,
              tags: [{ tag: "bestseller" }],
            };

            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: Bestseller products must trigger best-sellers collection
            expect(invalidatedTags).toContain(COLLECTION_TAGS.bestSellers);
          })
        );
      });

      it("should handle case-insensitive best-seller tag matching", () => {
        fc.assert(
          fc.property(
            operationTypeArb,
            baseProductDocArb,
            fc.constantFrom("BEST-SELLER", "Best-Seller", "best-SELLER", "BESTSELLER"),
            (operation, baseDoc, tagVariant) => {
              const doc = {
                ...baseDoc,
                tags: [{ tag: tagVariant }],
              };

              const context: RevalidationContext = {
                collection: "products",
                operation,
                doc,
              };

              const invalidatedTags = computeTagsToInvalidate(context);

              // Property: Case-insensitive matching for best-seller tags
              expect(invalidatedTags).toContain(COLLECTION_TAGS.bestSellers);
            }
          )
        );
      });
    });

    describe("New Arrivals Collection", () => {
      it("should trigger new-arrivals collection tag for products with new-arrival tag", () => {
        fc.assert(
          fc.property(operationTypeArb, baseProductDocArb, (operation, baseDoc) => {
            // Create product with new-arrival tag
            const doc = {
              ...baseDoc,
              tags: [{ tag: "new-arrival" }],
            };

            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: New-arrival products must trigger new-arrivals collection
            expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
          })
        );
      });

      it("should trigger new-arrivals collection tag for products with 'new arrival' tag (space variant)", () => {
        fc.assert(
          fc.property(operationTypeArb, baseProductDocArb, (operation, baseDoc) => {
            // Create product with "new arrival" tag (with space)
            const doc = {
              ...baseDoc,
              tags: [{ tag: "new arrival" }],
            };

            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: "new arrival" products must trigger new-arrivals collection
            expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
          })
        );
      });

      it("should handle case-insensitive new-arrival tag matching", () => {
        fc.assert(
          fc.property(
            operationTypeArb,
            baseProductDocArb,
            fc.constantFrom("NEW-ARRIVAL", "New-Arrival", "new-ARRIVAL", "NEW ARRIVAL"),
            (operation, baseDoc, tagVariant) => {
              const doc = {
                ...baseDoc,
                tags: [{ tag: tagVariant }],
              };

              const context: RevalidationContext = {
                collection: "products",
                operation,
                doc,
              };

              const invalidatedTags = computeTagsToInvalidate(context);

              // Property: Case-insensitive matching for new-arrival tags
              expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
            }
          )
        );
      });
    });

    describe("Editors Picks Collection", () => {
      it("should trigger editors-picks collection tag for products with featured tag", () => {
        fc.assert(
          fc.property(operationTypeArb, baseProductDocArb, (operation, baseDoc) => {
            // Create product with featured tag
            const doc = {
              ...baseDoc,
              tags: [{ tag: "featured" }],
            };

            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: Featured products must trigger editors-picks collection
            expect(invalidatedTags).toContain(COLLECTION_TAGS.editorsPicks);
          })
        );
      });

      it("should trigger editors-picks collection tag for products with editors-pick tag", () => {
        fc.assert(
          fc.property(operationTypeArb, baseProductDocArb, (operation, baseDoc) => {
            // Create product with editors-pick tag
            const doc = {
              ...baseDoc,
              tags: [{ tag: "editors-pick" }],
            };

            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: Editors-pick products must trigger editors-picks collection
            expect(invalidatedTags).toContain(COLLECTION_TAGS.editorsPicks);
          })
        );
      });
    });

    describe("Multiple Collection Tags", () => {
      it("should trigger multiple collection tags for products with multiple special tags", () => {
        fc.assert(
          fc.property(operationTypeArb, baseProductDocArb, (operation, baseDoc) => {
            // Create product with multiple special tags
            const doc = {
              ...baseDoc,
              tags: [{ tag: "best-seller" }, { tag: "new-arrival" }, { tag: "featured" }],
            };

            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: All relevant collection tags must be included
            expect(invalidatedTags).toContain(COLLECTION_TAGS.bestSellers);
            expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
            expect(invalidatedTags).toContain(COLLECTION_TAGS.editorsPicks);
          })
        );
      });
    });

    describe("Products Without Special Tags", () => {
      it("should not trigger special collection tags for products without special tags", () => {
        fc.assert(
          fc.property(operationTypeArb, baseProductDocArb, (operation, baseDoc) => {
            // Create product with no special tags (only unrecognized tags)
            const doc = {
              ...baseDoc,
              tags: [{ tag: "regular" }, { tag: "standard" }],
            };

            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: Products without special tags should not trigger special collections
            // (unless it's a create operation which always triggers new arrivals)
            if (operation !== "create") {
              expect(invalidatedTags).not.toContain(COLLECTION_TAGS.bestSellers);
              expect(invalidatedTags).not.toContain(COLLECTION_TAGS.editorsPicks);
            }
          })
        );
      });

      it("should handle products with null or empty tags array", () => {
        fc.assert(
          fc.property(
            operationTypeArb,
            baseProductDocArb,
            fc.constantFrom(null, [], undefined),
            (operation, baseDoc, tagsValue) => {
              const doc = {
                ...baseDoc,
                tags: tagsValue as null | undefined | Array<{ tag?: string | null }>,
              };

              const context: RevalidationContext = {
                collection: "products",
                operation,
                doc,
              };

              const invalidatedTags = computeTagsToInvalidate(context);

              // Property: Should not throw and should return valid tags
              expect(Array.isArray(invalidatedTags)).toBe(true);

              // Property: Products with no tags should not trigger special collections
              // (unless it's a create operation)
              if (operation !== "create") {
                expect(invalidatedTags).not.toContain(COLLECTION_TAGS.bestSellers);
                expect(invalidatedTags).not.toContain(COLLECTION_TAGS.editorsPicks);
              }
            }
          )
        );
      });
    });
  });
});
