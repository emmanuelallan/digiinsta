"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingBag01Icon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import type { StorefrontProduct } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface StickyAddToCartProps {
  product: StorefrontProduct;
  className?: string;
}

export function StickyAddToCart({ product, className }: StickyAddToCartProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log("Adding to cart:", { product, quantity });
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "bg-background/95 backdrop-blur-sm border-t",
        "safe-area-inset-bottom",
        className,
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Quantity selector - 44px touch targets */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-l-lg rounded-r-none"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
            >
              <HugeiconsIcon icon={MinusSignIcon} size={18} />
            </Button>
            <span className="w-10 text-center font-medium tabular-nums">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-r-lg rounded-l-none"
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={18} />
            </Button>
          </div>

          {/* Add to cart button - full width, 44px height */}
          <Button
            className="flex-1 h-11 gap-2 text-base font-semibold"
            onClick={handleAddToCart}
          >
            <HugeiconsIcon icon={ShoppingBag01Icon} size={20} />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
