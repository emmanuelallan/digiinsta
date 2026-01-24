import * as React from "react";
import { Product } from "@/lib/types/storefront";
import { Badge } from "../shared/badge";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: Product;
  className?: string;
}

export function ProductInfo({ product, className }: ProductInfoProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);
  
  const formattedSalePrice = product.salePrice
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(product.salePrice)
    : null;

  // Display maximum three badges
  const displayBadges = product.badges.slice(0, 3);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Badges */}
      {displayBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayBadges.map((badge, index) => (
            <Badge key={index} badge={badge} />
          ))}
        </div>
      )}

      {/* Product Title */}
      <h1 className="text-3xl font-semibold text-brand-gray-warm-dark md:text-4xl">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3">
        {formattedSalePrice ? (
          <>
            <span className="text-3xl font-bold text-brand-pink-accent">
              {formattedSalePrice}
            </span>
            <span className="text-xl text-brand-gray-warm line-through">
              {formattedPrice}
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold text-brand-gray-warm-dark">
            {formattedPrice}
          </span>
        )}
      </div>

      {/* Emotional Promise */}
      {product.emotionalPromise && (
        <p className="text-lg leading-relaxed text-brand-gray-warm-dark">
          {product.emotionalPromise}
        </p>
      )}

      {/* Instant Download Micro-text */}
      <p className="flex items-center gap-2 text-sm text-brand-gray-warm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <span>Instant digital download after purchase</span>
      </p>
    </div>
  );
}
