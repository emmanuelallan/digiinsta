"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function CartButton() {
  const { itemCount, toggleCart, isLoading } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  // Listen for cart-item-added events to trigger animation
  useEffect(() => {
    const handleCartItemAdded = () => {
      setIsAnimating(true);
      // Reset animation after it completes
      setTimeout(() => setIsAnimating(false), 600);
    };

    window.addEventListener("cart-item-added", handleCartItemAdded);
    return () => window.removeEventListener("cart-item-added", handleCartItemAdded);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative h-11 min-h-[44px] w-11 min-w-[44px] transition-transform",
        isAnimating && "animate-bounce"
      )}
      onClick={toggleCart}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <HugeiconsIcon icon={ShoppingBag01Icon} size={20} />
      {!isLoading && itemCount > 0 && (
        <span
          className={cn(
            "bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium transition-transform",
            isAnimating && "scale-125"
          )}
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Button>
  );
}
