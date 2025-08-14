"use server"

import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/types/products"
import type { Category } from "@/types/categories"

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
    const [productsRes, categoriesRes] = await Promise.all([getActiveProducts(), getActiveCategories()])
    if (productsRes.error) return { data: null, error: productsRes.error }
    if (categoriesRes.error) return { data: null, error: categoriesRes.error }

    const categoriesById = new Map(
      (categoriesRes.data ?? []).map((c) => [c.id, { id: c.id, title: c.title, slug: c.slug }]),
    )

    const productsWithCategories: PublicProduct[] = (productsRes.data ?? []).map((p) => ({
      ...p,
      categories: (p.category_ids ?? [])
        .map((cid) => categoriesById.get(cid))
        .filter((c): c is { id: string; title: string; slug: string } => Boolean(c)),
    }))

    return { data: { products: productsWithCategories, categories: categoriesRes.data ?? [] }, error: null }
  } catch (err) {
    return { data: null, error: "Failed to build catalog" }
  }
}

export async function getPublicProductById(id: string): Promise<{ data: PublicProduct | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: product, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()
    if (error) return { data: null, error: error.message }
    if (!product) return { data: null, error: "Product not found" }

    const categoryIds = product.category_ids ?? []
    const { data: categories, error: catErr } = await supabase
      .from("categories")
      .select("id,title,slug")
      .in("id", categoryIds.length > 0 ? categoryIds : ["00000000-0000-0000-0000-000000000000"]) // ensure non-empty
    if (catErr) return { data: null, error: catErr.message }

    return {
      data: { ...product, categories: (categories ?? []) as PublicProduct["categories"] },
      error: null,
    }
  } catch (err) {
    return { data: null, error: "Failed to fetch product" }
  }
}
