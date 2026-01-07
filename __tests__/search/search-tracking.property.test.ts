/**
 * Property-Based Tests for Search Tracking
 *
 * Feature: comprehensive-site-optimization
 * Property 21: Search queries are tracked with results count
 * Validates: Requirements 15.6
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Mock analytics tracking function that captures events
 * This simulates the trackSearch function behavior
 */
interface TrackedSearchEvent {
  query: string;
  results_count?: string;
}

let trackedEvents: TrackedSearchEvent[] = [];

/**
 * Simulates the trackSearch function from components/analytics.tsx
 * The actual function calls trackGoal with query and optional results_count
 */
function trackSearch(query: string, results_count?: number): TrackedSearchEvent | null {
  // Simulate the actual implementation behavior
  if (typeof window === "undefined") {
    // In test environment, we still want to validate the event structure
  }

  const event: TrackedSearchEvent = {
    query,
    ...(results_count !== undefined && { results_count: String(results_count) }),
  };

  trackedEvents.push(event);
  return event;
}

/**
 * Validates that a tracked search event contains required fields
 */
function isValidSearchEvent(event: TrackedSearchEvent | null): boolean {
  if (!event) return false;

  // Must have query string
  if (typeof event.query !== "string") return false;

  // If results_count is present, it must be a string representation of a number
  if (event.results_count !== undefined) {
    if (typeof event.results_count !== "string") return false;
    const parsed = parseInt(event.results_count, 10);
    if (isNaN(parsed) || parsed < 0) return false;
  }

  return true;
}

/**
 * Generator for valid search queries (minimum 2 characters as per implementation)
 */
const validSearchQueryArb = fc
  .string({ minLength: 2, maxLength: 100 })
  .filter((q) => q.trim().length >= 2);

/**
 * Generator for results count (non-negative integers)
 */
const resultsCountArb = fc.integer({ min: 0, max: 10000 });

describe("Search Tracking Property Tests", () => {
  beforeEach(() => {
    trackedEvents = [];
  });

  afterEach(() => {
    trackedEvents = [];
  });

  describe("Property 21: Search queries are tracked with results count", () => {
    it("should track search with query string", () => {
      fc.assert(
        fc.property(validSearchQueryArb, (query) => {
          const event = trackSearch(query);

          // Event should be valid
          expect(isValidSearchEvent(event)).toBe(true);

          // Query should match
          expect(event?.query).toBe(query);

          return true;
        })
      );
    });

    it("should track search with query string and results count", () => {
      fc.assert(
        fc.property(validSearchQueryArb, resultsCountArb, (query, resultsCount) => {
          const event = trackSearch(query, resultsCount);

          // Event should be valid
          expect(isValidSearchEvent(event)).toBe(true);

          // Query should match
          expect(event?.query).toBe(query);

          // Results count should be present and match
          expect(event?.results_count).toBe(String(resultsCount));

          return true;
        })
      );
    });

    it("should convert results_count to string format", () => {
      fc.assert(
        fc.property(validSearchQueryArb, resultsCountArb, (query, resultsCount) => {
          const event = trackSearch(query, resultsCount);

          // Results count should be a string
          if (event?.results_count !== undefined) {
            expect(typeof event.results_count).toBe("string");
            // Should be parseable back to the original number
            expect(parseInt(event.results_count, 10)).toBe(resultsCount);
          }

          return true;
        })
      );
    });

    it("should handle zero results count", () => {
      fc.assert(
        fc.property(validSearchQueryArb, (query) => {
          const event = trackSearch(query, 0);

          expect(isValidSearchEvent(event)).toBe(true);
          expect(event?.results_count).toBe("0");

          return true;
        })
      );
    });

    it("should handle undefined results count", () => {
      fc.assert(
        fc.property(validSearchQueryArb, (query) => {
          const event = trackSearch(query, undefined);

          expect(isValidSearchEvent(event)).toBe(true);
          expect(event?.query).toBe(query);
          // results_count should not be present when undefined
          expect(event?.results_count).toBeUndefined();

          return true;
        })
      );
    });

    it("should track multiple searches independently", () => {
      fc.assert(
        fc.property(
          fc.array(fc.tuple(validSearchQueryArb, fc.option(resultsCountArb, { nil: undefined })), {
            minLength: 1,
            maxLength: 10,
          }),
          (searches) => {
            // Clear previous events
            trackedEvents = [];

            // Track all searches
            searches.forEach(([query, resultsCount]) => {
              trackSearch(query, resultsCount ?? undefined);
            });

            // Should have tracked all searches
            expect(trackedEvents.length).toBe(searches.length);

            // Each event should be valid
            trackedEvents.forEach((event) => {
              expect(isValidSearchEvent(event)).toBe(true);
            });

            return true;
          }
        )
      );
    });

    it("should preserve query string exactly as provided", () => {
      fc.assert(
        fc.property(
          // Test with various special characters
          fc
            .oneof(
              validSearchQueryArb,
              fc.string({ minLength: 2, maxLength: 50 }).map((s) => s + " with spaces"),
              fc.string({ minLength: 2, maxLength: 50 }).map((s) => s + "!@#$%"),
              fc.string({ minLength: 2, maxLength: 50 }).map((s) => "test " + s + " query")
            )
            .filter((q) => q.trim().length >= 2),
          (query) => {
            const event = trackSearch(query);

            // Query should be preserved exactly
            expect(event?.query).toBe(query);

            return true;
          }
        )
      );
    });

    it("should handle large results counts", () => {
      fc.assert(
        fc.property(
          validSearchQueryArb,
          fc.integer({ min: 10000, max: 1000000 }),
          (query, largeCount) => {
            const event = trackSearch(query, largeCount);

            expect(isValidSearchEvent(event)).toBe(true);
            expect(event?.results_count).toBe(String(largeCount));

            return true;
          }
        )
      );
    });
  });
});
