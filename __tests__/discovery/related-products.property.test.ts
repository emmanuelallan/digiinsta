/**
 * Property-Based Tests for Related Products Relevance
 *
 * Feature: sanity-migration
 * Property 10: Related Products Relevance
 * Validates: Requirements 11.2
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  isRelatedProduct,
  filterRelatedProducts,
  type RelatedProductInput,
} from "../../lib/sanity/queries/discovery-utils";

fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

const productIdArb = fc.uuid();
const subcategoryIdArb = fc.uuid();

const tagArb = fc
  .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789"), {
    minLength: 3,
    maxLength: 20,
  })
  .map((chars) => chars.join(""));

const tagsArb: fc.Arbitrary<string[]> = fc.array(tagArb, { minLength: 0, maxLength: 5 });

const productInputArb = (): fc.Arbitrary<RelatedProductInput> =>
  fc.record({
    _id: productIdArb,
    subcategory: fc.record({ _id: subcategoryIdArb }),
    tags: tagsArb,
  });

describe("Related Products Property Tests", () => {
  describe("Property 10: Related Products Relevance", () => {
    it("should return false when comparing a product to itself", () => {
      fc.assert(
        fc.property(productInputArb(), (product) => {
          const result = isRelatedProduct(product, product);
          expect(result).toBe(false);
        })
      );
    });

    it("should return true for products in the same subcategory", () => {
      fc.assert(
        fc.property(
          subcategoryIdArb,
          productIdArb,
          productIdArb,
          tagsArb,
          tagsArb,
          (subcatId, id1, id2, tags1, tags2) => {
            fc.pre(id1 !== id2);

            const product1: RelatedProductInput = {
              _id: id1,
              subcategory: { _id: subcatId },
              tags: tags1,
            };
            const product2: RelatedProductInput = {
              _id: id2,
              subcategory: { _id: subcatId },
              tags: tags2,
            };

            const result = isRelatedProduct(product1, product2);
            expect(result).toBe(true);
          }
        )
      );
    });

    it("should return true for products with overlapping tags", () => {
      fc.assert(
        fc.property(
          productIdArb,
          productIdArb,
          subcategoryIdArb,
          subcategoryIdArb,
          tagArb,
          tagsArb,
          tagsArb,
          (id1, id2, subcat1, subcat2, sharedTag, extraTags1, extraTags2) => {
            fc.pre(id1 !== id2);
            fc.pre(subcat1 !== subcat2);

            const product1: RelatedProductInput = {
              _id: id1,
              subcategory: { _id: subcat1 },
              tags: [sharedTag, ...extraTags1],
            };
            const product2: RelatedProductInput = {
              _id: id2,
              subcategory: { _id: subcat2 },
              tags: [sharedTag, ...extraTags2],
            };

            const result = isRelatedProduct(product1, product2);
            expect(result).toBe(true);
          }
        )
      );
    });

    it("should return false for products with no shared subcategory or tags", () => {
      fc.assert(
        fc.property(
          productIdArb,
          productIdArb,
          subcategoryIdArb,
          subcategoryIdArb,
          tagsArb,
          tagsArb,
          (id1, id2, subcat1, subcat2, tags1, tags2) => {
            fc.pre(id1 !== id2);
            fc.pre(subcat1 !== subcat2);
            const hasOverlap = tags1.some((t) => tags2.includes(t));
            fc.pre(!hasOverlap);

            const product1: RelatedProductInput = {
              _id: id1,
              subcategory: { _id: subcat1 },
              tags: tags1,
            };
            const product2: RelatedProductInput = {
              _id: id2,
              subcategory: { _id: subcat2 },
              tags: tags2,
            };

            const result = isRelatedProduct(product1, product2);
            expect(result).toBe(false);
          }
        )
      );
    });

    it("should be symmetric - if A is related to B, then B is related to A", () => {
      fc.assert(
        fc.property(productInputArb(), productInputArb(), (product1, product2) => {
          fc.pre(product1._id !== product2._id);

          const result1 = isRelatedProduct(product1, product2);
          const result2 = isRelatedProduct(product2, product1);

          expect(result1).toBe(result2);
        })
      );
    });
  });

  describe("filterRelatedProducts", () => {
    it("should exclude the source product from results", () => {
      fc.assert(
        fc.property(fc.array(productInputArb(), { minLength: 1, maxLength: 10 }), (products) => {
          const sourceProduct = products[0];
          const result = filterRelatedProducts(products, sourceProduct);
          expect(result.every((p) => p._id !== sourceProduct._id)).toBe(true);
        })
      );
    });

    it("should only include products that are actually related", () => {
      fc.assert(
        fc.property(fc.array(productInputArb(), { minLength: 2, maxLength: 10 }), (products) => {
          const sourceProduct = products[0];
          const result = filterRelatedProducts(products, sourceProduct);

          result.forEach((p) => {
            expect(isRelatedProduct(p, sourceProduct)).toBe(true);
          });
        })
      );
    });
  });
});
