"use client";

import { type RefObject, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/storefront/cart/AddToCartButton";
import { BuyNowButton } from "@/components/storefront/cart/BuyNowButton";
import { useElementVisibility } from "@/lib/hooks";
import { formatPrice, isOnSale } from "@/lib/cart/utils";
import { cn } from "@/lib/utils";

interface StickyAddToCartProps {
  product: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    polarProductId: string;
    images?: Array<{
      image?: { url?: string | null } | null;
      alt?: string | null;
    }> | null;
  };
  /** Ref to the element that triggers sticky bar visibility (e.g., main CTA section) */
  triggerRef: RefObject<HTMLElement | null>;
}

/**
 * Sticky Add-to-Cart bar that appears when the main CTA section scrolls out of view
 * Displays product info and action buttons in a fixed bottom bar
 *
 * Requirements: 11.1, 11.2, 11.5
 */
export function StickyAddToCart({ product, triggerRef }: StickyAddToCartProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Track if the trigger element (main CTA) is visible
  const isTriggerVisible = useElementVisibility(triggerRef, {
    threshold: 0,
    rootMargin: "-100px 0px 0px 0px", // Trigger slightly before element leaves viewport
  });

  // Show sticky bar when trigger is NOT visible and not dismissed
  const shouldShow = !isTriggerVisible && !isDismissed;

  const hasPrice = product.price && product.price > 0;
  const onSale = isOnSale(product.price, product.compareAtPrice);
  const firstImage = product.images?.[0]?.image?.url;

  if (!hasPrice) return null;

  return (
    <div
      className={cn(
        "bg-background/95 fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg backdrop-blur-sm",
        "transform transition-transform duration-300 ease-in-out",
        shouldShow ? "translate-y-0" : "translate-y-full"
      )}
      role="region"
      aria-label="Quick add to cart"
      aria-hidden={!shouldShow}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Product Info */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Product Image */}
            {firstImage && (
              <div className="hidden flex-shrink-0 sm:block">
                <Image
                  src={firstImage}
                  alt={product.title}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                />
              </div>
            )}

            {/* Title & Price */}
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground truncate text-sm font-medium">{product.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm font-semibold">
                  {formatPrice(product.price)}
                </span>
                {onSale && product.compareAtPrice && (
                  <span className="text-muted-foreground text-xs line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <AddToCartButton
              item={{
                type: "product",
                productId: product.id,
                polarProductId: product.polarProductId,
                title: product.title,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: firstImage ?? undefined,
              }}
              size="sm"
              className="hidden sm:flex"
            />
            <AddToCartButton
              item={{
                type: "product",
                productId: product.id,
                polarProductId: product.polarProductId,
                title: product.title,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: firstImage ?? undefined,
              }}
              size="sm"
              showIcon={false}
              className="sm:hidden"
            />
            <BuyNowButton
              polarProductId={product.polarProductId}
              productId={product.id}
              type="product"
              size="sm"
              className="hidden md:flex"
            />

            {/* Dismiss Button - 44x44px minimum touch target */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-11 min-h-[44px] w-11 min-w-[44px]"
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss sticky bar"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
