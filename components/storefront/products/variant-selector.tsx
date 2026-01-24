"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  name: string;
  description?: string;
  available: boolean;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId?: string;
  onVariantChange: (variantId: string) => void;
  className?: string;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
  className,
}: VariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-semibold text-brand-gray-warm-dark">
        Select option
      </label>
      
      <div className="grid gap-3">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => variant.available && onVariantChange(variant.id)}
            disabled={!variant.available}
            className={cn(
              "flex items-center justify-between rounded-lg border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink-accent focus-visible:ring-offset-2",
              selectedVariantId === variant.id
                ? "border-brand-pink-accent bg-brand-pink-soft"
                : "border-brand-gray-warm-light bg-white hover:border-brand-pink-medium",
              !variant.available && "cursor-not-allowed opacity-50"
            )}
            aria-pressed={selectedVariantId === variant.id}
            aria-disabled={!variant.available}
          >
            <div className="flex-1">
              <div className="font-semibold text-brand-gray-warm-dark">
                {variant.name}
              </div>
              {variant.description && (
                <div className="mt-1 text-sm text-brand-gray-warm">
                  {variant.description}
                </div>
              )}
              {!variant.available && (
                <div className="mt-1 text-sm font-medium text-red-600">
                  Currently unavailable
                </div>
              )}
            </div>
            
            {selectedVariantId === variant.id && (
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
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
