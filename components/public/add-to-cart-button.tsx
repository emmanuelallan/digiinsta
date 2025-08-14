"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/products"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  product: Product
  className?: string
  size?: "sm" | "lg" | "default"
}

export function AddToCartButton({ product, className, size = "lg" }: AddToCartButtonProps) {
  const { addItem, openCart } = useCart()

  const handleAddToCart = () => {
    addItem(product)
    openCart()
  }

  return (
    <Button size={size} className={cn("bg-cyan-600 hover:bg-cyan-700", className)} onClick={handleAddToCart}>
      <ShoppingCart className="h-5 w-5 mr-2" />
      Add to Cart
    </Button>
  )
}
