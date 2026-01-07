/**
 * Property-Based Tests for Table of Contents Extraction
 *
 * Feature: comprehensive-site-optimization
 * Property 8: Table of contents extraction is complete
 * Validates: Requirements 8.4
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { extractHeadings, RichTextContent, RichTextNode } from "../../lib/blog/toc-extraction";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for heading text (non-empty alphanumeric strings)
 */
const headingTextArb = fc
  .stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]*$/)
  .filter((s) => s.trim().length > 0 && s.length <= 100);

/**
 * Generator for a text node
 */
const textNodeArb = (text: string): RichTextNode => ({
  type: "text",
  text,
});

/**
 * Generator for a heading node (h2 or h3)
 */
const headingNodeArb = fc
  .record({
    type: fc.constant("heading"),
    tag: fc.constantFrom("h2", "h3"),
    text: headingTextArb,
  })
  .map(
    ({ type, tag, text }): RichTextNode => ({
      type,
      tag,
      children: [textNodeArb(text)],
    })
  );

/**
 * Generator for a paragraph node
 */
const paragraphNodeArb = fc.string({ minLength: 0, maxLength: 200 }).map(
  (text): RichTextNode => ({
    type: "paragraph",
    children: [textNodeArb(text)],
  })
);

/**
 * Generator for mixed content nodes (headings and paragraphs)
 */
const contentNodeArb: fc.Arbitrary<RichTextNode> = fc.oneof(headingNodeArb, paragraphNodeArb);

/**
 * Generator for rich text content with known headings
 */
const richTextWithHeadingsArb = fc
  .array(
    fc.record({
      tag: fc.constantFrom("h2", "h3") as fc.Arbitrary<"h2" | "h3">,
      text: headingTextArb,
    }),
    { minLength: 1, maxLength: 20 }
  )
  .map((headings) => {
    const nodes: RichTextNode[] = headings.map(({ tag, text }) => ({
      type: "heading",
      tag,
      children: [{ type: "text", text }],
    }));

    const content: RichTextContent = {
      root: {
        type: "root",
        children: nodes,
      },
    };

    return {
      content,
      expectedHeadings: headings.map(({ tag, text }) => ({
        text: text.trim(),
        level: parseInt(tag.replace("h", ""), 10),
      })),
    };
  });

/**
 * Generator for rich text content with mixed nodes
 */
const mixedRichTextArb = fc.array(contentNodeArb, { minLength: 0, maxLength: 30 }).map(
  (nodes): RichTextContent => ({
    root: {
      type: "root",
      children: nodes,
    },
  })
);

/**
 * Generator for content with h1, h4, h5, h6 headings (should be excluded)
 */
const excludedHeadingsArb = fc
  .array(
    fc.record({
      tag: fc.constantFrom("h1", "h4", "h5", "h6"),
      text: headingTextArb,
    }),
    { minLength: 1, maxLength: 10 }
  )
  .map(
    (headings): RichTextContent => ({
      root: {
        type: "root",
        children: headings.map(({ tag, text }) => ({
          type: "heading",
          tag,
          children: [{ type: "text", text }],
        })),
      },
    })
  );

describe("Table of Contents Extraction Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 8: Table of contents extraction is complete
   * Validates: Requirements 8.4
   */
  describe("Property 8: Table of contents extraction is complete", () => {
    it("should extract all h2 and h3 headings in document order", () => {
      fc.assert(
        fc.property(richTextWithHeadingsArb, ({ content, expectedHeadings }) => {
          const extractedHeadings = extractHeadings(content);

          // Property: Number of extracted headings should match expected
          expect(extractedHeadings.length).toBe(expectedHeadings.length);

          // Property: Headings should be in document order with correct text and level
          extractedHeadings.forEach((heading, index) => {
            const expected = expectedHeadings[index];
            if (expected) {
              expect(heading.text).toBe(expected.text);
              expect(heading.level).toBe(expected.level);
            }
          });
        })
      );
    });

    it("should maintain correct hierarchy (h2 = level 2, h3 = level 3)", () => {
      fc.assert(
        fc.property(richTextWithHeadingsArb, ({ content }) => {
          const headings = extractHeadings(content);

          // Property: All headings should have level 2 or 3
          headings.forEach((heading) => {
            expect(heading.level).toBeGreaterThanOrEqual(2);
            expect(heading.level).toBeLessThanOrEqual(3);
          });
        })
      );
    });

    it("should generate unique IDs for each heading", () => {
      fc.assert(
        fc.property(richTextWithHeadingsArb, ({ content }) => {
          const headings = extractHeadings(content);
          const ids = headings.map((h) => h.id);

          // Property: All IDs should be unique
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        })
      );
    });

    it("should generate URL-safe slugs as IDs", () => {
      fc.assert(
        fc.property(richTextWithHeadingsArb, ({ content }) => {
          const headings = extractHeadings(content);

          // Property: All IDs should be URL-safe (lowercase, no special chars except hyphens)
          headings.forEach((heading) => {
            expect(heading.id).toMatch(/^[a-z0-9-]+$/);
            // Should not have consecutive hyphens
            expect(heading.id).not.toMatch(/--/);
            // Should not start or end with hyphen (after trim)
            if (heading.id.length > 0) {
              expect(heading.id).not.toMatch(/^-|-$/);
            }
          });
        })
      );
    });

    it("should exclude h1, h4, h5, h6 headings from TOC", () => {
      fc.assert(
        fc.property(excludedHeadingsArb, (content) => {
          const headings = extractHeadings(content);

          // Property: No headings should be extracted from h1, h4, h5, h6
          expect(headings.length).toBe(0);
        })
      );
    });

    it("should return empty array for null/undefined content", () => {
      // Property: Null content should return empty array
      expect(extractHeadings(null)).toEqual([]);
      expect(extractHeadings(undefined)).toEqual([]);
    });

    it("should return empty array for content with no headings", () => {
      fc.assert(
        fc.property(fc.array(paragraphNodeArb, { minLength: 0, maxLength: 10 }), (paragraphs) => {
          const content: RichTextContent = {
            root: {
              type: "root",
              children: paragraphs,
            },
          };

          const headings = extractHeadings(content);

          // Property: Content with only paragraphs should have no headings
          expect(headings.length).toBe(0);
        })
      );
    });

    it("should handle duplicate heading text by appending numbers to slugs", () => {
      // Create content with duplicate headings
      const duplicateHeadingsArb = fc
        .tuple(headingTextArb, fc.integer({ min: 2, max: 5 }))
        .map(([text, count]) => {
          const nodes: RichTextNode[] = Array(count)
            .fill(null)
            .map(() => ({
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text }],
            }));

          return {
            content: {
              root: {
                type: "root",
                children: nodes,
              },
            } as RichTextContent,
            count,
          };
        });

      fc.assert(
        fc.property(duplicateHeadingsArb, ({ content, count }) => {
          const headings = extractHeadings(content);

          // Property: Should have all headings
          expect(headings.length).toBe(count);

          // Property: All IDs should still be unique
          const ids = headings.map((h) => h.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(count);
        })
      );
    });

    it("should preserve heading text exactly (trimmed)", () => {
      fc.assert(
        fc.property(richTextWithHeadingsArb, ({ content, expectedHeadings }) => {
          const headings = extractHeadings(content);

          // Property: Heading text should match original (trimmed)
          headings.forEach((heading, index) => {
            const expected = expectedHeadings[index];
            if (expected) {
              expect(heading.text).toBe(expected.text);
            }
          });
        })
      );
    });

    it("should be deterministic - same input always produces same output", () => {
      fc.assert(
        fc.property(mixedRichTextArb, (content) => {
          const result1 = extractHeadings(content);
          const result2 = extractHeadings(content);

          // Property: Same input should always produce same output
          expect(result1).toEqual(result2);
        })
      );
    });

    it("should handle empty heading text by excluding it", () => {
      const emptyHeadingContent: RichTextContent = {
        root: {
          type: "root",
          children: [
            {
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text: "" }],
            },
            {
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text: "   " }],
            },
            {
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text: "Valid Heading" }],
            },
          ],
        },
      };

      const headings = extractHeadings(emptyHeadingContent);

      // Property: Empty or whitespace-only headings should be excluded
      expect(headings.length).toBe(1);
      expect(headings[0]?.text).toBe("Valid Heading");
    });
  });
});
