/**
 * Property-Based Tests for Sale Countdown Calculation
 *
 * Feature: comprehensive-site-optimization
 * Property 13: Sale countdown calculates correctly
 * Validates: Requirements 13.1
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { calculateTimeRemaining } from "@/lib/countdown/calculate-time-remaining";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for future dates (1 second to 365 days from now)
 */
const futureDateArb = fc.integer({ min: 1000, max: 365 * 24 * 60 * 60 * 1000 }).map((ms) => {
  return new Date(Date.now() + ms);
});

/**
 * Generator for past dates (1 second to 365 days ago)
 */
const pastDateArb = fc.integer({ min: 1000, max: 365 * 24 * 60 * 60 * 1000 }).map((ms) => {
  return new Date(Date.now() - ms);
});

/**
 * Generator for specific time differences in milliseconds
 */
const timeDiffArb = fc.record({
  days: fc.integer({ min: 0, max: 365 }),
  hours: fc.integer({ min: 0, max: 23 }),
  minutes: fc.integer({ min: 0, max: 59 }),
  seconds: fc.integer({ min: 0, max: 59 }),
});

describe("Sale Countdown Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 13: Sale countdown calculates correctly
   * Validates: Requirements 13.1
   */
  describe("Property 13: Sale countdown calculates correctly", () => {
    describe("Future dates (sale active)", () => {
      it("should return isEnded=false for all future dates", () => {
        fc.assert(
          fc.property(futureDateArb, (endDate) => {
            const result = calculateTimeRemaining(endDate);

            // Property: Future dates should not be ended
            expect(result.isEnded).toBe(false);
          })
        );
      });

      it("should return non-negative values for days, hours, minutes, seconds", () => {
        fc.assert(
          fc.property(futureDateArb, (endDate) => {
            const result = calculateTimeRemaining(endDate);

            // Property: All time components should be non-negative
            expect(result.days).toBeGreaterThanOrEqual(0);
            expect(result.hours).toBeGreaterThanOrEqual(0);
            expect(result.minutes).toBeGreaterThanOrEqual(0);
            expect(result.seconds).toBeGreaterThanOrEqual(0);
          })
        );
      });

      it("should have hours in range 0-23", () => {
        fc.assert(
          fc.property(futureDateArb, (endDate) => {
            const result = calculateTimeRemaining(endDate);

            // Property: Hours should be in valid range
            expect(result.hours).toBeGreaterThanOrEqual(0);
            expect(result.hours).toBeLessThanOrEqual(23);
          })
        );
      });

      it("should have minutes in range 0-59", () => {
        fc.assert(
          fc.property(futureDateArb, (endDate) => {
            const result = calculateTimeRemaining(endDate);

            // Property: Minutes should be in valid range
            expect(result.minutes).toBeGreaterThanOrEqual(0);
            expect(result.minutes).toBeLessThanOrEqual(59);
          })
        );
      });

      it("should have seconds in range 0-59", () => {
        fc.assert(
          fc.property(futureDateArb, (endDate) => {
            const result = calculateTimeRemaining(endDate);

            // Property: Seconds should be in valid range
            expect(result.seconds).toBeGreaterThanOrEqual(0);
            expect(result.seconds).toBeLessThanOrEqual(59);
          })
        );
      });

      it("should calculate total time correctly", () => {
        fc.assert(
          fc.property(timeDiffArb, ({ days, hours, minutes, seconds }) => {
            // Skip if all values are 0 (would be in the past immediately)
            if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
              return;
            }

            const totalMs =
              days * 24 * 60 * 60 * 1000 +
              hours * 60 * 60 * 1000 +
              minutes * 60 * 1000 +
              seconds * 1000;

            const endDate = new Date(Date.now() + totalMs);
            const result = calculateTimeRemaining(endDate);

            // Convert both to total seconds for comparison
            // This avoids issues with minute/second boundary crossings during test execution
            const expectedTotalSeconds =
              days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
            const actualTotalSeconds =
              result.days * 24 * 60 * 60 +
              result.hours * 60 * 60 +
              result.minutes * 60 +
              result.seconds;

            // Property: Total time should match within 2 seconds tolerance due to test execution time
            expect(Math.abs(actualTotalSeconds - expectedTotalSeconds)).toBeLessThanOrEqual(2);
          })
        );
      });
    });

    describe("Past dates (sale ended)", () => {
      it("should return isEnded=true for all past dates", () => {
        fc.assert(
          fc.property(pastDateArb, (endDate) => {
            const result = calculateTimeRemaining(endDate);

            // Property: Past dates should be ended
            expect(result.isEnded).toBe(true);
          })
        );
      });

      it("should return all zeros for past dates", () => {
        fc.assert(
          fc.property(pastDateArb, (endDate) => {
            const result = calculateTimeRemaining(endDate);

            // Property: All time components should be 0 for ended sales
            expect(result.days).toBe(0);
            expect(result.hours).toBe(0);
            expect(result.minutes).toBe(0);
            expect(result.seconds).toBe(0);
          })
        );
      });
    });

    describe("String date input", () => {
      it("should handle ISO string dates correctly", () => {
        fc.assert(
          fc.property(futureDateArb, (endDate) => {
            const isoString = endDate.toISOString();
            const result = calculateTimeRemaining(isoString);

            // Property: String dates should work the same as Date objects
            expect(result.isEnded).toBe(false);
            expect(result.days).toBeGreaterThanOrEqual(0);
          })
        );
      });

      it("should produce same result for Date and ISO string", () => {
        fc.assert(
          fc.property(futureDateArb, (endDate) => {
            const isoString = endDate.toISOString();
            const resultFromDate = calculateTimeRemaining(endDate);
            const resultFromString = calculateTimeRemaining(isoString);

            // Property: Date and string should produce equivalent results
            expect(resultFromDate.days).toBe(resultFromString.days);
            expect(resultFromDate.hours).toBe(resultFromString.hours);
            expect(resultFromDate.minutes).toBe(resultFromString.minutes);
            // Allow 1 second tolerance
            expect(Math.abs(resultFromDate.seconds - resultFromString.seconds)).toBeLessThanOrEqual(
              1
            );
            expect(resultFromDate.isEnded).toBe(resultFromString.isEnded);
          })
        );
      });
    });

    describe("Edge cases", () => {
      it("should handle exactly now as ended", () => {
        const now = new Date();
        const result = calculateTimeRemaining(now);

        // Property: Current time should be considered ended (diff <= 0)
        expect(result.isEnded).toBe(true);
      });

      it("should handle 1 second in future correctly", () => {
        const oneSecondLater = new Date(Date.now() + 1000);
        const result = calculateTimeRemaining(oneSecondLater);

        // Property: 1 second in future should not be ended
        expect(result.isEnded).toBe(false);
        expect(result.days).toBe(0);
        expect(result.hours).toBe(0);
        expect(result.minutes).toBe(0);
        // Seconds should be 0 or 1 depending on timing
        expect(result.seconds).toBeLessThanOrEqual(1);
      });

      it("should handle exactly 1 day correctly", () => {
        const oneDayLater = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const result = calculateTimeRemaining(oneDayLater);

        // Property: Exactly 1 day should show 1 day (or 0 days 23 hours 59 minutes 59 seconds)
        const totalSeconds =
          result.days * 24 * 60 * 60 +
          result.hours * 60 * 60 +
          result.minutes * 60 +
          result.seconds;

        // Should be within 2 seconds of 86400 (1 day in seconds)
        expect(Math.abs(totalSeconds - 86400)).toBeLessThanOrEqual(2);
      });
    });

    describe("Monotonicity", () => {
      it("should return larger values for dates further in the future", () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 1000, max: 100 * 24 * 60 * 60 * 1000 }),
            fc.integer({ min: 1, max: 100 * 24 * 60 * 60 * 1000 }),
            (baseMs, additionalMs) => {
              const nearerDate = new Date(Date.now() + baseMs);
              const fartherDate = new Date(Date.now() + baseMs + additionalMs);

              const nearerResult = calculateTimeRemaining(nearerDate);
              const fartherResult = calculateTimeRemaining(fartherDate);

              // Convert to total seconds for comparison
              const nearerTotal =
                nearerResult.days * 24 * 60 * 60 +
                nearerResult.hours * 60 * 60 +
                nearerResult.minutes * 60 +
                nearerResult.seconds;

              const fartherTotal =
                fartherResult.days * 24 * 60 * 60 +
                fartherResult.hours * 60 * 60 +
                fartherResult.minutes * 60 +
                fartherResult.seconds;

              // Property: Farther date should have more time remaining
              expect(fartherTotal).toBeGreaterThanOrEqual(nearerTotal);
            }
          )
        );
      });
    });
  });
});
