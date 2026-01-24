"use client";

import * as React from "react";
import { Button } from "../shared/button";

interface BuyNowButtonProps {
  checkoutUrl: string;
  productName: string;
  onCheckoutOpen?: () => void;
  className?: string;
}

export function BuyNowButton({
  checkoutUrl,
  productName,
  onCheckoutOpen,
  className,
}: BuyNowButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleClick = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate checkout URL
      if (!checkoutUrl) {
        throw new Error("Checkout URL is missing");
      }

      // Call optional callback before opening checkout
      onCheckoutOpen?.();

      // Open the checkout URL in the current window
      window.location.href = checkoutUrl;
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (err) {
      console.error("Checkout error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(
        retryCount < 2
          ? "Unable to open checkout. Please try again."
          : "We're having trouble opening checkout. Please contact support."
      );
      setRetryCount((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        variant="primary"
        size="lg"
        onClick={handleClick}
        loading={loading}
        className="w-full"
        aria-label={`Buy ${productName}`}
      >
        {error && retryCount > 0 ? "Retry Purchase" : "Buy Now"}
      </Button>
      
      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          <p className="font-medium">{error}</p>
          <p className="mt-1 text-xs">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@digitallove.com"
              className="underline hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 rounded"
            >
              support@digitallove.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
