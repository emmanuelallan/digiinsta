"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuyNowButtonProps {
  polarProductId: string;
  productId: number;
  type: "product" | "bundle";
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
}

export function BuyNowButton({
  polarProductId,
  productId,
  type,
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
      // Create checkout session for single product
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ polarProductId, productId, type }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout");
      }

      const { checkoutUrl } = await response.json();

      // Redirect to Polar checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
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
