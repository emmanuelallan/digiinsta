import { z } from "zod"

export const productSchema = z.object({
  lemon_product_id: z.string().min(1, "Lemon product id is required"),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug must be less than 255 characters"),
  description: z.string().optional().or(z.literal("")),
  thumb_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
  price: z.number().int().nonnegative().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  category_ids: z.array(z.string().uuid("Invalid category id")).default([]),
})

export const updateProductSchema = productSchema.extend({
  id: z.string().uuid("Invalid product id"),
})

export type ProductFormData = z.infer<typeof productSchema>
export type UpdateProductFormData = z.infer<typeof updateProductSchema>
// For client form inputs (before defaults applied)
export type ProductFormInput = z.input<typeof productSchema>
