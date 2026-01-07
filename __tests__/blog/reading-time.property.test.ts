/**
 * Property-Based Tests for Reading Time Calculator
 *
 * Feature: comprehensive-site-optimization
 * Property 7: Reading time calculation is consistent
 * Validates: Requirements 8.3
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  countWords,
  calculateReadingTime,
  getReadingTimeFromText,
  formatReadingTime,
  formatDurationISO8601,
  extractTextFromRichContent,
  getReadingTimeFromRichContent,
  WORDS_PER_MINUTE,
} from "../../lib/blog/reading-time";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for non-empty text with known word count
 * Uses alphanumeric words to match what countWords considers a "word"
 */
const textWithWordCountArb = fc
  .array(
    fc.stringMatching(/^[a-zA-Z0-9]+$/).filter((s) => s.length > 0),
    {
      minLength: 1,
      maxLength: 500,
    }
  )
  .map((words) => ({
    text: words.join(" "),
    expectedWordCount: words.length,
  }));

/**
 * Generator for arbitrary text content
 */
const arbitraryTextArb = fc.string({ minLength: 0, maxLength: 5000 });

/**
 * Generator for word count values
 */
const wordCountArb = fc.integer({ min: 0, max: 10000 });

/**
 * Rich text node interface for type safety
 */
interface RichTextNode {
  type: string;
  children?: RichTextNode[];
  text?: string;
  [key: string]: unknown;
}

interface RichTextContent {
  root: {
    type: string;
    children: RichTextNode[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Generator for Lexical rich text content
 */
const richTextNodeArb: fc.Arbitrary<RichTextNode> = fc.oneof(
  fc.record({
    type: fc.constant("text"),
    text: fc.string({ minLength: 1, maxLength: 50 }),
  }),
  fc.record({
    type: fc.constant("paragraph"),
    children: fc.array(
      fc.record({
        type: fc.constant("text"),
        text: fc.string({ minLength: 1, maxLength: 50 }),
      }) as fc.Arbitrary<RichTextNode>,
      { minLength: 0, maxLength: 5 }
    ),
  })
) as fc.Arbitrary<RichTextNode>;

const richTextContentArb: fc.Arbitrary<RichTextContent> = fc.record({
  root: fc.record({
    type: fc.constant("root" as const),
    children: fc.array(richTextNodeArb, { minLength: 0, maxLength: 10 }),
  }),
}) as fc.Arbitrary<RichTextContent>;

describe("Reading Time Calculator Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 7: Reading time calculation is consistent
   * Validates: Requirements 8.3
   */
  describe("Property 7: Reading time calculation is consistent", () => {
    it("should calculate reading time as ceil(wordCount / 200) minutes", () => {
      fc.assert(
        fc.property(wordCountArb, (wordCount) => {
          const readingTime = calculateReadingTime(wordCount);

          if (wordCount <= 0) {
            // Property: Zero or negative word count should return 0
            expect(readingTime).toBe(0);
          } else {
            // Property: Reading time should equal ceil(wordCount / 200)
            const expectedTime = Math.ceil(wordCount / WORDS_PER_MINUTE);
            expect(readingTime).toBe(expectedTime);
          }
        })
      );
    });

    it("should count words correctly for text with known word count", () => {
      fc.assert(
        fc.property(textWithWordCountArb, ({ text, expectedWordCount }) => {
          const actualWordCount = countWords(text);

          // Property: Word count should match expected count
          expect(actualWordCount).toBe(expectedWordCount);
        })
      );
    });

    it("should return 0 for empty or whitespace-only text", () => {
      fc.assert(
        fc.property(
          fc
            .array(fc.constantFrom(" ", "\t", "\n", "\r"), { minLength: 0, maxLength: 100 })
            .map((arr) => arr.join("")),
          (whitespaceText) => {
            const wordCount = countWords(whitespaceText);

            // Property: Whitespace-only text should have 0 words
            expect(wordCount).toBe(0);
          }
        )
      );
    });

    it("should return consistent results for getReadingTimeFromText", () => {
      fc.assert(
        fc.property(arbitraryTextArb, (text) => {
          const readingTime = getReadingTimeFromText(text);
          const wordCount = countWords(text);
          const expectedTime = calculateReadingTime(wordCount);

          // Property: getReadingTimeFromText should equal calculateReadingTime(countWords(text))
          expect(readingTime).toBe(expectedTime);
        })
      );
    });

    it("should format reading time correctly", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 1000 }), (minutes) => {
          const formatted = formatReadingTime(minutes);

          if (minutes <= 0) {
            // Property: Zero or negative minutes should show "< 1 min read"
            expect(formatted).toBe("< 1 min read");
          } else if (minutes === 1) {
            // Property: 1 minute should be singular
            expect(formatted).toBe("1 min read");
          } else {
            // Property: Multiple minutes should show "{n} min read"
            expect(formatted).toBe(`${minutes} min read`);
          }
        })
      );
    });

    it("should format ISO 8601 duration correctly", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 1000 }), (minutes) => {
          const formatted = formatDurationISO8601(minutes);

          if (minutes <= 0) {
            // Property: Zero or negative should return PT1M (minimum)
            expect(formatted).toBe("PT1M");
          } else {
            // Property: Should be in PT{n}M format
            expect(formatted).toBe(`PT${minutes}M`);
          }

          // Property: Should always match PT{n}M pattern
          expect(formatted).toMatch(/^PT\d+M$/);
        })
      );
    });

    it("should extract text from rich content and calculate reading time", () => {
      fc.assert(
        fc.property(richTextContentArb, (content) => {
          const extractedText = extractTextFromRichContent(content);
          const readingTime = getReadingTimeFromRichContent(content);

          // Property: Reading time from rich content should match reading time from extracted text
          const expectedTime = getReadingTimeFromText(extractedText);
          expect(readingTime).toBe(expectedTime);
        })
      );
    });

    it("should handle null/undefined rich content gracefully", () => {
      // Property: Null content should return empty string
      expect(extractTextFromRichContent(null)).toBe("");
      expect(extractTextFromRichContent(undefined)).toBe("");

      // Property: Null content should return 0 reading time
      expect(getReadingTimeFromRichContent(null)).toBe(0);
      expect(getReadingTimeFromRichContent(undefined)).toBe(0);
    });

    it("should be deterministic - same input always produces same output", () => {
      fc.assert(
        fc.property(arbitraryTextArb, (text) => {
          const result1 = getReadingTimeFromText(text);
          const result2 = getReadingTimeFromText(text);

          // Property: Same input should always produce same output
          expect(result1).toBe(result2);
        })
      );
    });

    it("should satisfy the invariant: reading time >= 0", () => {
      fc.assert(
        fc.property(arbitraryTextArb, (text) => {
          const readingTime = getReadingTimeFromText(text);

          // Property: Reading time should never be negative
          expect(readingTime).toBeGreaterThanOrEqual(0);
        })
      );
    });

    it("should satisfy the invariant: more words = more or equal reading time", () => {
      fc.assert(
        fc.property(
          fc.tuple(arbitraryTextArb, fc.string({ minLength: 1, maxLength: 100 })),
          ([text, additionalWords]) => {
            const originalTime = getReadingTimeFromText(text);
            const extendedText = text + " " + additionalWords;
            const extendedTime = getReadingTimeFromText(extendedText);

            // Property: Adding words should not decrease reading time
            expect(extendedTime).toBeGreaterThanOrEqual(originalTime);
          }
        )
      );
    });
  });
});
