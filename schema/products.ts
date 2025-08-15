import { z } from "zod"

export const productSchema = z.object({
  lemon_product_id: z.string().min(1, "Lemon product id is required"),
  lemon_variant_id: z.string().min(1, "Lemon variant id is required"),
  subcategory_id: z.string().uuid("Invalid subcategory id").nullable().optional(),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug must be less than 255 characters"),
  price: z.number().int().nonnegative().nullable().optional(),
  description: z.string().nullable().optional(),
  details: z.record(z.any()).nullable().optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  is_physical: z.boolean().default(false),
  tags: z.array(z.string()).nullable().optional(),
  images: z.array(z.object({
    id: z.string(),
    image_url: z.string().url(),
    caption: z.string().nullable().optional(),
    sort_order: z.number().optional()
  })).default([]),
})

export const updateProductSchema = productSchema.extend({
  id: z.string().uuid("Invalid product id"),
})

export const bundleSchema = z.object({
  lemon_product_id: z.string().min(1, "Lemon product id is required"),
  lemon_variant_id: z.string().min(1, "Lemon variant id is required"),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug must be less than 255 characters"),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  hero_image_url: z.string().url("Invalid image URL").nullable().optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  product_ids: z.array(z.string().uuid("Invalid product id")).default([]),
})

export const updateBundleSchema = bundleSchema.extend({
  id: z.string().uuid("Invalid bundle id"),
})

export type ProductFormData = z.infer<typeof productSchema>
export type UpdateProductFormData = z.infer<typeof updateProductSchema>
export type BundleFormData = z.infer<typeof bundleSchema>
export type UpdateBundleFormData = z.infer<typeof updateBundleSchema>
// For client form inputs (before defaults applied)
export type ProductFormInput = z.input<typeof productSchema>
export type BundleFormInput = z.input<typeof bundleSchema>
