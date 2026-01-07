"use client";

import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Delete02Icon,
  ShoppingBag01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/lib/cart";
import { formatPrice, isOnSale, calculateSavingsPercent } from "@/lib/cart/utils";

export function CartSlideOut() {
  const { cart, itemCount, subtotal, savings, isOpen, closeCart, removeItem, clearCart } =
    useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        {/* Header */}
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2.5 text-lg">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={22} />
            Your Cart
            {itemCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
                {itemCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
            <div className="bg-muted mb-5 flex h-24 w-24 items-center justify-center rounded-full">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6 max-w-[240px] text-center text-sm">
              Looks like you haven&apos;t added any products yet. Start exploring!
            </p>
            <Button asChild onClick={closeCart}>
              <Link href="/categories" className="gap-2">
                Browse Products
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1">
              <div className="divide-y px-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-5">
                    {/* Image */}
                    <div className="bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <HugeiconsIcon
                            icon={ShoppingBag01Icon}
                            size={24}
                            className="text-muted-foreground"
                          />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-foreground line-clamp-2 text-sm leading-snug font-medium">
                            {item.title}
                          </h4>
                          <p className="text-muted-foreground mt-1 text-xs capitalize">
                            Digital {item.type}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1.5 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full transition-colors"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <HugeiconsIcon icon={Cancel01Icon} size={18} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-semibold">
                          {formatPrice(item.price)}
                        </span>
                        {isOnSale(item.price, item.compareAtPrice) && item.compareAtPrice && (
                          <>
                            <span className="text-muted-foreground text-xs line-through">
                              {formatPrice(item.compareAtPrice)}
                            </span>
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                              -{calculateSavingsPercent(item.compareAtPrice, item.price)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="bg-muted/30 border-t px-6 py-5">
              {/* Savings Banner */}
              {savings > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-500/10 px-4 py-3">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    You&apos;re saving
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatPrice(savings)}
                  </span>
                </div>
              )}

              {/* Subtotal */}
              <div className="mb-5 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Subtotal</span>
                <span className="text-foreground text-xl font-bold">{formatPrice(subtotal)}</span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout" onClick={closeCart} className="gap-2">
                    Checkout
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1"
                    size="default"
                    onClick={closeCart}
                  >
                    <Link href="/cart">View Full Cart</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearCart}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-11 min-h-[44px] w-11 min-w-[44px]"
                    aria-label="Clear cart"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={20} />
                  </Button>
                </div>
              </div>

              {/* Trust Badge */}
              <p className="text-muted-foreground mt-4 text-center text-xs">
                Secure checkout powered by Polar
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
