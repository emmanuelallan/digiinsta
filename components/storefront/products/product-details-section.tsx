"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ProductDetailsSectionProps {
  description: string;
  className?: string;
}

export function ProductDetailsSection({ description, className }: ProductDetailsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show first 300 characters when collapsed
  const previewText = getPlainText(description).substring(0, 300);
  const shouldShowReadMore = getPlainText(description).length > 300;

  return (
    <div className={cn("border-t border-gray-200 py-6", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <h2 className="text-lg font-semibold text-gray-900">Item details</h2>
        <HugeiconsIcon
          icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
          size={20}
          className="text-gray-600 group-hover:text-gray-900 transition-colors"
        />
      </button>

      {isExpanded ? (
        <div className="mt-6">
          <div
            className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3 prose-p:my-2 prose-ul:my-2 prose-ol:my-2"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {previewText}
            {shouldShowReadMore && "..."}
          </p>
          {shouldShowReadMore && (
            <button
              onClick={() => setIsExpanded(true)}
              className="mt-3 text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors inline-flex items-center gap-1"
            >
              Read more about this item
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function getPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
