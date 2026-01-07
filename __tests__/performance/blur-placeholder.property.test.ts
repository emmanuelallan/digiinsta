/**
 * Property-Based Tests for Blur Placeholder Generation
 *
 * Feature: comprehensive-site-optimization
 * Property 2: Blur data URL generation produces valid base64
 * Validates: Requirements 2.4
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  isValidBase64DataURL,
  createColoredPlaceholder,
  DEFAULT_BLUR_DATA_URL,
} from "@/lib/image/blur-placeholder";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for valid hex characters
 */
const hexCharArb = fc.constantFrom(
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F"
);

/**
 * Generator for valid hex color codes
 */
const hexColorArb = fc.oneof(
  // 6-digit hex
  fc.array(hexCharArb, { minLength: 6, maxLength: 6 }).map((chars) => `#${chars.join("")}`),
  // 3-digit hex
  fc.array(hexCharArb, { minLength: 3, maxLength: 3 }).map((chars) => `#${chars.join("")}`)
);

/**
 * Generator for invalid hex color codes
 */
const invalidHexColorArb = fc.oneof(
  // Missing hash
  fc.array(hexCharArb, { minLength: 6, maxLength: 6 }).map((chars) => chars.join("")),
  // Wrong length (2 chars)
  fc.array(hexCharArb, { minLength: 2, maxLength: 2 }).map((chars) => `#${chars.join("")}`),
  // Wrong length (4 chars)
  fc.array(hexCharArb, { minLength: 4, maxLength: 4 }).map((chars) => `#${chars.join("")}`),
  // Wrong length (5 chars)
  fc.array(hexCharArb, { minLength: 5, maxLength: 5 }).map((chars) => `#${chars.join("")}`),
  // Wrong length (7+ chars)
  fc.array(hexCharArb, { minLength: 7, maxLength: 10 }).map((chars) => `#${chars.join("")}`),
  // Invalid characters
  fc.string({ minLength: 6, maxLength: 6 }).map((s) => `#${s}`),
  // Empty string
  fc.constant("")
);

/**
 * Generator for valid base64 data URLs
 */
const validBase64DataURLArb = fc.oneof(
  fc.constant(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  ),
  fc.constant(
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q=="
  ),
  fc.constant("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  fc.constant(
    "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJYgCdAEO/hOMAAAD"
  ),
  fc.constant(
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlNWU3ZWIiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
  )
);

/**
 * Generator for invalid base64 data URLs
 */
const invalidBase64DataURLArb = fc.oneof(
  // Missing data: prefix
  fc.constant("image/png;base64,iVBORw0KGgo="),
  // Missing base64 marker
  fc.constant("data:image/png,iVBORw0KGgo="),
  // Invalid image type
  fc.constant("data:text/plain;base64,SGVsbG8="),
  // Invalid base64 characters
  fc.constant("data:image/png;base64,!!!invalid!!!"),
  // Empty string
  fc.constant(""),
  // Null-like values
  fc.constant("null"),
  fc.constant("undefined"),
  // Just the prefix
  fc.constant("data:image/png;base64,"),
  // Random strings
  fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.startsWith("data:image/"))
);

describe("Blur Placeholder Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 2: Blur data URL generation produces valid base64
   * Validates: Requirements 2.4
   */
  describe("Property 2: Blur data URL generation produces valid base64", () => {
    describe("isValidBase64DataURL validation", () => {
      it("should return true for all valid base64 data URLs", () => {
        fc.assert(
          fc.property(validBase64DataURLArb, (dataUrl) => {
            const result = isValidBase64DataURL(dataUrl);
            expect(result).toBe(true);
          })
        );
      });

      it("should return false for all invalid base64 data URLs", () => {
        fc.assert(
          fc.property(invalidBase64DataURLArb, (dataUrl) => {
            const result = isValidBase64DataURL(dataUrl);
            expect(result).toBe(false);
          })
        );
      });

      it("should validate the default blur data URL", () => {
        expect(isValidBase64DataURL(DEFAULT_BLUR_DATA_URL)).toBe(true);
      });
    });

    describe("createColoredPlaceholder generation", () => {
      it("should produce valid base64 data URLs for all valid hex colors", () => {
        fc.assert(
          fc.property(hexColorArb, (color) => {
            const result = createColoredPlaceholder(color);

            // Property: Result should be a valid base64 data URL
            expect(isValidBase64DataURL(result)).toBe(true);

            // Property: Result should be an SVG data URL
            expect(result.startsWith("data:image/svg+xml;base64,")).toBe(true);
          })
        );
      });

      it("should produce valid base64 data URLs even for invalid hex colors (fallback)", () => {
        fc.assert(
          fc.property(invalidHexColorArb, (color) => {
            const result = createColoredPlaceholder(color);

            // Property: Result should still be a valid base64 data URL (uses fallback color)
            expect(isValidBase64DataURL(result)).toBe(true);

            // Property: Result should be an SVG data URL
            expect(result.startsWith("data:image/svg+xml;base64,")).toBe(true);
          })
        );
      });

      it("should produce consistent output for the same color input", () => {
        fc.assert(
          fc.property(hexColorArb, (color) => {
            const result1 = createColoredPlaceholder(color);
            const result2 = createColoredPlaceholder(color);

            // Property: Same input should produce same output (idempotent)
            expect(result1).toBe(result2);
          })
        );
      });

      it("should produce decodable SVG content", () => {
        fc.assert(
          fc.property(hexColorArb, (color) => {
            const result = createColoredPlaceholder(color);

            // Extract base64 part and decode
            const parts = result.split(",");
            expect(parts.length).toBe(2);
            const base64Part = parts[1] as string;
            const decoded = Buffer.from(base64Part, "base64").toString("utf-8");

            // Property: Decoded content should be valid SVG
            expect(decoded).toContain("<svg");
            expect(decoded).toContain("</svg>");
            expect(decoded).toContain("<rect");
          })
        );
      });

      it("should include the color in the generated SVG", () => {
        fc.assert(
          fc.property(hexColorArb, (color) => {
            const result = createColoredPlaceholder(color);

            // Extract base64 part and decode
            const parts = result.split(",");
            expect(parts.length).toBe(2);
            const base64Part = parts[1] as string;
            const decoded = Buffer.from(base64Part, "base64").toString("utf-8");

            // Property: Decoded SVG should contain the fill color
            // Note: The color is normalized to lowercase in the SVG
            expect(decoded.toLowerCase()).toContain(`fill="${color.toLowerCase()}"`);
          })
        );
      });
    });

    describe("Base64 encoding properties", () => {
      it("should produce base64 strings with valid characters only", () => {
        fc.assert(
          fc.property(hexColorArb, (color) => {
            const result = createColoredPlaceholder(color);
            const parts = result.split(",");
            expect(parts.length).toBe(2);
            const base64Part = parts[1] as string;

            // Property: Base64 part should only contain valid base64 characters
            const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
            expect(base64Pattern.test(base64Part)).toBe(true);
          })
        );
      });

      it("should produce base64 strings with correct padding", () => {
        fc.assert(
          fc.property(hexColorArb, (color) => {
            const result = createColoredPlaceholder(color);
            const parts = result.split(",");
            expect(parts.length).toBe(2);
            const base64Part = parts[1] as string;

            // Property: Base64 length should be divisible by 4 (with padding)
            expect(base64Part.length % 4).toBe(0);
          })
        );
      });
    });
  });
});
