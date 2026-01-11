/**
 * Property-Based Tests for Creator Revenue Calculation
 *
 * Feature: sanity-migration
 * Property 4: Creator Revenue Calculation
 * Validates: Requirements 4.3, 5.4
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  calculateProductCreatorRevenue,
  calculateBundleCreatorRevenue,
  calculateOrderCreatorRevenue,
  validateCreatorPayouts,
  CREATOR_REVENUE_SHARE,
  type OrderItem,
  type BundleProduct,
} from "../../lib/revenue/calculator";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generators for revenue calculation inputs
 */
const priceArb = fc.integer({ min: 100, max: 10000000 }); // $1 to $100,000 in cents
const sanityIdArb = fc.string({ minLength: 10, maxLength: 30 });
const optionalSanityIdArb = fc.option(sanityIdArb, { nil: null });

const bundleProductArb: fc.Arbitrary<BundleProduct> = fc.record({
  sanityId: sanityIdArb,
  creatorSanityId: optionalSanityIdArb,
  price: priceArb,
});

const productOrderItemArb: fc.Arbitrary<OrderItem> = fc.record({
  type: fc.constant("product" as const),
  price: priceArb,
  creatorSanityId: optionalSanityIdArb,
  bundleProducts: fc.constant(undefined),
});

const bundleOrderItemArb: fc.Arbitrary<OrderItem> = fc.record({
  type: fc.constant("bundle" as const),
  price: priceArb,
  creatorSanityId: fc.constant(undefined),
  bundleProducts: fc.array(bundleProductArb, { minLength: 2, maxLength: 10 }),
});

const orderItemArb = fc.oneof(productOrderItemArb, bundleOrderItemArb);

describe("Creator Revenue Calculation Property Tests", () => {
  /**
   * Feature: sanity-migration
   * Property 4: Creator Revenue Calculation
   * Validates: Requirements 4.3, 5.4
   */
  describe("Property 4: Creator Revenue Calculation", () => {
    describe("Product Revenue (50% split)", () => {
      it("should calculate exactly 50% revenue share for products with creators", () => {
        fc.assert(
          fc.property(priceArb, sanityIdArb, (price, creatorId) => {
            const revenue = calculateProductCreatorRevenue(price, creatorId);

            // Property: Creator revenue share equals exactly 50% of the item price (floored)
            const expectedRevenue = Math.floor(price * CREATOR_REVENUE_SHARE);
            expect(revenue).toBe(expectedRevenue);
          })
        );
      });

      it("should return 0 revenue for products without creators", () => {
        fc.assert(
          fc.property(priceArb, (price) => {
            const revenueNull = calculateProductCreatorRevenue(price, null);
            const revenueUndefined = calculateProductCreatorRevenue(price, undefined);

            // Property: No creator means no revenue share
            expect(revenueNull).toBe(0);
            expect(revenueUndefined).toBe(0);
          })
        );
      });

      it("should never exceed 50% of product price", () => {
        fc.assert(
          fc.property(priceArb, optionalSanityIdArb, (price, creatorId) => {
            const revenue = calculateProductCreatorRevenue(price, creatorId);

            // Property: Revenue never exceeds 50%
            expect(revenue).toBeLessThanOrEqual(Math.floor(price * CREATOR_REVENUE_SHARE));
          })
        );
      });
    });

    describe("Bundle Revenue (proportional split)", () => {
      it("should split bundle revenue proportionally among creators", () => {
        fc.assert(
          fc.property(
            priceArb,
            fc.array(
              fc.record({
                sanityId: sanityIdArb,
                creatorSanityId: sanityIdArb, // All products have creators
                price: priceArb,
              }),
              { minLength: 2, maxLength: 5 }
            ),
            (bundlePrice, products) => {
              const revenues = calculateBundleCreatorRevenue(bundlePrice, products);

              // Property: Total creator payout from bundle never exceeds 50%
              const totalPayout = revenues.reduce((sum, r) => sum + r.amount, 0);
              const maxPayout = Math.floor(bundlePrice * CREATOR_REVENUE_SHARE);
              expect(totalPayout).toBeLessThanOrEqual(maxPayout);
            }
          )
        );
      });

      it("should return empty array for bundles with no products", () => {
        fc.assert(
          fc.property(priceArb, (bundlePrice) => {
            const revenues = calculateBundleCreatorRevenue(bundlePrice, []);

            // Property: No products means no revenue
            expect(revenues).toEqual([]);
          })
        );
      });

      it("should aggregate revenue for same creator across multiple products", () => {
        fc.assert(
          fc.property(
            priceArb,
            sanityIdArb,
            priceArb,
            priceArb,
            (bundlePrice, creatorId, price1, price2) => {
              const products: BundleProduct[] = [
                { sanityId: "prod1", creatorSanityId: creatorId, price: price1 },
                { sanityId: "prod2", creatorSanityId: creatorId, price: price2 },
              ];

              const revenues = calculateBundleCreatorRevenue(bundlePrice, products);

              // Property: Same creator should have single aggregated entry
              expect(revenues.length).toBe(1);
              expect(revenues[0].creatorSanityId).toBe(creatorId);
            }
          )
        );
      });

      it("should exclude products without creators from revenue calculation", () => {
        fc.assert(
          fc.property(
            priceArb,
            sanityIdArb,
            priceArb,
            priceArb,
            (bundlePrice, creatorId, price1, price2) => {
              const products: BundleProduct[] = [
                { sanityId: "prod1", creatorSanityId: creatorId, price: price1 },
                { sanityId: "prod2", creatorSanityId: null, price: price2 }, // No creator
              ];

              const revenues = calculateBundleCreatorRevenue(bundlePrice, products);

              // Property: Only products with creators generate revenue
              const creatorIds = revenues.map((r) => r.creatorSanityId);
              expect(creatorIds).not.toContain(null);
              expect(creatorIds).not.toContain(undefined);
            }
          )
        );
      });
    });

    describe("Order Revenue (combined)", () => {
      it("should never have total creator payouts exceed 50% of order total", () => {
        fc.assert(
          fc.property(fc.array(orderItemArb, { minLength: 1, maxLength: 10 }), (items) => {
            const result = calculateOrderCreatorRevenue(items);

            // Property: Total creator payouts never exceed 50% of order total
            const maxPayout = Math.floor(result.orderTotal * CREATOR_REVENUE_SHARE);
            expect(result.totalCreatorPayout).toBeLessThanOrEqual(maxPayout);
            expect(validateCreatorPayouts(result)).toBe(true);
          })
        );
      });

      it("should have platform revenue equal to order total minus creator payouts", () => {
        fc.assert(
          fc.property(fc.array(orderItemArb, { minLength: 1, maxLength: 10 }), (items) => {
            const result = calculateOrderCreatorRevenue(items);

            // Property: Platform revenue = order total - creator payouts
            expect(result.platformRevenue).toBe(result.orderTotal - result.totalCreatorPayout);
          })
        );
      });

      it("should calculate order total as sum of all item prices", () => {
        fc.assert(
          fc.property(fc.array(orderItemArb, { minLength: 1, maxLength: 10 }), (items) => {
            const result = calculateOrderCreatorRevenue(items);
            const expectedTotal = items.reduce((sum, item) => sum + item.price, 0);

            // Property: Order total equals sum of item prices
            expect(result.orderTotal).toBe(expectedTotal);
          })
        );
      });

      it("should aggregate revenue for same creator across multiple items", () => {
        fc.assert(
          fc.property(sanityIdArb, priceArb, priceArb, (creatorId, price1, price2) => {
            const items: OrderItem[] = [
              { type: "product", price: price1, creatorSanityId: creatorId },
              { type: "product", price: price2, creatorSanityId: creatorId },
            ];

            const result = calculateOrderCreatorRevenue(items);

            // Property: Same creator should have single aggregated entry
            expect(result.creatorRevenues.length).toBe(1);
            expect(result.creatorRevenues[0].creatorSanityId).toBe(creatorId);

            // And the amount should be the sum of individual revenues
            const expectedRevenue =
              Math.floor(price1 * CREATOR_REVENUE_SHARE) +
              Math.floor(price2 * CREATOR_REVENUE_SHARE);
            expect(result.creatorRevenues[0].amount).toBe(expectedRevenue);
          })
        );
      });

      it("should return empty creator revenues for orders with no creator products", () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.record({
                type: fc.constant("product" as const),
                price: priceArb,
                creatorSanityId: fc.constant(null),
                bundleProducts: fc.constant(undefined),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            (items) => {
              const result = calculateOrderCreatorRevenue(items);

              // Property: No creators means no creator revenues
              expect(result.creatorRevenues).toEqual([]);
              expect(result.totalCreatorPayout).toBe(0);
              expect(result.platformRevenue).toBe(result.orderTotal);
            }
          )
        );
      });
    });
  });
});
