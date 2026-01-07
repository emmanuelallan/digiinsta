/**
 * Reading Time Calculator
 * Calculates estimated reading time based on word count (200 wpm)
 * Requirements: 8.3
 */

/**
 * Average reading speed in words per minute
 */
export const WORDS_PER_MINUTE = 200;

/**
 * Count words in text content
 * Handles plain text and strips extra whitespace
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate reading time in minutes based on word count
 * Uses 200 words per minute as the average reading speed
 * Returns minimum of 1 minute for any non-empty content
 */
export function calculateReadingTime(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

/**
 * Calculate reading time from text content
 * Convenience function that combines countWords and calculateReadingTime
 */
export function getReadingTimeFromText(text: string): number {
  const wordCount = countWords(text);
  return calculateReadingTime(wordCount);
}

/**
 * Format reading time for display
 * Returns human-readable string like "5 min read"
 */
export function formatReadingTime(minutes: number): string {
  if (minutes <= 0) return "< 1 min read";
  if (minutes === 1) return "1 min read";
  return `${minutes} min read`;
}

/**
 * Convert minutes to ISO 8601 duration format
 * Used for structured data (schema.org timeRequired)
 */
export function formatDurationISO8601(minutes: number): string {
  if (minutes <= 0) return "PT1M"; // Minimum 1 minute
  return `PT${minutes}M`;
}

/**
 * Rich text node interface for extracting text from Lexical content
 */
interface RichTextNode {
  type: string;
  children?: RichTextNode[];
  text?: string;
  [key: string]: unknown;
}

/**
 * Rich text content interface (Lexical format from Payload CMS)
 */
interface RichTextContent {
  root: {
    type: string;
    children: RichTextNode[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Extract plain text from Lexical rich text content
 * Recursively traverses the content tree to extract all text nodes
 */
export function extractTextFromRichContent(content: RichTextContent | null | undefined): string {
  if (!content?.root?.children) return "";

  const extractText = (nodes: RichTextNode[]): string => {
    return nodes
      .map((node) => {
        if (node.type === "text" && node.text) {
          return node.text;
        }
        if (node.children) {
          return extractText(node.children);
        }
        return "";
      })
      .join(" ");
  };

  return extractText(content.root.children);
}

/**
 * Calculate reading time from rich text content
 * Extracts text from Lexical content and calculates reading time
 */
export function getReadingTimeFromRichContent(content: RichTextContent | null | undefined): number {
  const text = extractTextFromRichContent(content);
  return getReadingTimeFromText(text);
}

/**
 * Get formatted reading time from rich text content
 * Returns human-readable string like "5 min read"
 */
export function getFormattedReadingTime(content: RichTextContent | null | undefined): string {
  const minutes = getReadingTimeFromRichContent(content);
  return formatReadingTime(minutes);
}
