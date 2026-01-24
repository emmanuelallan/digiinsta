import * as React from "react";
import { Product } from "@/lib/types/storefront";
import { ProductCard } from "../shared/product-card";
import { cn } from "@/lib/utils";

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
  className?: string;
}

export function RelatedProducts({ products, currentProductId, className }: RelatedProductsProps) {
  // Filter out current product and display 2-3 related products
  const relatedProducts = products
    .filter(product => product.id !== currentProductId)
    .slice(0, 3);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-semibold text-brand-gray-warm-dark">
        Pairs well with
      </h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
