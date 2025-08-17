"use server"

import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/types/products"
import type { Tables } from "@/types/supabase"

type Category = Tables<"categories">

export interface PublicProduct extends Product {
  categories: Pick<Category, "id" | "title" | "slug">[]
}

export async function getActiveCategories(): Promise<{ data: Category[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("status", "active")
      .order("title", { ascending: true })
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: "Failed to fetch categories" }
  }
}

export async function getActiveProducts(): Promise<{ data: Product[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: "Failed to fetch products" }
  }
}

export async function getPublicCatalog(): Promise<{
  data: { products: PublicProduct[]; categories: Category[] } | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    // Get products with their subcategories and categories in one query
    const { data: productsWithRelations, error: productsError } = await supabase
      .from("products")
      .select(`
        *,
        subcategories!products_subcategory_id_fkey (
          id,
          title,
          slug,
          categories!subcategories_category_id_fkey (
            id,
            title,
            slug
          )
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (productsError) return { data: null, error: productsError.message }

    // Get all active categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("status", "active")
      .order("title", { ascending: true })

    if (categoriesError) return { data: null, error: categoriesError.message }

    // Transform products to include categories
    const productsWithCategories: PublicProduct[] = (productsWithRelations ?? []).map((p) => {
      const categories = p.subcategories?.categories ? [p.subcategories.categories] : []
      return {
        ...p,
        categories: categories.map(c => ({ id: c.id, title: c.title, slug: c.slug }))
      }
    })

    return { data: { products: productsWithCategories, categories: categories ?? [] }, error: null }
  } catch (err) {
    return { data: null, error: "Failed to build catalog" }
  }
}

export async function getPublicProductById(id: string): Promise<{ data: PublicProduct | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    // Get product with its subcategory, category, and images in one query
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          id,
          image_url,
          caption,
          sort_order
        ),
        subcategories!products_subcategory_id_fkey (
          id,
          title,
          slug,
          categories!subcategories_category_id_fkey (
            id,
            title,
            slug
          )
        )
      `)
      .eq("id", id)
      .maybeSingle()

    if (error) return { data: null, error: error.message }
    if (!product) return { data: null, error: "Product not found" }

    // Transform to include categories and images
    const categories = product.subcategories?.categories ? [product.subcategories.categories] : []
    
    type ProductImageData = {
      id: string
      image_url: string
      caption: string | null
      sort_order: number | null
    }
    
    const images = (product.product_images as ProductImageData[] || [])
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(img => ({
        id: img.id,
        product_id: id,
        image_url: img.image_url,
        caption: img.caption,
        sort_order: img.sort_order
      }))

    return {
      data: {
        ...product,
        images,
        categories: categories.map(c => ({ id: c.id, title: c.title, slug: c.slug }))
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: "Failed to fetch product" }
  }
}
