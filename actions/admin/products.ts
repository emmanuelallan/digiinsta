"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { LemonProduct, ManagedAndUnmanagedProducts, Product, UpsertProductData } from "@/types/products"
import { productSchema, updateProductSchema } from "@/schema/products"

const LEMON_API = "https://api.lemonsqueezy.com/v1/products"

async function fetchAllLemonProducts(apiKey: string, storeId?: string): Promise<LemonProduct[]> {
  const headers = {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${apiKey}`,
  }

  const collected: LemonProduct[] = []
  let url = new URL(LEMON_API)
  url.searchParams.set("sort", "name")
  if (storeId) url.searchParams.set("filter[store_id]", storeId)

  while (true) {
    const res = await fetch(url.toString(), { headers, cache: "no-store" })
    if (!res.ok) {
      throw new Error(`Lemon Squeezy request failed (${res.status})`)
    }
    const json = await res.json()
    if (Array.isArray(json?.data)) {
      collected.push(...json.data)
    }
    const next = json?.links?.next as string | undefined
    if (!next) break
    url = new URL(next)
  }

  return collected
}

export async function getManagedProducts(): Promise<{ data: Product[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: "Failed to fetch products" }
  }
}

export async function getLemonProductsNotInSupabase(): Promise<{ data: LemonProduct[] | null; error: string | null }> {
  try {
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID
    if (!apiKey) return { data: null, error: "Missing Lemon Squeezy API key" }

    const lemonProducts = await fetchAllLemonProducts(apiKey, storeId)

    const supabase = await createClient()
    const { data: managed, error } = await supabase.from("products").select("lemon_product_id")
    if (error) return { data: null, error: error.message }

    const managedIds = new Set((managed ?? []).map((p) => p.lemon_product_id))
    const unmanaged = lemonProducts.filter((p) => !managedIds.has(p.id))

    return { data: unmanaged, error: null }
  } catch (err) {
    return { data: null, error: "Failed to fetch Lemon Squeezy products" }
  }
}

export async function getProductsSplit(): Promise<{ data: ManagedAndUnmanagedProducts | null; error: string | null }> {
  try {
    const [managedRes, unmanagedRes] = await Promise.all([getManagedProducts(), getLemonProductsNotInSupabase()])
    if (managedRes.error) return { data: null, error: managedRes.error }
    if (unmanagedRes.error) return { data: null, error: unmanagedRes.error }

    return { data: { managed: managedRes.data ?? [], unmanaged: unmanagedRes.data ?? [] }, error: null }
  } catch (err) {
    return { data: null, error: "Failed to split product lists" }
  }
}

export async function upsertProduct(formData: UpsertProductData): Promise<{ data: Product | null; error: string | null }> {
  try {
    const validated = productSchema.parse(formData)
    const supabase = await createClient()

    // Check duplicate lemon_product_id
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("lemon_product_id", validated.lemon_product_id)
      .limit(1)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from("products")
        .update({
          title: validated.title,
          slug: validated.slug,
          description: validated.description || null,
          thumb_url: validated.thumb_url || null,
          price: validated.price ?? null,
          status: validated.status ?? "active",
          category_ids: validated.category_ids ?? [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()
      if (error) return { data: null, error: error.message }
      revalidatePath("/admin/products")
      return { data, error: null }
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          lemon_product_id: validated.lemon_product_id,
          title: validated.title,
          slug: validated.slug,
          description: validated.description || null,
          thumb_url: validated.thumb_url || null,
          price: validated.price ?? null,
          status: validated.status ?? "active",
          category_ids: validated.category_ids ?? [],
        },
      ])
      .select()
      .single()

    if (error) return { data: null, error: error.message }

    revalidatePath("/admin/products")
    return { data, error: null }
  } catch (err: any) {
    return { data: null, error: err?.message ?? "Failed to save product" }
  }
}

export async function updateProduct(formData: { id: string } & Partial<UpsertProductData>): Promise<{ data: Product | null; error: string | null }> {
  try {
    const validated = updateProductSchema.parse(formData)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("products")
      .update({
        title: validated.title,
        slug: validated.slug,
        description: validated.description || null,
        thumb_url: validated.thumb_url || null,
        price: validated.price ?? null,
        status: validated.status ?? "active",
        category_ids: validated.category_ids ?? [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.id)
      .select()
      .single()

    if (error) return { data: null, error: error.message }

    revalidatePath("/admin/products")
    return { data, error: null }
  } catch (err: any) {
    return { data: null, error: err?.message ?? "Failed to update product" }
  }
}
