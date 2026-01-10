/**
 * Property-Based Tests for Tag Invalidation Scope
 *
 * Feature: cache-revalidation-fix
 * Property 3: Tag Invalidation Scope
 * Validates: Requirements 2.4, 2.5
 *
 * Tests that invalidated tags are a subset of all tags in the system,
 * containing only tags directly related to the updated content and its dependents.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  computeTagsToInvalidate,
  type RevalidationContext,
  type CollectionType,
  type OperationType,
} from "../../lib/revalidation/service";
import {
  TAG_PREFIXES,
  COLLECTION_TAGS,
  getProductTags,
  getCategoryTags,
  getSubcategoryTags,
  getBundleTags,
  getPostTags,
} from "../../lib/revalidation/tags";

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
 * Generator for collection types
 */
const collectionTypeArb = fc.constantFrom<CollectionType>(
  "products",
  "categories",
  "subcategories",
  "bundles",
  "posts"
);

/**
 * Generator for operation types
 */
const operationTypeArb = fc.constantFrom<OperationType>("create", "update", "delete");

/**
 * Generator for product tag objects
 */
const productTagArb = fc.record({
  tag: fc.option(fc.constantFrom("best-seller", "new-arrival", "featured", "sale", "popular"), {
    nil: null,
  }),
});

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
 * Generator for category
 */
const categoryArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
});

/**
 * Generator for product document
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

/**
 * Generator for category document
 */
const categoryDocArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
  status: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  previousStatus: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  tags: fc.constant(null),
  subcategory: fc.constant(null),
  category: fc.constant(null),
});

/**
 * Generator for subcategory document
 */
const subcategoryDocArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
  status: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  previousStatus: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  tags: fc.constant(null),
  subcategory: fc.constant(null),
  category: fc.option(categoryArb, { nil: null }),
});

/**
 * Generator for bundle document
 */
const bundleDocArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
  status: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  previousStatus: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  tags: fc.constant(null),
  subcategory: fc.constant(null),
  category: fc.constant(null),
});

/**
 * Generator for post document
 */
const postDocArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
  status: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  previousStatus: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
  tags: fc.constant(null),
  subcategory: fc.constant(null),
  category: fc.option(categoryArb, { nil: null }),
});

/**
 * Get all possible tags in the system for a given content type
 */
function getAllPossibleTags(): Set<string> {
  const allTags = new Set<string>();

  // Add all collection tags
  Object.values(COLLECTION_TAGS).forEach((tag) => allTags.add(tag));

  return allTags;
}

/**
 * Check if a tag is a valid system tag (follows correct format)
 */
function isValidSystemTag(tag: string): boolean {
  // Collection tags
  if (tag.startsWith("collection:")) {
    return Object.values(COLLECTION_TAGS).includes(
      tag as (typeof COLLECTION_TAGS)[keyof typeof COLLECTION_TAGS]
    );
  }

  // Content-specific tags (prefix:slug format)
  const validPrefixes = Object.values(TAG_PREFIXES);
  for (const prefix of validPrefixes) {
    if (tag.startsWith(`${prefix}:`)) {
      return true;
    }
  }

  return false;
}

describe("Tag Invalidation Scope Property Tests", () => {
  /**
   * Feature: cache-revalidation-fix
   * Property 3: Tag Invalidation Scope
   * Validates: Requirements 2.4, 2.5
   */
  describe("Property 3: Tag Invalidation Scope", () => {
    describe("Products", () => {
      it("should only invalidate tags related to the product and its ancestors", () => {
        fc.assert(
          fc.property(operationTypeArb, productDocArb, (operation, doc) => {
            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: All invalidated tags must be valid system tags
            for (const tag of invalidatedTags) {
              expect(isValidSystemTag(tag)).toBe(true);
            }

            // Property: Product's own tag must be included
            expect(invalidatedTags).toContain(`${TAG_PREFIXES.product}:${doc.slug}`);

            // Property: If subcategory exists, its tag should be included
            if (doc.subcategory?.slug) {
              expect(invalidatedTags).toContain(
                `${TAG_PREFIXES.subcategory}:${doc.subcategory.slug}`
              );
            }

            // Property: If category exists (via subcategory), its tag should be included
            if (doc.subcategory?.category?.slug) {
              expect(invalidatedTags).toContain(
                `${TAG_PREFIXES.category}:${doc.subcategory.category.slug}`
              );
            }
          })
        );
      });

      it("should not include unrelated content tags", () => {
        fc.assert(
          fc.property(operationTypeArb, productDocArb, slugArb, (operation, doc, unrelatedSlug) => {
            // Ensure unrelated slug is different from doc slug
            fc.pre(unrelatedSlug !== doc.slug);
            fc.pre(unrelatedSlug !== doc.subcategory?.slug);
            fc.pre(unrelatedSlug !== doc.subcategory?.category?.slug);

            const context: RevalidationContext = {
              collection: "products",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: Unrelated product tags should not be included
            expect(invalidatedTags).not.toContain(`${TAG_PREFIXES.product}:${unrelatedSlug}`);

            // Property: Unrelated bundle tags should not be included
            expect(invalidatedTags).not.toContain(`${TAG_PREFIXES.bundle}:${unrelatedSlug}`);

            // Property: Unrelated post tags should not be included
            expect(invalidatedTags).not.toContain(`${TAG_PREFIXES.post}:${unrelatedSlug}`);
          })
        );
      });
    });

    describe("Categories", () => {
      it("should only invalidate category-related tags", () => {
        fc.assert(
          fc.property(operationTypeArb, categoryDocArb, (operation, doc) => {
            const context: RevalidationContext = {
              collection: "categories",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: All invalidated tags must be valid system tags
            for (const tag of invalidatedTags) {
              expect(isValidSystemTag(tag)).toBe(true);
            }

            // Property: Category's own tag must be included
            expect(invalidatedTags).toContain(`${TAG_PREFIXES.category}:${doc.slug}`);

            // Property: All-categories collection tag should be included
            expect(invalidatedTags).toContain(COLLECTION_TAGS.allCategories);
          })
        );
      });

      it("should not include unrelated content tags", () => {
        fc.assert(
          fc.property(
            operationTypeArb,
            categoryDocArb,
            slugArb,
            (operation, doc, unrelatedSlug) => {
              fc.pre(unrelatedSlug !== doc.slug);

              const context: RevalidationContext = {
                collection: "categories",
                operation,
                doc,
              };

              const invalidatedTags = computeTagsToInvalidate(context);

              // Property: Unrelated category tags should not be included
              expect(invalidatedTags).not.toContain(`${TAG_PREFIXES.category}:${unrelatedSlug}`);

              // Property: Product tags should not be included for category updates
              expect(invalidatedTags).not.toContain(`${TAG_PREFIXES.product}:${unrelatedSlug}`);
            }
          )
        );
      });
    });

    describe("Subcategories", () => {
      it("should only invalidate subcategory and parent category tags", () => {
        fc.assert(
          fc.property(operationTypeArb, subcategoryDocArb, (operation, doc) => {
            const context: RevalidationContext = {
              collection: "subcategories",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: All invalidated tags must be valid system tags
            for (const tag of invalidatedTags) {
              expect(isValidSystemTag(tag)).toBe(true);
            }

            // Property: Subcategory's own tag must be included
            expect(invalidatedTags).toContain(`${TAG_PREFIXES.subcategory}:${doc.slug}`);

            // Property: If parent category exists, its tag should be included
            if (doc.category?.slug) {
              expect(invalidatedTags).toContain(`${TAG_PREFIXES.category}:${doc.category.slug}`);
            }
          })
        );
      });
    });

    describe("Bundles", () => {
      it("should only invalidate bundle-related tags", () => {
        fc.assert(
          fc.property(operationTypeArb, bundleDocArb, (operation, doc) => {
            const context: RevalidationContext = {
              collection: "bundles",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: All invalidated tags must be valid system tags
            for (const tag of invalidatedTags) {
              expect(isValidSystemTag(tag)).toBe(true);
            }

            // Property: Bundle's own tag must be included
            expect(invalidatedTags).toContain(`${TAG_PREFIXES.bundle}:${doc.slug}`);

            // Property: All-bundles collection tag should be included
            expect(invalidatedTags).toContain(COLLECTION_TAGS.allBundles);
          })
        );
      });
    });

    describe("Posts", () => {
      it("should only invalidate post-related tags", () => {
        fc.assert(
          fc.property(operationTypeArb, postDocArb, (operation, doc) => {
            const context: RevalidationContext = {
              collection: "posts",
              operation,
              doc,
            };

            const invalidatedTags = computeTagsToInvalidate(context);

            // Property: All invalidated tags must be valid system tags
            for (const tag of invalidatedTags) {
              expect(isValidSystemTag(tag)).toBe(true);
            }

            // Property: Post's own tag must be included
            expect(invalidatedTags).toContain(`${TAG_PREFIXES.post}:${doc.slug}`);

            // Property: All-posts collection tag should be included
            expect(invalidatedTags).toContain(COLLECTION_TAGS.allPosts);

            // Property: If category exists, its tag should be included
            if (doc.category?.slug) {
              expect(invalidatedTags).toContain(`${TAG_PREFIXES.category}:${doc.category.slug}`);
            }
          })
        );
      });
    });

    describe("Cross-collection isolation", () => {
      it("should not include tags from unrelated collections", () => {
        fc.assert(
          fc.property(
            operationTypeArb,
            productDocArb,
            slugArb,
            slugArb,
            (operation, doc, bundleSlug, postSlug) => {
              fc.pre(bundleSlug !== doc.slug);
              fc.pre(postSlug !== doc.slug);

              const context: RevalidationContext = {
                collection: "products",
                operation,
                doc,
              };

              const invalidatedTags = computeTagsToInvalidate(context);

              // Property: Bundle tags should not be included for product updates
              expect(invalidatedTags).not.toContain(`${TAG_PREFIXES.bundle}:${bundleSlug}`);

              // Property: Post tags should not be included for product updates
              expect(invalidatedTags).not.toContain(`${TAG_PREFIXES.post}:${postSlug}`);
            }
          )
        );
      });
    });
  });
});
