"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon, Download01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const { clearCart } = useCart();

  // Clear cart on successful checkout
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={48} className="text-emerald-500" />
          </div>

          {/* Title */}
          <h1 className="text-foreground mb-4 text-3xl font-bold">Thank you for your purchase!</h1>

          {/* Description */}
          <p className="text-muted-foreground mb-8 text-lg">
            Your order has been confirmed and your digital products are ready.
          </p>

          {/* Order Info */}
          {checkoutId && (
            <div className="bg-muted/50 mb-8 rounded-lg p-4">
              <p className="text-muted-foreground text-sm">
                Order ID: <span className="text-foreground font-mono">{checkoutId}</span>
              </p>
            </div>
          )}

          {/* What's Next */}
          <div className="mb-8 space-y-4 text-left">
            <h2 className="text-foreground text-lg font-semibold">What&apos;s next?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <HugeiconsIcon icon={Mail01Icon} size={14} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-foreground font-medium">Check your email</p>
                  <p className="text-muted-foreground text-sm">
                    We&apos;ve sent a confirmation email with your receipt and download links.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <HugeiconsIcon icon={Download01Icon} size={14} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-foreground font-medium">Download your products</p>
                  <p className="text-muted-foreground text-sm">
                    Access your digital products anytime from your Polar account or email links.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/categories">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
