import * as React from "react";
import { cn } from "@/lib/utils";

interface WhatsIncludedProps {
  items: string[];
  className?: string;
}

export function WhatsIncluded({ items, className }: WhatsIncludedProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="text-2xl font-semibold text-brand-gray-warm-dark">
        What&apos;s included
      </h2>
      
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 flex-shrink-0 text-brand-pink-accent"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-base text-brand-gray-warm-dark leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
