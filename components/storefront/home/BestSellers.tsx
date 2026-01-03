import { getBestSellers } from "@/lib/storefront";
import { ProductTray } from "./ProductTray";

interface BestSellersProps {
  className?: string;
}

export async function BestSellers({ className }: BestSellersProps) {
  const products = await getBestSellers(8);

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
