"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  extractHeadings,
  type RichTextContent,
} from "@/lib/blog/toc-extraction";

interface TableOfContentsProps {
  content: RichTextContent | null | undefined;
  className?: string;
  title?: string;
  minHeadings?: number;
}

export function TableOfContents({
  content,
  className,
  title = "Table of Contents",
  minHeadings = 3,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = extractHeadings(content);
  const shouldRender = headings.length >= minHeadings;

  useEffect(() => {
    if (!shouldRender) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  return (
    <nav
      className={cn("rounded-lg border bg-muted/30 p-4", className)}
      aria-label="Table of contents"
    >
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.level === 3 && "ml-4")}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={cn(
                "block py-1 transition-colors hover:text-primary",
                activeId === heading.id ? "font-medium text-primary" : "text-muted-foreground"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
