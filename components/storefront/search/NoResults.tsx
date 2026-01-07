"use client";

import Link from "next/link";
import { Search01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product/ProductCard";
import type { StorefrontProduct } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface NoResultsProps {
  /** The search query that returned no results */
  query?: string;
  /** Popular products to display as suggestions */
  popularProducts?: StorefrontProduct[];
  /** Suggested search terms */
  suggestions?: string[];
  /** Callback when a suggestion is clicked */
  onSuggestionClick?: (suggestion: string) => void;
  /** Custom class name */
  className?: string;
}

/**
 * NoResults Component
 * Displays when a search returns no results, showing suggestions and popular products
 * Requirements: 15.5
 */
export function NoResults({
  query,
  popularProducts = [],
  suggestions = [],
  onSuggestionClick,
  className,
}: NoResultsProps) {
  // Default suggestions if none provided
  const defaultSuggestions = ["planner", "template", "budget", "tracker", "digital"];
  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className={cn("w-full", className)}>
      {/* No Results Message */}
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <HugeiconsIcon icon={Search01Icon} size={28} className="text-muted-foreground" />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">No results found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {query
            ? `We couldn't find anything matching "${query}". Try different keywords or browse our suggestions below.`
            : "Try searching for products, categories, or bundles."}
        </p>

        {/* Search Suggestions */}
        <div className="mb-8">
          <p className="text-muted-foreground mb-3 text-sm">Try searching for:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {displaySuggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="border-border hover:border-primary hover:bg-accent rounded-full border px-4 py-1.5 text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Browse All Button */}
        <Button asChild>
          <Link href="/products">
            Browse All Products
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
          </Link>
        </Button>
      </div>

      {/* Popular Products Section */}
      {popularProducts.length > 0 && (
        <div className="border-border border-t pt-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-lg font-semibold">Popular Products</h3>
              <p className="text-muted-foreground text-sm">Check out what others are loving</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/best-sellers">
                View All
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {popularProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NoResults;
