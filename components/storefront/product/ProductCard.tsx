"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StorefrontProduct, ProductCardVariant } from "@/types/storefront";
import { cn } from "@/lib/utils";
import { formatPrice, isOnSale, calculateSavingsPercent } from "@/lib/cart/utils";

interface ProductCardProps {
  product: StorefrontProduct;
  variant?: ProductCardVariant;
  className?: string;
}

export function ProductCard({ product, variant = "default", className }: ProductCardProps) {
  const firstImage = product.images?.[0]?.image;
  const imageUrl = firstImage?.url ?? "/images/placeholder-product.jpg";
  const imageAlt = product.images?.[0]?.alt ?? product.title;

  // Check for new product (created within last 14 days)
  const isNew = new Date(product.createdAt).getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000;

  // Check for featured tag
  const isFeatured = product.tags?.some(
    (t) => t.tag?.toLowerCase() === "featured" || t.tag?.toLowerCase() === "editors-pick"
  );

  if (variant === "compact") {
    return (
      <Link href={`/products/${product.slug}`} className={cn("group block", className)}>
        <div className="space-y-3">
          <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            {isNew && (
              <Badge className="absolute top-2 left-2 bg-emerald-500 text-xs text-white hover:bg-emerald-600">
                New
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-medium transition-colors">
              {product.title}
            </h3>
            {product.shortDescription && (
              <p className="text-muted-foreground line-clamp-1 text-xs">
                {product.shortDescription}
              </p>
            )}
            {product.price && product.price > 0 && (
              <p className="text-foreground text-sm font-semibold">{formatPrice(product.price)}</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/products/${product.slug}`} className={cn("group block", className)}>
        <Card className="hover:border-primary/50 overflow-hidden border transition-colors">
          <div className="flex gap-4 p-4">
            <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
              <Image src={imageUrl} alt={imageAlt} fill className="object-cover" sizes="80px" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground group-hover:text-primary line-clamp-1 font-medium transition-colors">
                {product.title}
              </h3>
              <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                {product.shortDescription}
              </p>
              {product.price && product.price > 0 && (
                <p className="text-foreground mt-1 font-semibold">{formatPrice(product.price)}</p>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default and featured variants - clean, minimal design
  return (
    <Link href={`/products/${product.slug}`} className={cn("group block", className)}>
      <div className="space-y-3">
        {/* Image Container */}
        <div
          className={cn(
            "bg-muted relative aspect-[4/3] overflow-hidden rounded-xl",
            variant === "featured" && "ring-primary/20 ring-2"
          )}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && (
              <Badge className="bg-emerald-500 text-xs text-white hover:bg-emerald-600">New</Badge>
            )}
            {isFeatured && (
              <Badge className="bg-amber-500 text-xs text-white hover:bg-amber-600">Featured</Badge>
            )}
          </div>

          {/* View Product text on hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="text-sm font-medium text-white">View Product →</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="text-foreground group-hover:text-primary line-clamp-2 leading-tight font-semibold transition-colors">
            {product.title}
          </h3>
          {product.shortDescription && (
            <p className="text-muted-foreground line-clamp-2 text-sm">{product.shortDescription}</p>
          )}
          {/* Price */}
          {product.price && product.price > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-foreground font-semibold">{formatPrice(product.price)}</span>
              {isOnSale(product.price, product.compareAtPrice) && product.compareAtPrice && (
                <>
                  <span className="text-muted-foreground text-sm line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600">
                    {calculateSavingsPercent(product.compareAtPrice, product.price)}% off
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
