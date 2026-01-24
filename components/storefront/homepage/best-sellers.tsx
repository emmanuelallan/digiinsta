"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types/storefront";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BestSellersProps {
  products: Product[];
  className?: string;
}

export function BestSellers({ products, className }: BestSellersProps) {
  const displayProducts = products.slice(0, 4);

  return (
    <section className={cn("py-16 bg-white", className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header - Title and Shop All in same row */}
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Best Sellers
          </h2>
          <Link
            href="/collections/best-sellers"
            className="group flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors border border-gray-300 rounded-full px-6 py-2 hover:border-pink-600"
          >
            SHOP ALL
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get first two images for hover effect
  const primaryImage = product.images[0] || null;
  const secondaryImage = product.images[1] || product.images[0] || null;
  
  // Get badge if exists
  const badge = product.badges[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-4">
        {/* Image Container with Badge */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {/* Badge */}
          {badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold uppercase px-3 py-1 rounded-full">
                {badge.text}
              </span>
            </div>
          )}
          
          {/* Primary Image */}
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                isHovered && secondaryImage ? "opacity-0" : "opacity-100"
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <svg
                className="h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}
          
          {/* Secondary Image (shown on hover) */}
          {secondaryImage && primaryImage && (
            <Image
              src={secondaryImage.url}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Description - HTML content clamped to 2 lines */}
          <div 
            className="text-sm text-gray-600 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              ${product.salePrice || product.price}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product.price}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
