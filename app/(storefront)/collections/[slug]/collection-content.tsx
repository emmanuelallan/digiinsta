"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, FilterHorizontalIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import type { Product } from "@/lib/types/storefront";
import { cn } from "@/lib/utils";

interface CollectionContentProps {
  products: Product[];
  collectionName: string;
  collectionDescription?: string;
}

type SortOption = "popularity" | "newest" | "price-asc" | "price-desc";

export function CollectionContent({ products, collectionName, collectionDescription }: CollectionContentProps) {
  const [sortOption, setSortOption] = useState<SortOption>("popularity");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store"}/collections`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collectionName,
      },
    ],
  };

  // Apply sorting
  const sortedProducts = useMemo(() => {
    let result = [...products];

    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Products are already sorted by newest from the database query
        break;
      case "popularity":
      default:
        // Keep default order (popularity/newest)
        break;
    }

    return result;
  }, [products, sortOption]);

  const sortOptions = [
    { value: "popularity" as const, label: "Popularity" },
    { value: "newest" as const, label: "Newest" },
    { value: "price-asc" as const, label: "Price: Low to High" },
    { value: "price-desc" as const, label: "Price: High to Low" },
  ];

  return (
    <section className="bg-white">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="py-6 border-b border-gray-200">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            <Link href="/collections" className="hover:text-pink-600 transition-colors">
              Collections
            </Link>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            <span className="text-gray-900 font-medium">{collectionName}</span>
          </nav>
        </div>

        {/* Collection Header */}
        <div className="py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {collectionName}
          </h1>
          {collectionDescription && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {collectionDescription}
            </p>
          )}
        </div>

        {/* Filter and Sort Bar */}
        <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-12">
          <button className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors">
            <HugeiconsIcon icon={FilterHorizontalIcon} size={20} />
            Filters
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors"
            >
              Sort by
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value);
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg",
                      sortOption === option.value && "bg-pink-50 text-pink-600 font-medium"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-16">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No products found in this collection.</p>
          </div>
        )}
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
          <h3 className="text-lg font-bold text-gray-900 transition-colors">
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
