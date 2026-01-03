import { ProductCard } from "./ProductCard";
import type { StorefrontProduct, ProductCardVariant } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: StorefrontProduct[];
  variant?: ProductCardVariant;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
  emptyMessage?: string;
}

const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
};

export function ProductGrid({
  products,
  variant = "default",
  columns = 4,
  className,
  emptyMessage = "No products found",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:gap-6", columnClasses[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={variant} />
      ))}
    </div>
  );
}
