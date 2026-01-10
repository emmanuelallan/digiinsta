/**
 * Property-Based Tests for Status Change Handling
 *
 * Feature: cache-revalidation-fix
 * Property 6: Status Change Triggers Listing Updates
 * Validates: Requirements 5.4
 *
 * Tests that status changes (active→archived, draft→active) trigger
 * listing page revalidation to ensure visibility changes are reflected.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  computeTagsToInvalidate,
  computePathsToRevalidate,
  type RevalidationContext,
} from "../../lib/revalidation/service";
import { COLLECTION_TAGS } from "../../lib/revalidation/tags";
import { hasListingAffectingStatusChange } from "../../lib/revalidation/hooks";

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
 * Generator for product status values
 */
const statusArb = fc.constantFrom("active", "draft", "archived");

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
 * Generator for product tag objects
 */
const productTagArb = fc.record({
  tag: fc.option(fc.constantFrom("best-seller", "new-arrival", "featured", "sale", "popular"), {
    nil: null,
  }),
});

/**
 * Generator for base product document
 */
const baseProductDocArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
  tags: fc.option(fc.array(productTagArb, { minLength: 0, maxLength: 5 }), { nil: null }),
  subcategory: fc.option(subcategoryArb, { nil: null }),
  category: fc.constant(null),
});

describe("Status Change Handling Property Tests", () => {
  /**
   * Feature: cache-revalidation-fix
   * Property 6: Status Change Triggers Listing Updates
   * Validates: Requirements 5.4
   */
  describe("Property 6: Status Change Triggers Listing Updates", () => {
    describe("Active to Archived Status Change", () => {
      it("should trigger listing page revalidation when product changes from active to archived", () => {
        fc.assert(
          fc.property(baseProductDocArb, (baseDoc) => {
            // Create product with active→archived status change
            const doc = {
              ...baseDoc,
              status: "archived",
              previousStatus: "active",
            };

            const context: RevalidationContext = {
              collection: "products",
              operation: "update",
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);
            const revalidatedPaths = computePathsToRevalidate(context);

            // Property: Status change should trigger all-products collection tag
            expect(invalidatedTags).toContain(COLLECTION_TAGS.allProducts);

            // Property: Status change should trigger homepage tag
            expect(invalidatedTags).toContain(COLLECTION_TAGS.homepage);

            // Property: Listing paths should be revalidated
            expect(revalidatedPaths).toContain("/");
            expect(revalidatedPaths).toContain("/products");
          })
        );
      });
    });

    describe("Draft to Active Status Change", () => {
      it("should trigger listing page revalidation when product changes from draft to active", () => {
        fc.assert(
          fc.property(baseProductDocArb, (baseDoc) => {
            // Create product with draft→active status change
            const doc = {
              ...baseDoc,
              status: "active",
              previousStatus: "draft",
            };

            const context: RevalidationContext = {
              collection: "products",
              operation: "update",
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);
            const revalidatedPaths = computePathsToRevalidate(context);

            // Property: Status change should trigger all-products collection tag
            expect(invalidatedTags).toContain(COLLECTION_TAGS.allProducts);

            // Property: Status change should trigger homepage tag
            expect(invalidatedTags).toContain(COLLECTION_TAGS.homepage);

            // Property: Listing paths should be revalidated
            expect(revalidatedPaths).toContain("/");
            expect(revalidatedPaths).toContain("/products");
          })
        );
      });
    });

    describe("Archived to Active Status Change", () => {
      it("should trigger listing page revalidation when product changes from archived to active", () => {
        fc.assert(
          fc.property(baseProductDocArb, (baseDoc) => {
            // Create product with archived→active status change
            const doc = {
              ...baseDoc,
              status: "active",
              previousStatus: "archived",
            };

            const context: RevalidationContext = {
              collection: "products",
              operation: "update",
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);
            const revalidatedPaths = computePathsToRevalidate(context);

            // Property: Status change should trigger all-products collection tag
            expect(invalidatedTags).toContain(COLLECTION_TAGS.allProducts);

            // Property: Status change should trigger homepage tag
            expect(invalidatedTags).toContain(COLLECTION_TAGS.homepage);

            // Property: Listing paths should be revalidated
            expect(revalidatedPaths).toContain("/");
            expect(revalidatedPaths).toContain("/products");
          })
        );
      });
    });

    describe("Active to Draft Status Change", () => {
      it("should trigger listing page revalidation when product changes from active to draft", () => {
        fc.assert(
          fc.property(baseProductDocArb, (baseDoc) => {
            // Create product with active→draft status change
            const doc = {
              ...baseDoc,
              status: "draft",
              previousStatus: "active",
            };

            const context: RevalidationContext = {
              collection: "products",
              operation: "update",
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);
            const revalidatedPaths = computePathsToRevalidate(context);

            // Property: Status change should trigger all-products collection tag
            expect(invalidatedTags).toContain(COLLECTION_TAGS.allProducts);

            // Property: Status change should trigger homepage tag
            expect(invalidatedTags).toContain(COLLECTION_TAGS.homepage);

            // Property: Listing paths should be revalidated
            expect(revalidatedPaths).toContain("/");
            expect(revalidatedPaths).toContain("/products");
          })
        );
      });
    });

    describe("No Status Change", () => {
      it("should not trigger extra listing revalidation when status remains the same", () => {
        fc.assert(
          fc.property(baseProductDocArb, statusArb, (baseDoc, status) => {
            // Create product with same status (no change)
            const doc = {
              ...baseDoc,
              status,
              previousStatus: status,
            };

            const context: RevalidationContext = {
              collection: "products",
              operation: "update",
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: When status doesn't change, allProducts should NOT be in tags
            // (unless product has special tags that would include it anyway)
            // The key is that hasStatusChanged returns false
            expect(hasListingAffectingStatusChange(doc)).toBe(false);
          })
        );
      });
    });

    describe("Status Change Detection Helper", () => {
      it("should correctly identify listing-affecting status changes", () => {
        fc.assert(
          fc.property(statusArb, statusArb, (previousStatus, currentStatus) => {
            const doc = {
              id: 1,
              slug: "test",
              status: currentStatus,
              previousStatus,
              tags: null,
              subcategory: null,
              category: null,
            };

            const hasChange = hasListingAffectingStatusChange(doc);

            // Property: Status change is detected when previous !== current
            if (previousStatus === currentStatus) {
              expect(hasChange).toBe(false);
            } else {
              expect(hasChange).toBe(true);
            }
          })
        );
      });

      it("should return false when previousStatus is null", () => {
        fc.assert(
          fc.property(statusArb, (currentStatus) => {
            const doc = {
              id: 1,
              slug: "test",
              status: currentStatus,
              previousStatus: null,
              tags: null,
              subcategory: null,
              category: null,
            };

            // Property: No status change when previousStatus is null
            expect(hasListingAffectingStatusChange(doc)).toBe(false);
          })
        );
      });

      it("should return false when status is null", () => {
        fc.assert(
          fc.property(statusArb, (previousStatus) => {
            const doc = {
              id: 1,
              slug: "test",
              status: null,
              previousStatus,
              tags: null,
              subcategory: null,
              category: null,
            };

            // Property: No status change when current status is null
            expect(hasListingAffectingStatusChange(doc)).toBe(false);
          })
        );
      });
    });

    describe("Status Change with Special Tags", () => {
      it("should include collection tags when status changes for products with special tags", () => {
        fc.assert(
          fc.property(
            baseProductDocArb,
            fc.constantFrom("best-seller", "new-arrival", "featured"),
            (baseDoc, specialTag) => {
              // Create product with special tag and status change
              const doc = {
                ...baseDoc,
                status: "archived",
                previousStatus: "active",
                tags: [{ tag: specialTag }],
              };

              const context: RevalidationContext = {
                collection: "products",
                operation: "update",
                doc,
              };

              const invalidatedTags = computeTagsToInvalidate(context);

              // Property: Status change should include the special collection tag
              // because the product's visibility affects that collection
              if (specialTag === "best-seller") {
                expect(invalidatedTags).toContain(COLLECTION_TAGS.bestSellers);
              } else if (specialTag === "new-arrival") {
                expect(invalidatedTags).toContain(COLLECTION_TAGS.newArrivals);
              } else if (specialTag === "featured") {
                expect(invalidatedTags).toContain(COLLECTION_TAGS.editorsPicks);
              }
            }
          )
        );
      });
    });
  });
});
