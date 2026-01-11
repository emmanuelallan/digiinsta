"use client";

import { useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingCart01Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { showCartToast } from "@/components/storefront/cart/CartToast";
import { cn } from "@/lib/utils";

interface QuickAddButtonProps {
  product: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    polarProductId: string;
    images?: Array<{
      image?: { url?: string } | null;
      alt?: string | null;
    }> | null;
  };
  variant?: "overlay" | "inline";
  onSuccess?: () => void;
  className?: string;
}

export function QuickAddButton({
  product,
  variant = "inline",
  onSuccess,
  className,
}: QuickAddButtonProps) {
  const { addItem, isInCart } = useCart();
  const [isPending, setIsPending] = useState(false);

  const inCart = isInCart(product.id, "product");
  const imageUrl = product.images?.[0]?.image?.url;

  const handleQuickAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (inCart || isPending) return;

      // Optimistic update - show pending state immediately
      setIsPending(true);

      // Add item to cart
      addItem({
        type: "product",
        productId: product.id,
        polarProductId: product.polarProductId,
        title: product.title,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: imageUrl,
      });

      // Show cart toast notification
      showCartToast({
        title: product.title,
        price: product.price,
        image: imageUrl,
      });

      // Trigger cart icon animation
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart-item-added"));
      }

      // Brief delay to show success state before callback
      setTimeout(() => {
        setIsPending(false);
        onSuccess?.();
      }, 300);
    },
    [addItem, inCart, isPending, product, imageUrl, onSuccess]
  );

  if (variant === "overlay") {
    return (
      <button
        onClick={handleQuickAdd}
        disabled={inCart || isPending}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
          inCart
            ? "cursor-default bg-emerald-500/90 text-white"
            : isPending
              ? "bg-primary/90 text-primary-foreground cursor-wait"
              : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95",
          className
        )}
        aria-label={inCart ? "Already in cart" : `Add ${product.title} to cart`}
      >
        {isPending ? (
          <>
            <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
            <span>Adding...</span>
          </>
        ) : inCart ? (
          <>
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
            <span>In Cart</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={ShoppingCart01Icon} size={16} />
            <span>Quick Add</span>
          </>
        )}
      </button>
    );
  }

  // Inline variant
  return (
    <Button
      onClick={handleQuickAdd}
      disabled={inCart || isPending}
      variant={inCart ? "secondary" : "default"}
      size="sm"
      className={cn("gap-2", className)}
      aria-label={inCart ? "Already in cart" : `Add ${product.title} to cart`}
    >
      {isPending ? (
        <>
          <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
          Adding...
        </>
      ) : inCart ? (
        <>
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
          In Cart
        </>
      ) : (
        <>
          <HugeiconsIcon icon={ShoppingCart01Icon} size={16} />
          Quick Add
        </>
      )}
    </Button>
  );
}
