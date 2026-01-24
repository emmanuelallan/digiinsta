"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types/storefront";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NewProductsProps {
  products: Product[];
  className?: string;
}

export function NewProducts({ products, className }: NewProductsProps) {
  const displayProducts = products.slice(0, 4);

  return (
    <section className={cn("py-16 bg-white", className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header - Title and Shop All in same row */}
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            New Products
          </h2>
          <Link
            href="/collections/new-arrivals"
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
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] || product.images[0];
  
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
          <Image
            src={primaryImage?.url || '/placeholder.jpg'}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              isHovered ? "opacity-0" : "opacity-100"
            )}
          />
          
          {/* Secondary Image (shown on hover) */}
          <Image
            src={secondaryImage?.url || '/placeholder.jpg'}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
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
