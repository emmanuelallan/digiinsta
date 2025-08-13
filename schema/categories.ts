import { z } from "zod"

export const categorySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug must be less than 255 characters"),
  description: z.string().optional(),
  image_url: z.url("Invalid image URL").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
})

// Schema for database operations (includes defaults)
export const categoryDbSchema = categorySchema.extend({
  status: z.enum(["active", "inactive"]).default("active"),
})

export const updateCategorySchema = categoryDbSchema.extend({
  id: z.uuid("Invalid category ID"),
})

export type CategoryFormData = z.infer<typeof categorySchema>
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>
