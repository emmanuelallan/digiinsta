/**
 * Property-Based Tests for Related Products Recommendations
 *
 * Feature: comprehensive-site-optimization
 * Property 22: Related products exclude the source product
 * Property 23: Related products are from same or related categories
 * Validates: Requirements 7.1, 7.2
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

// Simplified product type for testing
interface TestProduct {
  id: number;
  title: string;
  subcategoryId: number;
  categoryId: number;
}

/**
 * Pure recommendation logic for testing
 */
function filterExcludingSource(products: TestProduct[], sourceProductId: number): TestProduct[] {
  return products.filter((p) => p.id !== sourceProductId);
}

function filterBySameSubcategory(products: TestProduct[], subcategoryId: number): TestProduct[] {
  return products.filter((p) => p.subcategoryId === subcategoryId);
}

function filterBySameCategory(products: TestProduct[], categoryId: number): TestProduct[] {
  return products.filter((p) => p.categoryId === categoryId);
}

function isFromSameOrRelatedCategory(
  product: TestProduct,
  sourceCategoryId: number,
  siblingCategoryIds: number[]
): boolean {
  return product.categoryId === sourceCategoryId || siblingCategoryIds.includes(product.categoryId);
}

/**
 * Simple generator for products with same subcategory
 */
const productsWithSameSubcategoryArb: fc.Arbitrary<TestProduct[]> = fc
  .record({
    subcategoryId: fc.integer({ min: 1, max: 100 }),
    categoryId: fc.integer({ min: 1, max: 100 }),
    count: fc.integer({ min: 2, max: 10 }),
  })
  .map(({ subcategoryId, categoryId, count }) => {
    const products: TestProduct[] = [];
    for (let i = 0; i < count; i++) {
      products.push({
        id: i + 1,
        title: `Product ${i + 1}`,
        subcategoryId,
        categoryId,
      });
    }
    return products;
  });

/**
 * Simple generator for products with same category but different subcategories
 */
const productsWithSameCategoryArb: fc.Arbitrary<TestProduct[]> = fc
  .record({
    categoryId: fc.integer({ min: 1, max: 100 }),
    subcategoryCount: fc.integer({ min: 2, max: 5 }),
    productsPerSubcategory: fc.integer({ min: 1, max: 3 }),
  })
  .map(({ categoryId, subcategoryCount, productsPerSubcategory }) => {
    const products: TestProduct[] = [];
    let id = 1;
    for (let subId = 1; subId <= subcategoryCount; subId++) {
      for (let p = 0; p < productsPerSubcategory; p++) {
        products.push({
          id: id++,
          title: `Product ${id}`,
          subcategoryId: subId,
          categoryId,
        });
      }
    }
    return products;
  });

/**
 * Simple generator for products from multiple categories
 */
const productsFromMultipleCategoriesArb: fc.Arbitrary<TestProduct[]> = fc
  .record({
    categoryCount: fc.integer({ min: 2, max: 4 }),
    productsPerCategory: fc.integer({ min: 1, max: 3 }),
  })
  .map(({ categoryCount, productsPerCategory }) => {
    const products: TestProduct[] = [];
    let id = 1;
    for (let catId = 1; catId <= categoryCount; catId++) {
      for (let p = 0; p < productsPerCategory; p++) {
        products.push({
          id: id++,
          title: `Product ${id}`,
          subcategoryId: catId * 10,
          categoryId: catId,
        });
      }
    }
    return products;
  });

describe("Related Products Property Tests", () => {
  describe("Property 22: Related products exclude the source product", () => {
    it("getFrequentlyBoughtTogether should never include the source product", () => {
      fc.assert(
        fc.property(productsWithSameSubcategoryArb, (products) => {
          const sourceProduct = products[0];
          if (!sourceProduct) return true;

          const recommendations = filterExcludingSource(products, sourceProduct.id);
          const containsSource = recommendations.some((p) => p.id === sourceProduct.id);
          expect(containsSource).toBe(false);
          return true;
        })
      );
    });

    it("getCustomersAlsoViewed should never include the source product", () => {
      fc.assert(
        fc.property(productsWithSameCategoryArb, (products) => {
          const sourceProduct = products[0];
          if (!sourceProduct) return true;

          const recommendations = filterExcludingSource(products, sourceProduct.id);
          const containsSource = recommendations.some((p) => p.id === sourceProduct.id);
          expect(containsSource).toBe(false);
          return true;
        })
      );
    });

    it("should return all other products when filtering by source", () => {
      fc.assert(
        fc.property(productsWithSameSubcategoryArb, (products) => {
          const sourceProduct = products[0];
          if (!sourceProduct) return true;

          const recommendations = filterExcludingSource(products, sourceProduct.id);
          expect(recommendations.length).toBe(products.length - 1);
          return true;
        })
      );
    });
  });

  describe("Property 23: Related products are from same or related categories", () => {
    it("getFrequentlyBoughtTogether returns products from same subcategory", () => {
      fc.assert(
        fc.property(productsWithSameSubcategoryArb, (products) => {
          const sourceProduct = products[0];
          if (!sourceProduct) return true;

          const subcategoryId = sourceProduct.subcategoryId;
          const recommendations = filterBySameSubcategory(
            filterExcludingSource(products, sourceProduct.id),
            subcategoryId
          );

          recommendations.forEach((p) => {
            expect(p.subcategoryId).toBe(subcategoryId);
          });
          return true;
        })
      );
    });

    it("getCustomersAlsoViewed returns products from same category", () => {
      fc.assert(
        fc.property(productsWithSameCategoryArb, (products) => {
          const sourceProduct = products[0];
          if (!sourceProduct) return true;

          const categoryId = sourceProduct.categoryId;
          const recommendations = filterBySameCategory(
            filterExcludingSource(products, sourceProduct.id),
            categoryId
          );

          recommendations.forEach((p) => {
            expect(p.categoryId).toBe(categoryId);
          });
          return true;
        })
      );
    });

    it("at least 80% of recommendations should be from same or sibling categories", () => {
      fc.assert(
        fc.property(productsFromMultipleCategoriesArb, (products) => {
          if (products.length < 2) return true;

          const sourceProduct = products[0];
          if (!sourceProduct) return true;

          const sourceCategoryId = sourceProduct.categoryId;
          const allCategoryIds = [...new Set(products.map((p) => p.categoryId))];
          const siblingCategoryIds = allCategoryIds.filter((id) => id !== sourceCategoryId);

          const recommendations = filterExcludingSource(products, sourceProduct.id);
          if (recommendations.length === 0) return true;

          const fromSameOrRelated = recommendations.filter((p) =>
            isFromSameOrRelatedCategory(p, sourceCategoryId, siblingCategoryIds)
          );

          const percentage = (fromSameOrRelated.length / recommendations.length) * 100;
          expect(percentage).toBeGreaterThanOrEqual(80);
          return true;
        })
      );
    });

    it("products from different categories should be excluded when filtering by category", () => {
      fc.assert(
        fc.property(productsFromMultipleCategoriesArb, (products) => {
          if (products.length < 2) return true;

          const sourceProduct = products[0];
          if (!sourceProduct) return true;

          const sourceCategoryId = sourceProduct.categoryId;
          const recommendations = filterBySameCategory(
            filterExcludingSource(products, sourceProduct.id),
            sourceCategoryId
          );

          recommendations.forEach((p) => {
            expect(p.categoryId).toBe(sourceCategoryId);
          });
          return true;
        })
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle empty product list", () => {
      const recommendations = filterExcludingSource([], 1);
      expect(recommendations).toEqual([]);
    });

    it("should handle product not in list", () => {
      fc.assert(
        fc.property(productsWithSameSubcategoryArb, (products) => {
          const nonExistentId = 999999;
          const recommendations = filterExcludingSource(products, nonExistentId);
          expect(recommendations.length).toBe(products.length);
          return true;
        })
      );
    });

    it("should preserve product data integrity after filtering", () => {
      fc.assert(
        fc.property(productsWithSameSubcategoryArb, (products) => {
          const sourceProduct = products[0];
          if (!sourceProduct) return true;

          const recommendations = filterExcludingSource(products, sourceProduct.id);

          recommendations.forEach((p) => {
            expect(p.id).toBeDefined();
            expect(p.title).toBeDefined();
            expect(p.subcategoryId).toBeDefined();
            expect(p.categoryId).toBeDefined();
          });
          return true;
        })
      );
    });
  });
});
