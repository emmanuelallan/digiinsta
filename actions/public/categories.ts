"use server"

import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/supabase"

export type PublicSubcategory = Pick<Tables<"subcategories">, "id" | "title" | "slug">
export type PublicCategory = Pick<Tables<"categories">, "id" | "title" | "slug" | "tagline" | "image_url"> & {
  subcategories: PublicSubcategory[]
}

export type PublicBundle = Pick<
  Tables<"bundles">,
  "id" | "title" | "slug" | "price" | "tagline" | "hero_image_url"
>

export async function getCategoriesWithSubcategories(): Promise<{
  data: PublicCategory[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id,title,slug,status,tagline,image_url")
      .eq("status", "active")
      .order("title", { ascending: true })

    if (categoriesError) return { data: null, error: categoriesError.message }

    const categoryIds = (categories ?? []).map((c) => c.id)

    // Guard to avoid empty `in` queries
    const inIds = categoryIds.length > 0 ? categoryIds : ["00000000-0000-0000-0000-000000000000"]

    const { data: subcategories, error: subcategoriesError } = await supabase
      .from("subcategories")
      .select("id,title,slug,category_id")
      .in("category_id", inIds)
      .order("title", { ascending: true })

    if (subcategoriesError) return { data: null, error: subcategoriesError.message }

    const subcategoriesByCategory = new Map<string, PublicSubcategory[]>()
    for (const sub of subcategories ?? []) {
      const list = subcategoriesByCategory.get(sub.category_id) ?? []
      list.push({ id: sub.id, title: sub.title, slug: sub.slug })
      subcategoriesByCategory.set(sub.category_id, list)
    }

    const result: PublicCategory[] = (categories ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      tagline: c.tagline ?? null,
      image_url: c.image_url ?? null,
      subcategories: subcategoriesByCategory.get(c.id) ?? [],
    }))

    return { data: result, error: null }
  } catch (err) {
    return { data: null, error: "Failed to fetch categories" }
  }
}

export async function getActiveBundles(limit = 6): Promise<{
  data: PublicBundle[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("bundles")
      .select("id,title,slug,price,tagline,hero_image_url,status")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(limit)

    if (error) return { data: null, error: error.message }

    return {
      data: (data ?? []).map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        price: b.price ?? null,
        tagline: b.tagline ?? null,
        hero_image_url: b.hero_image_url ?? null,
      })) as PublicBundle[],
      error: null,
    }
  } catch (err) {
    return { data: null, error: "Failed to fetch bundles" }
  }
}

export async function getPublicNavigationData() {
  const [categoriesRes, bundlesRes] = await Promise.all([
    getCategoriesWithSubcategories(),
    getActiveBundles(6),
  ])
  return {
    categories: categoriesRes.data ?? [],
    bundles: bundlesRes.data ?? [],
    error: categoriesRes.error || bundlesRes.error || null,
  }
}

