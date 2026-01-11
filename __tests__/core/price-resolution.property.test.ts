/**
 * Property-Based Tests for Price Resolution
 *
 * Feature: sanity-migration
 * Property 2: Price Inheritance Resolution
 * Property 3: Sale Detection Accuracy
 * Validates: Requirements 2.3, 3.2, 3.3, 5.2, 6.6
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  resolveProductPrice,
  resolveBundlePrice,
  type ProductPriceInput,
  type SubcategoryPriceInput,
  type BundlePriceInput,
} from "../../lib/pricing/resolver";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generators for price inputs
 */
const priceArb = fc.integer({ min: 0, max: 10000000 }); // 0 to $100,000 in cents
const optionalPriceArb = fc.option(priceArb, { nil: null });

const productPriceInputArb: fc.Arbitrary<ProductPriceInput> = fc.record({
  customPrice: optionalPriceArb,
  compareAtPrice: optionalPriceArb,
});

const subcategoryPriceInputArb: fc.Arbitrary<SubcategoryPriceInput> = fc.record({
  defaultPrice: priceArb,
  compareAtPrice: optionalPriceArb,
});

const bundlePriceInputArb: fc.Arbitrary<BundlePriceInput> = fc.record({
  price: priceArb,
  compareAtPrice: optionalPriceArb,
});

describe("Price Resolution Property Tests", () => {
  /**
   * Feature: sanity-migration
   * Property 2: Price Inheritance Resolution
   * Validates: Requirements 2.3, 3.2, 3.3
   */
  describe("Property 2: Price Inheritance Resolution", () => {
    it("should use customPrice when defined", () => {
      fc.assert(
        fc.property(
          priceArb,
          subcategoryPriceInputArb,
          optionalPriceArb,
          (customPrice, subcategory, compareAtPrice) => {
            const product: ProductPriceInput = { customPrice, compareAtPrice };
            const result = resolveProductPrice(product, subcategory);

            // Property: When customPrice is defined, effectivePrice equals customPrice
            expect(result.price).toBe(customPrice);
          }
        )
      );
    });

    it("should use subcategory defaultPrice when customPrice is undefined", () => {
      fc.assert(
        fc.property(subcategoryPriceInputArb, optionalPriceArb, (subcategory, compareAtPrice) => {
          const product: ProductPriceInput = {
            customPrice: undefined,
            compareAtPrice,
          };
          const result = resolveProductPrice(product, subcategory);

          // Property: When customPrice is undefined, effectivePrice equals subcategory.defaultPrice
          expect(result.price).toBe(subcategory.defaultPrice);
        })
      );
    });

    it("should use subcategory defaultPrice when customPrice is null", () => {
      fc.assert(
        fc.property(subcategoryPriceInputArb, optionalPriceArb, (subcategory, compareAtPrice) => {
          const product: ProductPriceInput = {
            customPrice: null,
            compareAtPrice,
          };
          const result = resolveProductPrice(product, subcategory);

          // Property: When customPrice is null, effectivePrice equals subcategory.defaultPrice
          expect(result.price).toBe(subcategory.defaultPrice);
        })
      );
    });

    it("should always return a non-negative price", () => {
      fc.assert(
        fc.property(productPriceInputArb, subcategoryPriceInputArb, (product, subcategory) => {
          const result = resolveProductPrice(product, subcategory);

          // Property: The resolved price is always a non-negative integer
          expect(result.price).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(result.price)).toBe(true);
        })
      );
    });

    it("should use product compareAtPrice when defined", () => {
      fc.assert(
        fc.property(
          priceArb,
          subcategoryPriceInputArb,
          priceArb,
          (customPrice, subcategory, productCompareAt) => {
            const product: ProductPriceInput = {
              customPrice,
              compareAtPrice: productCompareAt,
            };
            const result = resolveProductPrice(product, subcategory);

            // Property: When product.compareAtPrice is defined, it takes precedence
            expect(result.compareAtPrice).toBe(productCompareAt);
          }
        )
      );
    });

    it("should use subcategory compareAtPrice when product compareAtPrice is undefined", () => {
      fc.assert(
        fc.property(
          optionalPriceArb,
          fc.record({
            defaultPrice: priceArb,
            compareAtPrice: priceArb, // Ensure subcategory has compareAtPrice
          }),
          (customPrice, subcategory) => {
            const product: ProductPriceInput = {
              customPrice,
              compareAtPrice: undefined,
            };
            const result = resolveProductPrice(product, subcategory);

            // Property: When product.compareAtPrice is undefined, use subcategory.compareAtPrice
            expect(result.compareAtPrice).toBe(subcategory.compareAtPrice);
          }
        )
      );
    });
  });

  /**
   * Feature: sanity-migration
   * Property 3: Sale Detection Accuracy
   * Validates: Requirements 5.2, 6.6, 11.5
   */
  describe("Property 3: Sale Detection Accuracy", () => {
    it("should mark as on sale when compareAtPrice > effectivePrice", () => {
      fc.assert(
        fc.property(
          priceArb.filter((p) => p > 0), // Ensure positive price
          (effectivePrice) => {
            // Generate compareAtPrice that is greater than effectivePrice
            const compareAtPrice =
              effectivePrice + fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0];

            const product: ProductPriceInput = {
              customPrice: effectivePrice,
              compareAtPrice,
            };
            const subcategory: SubcategoryPriceInput = {
              defaultPrice: effectivePrice,
            };
            const result = resolveProductPrice(product, subcategory);

            // Property: isOnSale is true if and only if compareAtPrice > effectivePrice
            expect(result.isOnSale).toBe(true);
          }
        )
      );
    });

    it("should not mark as on sale when compareAtPrice <= effectivePrice", () => {
      fc.assert(
        fc.property(priceArb, (effectivePrice) => {
          // Generate compareAtPrice that is less than or equal to effectivePrice
          const compareAtPrice = Math.max(
            0,
            effectivePrice - fc.sample(fc.integer({ min: 0, max: 1000 }), 1)[0]
          );

          const product: ProductPriceInput = {
            customPrice: effectivePrice,
            compareAtPrice,
          };
          const subcategory: SubcategoryPriceInput = {
            defaultPrice: effectivePrice,
          };
          const result = resolveProductPrice(product, subcategory);

          // Property: isOnSale is false when compareAtPrice <= effectivePrice
          expect(result.isOnSale).toBe(false);
        })
      );
    });

    it("should not mark as on sale when compareAtPrice is null", () => {
      fc.assert(
        fc.property(
          productPriceInputArb.map((p) => ({ ...p, compareAtPrice: null })),
          subcategoryPriceInputArb.map((s) => ({ ...s, compareAtPrice: null })),
          (product, subcategory) => {
            const result = resolveProductPrice(product, subcategory);

            // Property: isOnSale is false when compareAtPrice is null
            expect(result.isOnSale).toBe(false);
            expect(result.savings).toBeNull();
            expect(result.savingsPercentage).toBeNull();
          }
        )
      );
    });

    it("should calculate savings correctly when on sale", () => {
      fc.assert(
        fc.property(
          priceArb.filter((p) => p > 0),
          fc.integer({ min: 1, max: 10000 }),
          (effectivePrice, extraAmount) => {
            const compareAtPrice = effectivePrice + extraAmount;

            const product: ProductPriceInput = {
              customPrice: effectivePrice,
              compareAtPrice,
            };
            const subcategory: SubcategoryPriceInput = {
              defaultPrice: effectivePrice,
            };
            const result = resolveProductPrice(product, subcategory);

            // Property: savings equals compareAtPrice - effectivePrice when on sale
            expect(result.savings).toBe(compareAtPrice - effectivePrice);
          }
        )
      );
    });

    it("should calculate savings percentage correctly when on sale", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }), // Positive price
          fc.integer({ min: 1, max: 10000 }), // Extra amount for sale
          (effectivePrice, extraAmount) => {
            const compareAtPrice = effectivePrice + extraAmount;

            const product: ProductPriceInput = {
              customPrice: effectivePrice,
              compareAtPrice,
            };
            const subcategory: SubcategoryPriceInput = {
              defaultPrice: effectivePrice,
            };
            const result = resolveProductPrice(product, subcategory);

            // Property: savingsPercentage equals round((savings / compareAtPrice) * 100) when on sale
            const expectedPercentage = Math.round(
              ((compareAtPrice - effectivePrice) / compareAtPrice) * 100
            );
            expect(result.savingsPercentage).toBe(expectedPercentage);
          }
        )
      );
    });

    it("should have null savings when not on sale", () => {
      fc.assert(
        fc.property(priceArb, (effectivePrice) => {
          // No compareAtPrice or compareAtPrice <= effectivePrice
          const product: ProductPriceInput = {
            customPrice: effectivePrice,
            compareAtPrice: null,
          };
          const subcategory: SubcategoryPriceInput = {
            defaultPrice: effectivePrice,
            compareAtPrice: null,
          };
          const result = resolveProductPrice(product, subcategory);

          // Property: savings is null when not on sale
          expect(result.savings).toBeNull();
          expect(result.savingsPercentage).toBeNull();
        })
      );
    });
  });

  /**
   * Bundle price resolution tests
   */
  describe("Bundle Price Resolution", () => {
    it("should use bundle price directly", () => {
      fc.assert(
        fc.property(bundlePriceInputArb, (bundle) => {
          const result = resolveBundlePrice(bundle);

          // Property: Bundle price is used directly
          expect(result.price).toBe(bundle.price);
        })
      );
    });

    it("should detect sale correctly for bundles", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 1, max: 10000 }),
          (price, extraAmount) => {
            const compareAtPrice = price + extraAmount;
            const bundle: BundlePriceInput = { price, compareAtPrice };
            const result = resolveBundlePrice(bundle);

            // Property: Bundle is on sale when compareAtPrice > price
            expect(result.isOnSale).toBe(true);
            expect(result.savings).toBe(compareAtPrice - price);
          }
        )
      );
    });
  });
});
