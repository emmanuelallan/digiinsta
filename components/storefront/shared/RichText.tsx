"use client";

import { Fragment } from "react";
import type { BlockContent, SanityBlock, SanityImage } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";

// ============================================================================
// Lexical Rich Text Types (for backward compatibility)
// ============================================================================

interface LexicalRichTextNode {
  type: string;
  children?: LexicalRichTextNode[];
  text?: string;
  format?: number;
  tag?: string;
  url?: string;
  listType?: string;
  value?: {
    url?: string;
    alt?: string;
  };
  [key: string]: unknown;
}

interface LexicalRichTextContent {
  root: {
    type: string;
    children: LexicalRichTextNode[];
    direction: ("ltr" | "rtl") | null;
    format: string;
    indent: number;
    version: number;
  };
  [key: string]: unknown;
}

// Track heading slugs for duplicate handling
const headingSlugCounts = new Map<string, number>();

/**
 * Extracts text content from a Lexical node for slug generation
 */
function extractTextFromLexicalNode(node: LexicalRichTextNode): string {
  if (node.text) {
    return node.text;
  }
  if (node.children) {
    return node.children.map(extractTextFromLexicalNode).join("");
  }
  return "";
}

/**
 * Generates a URL-safe slug from heading text
 */
function generateHeadingSlug(text: string): string {
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const count = headingSlugCounts.get(baseSlug) ?? 0;
  headingSlugCounts.set(baseSlug, count + 1);

  return count > 0 ? `${baseSlug}-${count}` : baseSlug;
}

// Format flags from Lexical
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

function renderLexicalText(node: LexicalRichTextNode): React.ReactNode {
  let text: React.ReactNode = node.text ?? "";
  const format = node.format ?? 0;

  if (format & IS_BOLD) {
    text = <strong>{text}</strong>;
  }
  if (format & IS_ITALIC) {
    text = <em>{text}</em>;
  }
  if (format & IS_STRIKETHROUGH) {
    text = <s>{text}</s>;
  }
  if (format & IS_UNDERLINE) {
    text = <u>{text}</u>;
  }
  if (format & IS_CODE) {
    text = <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">{text}</code>;
  }
  if (format & IS_SUBSCRIPT) {
    text = <sub>{text}</sub>;
  }
  if (format & IS_SUPERSCRIPT) {
    text = <sup>{text}</sup>;
  }

  return text;
}

function renderLexicalNode(node: LexicalRichTextNode, index: number): React.ReactNode {
  const key = `node-${index}`;

  switch (node.type) {
    case "text":
      return <Fragment key={key}>{renderLexicalText(node)}</Fragment>;

    case "paragraph":
      return (
        <p key={key} className="mb-4 last:mb-0">
          {node.children?.map((child, i) => renderLexicalNode(child, i))}
        </p>
      );

    case "heading":
      const tag = (node.tag ?? "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const headingClasses: Record<string, string> = {
        h1: "text-3xl font-bold mt-8 mb-4",
        h2: "text-2xl font-bold mt-6 mb-3",
        h3: "text-xl font-semibold mt-5 mb-2",
        h4: "text-lg font-semibold mt-4 mb-2",
        h5: "text-base font-semibold mt-3 mb-2",
        h6: "text-sm font-semibold mt-3 mb-2",
      };
      const className = headingClasses[tag];
      const children = node.children?.map((child, i) => renderLexicalNode(child, i));
      const headingText = extractTextFromLexicalNode(node);
      const headingId = generateHeadingSlug(headingText);

      switch (tag) {
        case "h1":
          return (
            <h1 key={key} id={headingId} className={className}>
              {children}
            </h1>
          );
        case "h2":
          return (
            <h2 key={key} id={headingId} className={className}>
              {children}
            </h2>
          );
        case "h3":
          return (
            <h3 key={key} id={headingId} className={className}>
              {children}
            </h3>
          );
        case "h4":
          return (
            <h4 key={key} id={headingId} className={className}>
              {children}
            </h4>
          );
        case "h5":
          return (
            <h5 key={key} id={headingId} className={className}>
              {children}
            </h5>
          );
        case "h6":
          return (
            <h6 key={key} id={headingId} className={className}>
              {children}
            </h6>
          );
        default:
          return (
            <h2 key={key} id={headingId} className={className}>
              {children}
            </h2>
          );
      }

    case "list":
      if (node.listType === "number") {
        return (
          <ol key={key} className="mb-4 list-decimal space-y-1 pl-6">
            {node.children?.map((child, i) => renderLexicalNode(child, i))}
          </ol>
        );
      }
      return (
        <ul key={key} className="mb-4 list-disc space-y-1 pl-6">
          {node.children?.map((child, i) => renderLexicalNode(child, i))}
        </ul>
      );

    case "listitem":
      return <li key={key}>{node.children?.map((child, i) => renderLexicalNode(child, i))}</li>;

    case "link":
      return (
        <a
          key={key}
          href={node.url}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {node.children?.map((child, i) => renderLexicalNode(child, i))}
        </a>
      );

    case "quote":
      return (
        <blockquote
          key={key}
          className="border-primary/30 text-muted-foreground my-4 border-l-4 pl-4 italic"
        >
          {node.children?.map((child, i) => renderLexicalNode(child, i))}
        </blockquote>
      );

    case "horizontalrule":
      return <hr key={key} className="my-6 border-t" />;

    case "linebreak":
      return <br key={key} />;

    case "upload":
      if (node.value?.url) {
        return (
          <figure key={key} className="my-6">
            <img
              src={node.value.url}
              alt={node.value.alt ?? ""}
              className="h-auto max-w-full rounded-lg"
            />
          </figure>
        );
      }
      return null;

    default:
      // For unknown types, try to render children
      if (node.children) {
        return (
          <Fragment key={key}>
            {node.children.map((child, i) => renderLexicalNode(child, i))}
          </Fragment>
        );
      }
      return null;
  }
}

// ============================================================================
// Sanity Portable Text Renderer
// ============================================================================

/**
 * Extracts text content from a Sanity block for slug generation
 */
function extractTextFromSanityBlock(block: SanityBlock): string {
  return block.children?.map((child) => child.text).join("") ?? "";
}

/**
 * Renders a span with marks (bold, italic, links, etc.)
 */
function renderSanitySpan(
  span: SanityBlock["children"][0],
  markDefs: SanityBlock["markDefs"],
  key: string
): React.ReactNode {
  let content: React.ReactNode = span.text;

  // Apply marks
  if (span.marks && span.marks.length > 0) {
    for (const mark of span.marks) {
      // Check if it's a decorator (bold, italic, etc.)
      switch (mark) {
        case "strong":
          content = <strong key={`${key}-strong`}>{content}</strong>;
          break;
        case "em":
          content = <em key={`${key}-em`}>{content}</em>;
          break;
        case "underline":
          content = <u key={`${key}-underline`}>{content}</u>;
          break;
        case "strike-through":
          content = <s key={`${key}-strike`}>{content}</s>;
          break;
        case "code":
          content = (
            <code key={`${key}-code`} className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
              {content}
            </code>
          );
          break;
        default:
          // Check if it's a link annotation
          const linkDef = markDefs?.find((def) => def._key === mark && def._type === "link");
          if (linkDef && "href" in linkDef) {
            content = (
              <a
                key={`${key}-link`}
                href={linkDef.href as string}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            );
          }
          break;
      }
    }
  }

  return <Fragment key={key}>{content}</Fragment>;
}

/**
 * Renders a Sanity block (paragraph, heading, list, etc.)
 */
function renderSanityBlock(block: SanityBlock | SanityImage, index: number): React.ReactNode {
  const key = block._key ?? `block-${index}`;

  // Handle image blocks
  if (block._type === "image") {
    const image = block as SanityImage;
    const imageUrl = urlFor(image).width(800).url();
    return (
      <figure key={key} className="my-6">
        <img src={imageUrl} alt="" className="h-auto max-w-full rounded-lg" />
      </figure>
    );
  }

  // Handle text blocks
  const textBlock = block as SanityBlock;
  const style = textBlock.style ?? "normal";
  const children = textBlock.children?.map((child, i) =>
    renderSanitySpan(child, textBlock.markDefs, `${key}-span-${i}`)
  );

  // Handle list items
  if (textBlock.listItem) {
    return <li key={key}>{children}</li>;
  }

  // Handle different block styles
  switch (style) {
    case "h1": {
      const text = extractTextFromSanityBlock(textBlock);
      const id = generateHeadingSlug(text);
      return (
        <h1 key={key} id={id} className="mt-8 mb-4 text-3xl font-bold">
          {children}
        </h1>
      );
    }
    case "h2": {
      const text = extractTextFromSanityBlock(textBlock);
      const id = generateHeadingSlug(text);
      return (
        <h2 key={key} id={id} className="mt-6 mb-3 text-2xl font-bold">
          {children}
        </h2>
      );
    }
    case "h3": {
      const text = extractTextFromSanityBlock(textBlock);
      const id = generateHeadingSlug(text);
      return (
        <h3 key={key} id={id} className="mt-5 mb-2 text-xl font-semibold">
          {children}
        </h3>
      );
    }
    case "h4": {
      const text = extractTextFromSanityBlock(textBlock);
      const id = generateHeadingSlug(text);
      return (
        <h4 key={key} id={id} className="mt-4 mb-2 text-lg font-semibold">
          {children}
        </h4>
      );
    }
    case "h5": {
      const text = extractTextFromSanityBlock(textBlock);
      const id = generateHeadingSlug(text);
      return (
        <h5 key={key} id={id} className="mt-3 mb-2 text-base font-semibold">
          {children}
        </h5>
      );
    }
    case "h6": {
      const text = extractTextFromSanityBlock(textBlock);
      const id = generateHeadingSlug(text);
      return (
        <h6 key={key} id={id} className="mt-3 mb-2 text-sm font-semibold">
          {children}
        </h6>
      );
    }
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-primary/30 text-muted-foreground my-4 border-l-4 pl-4 italic"
        >
          {children}
        </blockquote>
      );
    case "normal":
    default:
      return (
        <p key={key} className="mb-4 last:mb-0">
          {children}
        </p>
      );
  }
}

/**
 * Groups consecutive list items into lists
 */
function groupListItems(blocks: BlockContent): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let currentList: { type: "bullet" | "number"; items: SanityBlock[] } | null = null;

  blocks.forEach((block, index) => {
    if (block._type === "block" && (block as SanityBlock).listItem) {
      const textBlock = block as SanityBlock;
      const listType = textBlock.listItem === "number" ? "number" : "bullet";

      if (currentList?.type === listType) {
        currentList.items.push(textBlock);
      } else {
        // Close previous list if exists
        if (currentList) {
          const ListTag = currentList.type === "number" ? "ol" : "ul";
          const listClass =
            currentList.type === "number"
              ? "mb-4 list-decimal space-y-1 pl-6"
              : "mb-4 list-disc space-y-1 pl-6";
          result.push(
            <ListTag key={`list-${result.length}`} className={listClass}>
              {currentList.items.map((item, i) => renderSanityBlock(item, i))}
            </ListTag>
          );
        }
        currentList = { type: listType, items: [textBlock] };
      }
    } else {
      // Close current list if exists
      if (currentList) {
        const ListTag = currentList.type === "number" ? "ol" : "ul";
        const listClass =
          currentList.type === "number"
            ? "mb-4 list-decimal space-y-1 pl-6"
            : "mb-4 list-disc space-y-1 pl-6";
        result.push(
          <ListTag key={`list-${result.length}`} className={listClass}>
            {currentList.items.map((item, i) => renderSanityBlock(item, i))}
          </ListTag>
        );
        currentList = null;
      }
      result.push(renderSanityBlock(block, index));
    }
  });

  // Close any remaining list
  if (currentList !== null) {
    const list = currentList as { type: "bullet" | "number"; items: SanityBlock[] };
    const ListTag = list.type === "number" ? "ol" : "ul";
    const listClass =
      list.type === "number" ? "mb-4 list-decimal space-y-1 pl-6" : "mb-4 list-disc space-y-1 pl-6";
    result.push(
      <ListTag key={`list-${result.length}`} className={listClass}>
        {list.items.map((item: SanityBlock, i: number) => renderSanityBlock(item, i))}
      </ListTag>
    );
  }

  return result;
}

// ============================================================================
// Main RichText Component
// ============================================================================

interface RichTextProps {
  /** Content can be either Lexical format or Sanity Portable Text */
  content: LexicalRichTextContent | BlockContent | null | undefined;
  className?: string;
}

/**
 * Checks if content is Lexical format (has root.children structure)
 */
function isLexicalContent(
  content: LexicalRichTextContent | BlockContent
): content is LexicalRichTextContent {
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
 * Checks if content is Sanity Portable Text (array of blocks)
 */
function isPortableTextContent(
  content: LexicalRichTextContent | BlockContent
): content is BlockContent {
  return Array.isArray(content);
}

export function RichText({ content, className }: RichTextProps) {
  if (!content) {
    return null;
  }

  // Reset slug counter for each render
  headingSlugCounts.clear();

  // Handle Lexical format
  if (isLexicalContent(content)) {
    if (!content.root?.children) {
      return null;
    }
    return (
      <div className={className}>
        {content.root.children.map((node, index) => renderLexicalNode(node, index))}
      </div>
    );
  }

  // Handle Sanity Portable Text format
  if (isPortableTextContent(content)) {
    if (content.length === 0) {
      return null;
    }
    return <div className={className}>{groupListItems(content)}</div>;
  }

  return null;
}
