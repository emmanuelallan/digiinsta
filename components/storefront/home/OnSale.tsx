import { unstable_cache } from "next/cache";
import { getOnSale } from "@/lib/storefront";
import { ProductTray } from "./ProductTray";
import { COLLECTION_TAGS } from "@/lib/revalidation/tags";

interface OnSaleProps {
  className?: string;
}

/**
 * Cached on sale products fetching with collection tag
 * Requirements: 6.6, 11.5 - Products on sale where compareAtPrice > currentPrice
 */
const getCachedOnSale = () =>
  unstable_cache(
    async () => {
      const result = await getOnSale(8);
      return result.products;
    },
    ["on-sale"],
    {
      revalidate: 3600, // 1 hour fallback
      tags: [COLLECTION_TAGS.onSale, COLLECTION_TAGS.allProducts],
    }
  )();

export async function OnSale({ className }: OnSaleProps) {
  const products = await getCachedOnSale();

  if (products.length === 0) {
    return null;
  }

  return (
    <ProductTray
      title="On Sale"
      subtitle="Great deals on premium digital products"
      products={products}
      viewAllHref="/sale"
      className={className}
    />
  );
}
