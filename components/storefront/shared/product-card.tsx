"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types/storefront";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const primaryImage = product.images.find(img => img.type === 'overview') || product.images[0];
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

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group block overflow-hidden rounded-2xl bg-white transition-all hover:shadow-xl border border-gray-100",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-brand-beige">
        {primaryImage && !imageError ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback UI for missing or failed image
          <div className="flex h-full w-full flex-col items-center justify-center p-8">
            <svg
              className="h-12 w-12 text-brand-gray-warm"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}
        {product.badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.badges.slice(0, 2).map((badge, index) => (
              <Badge key={index} badge={badge} />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="mb-2 text-base font-semibold text-brand-gray-warm-dark line-clamp-2 group-hover:text-brand-pink-accent transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2">
          {formattedSalePrice ? (
            <>
              <span className="text-lg font-bold text-brand-pink-accent">
                {formattedSalePrice}
              </span>
              <span className="text-sm text-brand-gray-warm line-through">
                {formattedPrice}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-brand-gray-warm-dark">
              {formattedPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
