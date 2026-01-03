"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingBag01Icon,
  ArrowRight01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StorefrontProduct } from "@/types/storefront";

interface QuickViewProps {
  product: StorefrontProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickView({ product, open, onOpenChange }: QuickViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // Reset image index when product changes
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

  if (!product) return null;

  const images = product.images ?? [];
  const currentImage = images[currentImageIndex]?.image;
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Check for badges
  const isNew = new Date(product.createdAt).getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000;
  const isFeatured = product.tags?.some(
    (t) => t.tag?.toLowerCase() === "featured" || t.tag?.toLowerCase() === "editors-pick"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2">
          {/* Image Section */}
          <div className="bg-muted relative aspect-square">
            {currentImage?.url ? (
              <Image
                src={currentImage.url}
                alt={images[currentImageIndex]?.alt ?? product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
                No image available
              </div>
            )}

            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="bg-background/80 hover:bg-background absolute top-1/2 left-2 flex h-11 min-h-[44px] w-11 min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <HugeiconsIcon icon={ArrowLeft02Icon} size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="bg-background/80 hover:bg-background absolute top-1/2 right-2 flex h-11 min-h-[44px] w-11 min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
                </button>

                {/* Image Dots - larger touch targets with visual dot inside */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className="flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center"
                      aria-label={`Go to image ${index + 1}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-primary"
                            : "bg-background/60 hover:bg-background"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {isNew && (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">New</Badge>
              )}
              {isFeatured && (
                <Badge className="bg-amber-500 text-white hover:bg-amber-600">Featured</Badge>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col p-6 md:p-8">
            {/* Category */}
            <p className="text-muted-foreground mb-2 text-sm tracking-wide uppercase">
              {product.subcategory?.title}
            </p>

            {/* Title */}
            <h2 className="text-foreground mb-4 text-2xl font-bold">{product.title}</h2>

            {/* Description */}
            {product.shortDescription && (
              <p className="text-muted-foreground mb-6 line-clamp-4">{product.shortDescription}</p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {product.tags.slice(0, 5).map(
                  (tag, index) =>
                    tag.tag && (
                      <Badge key={index} variant="secondary">
                        {tag.tag}
                      </Badge>
                    )
                )}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <HugeiconsIcon icon={ShoppingBag01Icon} size={18} className="mr-2" />
                Add to Cart
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href={`/products/${product.slug}`}>
                  View Full Details
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
