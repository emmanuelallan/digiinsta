"use client";

import { AddToCartButton } from "@/components/storefront/cart/AddToCartButton";
import { BuyNowButton } from "@/components/storefront/cart/BuyNowButton";
import { formatPrice, isOnSale, calculateSavingsPercent } from "@/lib/cart/utils";

interface BundleActionsProps {
  bundle: {
    id: number;
    title: string;
    price?: number;
    compareAtPrice?: number | null;
    polarProductId: string;
    heroImage?: { url?: string | null } | null;
    productCount: number;
  };
}

export function BundleActions({ bundle }: BundleActionsProps) {
  const hasPrice = bundle.price && bundle.price > 0;
  const onSale = isOnSale(bundle.price ?? 0, bundle.compareAtPrice);
  const heroImageUrl = bundle.heroImage?.url;

  if (!hasPrice) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Price not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Price Display */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-foreground text-4xl font-bold">{formatPrice(bundle.price!)}</span>
        {onSale && bundle.compareAtPrice && (
          <>
            <span className="text-muted-foreground text-xl line-through">
              {formatPrice(bundle.compareAtPrice)}
            </span>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-600">
              Save {calculateSavingsPercent(bundle.compareAtPrice, bundle.price!)}%
            </span>
          </>
        )}
      </div>

      {/* Per Product Price */}
      {bundle.productCount > 0 && (
        <p className="text-muted-foreground text-sm">
          Only{" "}
          <span className="text-foreground font-medium">
            {formatPrice(Math.round(bundle.price! / bundle.productCount))}
          </span>{" "}
          per product
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <AddToCartButton
          item={{
            type: "bundle",
            bundleId: bundle.id,
            polarProductId: bundle.polarProductId,
            title: bundle.title,
            price: bundle.price!,
            compareAtPrice: bundle.compareAtPrice,
            image: heroImageUrl ?? undefined,
          }}
          size="lg"
          fullWidth
          className="py-6 text-base"
        />
        <BuyNowButton
          polarProductId={bundle.polarProductId}
          productId={bundle.id}
          type="bundle"
          title={bundle.title}
          price={bundle.price}
          size="lg"
          fullWidth
          className="py-6 text-base"
        />
      </div>
    </div>
  );
}
