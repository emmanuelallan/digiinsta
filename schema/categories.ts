import { z } from "zod"

export const categorySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug must be less than 255 characters"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  image_url: z.url("Invalid image URL").optional().or(z.literal("")),
  // Align with Supabase enum: category_status: "active" | "archived"
  status: z.enum(["active", "archived"]),
})

// Schema for database operations (includes defaults)
export const categoryDbSchema = categorySchema.extend({
  status: z.enum(["active", "archived"]).default("active"),
})

export const updateCategorySchema = categoryDbSchema.extend({
  id: z.uuid("Invalid category ID"),
})

export type CategoryFormData = z.infer<typeof categorySchema>
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>

// Subcategory schemas
export const subcategorySchema = z.object({
  category_id: z.string().uuid("Invalid category ID"),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug must be less than 255 characters"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  image_url: z.url("Invalid image URL").optional().or(z.literal("")),
})

export const subcategoryDbSchema = subcategorySchema

export const updateSubcategorySchema = subcategorySchema.extend({
  id: z.string().uuid("Invalid subcategory ID"),
})

export type SubcategoryFormData = z.infer<typeof subcategorySchema>
export type UpdateSubcategoryFormData = z.infer<typeof updateSubcategorySchema>
