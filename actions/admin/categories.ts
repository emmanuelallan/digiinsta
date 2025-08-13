"use server"

import { createClient } from "@/lib/supabase/server"
import { categoryDbSchema, updateCategorySchema } from "@/schema/categories"
import { revalidatePath } from "next/cache"
import type { Category, CreateCategoryData, UpdateCategoryData } from "@/types/categories"

export async function getCategories(): Promise<{ data: Category[] | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch categories" }
  }
}

export async function createCategory(
  formData: CreateCategoryData,
): Promise<{ data: Category | null; error: string | null }> {
  try {
    const validatedData = categoryDbSchema.parse(formData)
    const supabase = await createClient()

    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", validatedData.slug)
      .single()

    if (existingCategory) {
      return { data: null, error: "A category with this slug already exists" }
    }

    const { data, error } = await supabase.from("categories").insert([validatedData]).select().single()

    if (error) {
      return { data: null, error: error.message }
    }

    revalidatePath("/admin/categories")
    return { data, error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message }
    }
    return { data: null, error: "Failed to create category" }
  }
}

export async function updateCategory(
  formData: UpdateCategoryData,
): Promise<{ data: Category | null; error: string | null }> {
  try {
    const validatedData = updateCategorySchema.parse(formData)
    const supabase = await createClient()

    // Check if slug already exists for other categories
    if (validatedData.slug) {
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", validatedData.slug)
        .neq("id", validatedData.id)
        .single()

      if (existingCategory) {
        return { data: null, error: "A category with this slug already exists" }
      }
    }

    const { data, error } = await supabase
      .from("categories")
      .update(validatedData)
      .eq("id", validatedData.id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    revalidatePath("/admin/categories")
    return { data, error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message }
    }
    return { data: null, error: "Failed to update category" }
  }
}

export async function deleteCategory(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    // Get category to delete associated image
    const { data: category } = await supabase.from("categories").select("image_url").eq("id", id).single()

    // Delete category
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      return { error: error.message }
    }

    // Delete associated image from storage if exists
    if (category?.image_url) {
      const imagePath = category.image_url.split("/").pop()
      if (imagePath) {
        await supabase.storage.from("category-images").remove([imagePath])
      }
    }

    revalidatePath("/admin/categories")
    return { error: null }
  } catch (error) {
    return { error: "Failed to delete category" }
  }
}

export async function uploadCategoryImage(file: File): Promise<{ data: string | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await supabase.storage.from("category-images").upload(fileName, file)

    if (error) {
      return { data: null, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("category-images").getPublicUrl(fileName)

    return { data: publicUrl, error: null }
  } catch (error) {
    return { data: null, error: "Failed to upload image" }
  }
}
