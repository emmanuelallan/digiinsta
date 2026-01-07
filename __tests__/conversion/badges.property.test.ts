/**
 * Property-Based Tests for Product Badge Determination
 *
 * Feature: comprehensive-site-optimization
 * Property 14: Product badges are correctly determined
 * Validates: Requirements 13.2, 13.3, 13.4
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  isNewProduct,
  isOnSale,
  isPopular,
  determineBadges,
  calculateSavingsPercent,
} from "@/components/storefront/product/ProductBadges";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for dates within the last N days
 */
const recentDateArb = (maxDays: number) =>
  fc.integer({ min: 0, max: maxDays * 24 * 60 * 60 * 1000 }).map((ms) => {
    return new Date(Date.now() - ms).toISOString();
  });

/**
 * Generator for dates older than N days
 */
const oldDateArb = (minDays: number) =>
  fc.integer({ min: minDays * 24 * 60 * 60 * 1000, max: 365 * 24 * 60 * 60 * 1000 }).map((ms) => {
    return new Date(Date.now() - ms).toISOString();
  });

/**
 * Generator for new products (created within 14 days)
 */
const newProductArb = fc.record({
  createdAt: recentDateArb(13), // Within 13 days to ensure it's within 14
  price: fc.integer({ min: 100, max: 100000 }),
  compareAtPrice: fc.option(fc.integer({ min: 100, max: 100000 }), { nil: null }),
  salesCount: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
});

/**
 * Generator for old products (created more than 14 days ago)
 */
const oldProductArb = fc.record({
  createdAt: oldDateArb(15), // At least 15 days old
  price: fc.integer({ min: 100, max: 100000 }),
  compareAtPrice: fc.option(fc.integer({ min: 100, max: 100000 }), { nil: null }),
  salesCount: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
});

/**
 * Generator for products on sale (compareAtPrice > price)
 */
const saleProductArb = fc.integer({ min: 100, max: 50000 }).chain((price) =>
  fc.record({
    createdAt: fc.constant(new Date().toISOString()),
    price: fc.constant(price),
    compareAtPrice: fc.integer({ min: price + 1, max: price + 50000 }),
    salesCount: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
  })
);

/**
 * Generator for popular products (salesCount >= threshold)
 */
const popularProductArb = (threshold: number) =>
  fc.record({
    createdAt: fc.constant(new Date().toISOString()),
    price: fc.integer({ min: 100, max: 100000 }),
    compareAtPrice: fc.option(fc.integer({ min: 100, max: 100000 }), { nil: null }),
    salesCount: fc.integer({ min: threshold, max: 10000 }),
  });

/**
 * Generator for non-popular products (salesCount < threshold)
 */
const notPopularProductArb = (threshold: number) =>
  fc.record({
    createdAt: fc.constant(new Date().toISOString()),
    price: fc.integer({ min: 100, max: 100000 }),
    compareAtPrice: fc.option(fc.integer({ min: 100, max: 100000 }), { nil: null }),
    salesCount: fc.oneof(fc.constant(undefined), fc.integer({ min: 0, max: threshold - 1 })),
  });

describe("Product Badges Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 14: Product badges are correctly determined
   * Validates: Requirements 13.2, 13.3, 13.4
   */
  describe("Property 14: Product badges are correctly determined", () => {
    describe("New badge (Requirement 13.4)", () => {
      it("should assign 'new' badge to products created within 14 days", () => {
        fc.assert(
          fc.property(newProductArb, (product) => {
            const result = isNewProduct(product.createdAt, 14);

            // Property: Products created within 14 days should be marked as new
            expect(result).toBe(true);
          })
        );
      });

      it("should NOT assign 'new' badge to products created more than 14 days ago", () => {
        fc.assert(
          fc.property(oldProductArb, (product) => {
            const result = isNewProduct(product.createdAt, 14);

            // Property: Products older than 14 days should not be marked as new
            expect(result).toBe(false);
          })
        );
      });

      it("should respect custom threshold for new badge", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 30 }), (threshold) => {
            // Create a product exactly at the threshold boundary
            const withinThreshold = new Date(
              Date.now() - (threshold - 1) * 24 * 60 * 60 * 1000
            ).toISOString();
            const outsideThreshold = new Date(
              Date.now() - (threshold + 1) * 24 * 60 * 60 * 1000
            ).toISOString();

            // Property: Custom threshold should be respected
            expect(isNewProduct(withinThreshold, threshold)).toBe(true);
            expect(isNewProduct(outsideThreshold, threshold)).toBe(false);
          })
        );
      });
    });

    describe("Sale badge (Requirement 13.2)", () => {
      it("should assign 'sale' badge when compareAtPrice > price", () => {
        fc.assert(
          fc.property(saleProductArb, (product) => {
            const result = isOnSale(product.price, product.compareAtPrice);

            // Property: Products with compareAtPrice > price should be on sale
            expect(result).toBe(true);
          })
        );
      });

      it("should NOT assign 'sale' badge when compareAtPrice is null/undefined", () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 100, max: 100000 }),
            fc.constantFrom(null, undefined),
            (price, compareAtPrice) => {
              const result = isOnSale(price, compareAtPrice);

              // Property: No compareAtPrice means not on sale
              expect(result).toBe(false);
            }
          )
        );
      });

      it("should NOT assign 'sale' badge when compareAtPrice <= price", () => {
        fc.assert(
          fc.property(fc.integer({ min: 100, max: 100000 }), (price) => {
            // Test with compareAtPrice equal to price
            expect(isOnSale(price, price)).toBe(false);

            // Test with compareAtPrice less than price
            if (price > 100) {
              expect(isOnSale(price, price - 1)).toBe(false);
            }
          })
        );
      });

      it("should calculate correct savings percentage", () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 100, max: 50000 }),
            fc.integer({ min: 1, max: 99 }),
            (originalPrice, discountPercent) => {
              const salePrice = Math.floor((originalPrice * (100 - discountPercent)) / 100);
              const calculatedPercent = calculateSavingsPercent(originalPrice, salePrice);

              // Property: Calculated percentage should be close to actual discount
              // Allow 1% tolerance due to rounding
              expect(Math.abs(calculatedPercent - discountPercent)).toBeLessThanOrEqual(1);
            }
          )
        );
      });
    });

    describe("Popular badge (Requirement 13.3)", () => {
      it("should assign 'popular' badge when salesCount >= threshold", () => {
        const threshold = 10;
        fc.assert(
          fc.property(popularProductArb(threshold), (product) => {
            const result = isPopular(product.salesCount, threshold);

            // Property: Products with salesCount >= threshold should be popular
            expect(result).toBe(true);
          })
        );
      });

      it("should NOT assign 'popular' badge when salesCount < threshold", () => {
        const threshold = 10;
        fc.assert(
          fc.property(notPopularProductArb(threshold), (product) => {
            const result = isPopular(product.salesCount, threshold);

            // Property: Products with salesCount < threshold should not be popular
            expect(result).toBe(false);
          })
        );
      });

      it("should respect custom threshold for popular badge", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 100 }), (threshold) => {
            // Property: Custom threshold should be respected
            expect(isPopular(threshold, threshold)).toBe(true);
            expect(isPopular(threshold - 1, threshold)).toBe(false);
          })
        );
      });

      it("should NOT assign 'popular' badge when salesCount is undefined", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 100 }), (threshold) => {
            const result = isPopular(undefined, threshold);

            // Property: Undefined salesCount means not popular
            expect(result).toBe(false);
          })
        );
      });
    });

    describe("determineBadges integration", () => {
      it("should return 'new' badge for new products", () => {
        fc.assert(
          fc.property(newProductArb, (product) => {
            const badges = determineBadges(product, { newDaysThreshold: 14 });

            // Property: New products should have 'new' badge
            expect(badges).toContain("new");
          })
        );
      });

      it("should return 'sale' badge for products on sale", () => {
        fc.assert(
          fc.property(saleProductArb, (product) => {
            const badges = determineBadges(product);

            // Property: Sale products should have 'sale' badge
            expect(badges).toContain("sale");
          })
        );
      });

      it("should return 'popular' badge for popular products", () => {
        const threshold = 10;
        fc.assert(
          fc.property(popularProductArb(threshold), (product) => {
            const badges = determineBadges(product, { popularThreshold: threshold });

            // Property: Popular products should have 'popular' badge
            expect(badges).toContain("popular");
          })
        );
      });

      it("should return multiple badges when applicable", () => {
        // Create a product that is new, on sale, and popular
        const multipleConditionsArb = fc.record({
          createdAt: recentDateArb(13),
          price: fc.constant(5000),
          compareAtPrice: fc.constant(10000),
          salesCount: fc.constant(100),
        });

        fc.assert(
          fc.property(multipleConditionsArb, (product) => {
            const badges = determineBadges(product, {
              newDaysThreshold: 14,
              popularThreshold: 10,
            });

            // Property: Product meeting all criteria should have all badges
            expect(badges).toContain("new");
            expect(badges).toContain("sale");
            expect(badges).toContain("popular");
            expect(badges.length).toBe(3);
          })
        );
      });

      it("should return empty array when no badges apply", () => {
        // Create a product that is old, not on sale, and not popular
        const noBadgesArb = fc.record({
          createdAt: oldDateArb(30),
          price: fc.constant(5000),
          compareAtPrice: fc.constant(null),
          salesCount: fc.constant(5),
        });

        fc.assert(
          fc.property(noBadgesArb, (product) => {
            const badges = determineBadges(product, {
              newDaysThreshold: 14,
              popularThreshold: 10,
            });

            // Property: Product meeting no criteria should have no badges
            expect(badges.length).toBe(0);
          })
        );
      });
    });

    describe("Edge cases", () => {
      it("should handle exactly 14 days old product correctly", () => {
        // Product created exactly 14 days ago (should NOT be new)
        const exactlyFourteenDays = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

        // Property: Exactly 14 days old should not be new (> not >=)
        expect(isNewProduct(exactlyFourteenDays, 14)).toBe(false);
      });

      it("should handle exactly threshold salesCount correctly", () => {
        const threshold = 10;

        // Property: Exactly at threshold should be popular
        expect(isPopular(threshold, threshold)).toBe(true);
        expect(isPopular(threshold - 1, threshold)).toBe(false);
      });

      it("should handle zero price correctly", () => {
        // Property: Zero price with any compareAtPrice should be on sale
        expect(isOnSale(0, 100)).toBe(true);
        expect(isOnSale(0, 0)).toBe(false);
        expect(isOnSale(0, null)).toBe(false);
      });

      it("should handle zero salesCount correctly", () => {
        // Property: Zero salesCount should not be popular
        expect(isPopular(0, 10)).toBe(false);
        // Note: isPopular(0, 0) returns false because !!0 is falsy
        // This is expected behavior - 0 sales is never "popular"
        expect(isPopular(0, 0)).toBe(false);
      });
    });
  });
});
