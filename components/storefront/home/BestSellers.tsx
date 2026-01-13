import { unstable_cache } from "next/cache";
import { getBestSellers } from "@/lib/storefront";
import { ProductTray } from "./ProductTray";
import { COLLECTION_TAGS } from "@/lib/revalidation/tags";

interface BestSellersProps {
  className?: string;
}

/**
 * Cached best sellers fetching with collection tag
 * Validates: Requirements 2.3
 */
const getCachedBestSellers = () =>
  unstable_cache(
    async () => {
      return getBestSellers(8);
    },
    ["best-sellers"],
    {
      revalidate: 60, // 1 minute - reduced for fresher data
      tags: [COLLECTION_TAGS.bestSellers, COLLECTION_TAGS.allProducts],
    }
  )();

export async function BestSellers({ className }: BestSellersProps) {
  const products = await getCachedBestSellers();

  return (
    <ProductTray
      title="Best Sellers"
      subtitle="Top picks loved by our community"
      products={products}
      viewAllHref="/best-sellers"
      className={className}
    />
  );
}
