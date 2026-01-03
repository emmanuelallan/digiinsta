"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingBag01Icon,
  Cancel01Icon,
  Delete02Icon,
  Loading03Icon,
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

export default function CartPage() {
  const { cart, itemCount, subtotal, savings, removeItem, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    setIsCheckingOut(true);
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
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Cart</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-foreground mb-8 text-2xl font-bold sm:text-3xl">
          Shopping Cart ({itemCount})
        </h1>

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-6 flex h-24 w-24 items-center justify-center rounded-full">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={40} className="text-muted-foreground" />
            </div>
            <h2 className="text-foreground mb-2 text-xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Looks like you haven&apos;t added any products yet.
            </p>
            <Button asChild size="lg">
              <Link href="/categories">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card flex gap-4 rounded-lg border p-4 sm:gap-6 sm:p-6"
                  >
                    {/* Image */}
                    <div className="bg-muted relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-32">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <HugeiconsIcon
                            icon={ShoppingBag01Icon}
                            size={32}
                            className="text-muted-foreground"
                          />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-foreground font-semibold">{item.title}</h3>
                          <p className="text-muted-foreground mt-1 text-sm capitalize">
                            {item.type}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <HugeiconsIcon icon={Cancel01Icon} size={20} />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-lg font-semibold">
                            {formatPrice(item.price)}
                          </span>
                          {isOnSale(item.price, item.compareAtPrice) && (
                            <>
                              <span className="text-muted-foreground line-through">
                                {formatPrice(item.compareAtPrice!)}
                              </span>
                              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                {calculateSavingsPercent(item.compareAtPrice!, item.price)}% off
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={16} className="mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card sticky top-24 rounded-lg border p-6">
                <h2 className="text-foreground mb-4 text-lg font-semibold">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Savings</span>
                      <span className="text-emerald-600">-{formatPrice(savings)}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-foreground text-xl font-bold">{formatPrice(subtotal)}</span>
                </div>

                <Button
                  className="mt-6 w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cart.items.length === 0}
                >
                  {isCheckingOut ? (
                    <>
                      <HugeiconsIcon icon={Loading03Icon} size={20} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>

                <p className="text-muted-foreground mt-4 text-center text-xs">
                  Secure checkout powered by Polar
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
