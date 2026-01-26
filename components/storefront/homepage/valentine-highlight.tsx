"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types/storefront";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface ValentineHighlightProps {
  featuredProducts: Product[];
  className?: string;
}

export function ValentineHighlight({ featuredProducts, className }: ValentineHighlightProps) {
  // Display up to 4 products
  const displayProducts = featuredProducts.slice(0, 4);

  return (
    <section className={cn("relative py-20 md:py-28 overflow-hidden", className)}>
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-red-50 to-pink-100" />
      
      {/* Decorative hearts */}
      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-pulse">💕</div>
      <div className="absolute bottom-20 right-20 text-8xl opacity-10 animate-pulse delay-300">💖</div>
      <div className="absolute top-1/2 right-10 text-5xl opacity-10 animate-pulse delay-700">❤️</div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-sm font-bold uppercase px-4 py-2 rounded-full">
              <span className="text-xl">💝</span>
              Limited Time
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Valentine&apos;s Day Collection
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Make this Valentine&apos;s unforgettable with our curated collection of digital gifts designed to strengthen your bond and create lasting memories together.
          </p>
        </div>

        {/* Product Grid */}
        {displayProducts.length > 0 ? (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              {displayProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-2">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
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
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                          </svg>
                        </div>
                      )}
                      
                      {/* Heart overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="text-lg text-center font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-pink-600">
                          ${product.salePrice || product.price}
                        </span>
                        {product.salePrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Heart badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                      <span className="text-2xl">💖</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Link
                href="/collections/valentines"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-red-600 text-white text-lg font-bold px-10 py-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <span>Explore All Valentine&apos;s Gifts</span>
                <HugeiconsIcon 
                  icon={ArrowRight01Icon} 
                  size={24} 
                  className="transition-transform group-hover:translate-x-2" 
                />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <p className="text-xl text-gray-600">
              Valentine&apos;s products coming soon! Check back shortly.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
