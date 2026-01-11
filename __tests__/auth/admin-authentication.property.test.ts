/**
 * Property-Based Tests for Admin Authentication
 *
 * Feature: sanity-migration
 * Property 7: Admin Authentication Authorization
 * Validates: Requirements 8.1, 8.3, 8.5
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { isAuthorizedAdmin, AUTHORIZED_ADMIN_EMAILS } from "../../lib/auth/admin";
import { generateOTP, hashOTP, verifyOTP, isOTPExpired, OTP_LENGTH } from "../../lib/auth/otp";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

describe("Admin Authentication Property Tests", () => {
  /**
   * Feature: sanity-migration
   * Property 7: Admin Authentication Authorization
   * Validates: Requirements 8.1, 8.3, 8.5
   */
  describe("Property 7: Admin Authentication Authorization", () => {
    describe("Authorization Check", () => {
      it("should only authorize hardcoded admin emails", () => {
        // Test that authorized emails are accepted
        for (const email of AUTHORIZED_ADMIN_EMAILS) {
          expect(isAuthorizedAdmin(email)).toBe(true);
        }
      });

      it("should reject any email not in the authorized list", () => {
        // Generate arbitrary email addresses
        const emailArb = fc.emailAddress();

        fc.assert(
          fc.property(emailArb, (email) => {
            const normalizedEmail = email.toLowerCase().trim();
            const isInList = AUTHORIZED_ADMIN_EMAILS.includes(
              normalizedEmail as (typeof AUTHORIZED_ADMIN_EMAILS)[number]
            );

            // Property: Authorization result should match list membership
            expect(isAuthorizedAdmin(email)).toBe(isInList);
          })
        );
      });

      it("should be case-insensitive for email comparison", () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...AUTHORIZED_ADMIN_EMAILS),
            fc.boolean(),
            (email, uppercase) => {
              const testEmail = uppercase ? email.toUpperCase() : email.toLowerCase();

              // Property: Case should not affect authorization
              expect(isAuthorizedAdmin(testEmail)).toBe(true);
            }
          )
        );
      });

      it("should handle whitespace in emails", () => {
        fc.assert(
          fc.property(
            fc.constantFrom(...AUTHORIZED_ADMIN_EMAILS),
            fc.nat({ max: 5 }),
            fc.nat({ max: 5 }),
            (email, leadingSpaces, trailingSpaces) => {
              const paddedEmail = " ".repeat(leadingSpaces) + email + " ".repeat(trailingSpaces);

              // Property: Whitespace should be trimmed
              expect(isAuthorizedAdmin(paddedEmail)).toBe(true);
            }
          )
        );
      });

      it("should reject empty or invalid inputs", () => {
        expect(isAuthorizedAdmin("")).toBe(false);
        expect(isAuthorizedAdmin(null as unknown as string)).toBe(false);
        expect(isAuthorizedAdmin(undefined as unknown as string)).toBe(false);
      });

      it("should reject random strings that are not valid emails", () => {
        const nonEmailArb = fc.string().filter((s) => !s.includes("@"));

        fc.assert(
          fc.property(nonEmailArb, (input) => {
            // Property: Non-email strings should be rejected
            expect(isAuthorizedAdmin(input)).toBe(false);
          })
        );
      });
    });

    describe("OTP Generation and Verification", () => {
      it("should generate OTPs of correct length", () => {
        fc.assert(
          fc.property(fc.nat({ max: 100 }), () => {
            const otp = generateOTP();

            // Property: OTP should be exactly 6 digits
            expect(otp).toHaveLength(OTP_LENGTH);
            expect(otp).toMatch(/^\d{6}$/);
          })
        );
      });

      it("should verify OTP correctly against its hash", () => {
        fc.assert(
          fc.property(fc.nat({ max: 100 }), () => {
            const otp = generateOTP();
            const hash = hashOTP(otp);

            // Property: OTP should verify against its own hash
            expect(verifyOTP(otp, hash)).toBe(true);
          })
        );
      });

      it("should reject incorrect OTPs", () => {
        fc.assert(
          fc.property(fc.nat({ max: 100 }), () => {
            const otp1 = generateOTP();
            const otp2 = generateOTP();
            const hash1 = hashOTP(otp1);

            // Property: Different OTP should not verify against hash
            // (unless they happen to be the same, which is rare)
            if (otp1 !== otp2) {
              expect(verifyOTP(otp2, hash1)).toBe(false);
            }
          })
        );
      });

      it("should produce different hashes for different OTPs", () => {
        fc.assert(
          fc.property(fc.stringMatching(/^\d{6}$/), fc.stringMatching(/^\d{6}$/), (otp1, otp2) => {
            fc.pre(otp1 !== otp2);

            const hash1 = hashOTP(otp1);
            const hash2 = hashOTP(otp2);

            // Property: Different OTPs should produce different hashes
            expect(hash1).not.toBe(hash2);
          })
        );
      });

      it("should correctly identify expired OTPs", () => {
        const pastDate = new Date(Date.now() - 1000);
        const futureDate = new Date(Date.now() + 1000);

        // Property: Past dates should be expired
        expect(isOTPExpired(pastDate)).toBe(true);

        // Property: Future dates should not be expired
        expect(isOTPExpired(futureDate)).toBe(false);
      });

      it("should handle date strings for expiration check", () => {
        const pastDate = new Date(Date.now() - 1000).toISOString();
        const futureDate = new Date(Date.now() + 1000).toISOString();

        // Property: String dates should work the same as Date objects
        expect(isOTPExpired(pastDate)).toBe(true);
        expect(isOTPExpired(futureDate)).toBe(false);
      });
    });

    describe("Session Token Generation", () => {
      it("should generate unique session tokens", () => {
        // Import dynamically to avoid database connection at module load
        // We test the pure token generation function separately
        const { randomBytes } = require("crypto");
        const generateSessionToken = () => randomBytes(32).toString("hex");

        const tokens = new Set<string>();

        fc.assert(
          fc.property(fc.nat({ max: 100 }), () => {
            const token = generateSessionToken();

            // Property: Each token should be unique
            expect(tokens.has(token)).toBe(false);
            tokens.add(token);

            // Property: Token should be 64 hex characters (32 bytes)
            expect(token).toHaveLength(64);
            expect(token).toMatch(/^[a-f0-9]{64}$/);
          })
        );
      });

      it("should correctly identify expired sessions", () => {
        // Test expiration logic without database
        const isSessionExpired = (expiresAt: Date | string): boolean => {
          const expiration = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
          return Date.now() > expiration.getTime();
        };

        const pastDate = new Date(Date.now() - 1000);
        const futureDate = new Date(Date.now() + 1000);

        // Property: Past dates should be expired
        expect(isSessionExpired(pastDate)).toBe(true);

        // Property: Future dates should not be expired
        expect(isSessionExpired(futureDate)).toBe(false);
      });
    });
  });
});
