"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { initiateExpressCheckout } from "@/lib/checkout";

interface BuyNowButtonProps {
  polarProductId: string;
  productId: number;
  type: "product" | "bundle";
  title?: string;
  price?: number;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
}

/**
 * Buy Now Button - One-click checkout that skips the cart
 * Pre-fills customer email from localStorage if available
 *
 * Validates: Requirements 14.1, 14.2, 14.4
 */
export function BuyNowButton({
  polarProductId,
  productId,
  type,
  title,
  price,
  variant = "outline",
  size = "default",
  className,
  showIcon = true,
  fullWidth = false,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Use express checkout service with email pre-filling
      const result = await initiateExpressCheckout(
        {
          polarProductId,
          productId,
          type,
          title,
          price,
        },
        { skipCart: true }
      );

      // Redirect to Polar checkout
      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error("Express checkout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(fullWidth && "w-full", className)}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <HugeiconsIcon
          icon={Loading03Icon}
          size={size === "lg" ? 20 : 18}
          className="mr-2 animate-spin"
        />
      ) : showIcon ? (
        <HugeiconsIcon icon={FlashIcon} size={size === "lg" ? 20 : 18} className="mr-2" />
      ) : null}
      {isLoading ? "Processing..." : "Buy Now"}
    </Button>
  );
}
