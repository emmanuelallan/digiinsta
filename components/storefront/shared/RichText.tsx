"use client";

import { Fragment } from "react";

interface RichTextNode {
  type: string;
  children?: RichTextNode[];
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

// Track heading slugs for duplicate handling
const headingSlugCounts = new Map<string, number>();

/**
 * Extracts text content from a node for slug generation
 */
function extractTextFromNode(node: RichTextNode): string {
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

interface RichTextContent {
  root: {
    type: string;
    children: RichTextNode[];
    direction: ("ltr" | "rtl") | null;
    format: string;
    indent: number;
    version: number;
  };
  [key: string]: unknown;
}

interface RichTextProps {
  content: RichTextContent | null | undefined;
  className?: string;
}

// Format flags from Lexical
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

function renderText(node: RichTextNode): React.ReactNode {
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

function renderNode(node: RichTextNode, index: number): React.ReactNode {
  const key = `node-${index}`;

  switch (node.type) {
    case "text":
      return <Fragment key={key}>{renderText(node)}</Fragment>;

    case "paragraph":
      return (
        <p key={key} className="mb-4 last:mb-0">
          {node.children?.map((child, i) => renderNode(child, i))}
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
      const children = node.children?.map((child, i) => renderNode(child, i));
      const headingText = extractTextFromNode(node);
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
            {node.children?.map((child, i) => renderNode(child, i))}
          </ol>
        );
      }
      return (
        <ul key={key} className="mb-4 list-disc space-y-1 pl-6">
          {node.children?.map((child, i) => renderNode(child, i))}
        </ul>
      );

    case "listitem":
      return <li key={key}>{node.children?.map((child, i) => renderNode(child, i))}</li>;

    case "link":
      return (
        <a
          key={key}
          href={node.url}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {node.children?.map((child, i) => renderNode(child, i))}
        </a>
      );

    case "quote":
      return (
        <blockquote
          key={key}
          className="border-primary/30 text-muted-foreground my-4 border-l-4 pl-4 italic"
        >
          {node.children?.map((child, i) => renderNode(child, i))}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
          <Fragment key={key}>{node.children.map((child, i) => renderNode(child, i))}</Fragment>
        );
      }
      return null;
  }
}

export function RichText({ content, className }: RichTextProps) {
  if (!content?.root?.children) {
    return null;
  }

  // Reset slug counter for each render
  headingSlugCounts.clear();

  return (
    <div className={className}>
      {content.root.children.map((node, index) => renderNode(node, index))}
    </div>
  );
}
