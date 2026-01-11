/**
 * Table of Contents Extraction Utilities
 *
 * Pure functions for extracting headings from rich text content.
 * Separated from the React component for testability.
 * Supports both Lexical and Sanity Portable Text formats.
 */

import type { BlockContent, SanityBlock } from "@/types/sanity";

export interface RichTextNode {
  type: string;
  children?: RichTextNode[];
  text?: string;
  tag?: string;
  [key: string]: unknown;
}

export interface LexicalRichTextContent {
  root: {
    type: string;
    children: RichTextNode[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Union type for rich text content (supports both Lexical and Sanity Portable Text)
 */
export type RichTextContent = LexicalRichTextContent | BlockContent;

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Check if content is Lexical format
 */
function isLexicalContent(content: RichTextContent): content is LexicalRichTextContent {
  return (
    content !== null &&
    typeof content === "object" &&
    "root" in content &&
    content.root !== null &&
    typeof content.root === "object" &&
    "children" in content.root
  );
}

/**
 * Check if content is Sanity Portable Text format
 */
function isPortableTextContent(content: RichTextContent): content is BlockContent {
  return Array.isArray(content);
}

/**
 * Extracts text content from a rich text node and its children
 */
export function extractTextFromNode(node: RichTextNode): string {
  if (node.text) {
    return node.text;
  }
  if (node.children) {
    return node.children.map(extractTextFromNode).join("");
  }
  return "";
}

/**
 * Extracts text content from a Sanity block
 */
function extractTextFromSanityBlock(block: SanityBlock): string {
  if (!block.children) return "";
  return block.children.map((child) => child.text || "").join("");
}

/**
 * Generates a URL-safe slug from heading text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Extracts headings from Lexical rich text content
 */
function extractHeadingsFromLexical(content: LexicalRichTextContent): TOCHeading[] {
  if (!content?.root?.children) {
    return [];
  }

  const headings: TOCHeading[] = [];
  const slugCounts = new Map<string, number>();

  function processNode(node: RichTextNode): void {
    if (node.type === "heading") {
      const tag = node.tag ?? "h2";
      const level = parseInt(tag.replace("h", ""), 10);

      // Only include h2 and h3 for TOC
      if (level === 2 || level === 3) {
        const text = extractTextFromNode(node);
        if (text.trim()) {
          const baseSlug = generateSlug(text);

          // Handle duplicate slugs by appending a number
          const count = slugCounts.get(baseSlug) ?? 0;
          const slug = count > 0 ? `${baseSlug}-${count}` : baseSlug;
          slugCounts.set(baseSlug, count + 1);

          headings.push({
            id: slug,
            text: text.trim(),
            level,
          });
        }
      }
    }

    // Process children recursively
    if (node.children) {
      node.children.forEach(processNode);
    }
  }

  content.root.children.forEach(processNode);

  return headings;
}

/**
 * Extracts headings from Sanity Portable Text content
 */
function extractHeadingsFromPortableText(content: BlockContent): TOCHeading[] {
  if (!content || content.length === 0) {
    return [];
  }

  const headings: TOCHeading[] = [];
  const slugCounts = new Map<string, number>();

  for (const block of content) {
    if (block._type !== "block") continue;

    const sanityBlock = block as SanityBlock;
    const style = sanityBlock.style;

    // Only include h2 and h3 for TOC
    if (style === "h2" || style === "h3") {
      const level = style === "h2" ? 2 : 3;
      const text = extractTextFromSanityBlock(sanityBlock);

      if (text.trim()) {
        const baseSlug = generateSlug(text);

        // Handle duplicate slugs by appending a number
        const count = slugCounts.get(baseSlug) ?? 0;
        const slug = count > 0 ? `${baseSlug}-${count}` : baseSlug;
        slugCounts.set(baseSlug, count + 1);

        headings.push({
          id: slug,
          text: text.trim(),
          level,
        });
      }
    }
  }

  return headings;
}

/**
 * Extracts headings from rich text content for table of contents
 * Only extracts h2 and h3 headings to maintain a clean hierarchy
 * Supports both Lexical and Sanity Portable Text formats
 */
export function extractHeadings(content: RichTextContent | null | undefined): TOCHeading[] {
  if (!content) {
    return [];
  }

  if (isLexicalContent(content)) {
    return extractHeadingsFromLexical(content);
  }

  if (isPortableTextContent(content)) {
    return extractHeadingsFromPortableText(content);
  }

  return [];
}
