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
    price: dbProduct.price || 0,
    rating: dbProduct.rating || 4.5,
    reviews: dbProduct.reviews || 0,
    image: dbProduct.thumb_url || "/placeholder.svg?height=300&width=400",
    description: dbProduct.description || "",
    tags: dbProduct.tags || [],
    longDescription: dbProduct.description_html || dbProduct.description || "",
    gallery: dbProduct.images || [dbProduct.thumb_url || "/placeholder.svg?height=400&width=600"].filter(Boolean),
  }
}
