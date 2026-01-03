"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const { itemCount, toggleCart, isLoading } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-11 min-h-[44px] w-11 min-w-[44px]"
      onClick={toggleCart}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <HugeiconsIcon icon={ShoppingBag01Icon} size={20} />
      {!isLoading && itemCount > 0 && (
        <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Button>
  );
}
