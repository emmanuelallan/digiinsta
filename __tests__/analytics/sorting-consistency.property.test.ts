/**
 * Property-Based Tests for Sorting Consistency
 *
 * Feature: sanity-migration
 * Property 9: Sorting Consistency
 * Validates: Requirements 2.5, 11.3, 11.4, 14.2
 *
 * Tests that various collections maintain consistent sorting:
 * - Categories ordered by displayOrder ascending
 * - Hero slides ordered by displayOrder ascending
 * - New arrivals ordered by _createdAt descending
 * - Best sellers ordered by sales count descending
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Pure sorting functions for testing
 * These mirror the sorting logic used in GROQ queries and analytics
 */

/**
 * Sort items by displayOrder ascending (for categories, hero slides)
 */
export function sortByDisplayOrderAsc<T extends { displayOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Sort items by createdAt descending (for new arrivals)
 */
export function sortByCreatedAtDesc<T extends { _createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a._createdAt).getTime();
    const dateB = new Date(b._createdAt).getTime();
    return dateB - dateA;
  });
}

/**
 * Sort items by sales count descending (for best sellers)
 */
export function sortBySalesCountDesc<T extends { salesCount: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.salesCount - a.salesCount);
}

/**
 * Sort items by sales count descending, then by revenue descending (for best sellers with tiebreaker)
 */
export function sortBySalesCountAndRevenueDesc<
  T extends { salesCount: number; totalRevenue: number },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (b.salesCount !== a.salesCount) {
      return b.salesCount - a.salesCount;
    }
    return b.totalRevenue - a.totalRevenue;
  });
}

/**
 * Check if an array is sorted by a comparator function
 */
function isSorted<T>(items: T[], comparator: (a: T, b: T) => number): boolean {
  for (let i = 1; i < items.length; i++) {
    if (comparator(items[i - 1], items[i]) > 0) {
      return false;
    }
  }
  return true;
}

/**
 * Generators for test data
 */

// Generate a category-like object with displayOrder
const categoryArb = fc.record({
  _id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  displayOrder: fc.integer({ min: 0, max: 1000 }),
  status: fc.constant("active" as const),
});

// Generate a hero slide-like object with displayOrder
const heroSlideArb = fc.record({
  _id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  displayOrder: fc.integer({ min: 0, max: 100 }),
  status: fc.constant("active" as const),
});

// Generate a product-like object with _createdAt
const productArb = fc.record({
  _id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  _createdAt: fc
    .integer({
      min: new Date("2020-01-01").getTime(),
      max: new Date("2025-12-31").getTime(),
    })
    .map((timestamp) => new Date(timestamp).toISOString()),
  status: fc.constant("active" as const),
});

// Generate a best seller item with sales count and revenue
const bestSellerArb = fc.record({
  sanityId: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  itemType: fc.constantFrom("product", "bundle") as fc.Arbitrary<"product" | "bundle">,
  salesCount: fc.integer({ min: 0, max: 10000 }),
  totalRevenue: fc.integer({ min: 0, max: 10000000 }), // in cents
});

describe("Sorting Consistency Property Tests", () => {
  /**
   * Feature: sanity-migration
   * Property 9: Sorting Consistency
   * Validates: Requirements 2.5 (Categories ordered by displayOrder)
   */
  describe("Categories sorted by displayOrder ascending", () => {
    it("should sort categories by displayOrder in ascending order", () => {
      fc.assert(
        fc.property(fc.array(categoryArb, { minLength: 0, maxLength: 50 }), (categories) => {
          const sorted = sortByDisplayOrderAsc(categories);

          // Property: Result should be sorted by displayOrder ascending
          expect(isSorted(sorted, (a, b) => a.displayOrder - b.displayOrder)).toBe(true);
        })
      );
    });

    it("should preserve all items when sorting categories", () => {
      fc.assert(
        fc.property(fc.array(categoryArb, { minLength: 0, maxLength: 50 }), (categories) => {
          const sorted = sortByDisplayOrderAsc(categories);

          // Property: Sorting should not add or remove items
          expect(sorted.length).toBe(categories.length);

          // Property: All original items should be present
          const originalIds = new Set(categories.map((c) => c._id));
          const sortedIds = new Set(sorted.map((c) => c._id));
          expect(sortedIds).toEqual(originalIds);
        })
      );
    });

    it("should be idempotent - sorting twice gives same result", () => {
      fc.assert(
        fc.property(fc.array(categoryArb, { minLength: 0, maxLength: 50 }), (categories) => {
          const sortedOnce = sortByDisplayOrderAsc(categories);
          const sortedTwice = sortByDisplayOrderAsc(sortedOnce);

          // Property: Sorting is idempotent
          expect(sortedTwice).toEqual(sortedOnce);
        })
      );
    });
  });

  /**
   * Feature: sanity-migration
   * Property 9: Sorting Consistency
   * Validates: Requirements 14.2 (Hero slides ordered by displayOrder)
   */
  describe("Hero slides sorted by displayOrder ascending", () => {
    it("should sort hero slides by displayOrder in ascending order", () => {
      fc.assert(
        fc.property(fc.array(heroSlideArb, { minLength: 0, maxLength: 20 }), (slides) => {
          const sorted = sortByDisplayOrderAsc(slides);

          // Property: Result should be sorted by displayOrder ascending
          expect(isSorted(sorted, (a, b) => a.displayOrder - b.displayOrder)).toBe(true);
        })
      );
    });

    it("should handle slides with same displayOrder", () => {
      fc.assert(
        fc.property(
          fc.array(heroSlideArb, { minLength: 2, maxLength: 20 }),
          fc.integer({ min: 0, max: 100 }),
          (slides, sharedOrder) => {
            // Set all slides to same displayOrder
            const sameOrderSlides = slides.map((s) => ({ ...s, displayOrder: sharedOrder }));
            const sorted = sortByDisplayOrderAsc(sameOrderSlides);

            // Property: All items should still be present
            expect(sorted.length).toBe(sameOrderSlides.length);

            // Property: All items should have the same displayOrder
            expect(sorted.every((s) => s.displayOrder === sharedOrder)).toBe(true);
          }
        )
      );
    });
  });

  /**
   * Feature: sanity-migration
   * Property 9: Sorting Consistency
   * Validates: Requirements 11.3 (New arrivals ordered by _createdAt descending)
   */
  describe("New arrivals sorted by _createdAt descending", () => {
    it("should sort products by _createdAt in descending order (newest first)", () => {
      fc.assert(
        fc.property(fc.array(productArb, { minLength: 0, maxLength: 50 }), (products) => {
          const sorted = sortByCreatedAtDesc(products);

          // Property: Result should be sorted by _createdAt descending
          expect(
            isSorted(sorted, (a, b) => {
              const dateA = new Date(a._createdAt).getTime();
              const dateB = new Date(b._createdAt).getTime();
              return dateB - dateA;
            })
          ).toBe(true);
        })
      );
    });

    it("should place newest products first", () => {
      fc.assert(
        fc.property(fc.array(productArb, { minLength: 2, maxLength: 50 }), (products) => {
          const sorted = sortByCreatedAtDesc(products);

          if (sorted.length >= 2) {
            const firstDate = new Date(sorted[0]._createdAt).getTime();
            const lastDate = new Date(sorted[sorted.length - 1]._createdAt).getTime();

            // Property: First item should be newer than or equal to last item
            expect(firstDate).toBeGreaterThanOrEqual(lastDate);
          }
        })
      );
    });

    it("should preserve all items when sorting by date", () => {
      fc.assert(
        fc.property(fc.array(productArb, { minLength: 0, maxLength: 50 }), (products) => {
          const sorted = sortByCreatedAtDesc(products);

          // Property: Sorting should not add or remove items
          expect(sorted.length).toBe(products.length);
        })
      );
    });
  });

  /**
   * Feature: sanity-migration
   * Property 9: Sorting Consistency
   * Validates: Requirements 11.4 (Best sellers ordered by sales count descending)
   */
  describe("Best sellers sorted by sales count descending", () => {
    it("should sort best sellers by salesCount in descending order", () => {
      fc.assert(
        fc.property(fc.array(bestSellerArb, { minLength: 0, maxLength: 50 }), (items) => {
          const sorted = sortBySalesCountDesc(items);

          // Property: Result should be sorted by salesCount descending
          expect(isSorted(sorted, (a, b) => b.salesCount - a.salesCount)).toBe(true);
        })
      );
    });

    it("should place highest selling items first", () => {
      fc.assert(
        fc.property(fc.array(bestSellerArb, { minLength: 2, maxLength: 50 }), (items) => {
          const sorted = sortBySalesCountDesc(items);

          if (sorted.length >= 2) {
            // Property: First item should have highest or equal sales count
            expect(sorted[0].salesCount).toBeGreaterThanOrEqual(
              sorted[sorted.length - 1].salesCount
            );
          }
        })
      );
    });

    it("should use revenue as tiebreaker when sales counts are equal", () => {
      fc.assert(
        fc.property(
          fc.array(bestSellerArb, { minLength: 2, maxLength: 50 }),
          fc.integer({ min: 1, max: 1000 }),
          (items, sharedSalesCount) => {
            // Set all items to same sales count
            const sameSalesItems = items.map((item) => ({
              ...item,
              salesCount: sharedSalesCount,
            }));

            const sorted = sortBySalesCountAndRevenueDesc(sameSalesItems);

            // Property: When sales counts are equal, should be sorted by revenue descending
            expect(
              isSorted(sorted, (a, b) => {
                if (b.salesCount !== a.salesCount) {
                  return b.salesCount - a.salesCount;
                }
                return b.totalRevenue - a.totalRevenue;
              })
            ).toBe(true);
          }
        )
      );
    });

    it("should be idempotent - sorting twice gives same result", () => {
      fc.assert(
        fc.property(fc.array(bestSellerArb, { minLength: 0, maxLength: 50 }), (items) => {
          const sortedOnce = sortBySalesCountDesc(items);
          const sortedTwice = sortBySalesCountDesc(sortedOnce);

          // Property: Sorting is idempotent
          expect(sortedTwice).toEqual(sortedOnce);
        })
      );
    });
  });

  /**
   * Cross-cutting sorting properties
   */
  describe("General sorting properties", () => {
    it("should handle empty arrays gracefully", () => {
      // Property: Empty arrays should return empty arrays
      expect(sortByDisplayOrderAsc([])).toEqual([]);
      expect(sortByCreatedAtDesc([])).toEqual([]);
      expect(sortBySalesCountDesc([])).toEqual([]);
    });

    it("should handle single-item arrays", () => {
      fc.assert(
        fc.property(categoryArb, (category) => {
          const sorted = sortByDisplayOrderAsc([category]);

          // Property: Single item array should return same item
          expect(sorted.length).toBe(1);
          expect(sorted[0]).toEqual(category);
        })
      );
    });

    it("should not mutate original array", () => {
      fc.assert(
        fc.property(fc.array(categoryArb, { minLength: 1, maxLength: 20 }), (categories) => {
          const original = [...categories];
          sortByDisplayOrderAsc(categories);

          // Property: Original array should not be mutated
          expect(categories).toEqual(original);
        })
      );
    });
  });
});
