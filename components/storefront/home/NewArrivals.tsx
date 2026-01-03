import { getNewArrivals } from "@/lib/storefront";
import { ProductTray } from "./ProductTray";

interface NewArrivalsProps {
  className?: string;
}

export async function NewArrivals({ className }: NewArrivalsProps) {
  const products = await getNewArrivals(8);

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
