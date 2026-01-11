/**
 * Property-Based Tests for Slug Generation
 *
 * Feature: sanity-migration
 * Property 1: Slug Generation Produces Valid URLs
 * Validates: Requirements 1.2, 3.5, 5.3, 7.3
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { generateSlug, isValidSlug } from "../../lib/utils/slug";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

describe("Slug Generation Property Tests", () => {
  /**
   * Feature: sanity-migration
   * Property 1: Slug Generation Produces Valid URLs
   * Validates: Requirements 1.2, 3.5, 5.3, 7.3
   */
  describe("Property 1: Slug Generation Produces Valid URLs", () => {
    it("should contain only lowercase letters, numbers, and hyphens", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const slug = generateSlug(input);

          // Property: Slug should only contain valid characters
          expect(slug).toMatch(/^[a-z0-9-]+$/);
        })
      );
    });

    it("should not start with a hyphen", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const slug = generateSlug(input);

          // Property: Slug should not start with a hyphen
          expect(slug.startsWith("-")).toBe(false);
        })
      );
    });

    it("should not end with a hyphen", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const slug = generateSlug(input);

          // Property: Slug should not end with a hyphen
          expect(slug.endsWith("-")).toBe(false);
        })
      );
    });

    it("should not contain consecutive hyphens", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const slug = generateSlug(input);

          // Property: Slug should not contain consecutive hyphens
          expect(slug).not.toMatch(/--/);
        })
      );
    });

    it("should be non-empty for any input", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const slug = generateSlug(input);

          // Property: Slug should always be non-empty
          expect(slug.length).toBeGreaterThan(0);
        })
      );
    });

    it("should pass isValidSlug validation for all generated slugs", () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const slug = generateSlug(input);

          // Property: Generated slug should always be valid
          expect(isValidSlug(slug)).toBe(true);
        })
      );
    });

    it("should handle unicode characters by normalizing them", () => {
      // Generate strings with unicode characters (accented letters, etc.)
      const unicodeChars = "àáâãäåæçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ";
      const unicodeArb = fc
        .array(fc.constantFrom(...unicodeChars.split("")), { minLength: 1, maxLength: 20 })
        .map((arr) => arr.join(""));

      fc.assert(
        fc.property(unicodeArb, (input) => {
          const slug = generateSlug(input);

          // Property: Unicode input should produce valid ASCII slug
          expect(slug).toMatch(/^[a-z0-9-]+$/);
          expect(isValidSlug(slug)).toBe(true);
        })
      );
    });

    it("should convert spaces to hyphens", () => {
      // Generate arrays of lowercase words
      const wordArb = fc
        .string({ minLength: 1, maxLength: 10 })
        .filter((s) => /^[a-zA-Z]+$/.test(s));

      fc.assert(
        fc.property(fc.array(wordArb, { minLength: 2, maxLength: 5 }), (words) => {
          const input = words.join(" ");
          const slug = generateSlug(input);

          // Property: Spaces should become hyphens
          // The slug should contain hyphens if there were spaces between words
          if (words.length > 1) {
            expect(slug).toContain("-");
          }
        })
      );
    });

    it("should handle strings with only special characters", () => {
      const specialChars = "!@#$%^&*()+=[]{}|;:'\",.<>?/\\`~";
      const specialCharArb = fc
        .array(fc.constantFrom(...specialChars.split("")), { minLength: 1, maxLength: 20 })
        .map((arr) => arr.join(""));

      fc.assert(
        fc.property(specialCharArb, (input) => {
          const slug = generateSlug(input);

          // Property: Special character only strings should return 'untitled'
          expect(slug).toBe("untitled");
          expect(isValidSlug(slug)).toBe(true);
        })
      );
    });

    it("should preserve alphanumeric content in lowercase", () => {
      const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const alphanumericArb = fc
        .array(fc.constantFrom(...alphanumeric.split("")), { minLength: 1, maxLength: 50 })
        .map((arr) => arr.join(""));

      fc.assert(
        fc.property(alphanumericArb, (input) => {
          const slug = generateSlug(input);

          // Property: Alphanumeric content should be preserved (in lowercase)
          expect(slug).toBe(input.toLowerCase());
        })
      );
    });

    it("should be idempotent - generating slug from a slug produces the same slug", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 100 }), (input) => {
          const slug1 = generateSlug(input);
          const slug2 = generateSlug(slug1);

          // Property: Idempotence - f(f(x)) = f(x)
          expect(slug2).toBe(slug1);
        })
      );
    });
  });
});
