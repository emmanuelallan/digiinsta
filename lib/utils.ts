import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Product as DatabaseProduct } from "@/types/products"
import type { Product as ComprehensiveProduct } from "@/lib/products"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function mapDatabaseProductToComprehensive(dbProduct: DatabaseProduct): ComprehensiveProduct {
  return {
    id: parseInt(dbProduct.id) || 0,
    title: dbProduct.title,
    category: "Digital Products", // Default category since database doesn't have this
    price: (dbProduct.price || 0) / 100, // Convert from cents to dollars
    rating: 4.5, // Default rating since database doesn't have this
    reviews: 0, // Default reviews since database doesn't have this
    image: dbProduct.images?.[0]?.image_url || "/placeholder.svg?height=300&width=400",
    description: dbProduct.description || "",
    tags: dbProduct.tags || [],
    longDescription: dbProduct.description || "",
    gallery: dbProduct.images?.map(img => img.image_url) || ["/placeholder.svg?height=400&width=600"],
  }
}
