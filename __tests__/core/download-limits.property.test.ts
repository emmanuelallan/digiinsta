/**
 * Property-Based Tests for Download Limit Enforcement
 *
 * Feature: sanity-migration
 * Property 5: Download Limit Enforcement
 * Validates: Requirements 6.3, 12.3, 12.4
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  checkDownloadEligibility,
  simulateTrackDownload,
  DEFAULT_MAX_DOWNLOADS,
} from "../../lib/downloads/limits";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generators for download tracking inputs
 */
const maxDownloadsArb = fc.integer({ min: 1, max: 100 });
const downloadsUsedArb = fc.integer({ min: 0, max: 100 });

describe("Download Limit Enforcement Property Tests", () => {
  /**
   * Feature: sanity-migration
   * Property 5: Download Limit Enforcement
   * Validates: Requirements 6.3, 12.3, 12.4
   */
  describe("Property 5: Download Limit Enforcement", () => {
    describe("Download Eligibility Check", () => {
      it("should allow download when downloadsUsed < maxDownloads", () => {
        fc.assert(
          fc.property(maxDownloadsArb, (maxDownloads) => {
            // Generate downloadsUsed that is less than maxDownloads
            const downloadsUsed = fc.sample(fc.integer({ min: 0, max: maxDownloads - 1 }), 1)[0];

            const result = checkDownloadEligibility(downloadsUsed, maxDownloads);

            // Property: Download is allowed when under limit
            expect(result.canDownload).toBe(true);
            expect(result.remainingDownloads).toBeGreaterThan(0);
          })
        );
      });

      it("should block download when downloadsUsed >= maxDownloads", () => {
        fc.assert(
          fc.property(maxDownloadsArb, fc.integer({ min: 0, max: 50 }), (maxDownloads, extra) => {
            // downloadsUsed is at or over the limit
            const downloadsUsed = maxDownloads + extra;

            const result = checkDownloadEligibility(downloadsUsed, maxDownloads);

            // Property: Download is blocked when at or over limit
            expect(result.canDownload).toBe(false);
            expect(result.remainingDownloads).toBe(0);
            expect(result.reason).toBe("Download limit reached");
          })
        );
      });

      it("should calculate remaining downloads correctly", () => {
        fc.assert(
          fc.property(maxDownloadsArb, downloadsUsedArb, (maxDownloads, downloadsUsed) => {
            const result = checkDownloadEligibility(downloadsUsed, maxDownloads);

            // Property: remainingDownloads = max(0, maxDownloads - downloadsUsed)
            const expectedRemaining = Math.max(0, maxDownloads - downloadsUsed);
            expect(result.remainingDownloads).toBe(expectedRemaining);
          })
        );
      });

      it("should preserve input values in result", () => {
        fc.assert(
          fc.property(maxDownloadsArb, downloadsUsedArb, (maxDownloads, downloadsUsed) => {
            const result = checkDownloadEligibility(downloadsUsed, maxDownloads);

            // Property: Input values are preserved in result
            expect(result.downloadsUsed).toBe(downloadsUsed);
            expect(result.maxDownloads).toBe(maxDownloads);
          })
        );
      });
    });

    describe("Download Tracking (Increment)", () => {
      it("should increment downloadsUsed by 1 on successful download", () => {
        fc.assert(
          fc.property(maxDownloadsArb, (maxDownloads) => {
            // Start with downloadsUsed under the limit
            const downloadsUsed = fc.sample(fc.integer({ min: 0, max: maxDownloads - 1 }), 1)[0];

            const result = simulateTrackDownload(downloadsUsed, maxDownloads);

            // Property: downloadsUsed increments by 1 on each successful download
            expect(result.downloadsUsed).toBe(downloadsUsed + 1);
          })
        );
      });

      it("should not increment downloadsUsed when at limit", () => {
        fc.assert(
          fc.property(maxDownloadsArb, (maxDownloads) => {
            // Start at the limit
            const downloadsUsed = maxDownloads;

            const result = simulateTrackDownload(downloadsUsed, maxDownloads);

            // Property: downloadsUsed does not increment when at limit
            expect(result.downloadsUsed).toBe(downloadsUsed);
            expect(result.canDownload).toBe(false);
          })
        );
      });

      it("should not increment downloadsUsed when over limit", () => {
        fc.assert(
          fc.property(maxDownloadsArb, fc.integer({ min: 1, max: 50 }), (maxDownloads, extra) => {
            // Start over the limit
            const downloadsUsed = maxDownloads + extra;

            const result = simulateTrackDownload(downloadsUsed, maxDownloads);

            // Property: downloadsUsed does not increment when over limit
            expect(result.downloadsUsed).toBe(downloadsUsed);
            expect(result.canDownload).toBe(false);
          })
        );
      });

      it("should never have downloadsUsed exceed maxDownloads after tracking", () => {
        fc.assert(
          fc.property(maxDownloadsArb, downloadsUsedArb, (maxDownloads, downloadsUsed) => {
            const result = simulateTrackDownload(downloadsUsed, maxDownloads);

            // Property: downloadsUsed never exceeds maxDownloads (when starting under)
            // If we started under the limit, we should be at most at the limit
            if (downloadsUsed < maxDownloads) {
              expect(result.downloadsUsed).toBeLessThanOrEqual(maxDownloads);
            }
          })
        );
      });

      it("should update remaining downloads correctly after tracking", () => {
        fc.assert(
          fc.property(maxDownloadsArb, (maxDownloads) => {
            // Start under the limit
            const downloadsUsed = fc.sample(fc.integer({ min: 0, max: maxDownloads - 1 }), 1)[0];

            const result = simulateTrackDownload(downloadsUsed, maxDownloads);

            // Property: remainingDownloads decreases by 1 after successful download
            const expectedRemaining = Math.max(0, maxDownloads - (downloadsUsed + 1));
            expect(result.remainingDownloads).toBe(expectedRemaining);
          })
        );
      });
    });

    describe("Sequential Downloads", () => {
      it("should eventually block after maxDownloads downloads", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 20 }), (maxDownloads) => {
            let downloadsUsed = 0;

            // Simulate maxDownloads successful downloads
            for (let i = 0; i < maxDownloads; i++) {
              const result = simulateTrackDownload(downloadsUsed, maxDownloads);
              downloadsUsed = result.downloadsUsed;
            }

            // After maxDownloads downloads, should be blocked
            const finalResult = checkDownloadEligibility(downloadsUsed, maxDownloads);

            // Property: After maxDownloads downloads, further downloads are blocked
            expect(finalResult.canDownload).toBe(false);
            expect(finalResult.downloadsUsed).toBe(maxDownloads);
            expect(finalResult.remainingDownloads).toBe(0);
          })
        );
      });

      it("should allow exactly maxDownloads downloads", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 20 }), (maxDownloads) => {
            let downloadsUsed = 0;
            let successfulDownloads = 0;

            // Try to download maxDownloads + 5 times
            for (let i = 0; i < maxDownloads + 5; i++) {
              const eligibility = checkDownloadEligibility(downloadsUsed, maxDownloads);
              if (eligibility.canDownload) {
                const result = simulateTrackDownload(downloadsUsed, maxDownloads);
                downloadsUsed = result.downloadsUsed;
                successfulDownloads++;
              }
            }

            // Property: Exactly maxDownloads downloads should succeed
            expect(successfulDownloads).toBe(maxDownloads);
          })
        );
      });
    });

    describe("Default Values", () => {
      it("should have a reasonable default max downloads", () => {
        // Property: Default max downloads is a positive integer
        expect(DEFAULT_MAX_DOWNLOADS).toBeGreaterThan(0);
        expect(Number.isInteger(DEFAULT_MAX_DOWNLOADS)).toBe(true);
      });
    });
  });
});
