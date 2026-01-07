"use client";

import dynamic from "next/dynamic";

/**
 * Client-side wrapper for CartSlideOut with lazy loading
 * This wrapper is needed because `ssr: false` with `next/dynamic`
 * is not allowed in Server Components in Next.js 16+
 *
 * Validates: Requirements 5.1, 5.2
 */
const CartSlideOut = dynamic(
  () => import("@/components/storefront/cart/CartSlideOut").then((mod) => mod.CartSlideOut),
  {
    ssr: false, // Cart is client-side only
  }
);

export function CartSlideOutWrapper() {
  return <CartSlideOut />;
}
