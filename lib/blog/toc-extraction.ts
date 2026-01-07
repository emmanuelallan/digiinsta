/**
 * Table of Contents Extraction Utilities
 *
 * Pure functions for extracting headings from rich text content.
 * Separated from the React component for testability.
 */

export interface RichTextNode {
  type: string;
  children?: RichTextNode[];
  text?: string;
  tag?: string;
  [key: string]: unknown;
}

export interface RichTextContent {
  root: {
    type: string;
    children: RichTextNode[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
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
 * Extracts headings from rich text content for table of contents
 * Only extracts h2 and h3 headings to maintain a clean hierarchy
 */
export function extractHeadings(content: RichTextContent | null | undefined): TOCHeading[] {
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
