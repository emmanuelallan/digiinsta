"use client";

import * as React from "react";
import { Product } from "@/lib/types/storefront";
import { ProductCard } from "@/components/storefront/shared/product-card";
import { Button } from "@/components/storefront/shared/button";
import { cn } from "@/lib/utils";

interface ValentineHighlightProps {
  featuredProducts: Product[];
  className?: string;
}

export function ValentineHighlight({ featuredProducts, className }: ValentineHighlightProps) {
  // Display 3-4 products as per requirements
  const displayProducts = featuredProducts.slice(0, 4);

  return (
    <section className={cn("py-16 md:py-24 bg-gradient-to-b from-white to-brand-pink-soft", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-brand-gray-warm-dark md:text-4xl">
            Valentine&apos;s Collection 💖
          </h2>
          <p className="mt-4 text-lg text-brand-gray-warm max-w-2xl mx-auto">
            Celebrate love with our curated Valentine&apos;s collection. Thoughtful tools to deepen connection and create meaningful moments together.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA to Valentine's Collection */}
        <div className="flex justify-center">
          <a href="/collections/valentines">
            <Button variant="primary" size="lg">
              View All Valentine&apos;s Products
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
