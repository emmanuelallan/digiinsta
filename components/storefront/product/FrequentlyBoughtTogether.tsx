"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/cart/utils";
import type { StorefrontProduct } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface FrequentlyBoughtTogetherProps {
  /** The source product */
  sourceProduct: {
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    polarProductId: string;
    images?: Array<{ image?: { url?: string } | null; alt?: string | null }> | null;
  };
  /** Related products to display */
  relatedProducts: StorefrontProduct[];
  /** Maximum products to show (default: 3) */
  limit?: number;
  /** Section title */
  title?: string;
  /** Custom class name */
  className?: string;
}

interface SelectableProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  polarProductId: string;
  image?: string;
  selected: boolean;
  isSource: boolean;
}

export function FrequentlyBoughtTogether({
  sourceProduct,
  relatedProducts,
  limit = 3,
  title = "Frequently Bought Together",
  className,
}: FrequentlyBoughtTogetherProps) {
  const { addItem, isInCart } = useCart();
  const [addedAll, setAddedAll] = useState(false);

  // Limit related products
  const displayProducts = relatedProducts.slice(0, limit);

  // Don't render if no related products
  if (displayProducts.length === 0) {
    return null;
  }

  // Initialize selectable products (source + related)
  const sourceImage = sourceProduct.images?.[0]?.image?.url;
  const [selectedProducts, setSelectedProducts] = useState<SelectableProduct[]>(() => [
    {
      id: sourceProduct.id,
      title: sourceProduct.title,
      slug: "",
      price: sourceProduct.price,
      compareAtPrice: sourceProduct.compareAtPrice,
      polarProductId: sourceProduct.polarProductId,
      image: sourceImage ?? undefined,
      selected: true,
      isSource: true,
    },
    ...displayProducts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price ?? 0,
      compareAtPrice: p.compareAtPrice,
      polarProductId: p.polarProductId ?? "",
      image: p.images?.[0]?.image?.url ?? undefined,
      selected: true,
      isSource: false,
    })),
  ]);

  const toggleProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        // Don't allow deselecting the source product
        if (p.isSource) return p;
        return p.id === productId ? { ...p, selected: !p.selected } : p;
      })
    );
    setAddedAll(false);
  };

  const selectedItems = selectedProducts.filter((p) => p.selected);
  const totalPrice = selectedItems.reduce((sum, p) => sum + p.price, 0);
  const totalComparePrice = selectedItems.reduce(
    (sum, p) => sum + (p.compareAtPrice ?? p.price),
    0
  );
  const hasSavings = totalComparePrice > totalPrice;

  const handleAddAllToCart = () => {
    selectedItems.forEach((product) => {
      if (!isInCart(product.id, "product") && product.polarProductId) {
        addItem({
          type: "product",
          productId: product.id,
          polarProductId: product.polarProductId,
          title: product.title,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: product.image,
        });
      }
    });
    setAddedAll(true);
  };

  const allInCart = selectedItems.every((p) => isInCart(p.id, "product"));

  return (
    <section className={cn("py-8", className)} aria-labelledby="frequently-bought-together">
      <h2 id="frequently-bought-together" className="text-foreground mb-6 text-lg font-semibold">
        {title}
      </h2>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Products */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {selectedProducts.map((product, index) => (
            <div key={product.id} className="flex items-center gap-3">
              {/* Product Card */}
              <button
                type="button"
                onClick={() => toggleProduct(product.id)}
                disabled={product.isSource}
                className={cn(
                  "relative flex flex-col items-center rounded-lg border p-3 transition-all",
                  product.selected
                    ? "border-primary/50 bg-primary/5"
                    : "border-muted bg-muted/30 opacity-60",
                  !product.isSource && "hover:border-primary cursor-pointer"
                )}
              >
                {/* Selection indicator */}
                <div
                  className={cn(
                    "absolute top-2 left-2 h-4 w-4 rounded-full border-2 transition-colors",
                    product.selected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground bg-transparent"
                  )}
                >
                  {product.selected && <Check className="h-3 w-3 text-white" />}
                </div>

                {/* Image */}
                <div className="bg-muted relative mb-2 h-20 w-20 overflow-hidden rounded-md">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-muted-foreground text-xs">No image</span>
                    </div>
                  )}
                </div>

                {/* Title & Price */}
                <p className="line-clamp-1 max-w-[80px] text-center text-xs font-medium">
                  {product.title}
                </p>
                <p className="text-foreground text-sm font-semibold">
                  {formatPrice(product.price)}
                </p>
              </button>

              {/* Plus sign between products */}
              {index < selectedProducts.length - 1 && (
                <Plus className="text-muted-foreground h-5 w-5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Total & Add to Cart */}
        <div className="bg-card flex flex-col items-center gap-3 rounded-lg border p-4 lg:min-w-[200px]">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Total for {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-foreground text-xl font-bold">{formatPrice(totalPrice)}</span>
              {hasSavings && (
                <span className="text-muted-foreground text-sm line-through">
                  {formatPrice(totalComparePrice)}
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handleAddAllToCart}
            disabled={allInCart || selectedItems.length === 0}
            className="w-full"
            size="lg"
          >
            {allInCart || addedAll ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add All to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
