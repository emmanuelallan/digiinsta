/**
 * Property-Based Tests for Path Computation
 *
 * Feature: cache-revalidation-fix
 * Property 1: Path Computation Correctness
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getProductPaths,
  getCategoryPaths,
  getSubcategoryPaths,
  getBundlePaths,
  getPostPaths,
  type SubcategoryInfo,
} from "../../lib/revalidation/paths";

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
 * Generator for subcategory info
 */
const subcategoryInfoArb: fc.Arbitrary<SubcategoryInfo> = fc.record({
  slug: slugArb,
  category: fc.option(
    fc.record({
      slug: slugArb,
    }),
    { nil: null }
  ),
});

describe("Path Computation Property Tests", () => {
  /**
   * Feature: cache-revalidation-fix
   * Property 1: Path Computation Correctness
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  describe("Property 1: Path Computation Correctness", () => {
    describe("Product paths", () => {
      it("should always include the direct product page path", () => {
        fc.assert(
          fc.property(
            slugArb,
            fc.option(subcategoryInfoArb, { nil: null }),
            (slug, subcategory) => {
              const paths = getProductPaths(slug, subcategory);

              // Property: Direct product page path must always be included
              expect(paths).toContain(`/products/${slug}`);
            }
          )
        );
      });

      it("should always include the products listing page", () => {
        fc.assert(
          fc.property(
            slugArb,
            fc.option(subcategoryInfoArb, { nil: null }),
            (slug, subcategory) => {
              const paths = getProductPaths(slug, subcategory);

              // Property: Products listing page must always be included
              expect(paths).toContain("/products");
            }
          )
        );
      });

      it("should include subcategory path when subcategory is provided", () => {
        fc.assert(
          fc.property(slugArb, subcategoryInfoArb, (slug, subcategory) => {
            const paths = getProductPaths(slug, subcategory);

            // Property: Subcategory path must be included when subcategory exists
            expect(paths).toContain(`/subcategories/${subcategory.slug}`);
          })
        );
      });

      it("should include category path when category is provided via subcategory", () => {
        fc.assert(
          fc.property(slugArb, slugArb, slugArb, (productSlug, subcategorySlug, categorySlug) => {
            const subcategory: SubcategoryInfo = {
              slug: subcategorySlug,
              category: { slug: categorySlug },
            };
            const paths = getProductPaths(productSlug, subcategory);

            // Property: Category path must be included when category exists
            expect(paths).toContain(`/categories/${categorySlug}`);
          })
        );
      });

      it("should always include homepage for product updates", () => {
        fc.assert(
          fc.property(
            slugArb,
            fc.option(subcategoryInfoArb, { nil: null }),
            (slug, subcategory) => {
              const paths = getProductPaths(slug, subcategory);

              // Property: Homepage must always be included (products may appear in featured sections)
              expect(paths).toContain("/");
            }
          )
        );
      });

      it("should include collection pages for product updates", () => {
        fc.assert(
          fc.property(
            slugArb,
            fc.option(subcategoryInfoArb, { nil: null }),
            (slug, subcategory) => {
              const paths = getProductPaths(slug, subcategory);

              // Property: Collection pages must be included
              expect(paths).toContain("/best-sellers");
              expect(paths).toContain("/new-arrivals");
            }
          )
        );
      });
    });

    describe("Category paths", () => {
      it("should always include the direct category page path", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const paths = getCategoryPaths(slug);

            // Property: Direct category page path must always be included
            expect(paths).toContain(`/categories/${slug}`);
          })
        );
      });

      it("should always include the categories listing page", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const paths = getCategoryPaths(slug);

            // Property: Categories listing page must always be included
            expect(paths).toContain("/categories");
          })
        );
      });

      it("should always include homepage for category updates", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const paths = getCategoryPaths(slug);

            // Property: Homepage must always be included (categories appear in navigation)
            expect(paths).toContain("/");
          })
        );
      });
    });

    describe("Subcategory paths", () => {
      it("should always include the direct subcategory page path", () => {
        fc.assert(
          fc.property(slugArb, fc.option(slugArb, { nil: null }), (slug, categorySlug) => {
            const paths = getSubcategoryPaths(slug, categorySlug);

            // Property: Direct subcategory page path must always be included
            expect(paths).toContain(`/subcategories/${slug}`);
          })
        );
      });

      it("should include parent category path when category slug is provided", () => {
        fc.assert(
          fc.property(slugArb, slugArb, (slug, categorySlug) => {
            const paths = getSubcategoryPaths(slug, categorySlug);

            // Property: Parent category path must be included when category exists
            expect(paths).toContain(`/categories/${categorySlug}`);
          })
        );
      });

      it("should always include the categories listing page", () => {
        fc.assert(
          fc.property(slugArb, fc.option(slugArb, { nil: null }), (slug, categorySlug) => {
            const paths = getSubcategoryPaths(slug, categorySlug);

            // Property: Categories listing page must always be included
            expect(paths).toContain("/categories");
          })
        );
      });
    });

    describe("Bundle paths", () => {
      it("should always include the direct bundle page path", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const paths = getBundlePaths(slug);

            // Property: Direct bundle page path must always be included
            expect(paths).toContain(`/bundles/${slug}`);
          })
        );
      });

      it("should always include the bundles listing page", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const paths = getBundlePaths(slug);

            // Property: Bundles listing page must always be included
            expect(paths).toContain("/bundles");
          })
        );
      });

      it("should always include homepage for bundle updates", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const paths = getBundlePaths(slug);

            // Property: Homepage must always be included (bundles may appear in featured sections)
            expect(paths).toContain("/");
          })
        );
      });
    });

    describe("Post paths", () => {
      it("should always include the direct post page path", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const paths = getPostPaths(slug);

            // Property: Direct post page path must always be included
            expect(paths).toContain(`/blog/${slug}`);
          })
        );
      });

      it("should always include the blog listing page", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const paths = getPostPaths(slug);

            // Property: Blog listing page must always be included
            expect(paths).toContain("/blog");
          })
        );
      });

      it("should always include homepage for post updates", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            const paths = getPostPaths(slug);

            // Property: Homepage must always be included (posts may appear in featured sections)
            expect(paths).toContain("/");
          })
        );
      });
    });

    describe("All path functions", () => {
      it("should return non-empty arrays for all content types", () => {
        fc.assert(
          fc.property(slugArb, (slug) => {
            // Property: All path functions must return at least one path
            expect(getProductPaths(slug).length).toBeGreaterThan(0);
            expect(getCategoryPaths(slug).length).toBeGreaterThan(0);
            expect(getSubcategoryPaths(slug).length).toBeGreaterThan(0);
            expect(getBundlePaths(slug).length).toBeGreaterThan(0);
            expect(getPostPaths(slug).length).toBeGreaterThan(0);
          })
        );
      });

      it("should return paths that start with /", () => {
        fc.assert(
          fc.property(
            slugArb,
            fc.option(subcategoryInfoArb, { nil: null }),
            (slug, subcategory) => {
              const allPaths = [
                ...getProductPaths(slug, subcategory),
                ...getCategoryPaths(slug),
                ...getSubcategoryPaths(slug, subcategory?.category?.slug),
                ...getBundlePaths(slug),
                ...getPostPaths(slug),
              ];

              // Property: All paths must start with /
              for (const path of allPaths) {
                expect(path.startsWith("/")).toBe(true);
              }
            }
          )
        );
      });
    });
  });
});
