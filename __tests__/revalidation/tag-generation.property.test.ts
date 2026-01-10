/**
 * Property-Based Tests for Tag Generation
 *
 * Feature: cache-revalidation-fix
 * Property 2: Tag Generation Correctness
 * Validates: Requirements 2.1, 2.2
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  TAG_PREFIXES,
  COLLECTION_TAGS,
  getProductTags,
  getCategoryTags,
  getSubcategoryTags,
  getBundleTags,
  getPostTags,
  getCollectionTagsForProduct,
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
  .filter((s) => s.length >= 1 && s.length <= 100);

/**
 * Generator for product tag objects
 */
const productTagArb = fc.record({
  tag: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
});

/**
 * Generator for product tags array
 */
const productTagsArrayArb = fc.array(productTagArb, { minLength: 0, maxLength: 10 });

describe("Tag Generation Property Tests", () => {
  /**
   * Feature: cache-revalidation-fix
   * Property 2: Tag Generation Correctness
   * Validates: Requirements 2.1, 2.2
   */
  describe("Property 2: Tag Generation Correctness", () => {
    describe("Product tags", () => {
      it("should always include the product's own identifier tag", () => {
        fc.assert(
          fc.property(
            slugArb,
            fc.option(slugArb, { nil: null }),
            fc.option(slugArb, { nil: null }),
            (slug, subcategorySlug, categorySlug) => {
              const tags = getProductTags(slug, subcategorySlug, categorySlug);

              // Property: Product's own tag must always be included
              expect(tags).toContain(`${TAG_PREFIXES.product}:${slug}`);
            }
          )
        );
      });

      it("should include subcategory tag when subcategory slug is provided", () => {
        fc.assert(
          fc.property(
            slugArb,
            slugArb,
            fc.option(slugArb, { nil: null }),
            (slug, subcategorySlug, categorySlug) => {
              const tags = getProductTags(slug, subcategorySlug, categorySlug);

              // Property: Subcategory tag must be included when subcategory exists
              expect(tags).toContain(`${TAG_PREFIXES.subcategory}:${subcategorySlug}`);
            }
          )
        );
      });

      it("should include category tag when category slug is provided", () => {
        fc.assert(
          fc.property(
            slugArb,
            fc.option(slugArb, { nil: null }),
            slugArb,
            (slug, subcategorySlug, categorySlug) => {
              const tags = getProductTags(slug, subcategorySlug, categorySlug);

              // Property: Category tag must be included when category exists
              expect(tags).toContain(`${TAG_PREFIXES.category}:${categorySlug}`);
            }
          )
        );
      });

      it("should always include all-products collection tag", () => {
        fc.assert(
          fc.property(
            slugArb,
            fc.option(slugArb, { nil: null }),
            fc.option(slugArb, { nil: null }),
            (slug, subcategorySlug, categorySlug) => {
              const tags = getProductTags(slug, subcategorySlug, categorySlug);

              // Property: All-products collection tag must always be included
              expect(tags).toContain(COLLECTION_TAGS.allProducts);
            }
          )
        );
      });

      it("should include ancestor tags (subcategory and category) when both are provided", () => {
        fc.assert(
          fc.property(slugArb, slugArb, slugArb, (productSlug, subcategorySlug, categorySlug) => {
            const tags = getProductTags(productSlug, subcategorySlug, categorySlug);

            // Property: Both ancestor tags must be included
            expect(tags).toContain(`${TAG_PREFIXES.subcategory}:${subcategorySlug}`);
            expect(tags).toContain(`${TAG_PREFIXES.category}:${categorySlug}`);
          })
        );
      });
    });

    describe("Category tags", () => {
      it("should always include the category's own identifier tag", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const tags = getCategoryTags(slug);

            // Property: Category's own tag must always be included
            expect(tags).toContain(`${TAG_PREFIXES.category}:${slug}`);
          })
        );
      });

      it("should always include all-categories collection tag", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const tags = getCategoryTags(slug);

            // Property: All-categories collection tag must always be included
            expect(tags).toContain(COLLECTION_TAGS.allCategories);
          })
        );
      });
    });

    describe("Subcategory tags", () => {
      it("should always include the subcategory's own identifier tag", () => {
        fc.assert(
          fc.property(slugArb, fc.option(slugArb, { nil: null }), (slug, categorySlug) => {
            const tags = getSubcategoryTags(slug, categorySlug);

            // Property: Subcategory's own tag must always be included
            expect(tags).toContain(`${TAG_PREFIXES.subcategory}:${slug}`);
          })
        );
      });

      it("should include parent category tag when category slug is provided", () => {
        fc.assert(
          fc.property(slugArb, slugArb, (slug, categorySlug) => {
            const tags = getSubcategoryTags(slug, categorySlug);

            // Property: Parent category tag must be included when category exists
            expect(tags).toContain(`${TAG_PREFIXES.category}:${categorySlug}`);
          })
        );
      });
    });

    describe("Bundle tags", () => {
      it("should always include the bundle's own identifier tag", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const tags = getBundleTags(slug);

            // Property: Bundle's own tag must always be included
            expect(tags).toContain(`${TAG_PREFIXES.bundle}:${slug}`);
          })
        );
      });

      it("should always include all-bundles collection tag", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const tags = getBundleTags(slug);

            // Property: All-bundles collection tag must always be included
            expect(tags).toContain(COLLECTION_TAGS.allBundles);
          })
        );
      });
    });

    describe("Post tags", () => {
      it("should always include the post's own identifier tag", () => {
        fc.assert(
          fc.property(slugArb, fc.option(slugArb, { nil: null }), (slug, categorySlug) => {
            const tags = getPostTags(slug, categorySlug);

            // Property: Post's own tag must always be included
            expect(tags).toContain(`${TAG_PREFIXES.post}:${slug}`);
          })
        );
      });

      it("should always include all-posts collection tag", () => {
        fc.assert(
          fc.property(slugArb, fc.option(slugArb, { nil: null }), (slug, categorySlug) => {
            const tags = getPostTags(slug, categorySlug);

            // Property: All-posts collection tag must always be included
            expect(tags).toContain(COLLECTION_TAGS.allPosts);
          })
        );
      });

      it("should include category tag when category slug is provided", () => {
        fc.assert(
          fc.property(slugArb, slugArb, (slug, categorySlug) => {
            const tags = getPostTags(slug, categorySlug);

            // Property: Category tag must be included when category exists
            expect(tags).toContain(`${TAG_PREFIXES.category}:${categorySlug}`);
          })
        );
      });
    });

    describe("Collection tags for product", () => {
      it("should return best-sellers tag for products with best-seller tag", () => {
        const productTags = [{ tag: "best-seller" }];
        const collectionTags = getCollectionTagsForProduct(productTags);

        // Property: Best-seller tag should map to best-sellers collection
        expect(collectionTags).toContain(COLLECTION_TAGS.bestSellers);
      });

      it("should return new-arrivals tag for products with new-arrival tag", () => {
        const productTags = [{ tag: "new-arrival" }];
        const collectionTags = getCollectionTagsForProduct(productTags);

        // Property: New-arrival tag should map to new-arrivals collection
        expect(collectionTags).toContain(COLLECTION_TAGS.newArrivals);
      });

      it("should return editors-picks tag for products with featured tag", () => {
        const productTags = [{ tag: "featured" }];
        const collectionTags = getCollectionTagsForProduct(productTags);

        // Property: Featured tag should map to editors-picks collection
        expect(collectionTags).toContain(COLLECTION_TAGS.editorsPicks);
      });

      it("should return empty array for null or empty product tags", () => {
        // Property: Null or empty tags should return empty array
        expect(getCollectionTagsForProduct(null)).toEqual([]);
        expect(getCollectionTagsForProduct([])).toEqual([]);
        expect(getCollectionTagsForProduct(undefined)).toEqual([]);
      });

      it("should handle case-insensitive tag matching", () => {
        const productTags = [{ tag: "BEST-SELLER" }, { tag: "New-Arrival" }];
        const collectionTags = getCollectionTagsForProduct(productTags);

        // Property: Tag matching should be case-insensitive
        expect(collectionTags).toContain(COLLECTION_TAGS.bestSellers);
        expect(collectionTags).toContain(COLLECTION_TAGS.newArrivals);
      });

      it("should not duplicate collection tags for multiple matching product tags", () => {
        const productTags = [{ tag: "best-seller" }, { tag: "bestseller" }];
        const collectionTags = getCollectionTagsForProduct(productTags);

        // Property: Collection tags should not be duplicated
        const bestSellerCount = collectionTags.filter(
          (t) => t === COLLECTION_TAGS.bestSellers
        ).length;
        expect(bestSellerCount).toBe(1);
      });

      it("should return empty array for unrecognized tags", () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.record({
                tag: fc.stringMatching(/^[a-z]+-random-[0-9]+$/),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            (productTags) => {
              const collectionTags = getCollectionTagsForProduct(productTags);

              // Property: Unrecognized tags should not produce collection tags
              expect(collectionTags.length).toBe(0);
            }
          )
        );
      });
    });

    describe("All tag functions", () => {
      it("should return non-empty arrays for all content types", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            // Property: All tag functions must return at least one tag
            expect(getProductTags(slug).length).toBeGreaterThan(0);
            expect(getCategoryTags(slug).length).toBeGreaterThan(0);
            expect(getSubcategoryTags(slug).length).toBeGreaterThan(0);
            expect(getBundleTags(slug).length).toBeGreaterThan(0);
            expect(getPostTags(slug).length).toBeGreaterThan(0);
          })
        );
      });

      it("should return tags with correct prefix format", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const productTags = getProductTags(slug);
            const categoryTags = getCategoryTags(slug);
            const bundleTags = getBundleTags(slug);
            const postTags = getPostTags(slug);

            // Property: Tags should follow prefix:slug format or be collection tags
            const validTagPattern =
              /^(product|category|subcategory|bundle|post|collection):[a-z0-9-]+$/;

            for (const tag of productTags) {
              expect(tag).toMatch(validTagPattern);
            }
            for (const tag of categoryTags) {
              expect(tag).toMatch(validTagPattern);
            }
            for (const tag of bundleTags) {
              expect(tag).toMatch(validTagPattern);
            }
            for (const tag of postTags) {
              expect(tag).toMatch(validTagPattern);
            }
          })
        );
      });
    });
  });
});
