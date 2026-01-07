"use client";

import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/cart/utils";

interface CartToastProps {
  title: string;
  price: number;
  image?: string;
}

/**
 * Shows a toast notification when an item is added to cart
 * Includes product info and "View Cart" link
 */
export function showCartToast({ title, price, image }: CartToastProps) {
  toast.custom(
    (t) => (
      <div className="bg-popover text-popover-foreground border-border flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg">
        {/* Product Image */}
        {image ? (
          <div className="bg-muted relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
            <Image src={image} alt={title} fill className="object-cover" sizes="48px" />
          </div>
        ) : (
          <div className="bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={ShoppingCart01Icon} size={20} className="text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              size={16}
              className="flex-shrink-0 text-emerald-500"
            />
            <span className="text-sm font-medium">Added to cart</span>
          </div>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-sm">{title}</p>
          <p className="text-foreground mt-1 text-sm font-semibold">{formatPrice(price)}</p>
        </div>

        {/* View Cart Link */}
        <Link
          href="/cart"
          onClick={() => toast.dismiss(t)}
          className="text-primary hover:text-primary/80 flex-shrink-0 text-sm font-medium transition-colors"
        >
          View Cart
        </Link>
      </div>
    ),
    {
      duration: 4000,
      position: "bottom-right",
    }
  );
}

/**
 * Hook to trigger cart toast with animation
 * Returns a function that shows the toast and triggers cart icon animation
 */
export function useCartToast() {
  const { itemCount } = useCart();

  const showToast = (props: CartToastProps) => {
    showCartToast(props);

    // Trigger cart icon animation by dispatching a custom event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart-item-added"));
    }
  };

  return { showToast, itemCount };
}
