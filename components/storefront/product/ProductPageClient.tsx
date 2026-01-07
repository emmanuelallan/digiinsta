"use client";

import { useRef } from "react";
import { StickyAddToCart } from "./StickyAddToCart";

interface ProductPageClientProps {
  product: {
    id: number;
    title: string;
    price?: number;
    compareAtPrice?: number | null;
    polarProductId: string;
    images?: Array<{
      image: { url?: string | null };
      alt?: string | null;
    }> | null;
  };
  children: React.ReactNode;
}

/**
 * Client wrapper for product page that provides the sticky add-to-cart functionality
 * Wraps the main CTA section and provides a ref for visibility tracking
 */
export function ProductPageClient({ product, children }: ProductPageClientProps) {
  const ctaRef = useRef<HTMLDivElement>(null);

  const hasPrice = product.price && product.price > 0;

  return (
    <>
      {/* Wrap children with ref for visibility tracking */}
      <div ref={ctaRef}>{children}</div>

      {/* Sticky Add-to-Cart Bar */}
      {hasPrice && (
        <StickyAddToCart
          product={{
            id: product.id,
            title: product.title,
            price: product.price!,
            compareAtPrice: product.compareAtPrice,
            polarProductId: product.polarProductId,
            images: product.images,
          }}
          triggerRef={ctaRef}
        />
      )}
    </>
  );
}
