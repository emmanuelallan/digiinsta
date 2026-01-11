/**
 * Property-Based Tests for Presigned URL Expiration
 *
 * Feature: sanity-migration
 * Property 11: Presigned URL Expiration
 * Validates: Requirements 12.2
 *
 * Note: These tests use pure functions that don't require R2 client initialization.
 * The actual presigned URL generation is tested via integration tests.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Pure functions for testing - mirroring lib/storage/download.ts and lib/storage/upload.ts
 * These don't require R2 client initialization
 */

/** Download URL expiration: 1 hour (3600 seconds) */
const DOWNLOAD_URL_EXPIRATION_SECONDS = 3600;

/** Upload URL expiration: 10 minutes (600 seconds) */
const UPLOAD_URL_EXPIRATION_SECONDS = 600;

/**
 * Calculate presigned URL expiration time for downloads
 */
function calculateDownloadExpiration(
  expirationSeconds: number = DOWNLOAD_URL_EXPIRATION_SECONDS
): Date {
  return new Date(Date.now() + expirationSeconds * 1000);
}

/**
 * Calculate presigned URL expiration time for uploads
 */
function calculateUploadExpiration(
  expirationSeconds: number = UPLOAD_URL_EXPIRATION_SECONDS
): Date {
  return new Date(Date.now() + expirationSeconds * 1000);
}

/**
 * Check if a presigned URL has expired
 */
function isDownloadUrlExpired(expiresAt: Date | string): boolean {
  const expiration = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return Date.now() > expiration.getTime();
}

/**
 * Calculate remaining time until URL expiration
 */
function getRemainingDownloadTime(expiresAt: Date | string): number {
  const expiration = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const remaining = expiration.getTime() - Date.now();
  return Math.max(0, remaining);
}

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generators for time-related inputs
 */
const expirationSecondsArb = fc.integer({ min: 1, max: 86400 }); // 1 second to 24 hours
const timestampOffsetArb = fc.integer({ min: -86400000, max: 86400000 }); // -24h to +24h in ms

describe("Presigned URL Expiration Property Tests", () => {
  /**
   * Feature: sanity-migration
   * Property 11: Presigned URL Expiration
   * Validates: Requirements 12.2
   */
  describe("Property 11: Presigned URL Expiration", () => {
    describe("Download URL Expiration Calculation", () => {
      it("should calculate expiration exactly expirationSeconds from now", () => {
        fc.assert(
          fc.property(expirationSecondsArb, (expirationSeconds) => {
            const before = Date.now();
            const expiresAt = calculateDownloadExpiration(expirationSeconds);
            const after = Date.now();

            // Property: Expiration is within expected range
            const expectedMin = before + expirationSeconds * 1000;
            const expectedMax = after + expirationSeconds * 1000;

            expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
            expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
          })
        );
      });

      it("should default to 1 hour (3600 seconds) expiration", () => {
        const before = Date.now();
        const expiresAt = calculateDownloadExpiration();
        const after = Date.now();

        // Property: Default expiration is 1 hour
        const expectedMin = before + DOWNLOAD_URL_EXPIRATION_SECONDS * 1000;
        const expectedMax = after + DOWNLOAD_URL_EXPIRATION_SECONDS * 1000;

        expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
        expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
        expect(DOWNLOAD_URL_EXPIRATION_SECONDS).toBe(3600);
      });

      it("should return a valid Date object", () => {
        fc.assert(
          fc.property(expirationSecondsArb, (expirationSeconds) => {
            const expiresAt = calculateDownloadExpiration(expirationSeconds);

            // Property: Result is a valid Date
            expect(expiresAt).toBeInstanceOf(Date);
            expect(isNaN(expiresAt.getTime())).toBe(false);
          })
        );
      });
    });

    describe("Upload URL Expiration Calculation", () => {
      it("should calculate upload expiration correctly", () => {
        fc.assert(
          fc.property(expirationSecondsArb, (expirationSeconds) => {
            const before = Date.now();
            const expiresAt = calculateUploadExpiration(expirationSeconds);
            const after = Date.now();

            // Property: Expiration is within expected range
            const expectedMin = before + expirationSeconds * 1000;
            const expectedMax = after + expirationSeconds * 1000;

            expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
            expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
          })
        );
      });

      it("should default to 10 minutes (600 seconds) for uploads", () => {
        const before = Date.now();
        const expiresAt = calculateUploadExpiration();
        const after = Date.now();

        // Property: Default upload expiration is 10 minutes
        const expectedMin = before + UPLOAD_URL_EXPIRATION_SECONDS * 1000;
        const expectedMax = after + UPLOAD_URL_EXPIRATION_SECONDS * 1000;

        expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
        expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
        expect(UPLOAD_URL_EXPIRATION_SECONDS).toBe(600);
      });
    });

    describe("URL Expiration Detection", () => {
      it("should return false for future expiration times", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 86400 }), (secondsInFuture) => {
            const futureExpiration = new Date(Date.now() + secondsInFuture * 1000);

            // Property: Future expiration times are not expired
            expect(isDownloadUrlExpired(futureExpiration)).toBe(false);
          })
        );
      });

      it("should return true for past expiration times", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 86400 }), (secondsInPast) => {
            const pastExpiration = new Date(Date.now() - secondsInPast * 1000);

            // Property: Past expiration times are expired
            expect(isDownloadUrlExpired(pastExpiration)).toBe(true);
          })
        );
      });

      it("should handle string date inputs", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 86400 }), (secondsInFuture) => {
            const futureExpiration = new Date(Date.now() + secondsInFuture * 1000);
            const isoString = futureExpiration.toISOString();

            // Property: String dates are handled correctly
            expect(isDownloadUrlExpired(isoString)).toBe(false);
          })
        );
      });
    });

    describe("Remaining Time Calculation", () => {
      it("should calculate remaining time correctly for future expirations", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1000, max: 86400000 }), (msInFuture) => {
            const futureExpiration = new Date(Date.now() + msInFuture);
            const remaining = getRemainingDownloadTime(futureExpiration);

            // Property: Remaining time is approximately correct (within 100ms tolerance)
            expect(remaining).toBeGreaterThan(0);
            expect(remaining).toBeLessThanOrEqual(msInFuture + 100);
            expect(remaining).toBeGreaterThanOrEqual(msInFuture - 100);
          })
        );
      });

      it("should return 0 for past expiration times", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 86400000 }), (msInPast) => {
            const pastExpiration = new Date(Date.now() - msInPast);
            const remaining = getRemainingDownloadTime(pastExpiration);

            // Property: Past expirations have 0 remaining time
            expect(remaining).toBe(0);
          })
        );
      });

      it("should handle string date inputs for remaining time", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1000, max: 86400000 }), (msInFuture) => {
            const futureExpiration = new Date(Date.now() + msInFuture);
            const isoString = futureExpiration.toISOString();
            const remaining = getRemainingDownloadTime(isoString);

            // Property: String dates are handled correctly
            expect(remaining).toBeGreaterThan(0);
          })
        );
      });

      it("should never return negative values", () => {
        fc.assert(
          fc.property(timestampOffsetArb, (offset) => {
            const expiration = new Date(Date.now() + offset);
            const remaining = getRemainingDownloadTime(expiration);

            // Property: Remaining time is never negative
            expect(remaining).toBeGreaterThanOrEqual(0);
          })
        );
      });
    });

    describe("Expiration Invariants", () => {
      it("should have download expiration longer than upload expiration", () => {
        // Property: Download URLs last longer than upload URLs
        expect(DOWNLOAD_URL_EXPIRATION_SECONDS).toBeGreaterThan(UPLOAD_URL_EXPIRATION_SECONDS);
      });

      it("should have consistent expiration behavior between Date and string inputs", () => {
        fc.assert(
          fc.property(fc.integer({ min: -86400000, max: 86400000 }), (offset) => {
            const expiration = new Date(Date.now() + offset);
            const isoString = expiration.toISOString();

            // Property: Date and string inputs produce same result
            expect(isDownloadUrlExpired(expiration)).toBe(isDownloadUrlExpired(isoString));
          })
        );
      });

      it("should have expiration and remaining time be consistent", () => {
        fc.assert(
          fc.property(fc.integer({ min: 1000, max: 86400000 }), (msInFuture) => {
            const expiration = new Date(Date.now() + msInFuture);

            const isExpired = isDownloadUrlExpired(expiration);
            const remaining = getRemainingDownloadTime(expiration);

            // Property: If not expired, remaining > 0; if expired, remaining = 0
            if (!isExpired) {
              expect(remaining).toBeGreaterThan(0);
            } else {
              expect(remaining).toBe(0);
            }
          })
        );
      });
    });
  });
});
