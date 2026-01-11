/**
 * Property-Based Tests for New Arrivals Date Filtering
 *
 * Feature: sanity-migration
 * Property 6: New Arrivals Date Filtering
 * Validates: Requirements 6.5, 11.3
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Import only the pure function that doesn't require Sanity client
import { isNewArrival } from "../../lib/sanity/queries/discovery-utils";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generators for date inputs
 */

// Generate a valid reference date (any date in the past year, excluding invalid dates)
const referenceDateArb = fc
  .integer({
    min: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago
    max: Date.now(),
  })
  .map((timestamp) => new Date(timestamp));

describe("New Arrivals Date Filtering Property Tests", () => {
  /**
   * Feature: sanity-migration
   * Property 6: New Arrivals Date Filtering
   * Validates: Requirements 6.5, 11.3
   */
  describe("Property 6: New Arrivals Date Filtering", () => {
    it("should return true for products created within the last 30 days", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 29 }), // 0 to 29 days ago (within 30 days)
          referenceDateArb,
          (daysAgo, referenceDate) => {
            const createdDate = new Date(referenceDate);
            createdDate.setDate(createdDate.getDate() - daysAgo);
            const createdAt = createdDate.toISOString();

            const result = isNewArrival(createdAt, referenceDate);

            // Property: Products created within 30 days are new arrivals
            expect(result).toBe(true);
          }
        )
      );
    });

    it("should return false for products created more than 30 days ago", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 31, max: 365 }), // 31 to 365 days ago (outside 30 days)
          referenceDateArb,
          (daysAgo, referenceDate) => {
            const createdDate = new Date(referenceDate);
            createdDate.setDate(createdDate.getDate() - daysAgo);
            const createdAt = createdDate.toISOString();

            const result = isNewArrival(createdAt, referenceDate);

            // Property: Products created more than 30 days ago are NOT new arrivals
            expect(result).toBe(false);
          }
        )
      );
    });

    it("should handle the exact 30-day boundary correctly", () => {
      fc.assert(
        fc.property(referenceDateArb, (referenceDate) => {
          // Exactly 30 days ago (should NOT be a new arrival - boundary is exclusive)
          const exactly30DaysAgo = new Date(referenceDate);
          exactly30DaysAgo.setDate(exactly30DaysAgo.getDate() - 30);
          const createdAt30 = exactly30DaysAgo.toISOString();

          // 29 days and 23 hours ago (should be a new arrival)
          const just29Days = new Date(referenceDate);
          just29Days.setDate(just29Days.getDate() - 29);
          just29Days.setHours(just29Days.getHours() - 23);
          const createdAt29 = just29Days.toISOString();

          const result30 = isNewArrival(createdAt30, referenceDate);
          const result29 = isNewArrival(createdAt29, referenceDate);

          // Property: Exactly 30 days is NOT a new arrival (boundary is exclusive)
          expect(result30).toBe(false);
          // Property: Less than 30 days IS a new arrival
          expect(result29).toBe(true);
        })
      );
    });

    it("should return true for products created today", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 23 }), // Hours ago today
          fc.integer({ min: 0, max: 59 }), // Minutes
          referenceDateArb,
          (hoursAgo, minutesAgo, referenceDate) => {
            const createdDate = new Date(referenceDate);
            createdDate.setHours(createdDate.getHours() - hoursAgo);
            createdDate.setMinutes(createdDate.getMinutes() - minutesAgo);
            const createdAt = createdDate.toISOString();

            const result = isNewArrival(createdAt, referenceDate);

            // Property: Products created today are always new arrivals
            expect(result).toBe(true);
          }
        )
      );
    });

    it("should handle various ISO date string formats", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 29 }), referenceDateArb, (daysAgo, referenceDate) => {
          const createdDate = new Date(referenceDate);
          createdDate.setDate(createdDate.getDate() - daysAgo);

          // Test with full ISO string
          const isoFull = createdDate.toISOString();
          // Test with date only (midnight UTC)
          const dateOnly = createdDate.toISOString().split("T")[0] + "T00:00:00.000Z";

          const resultFull = isNewArrival(isoFull, referenceDate);
          const resultDateOnly = isNewArrival(dateOnly, referenceDate);

          // Property: Both formats should work correctly
          expect(resultFull).toBe(true);
          expect(resultDateOnly).toBe(true);
        })
      );
    });

    it("should be consistent regardless of time of day", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 28 }), // Days ago (within 30 days)
          fc.integer({ min: 0, max: 23 }), // Hour of day
          fc.integer({ min: 0, max: 59 }), // Minute
          referenceDateArb,
          (daysAgo, hour, minute, referenceDate) => {
            const createdDate = new Date(referenceDate);
            createdDate.setDate(createdDate.getDate() - daysAgo);
            createdDate.setHours(hour, minute, 0, 0);
            const createdAt = createdDate.toISOString();

            const result = isNewArrival(createdAt, referenceDate);

            // Property: Time of day doesn't affect the 30-day calculation
            // (as long as we're within the 30-day window)
            expect(result).toBe(true);
          }
        )
      );
    });

    it("should handle edge case of products created in the future", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // Days in the future
          referenceDateArb,
          (daysInFuture, referenceDate) => {
            const createdDate = new Date(referenceDate);
            createdDate.setDate(createdDate.getDate() + daysInFuture);
            const createdAt = createdDate.toISOString();

            const result = isNewArrival(createdAt, referenceDate);

            // Property: Future dates are considered new arrivals
            // (they're definitely within 30 days of the reference)
            expect(result).toBe(true);
          }
        )
      );
    });
  });
});
