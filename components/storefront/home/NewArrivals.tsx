import { unstable_cache } from "next/cache";
import { getNewArrivals } from "@/lib/storefront";
import { ProductTray } from "./ProductTray";
import { COLLECTION_TAGS } from "@/lib/revalidation/tags";

interface NewArrivalsProps {
  className?: string;
}

/**
 * Cached new arrivals fetching with collection tag
 * Validates: Requirements 2.3
 */
const getCachedNewArrivals = () =>
  unstable_cache(
    async () => {
      return getNewArrivals(8);
    },
    ["new-arrivals"],
    {
      revalidate: 3600, // 1 hour fallback
      tags: [COLLECTION_TAGS.newArrivals, COLLECTION_TAGS.allProducts],
    }
  )();

export async function NewArrivals({ className }: NewArrivalsProps) {
  const products = await getCachedNewArrivals();

  return (
    <ProductTray
      title="New Arrivals"
      subtitle="Fresh additions to help you achieve more"
      products={products}
      viewAllHref="/new-arrivals"
      className={className}
    />
  );
}
