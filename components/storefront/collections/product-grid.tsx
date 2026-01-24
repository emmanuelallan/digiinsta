"use client";

import * as React from "react";
import { Product } from "@/lib/types/storefront";
import { ProductCard } from "../shared/product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  columns?: 3 | 4;
  className?: string;
  enableLazyLoading?: boolean;
  itemsPerPage?: number;
}

export function ProductGrid({ 
  products, 
  columns = 4,
  className,
  enableLazyLoading = true,
  itemsPerPage = 12
}: ProductGridProps) {
  const [visibleProducts, setVisibleProducts] = React.useState<Product[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // Initialize visible products
  React.useEffect(() => {
    if (enableLazyLoading) {
      setVisibleProducts(products.slice(0, itemsPerPage));
      setHasMore(products.length > itemsPerPage);
    } else {
      setVisibleProducts(products);
      setHasMore(false);
    }
  }, [products, enableLazyLoading, itemsPerPage]);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (!enableLazyLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleProducts((prev) => {
            const nextBatch = products.slice(0, prev.length + itemsPerPage);
            setHasMore(nextBatch.length < products.length);
            return nextBatch;
          });
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [enableLazyLoading, hasMore, products, itemsPerPage]);

  // Handle empty state
  if (products.length === 0) {
    return (
      <div className={cn("py-16 text-center", className)}>
        <div className="mx-auto max-w-md">
          <p className="mb-2 text-xl font-medium text-brand-gray-warm-dark">
            No products found
          </p>
          <p className="text-base text-brand-gray-warm">
            We couldn&apos;t find any products in this collection. Check back soon for new additions.
          </p>
        </div>
      </div>
    );
  }

  const gridColsClass = columns === 3 
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={className}>
      <div className={cn("grid gap-6 md:gap-8", gridColsClass)}>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Loading trigger for intersection observer */}
      {enableLazyLoading && hasMore && (
        <div
          ref={loadMoreRef}
          className="mt-8 flex justify-center"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-2 text-brand-gray-warm">
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">Loading more products...</span>
          </div>
        </div>
      )}
    </div>
  );
}
