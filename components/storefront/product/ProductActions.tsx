"use client";

import { AddToCartButton } from "@/components/storefront/cart/AddToCartButton";
import { BuyNowButton } from "@/components/storefront/cart/BuyNowButton";
import { formatPrice, isOnSale, calculateSavingsPercent } from "@/lib/cart/utils";

interface ProductActionsProps {
  product: {
    id: string;
    title: string;
    price?: number;
    compareAtPrice?: number | null;
    polarProductId: string;
    images?: Array<{
      image?: { url?: string | null } | null;
      alt?: string | null;
    }> | null;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const hasPrice = product.price && product.price > 0;
  const onSale = isOnSale(product.price ?? 0, product.compareAtPrice);
  const firstImage = product.images?.[0]?.image?.url;

  if (!hasPrice) {
    return (
      <div className="space-y-4 pt-2">
        <p className="text-muted-foreground text-sm">Price not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Price Display */}
      <div className="flex items-baseline gap-3">
        <span className="text-foreground text-3xl font-bold">{formatPrice(product.price!)}</span>
        {onSale && product.compareAtPrice && (
          <>
            <span className="text-muted-foreground text-lg line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-600">
              {calculateSavingsPercent(product.compareAtPrice, product.price!)}% off
            </span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <AddToCartButton
          item={{
            type: "product",
            productId: product.id,
            polarProductId: product.polarProductId,
            title: product.title,
            price: product.price!,
            compareAtPrice: product.compareAtPrice,
            image: firstImage ?? undefined,
          }}
          size="lg"
          fullWidth
          className="py-6 text-base"
        />
        <BuyNowButton
          polarProductId={product.polarProductId}
          productId={product.id}
          type="product"
          title={product.title}
          price={product.price}
          size="lg"
          fullWidth
          className="py-6 text-base"
        />
      </div>
    </div>
  );
}
