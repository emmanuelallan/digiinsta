"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/products"
import { cn } from "@/lib/utils"

interface BuyNowButtonProps {
  product: Product
  className?: string
  size?: "sm" | "lg" | "default"
}

export function BuyNowButton({ product, className, size = "lg" }: BuyNowButtonProps) {
  const { clearCart, addItem } = useCart()
  const router = useRouter()

  const handleBuyNow = () => {
    // Clear cart and add only this product
    clearCart()
    addItem(product)
    // Redirect to checkout
    router.push("/checkout")
  }

  return (
    <Button variant="outline" size={size} className={cn("", className)} onClick={handleBuyNow}>
      Buy Now
    </Button>
  )
}
