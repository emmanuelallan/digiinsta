"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  item: {
    type: "product" | "bundle";
    productId?: number;
    bundleId?: number;
    polarProductId: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    image?: string;
  };
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
}

export function AddToCartButton({
  item,
  variant = "default",
  size = "default",
  className,
  showIcon = true,
  fullWidth = false,
}: AddToCartButtonProps) {
  const { addItem, isInCart } = useCart();

  // Get the appropriate ID based on type
  const itemId = item.type === "bundle" ? item.bundleId : item.productId;
  const inCart = itemId ? isInCart(itemId, item.type) : false;

  const handleClick = () => {
    if (!inCart) {
      addItem(item);
    }
  };

  return (
    <Button
      variant={inCart ? "secondary" : variant}
      size={size}
      className={cn(fullWidth && "w-full", className)}
      onClick={handleClick}
      disabled={inCart}
    >
      {showIcon && (
        <HugeiconsIcon
          icon={inCart ? CheckmarkCircle01Icon : ShoppingCart01Icon}
          size={size === "lg" ? 20 : 18}
          className="mr-2"
        />
      )}
      {inCart ? "In Cart" : "Add to Cart"}
    </Button>
  );
}
