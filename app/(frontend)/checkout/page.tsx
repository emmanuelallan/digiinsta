"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingBag01Icon,
  ArrowLeft01Icon,
  Loading03Icon,
  LockIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCart } from "@/lib/cart";
import { formatPrice, isOnSale, calculateSavingsPercent } from "@/lib/cart/utils";

export default function CheckoutPage() {
  const { cart, itemCount, subtotal, savings } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            polarProductId: item.polarProductId,
            productId: item.productId,
            type: item.type,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout");
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted mb-6 flex h-24 w-24 items-center justify-center rounded-full">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={40} className="text-muted-foreground" />
            </div>
            <h1 className="text-foreground mb-2 text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Add some products to your cart before checking out.
            </p>
            <Button asChild size="lg">
              <Link href="/categories">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/cart">Cart</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/cart"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to cart
        </Link>

        <h1 className="text-foreground mb-8 text-2xl font-bold sm:text-3xl">Checkout</h1>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">Order Summary</h2>

          {/* Items */}
          <div className="divide-y">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                {/* Image */}
                <div className="bg-muted relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <HugeiconsIcon
                        icon={ShoppingBag01Icon}
                        size={20}
                        className="text-muted-foreground"
                      />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-sm font-medium">{item.title}</h3>
                    <p className="text-muted-foreground mt-0.5 text-xs capitalize">
                      Digital {item.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-foreground font-medium">{formatPrice(item.price)}</span>
                    {isOnSale(item.price, item.compareAtPrice) && item.compareAtPrice && (
                      <div className="mt-0.5 flex items-center justify-end gap-1.5">
                        <span className="text-muted-foreground text-xs line-through">
                          {formatPrice(item.compareAtPrice)}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">
                          -{calculateSavingsPercent(item.compareAtPrice, item.price)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
              <span className="text-foreground">{formatPrice(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">Discount</span>
                <span className="text-emerald-600">-{formatPrice(savings)}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between">
            <span className="text-foreground text-lg font-semibold">Total</span>
            <span className="text-foreground text-2xl font-bold">{formatPrice(subtotal)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="mt-6 space-y-4">
          <Button
            className="w-full py-6 text-base"
            size="lg"
            onClick={handleCheckout}
            disabled={isProcessing || cart.items.length === 0}
          >
            {isProcessing ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} size={20} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={LockIcon} size={18} className="mr-2" />
                Pay {formatPrice(subtotal)}
              </>
            )}
          </Button>

          <p className="text-muted-foreground flex items-center justify-center gap-2 text-center text-xs">
            <HugeiconsIcon icon={LockIcon} size={14} />
            Secure checkout powered by Polar
          </p>
        </div>

        {/* Info */}
        <div className="bg-muted/50 mt-8 rounded-lg p-4">
          <h3 className="text-foreground mb-2 text-sm font-medium">What happens next?</h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• You&apos;ll be redirected to our secure payment page</li>
            <li>• After payment, you&apos;ll receive instant access to your downloads</li>
            <li>• A confirmation email will be sent with your receipt</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
