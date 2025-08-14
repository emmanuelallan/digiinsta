"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import slugify from "slugify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { productSchema, type ProductFormData, type ProductFormInput } from "@/schema/products"
import { upsertProduct, updateProduct } from "@/actions/admin/products"
import type { LemonProduct, Product } from "@/types/products"

interface ProductFormProps {
  lemonProduct?: LemonProduct
  product?: Product
  categories: { id: string; title: string }[]
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ lemonProduct, product, categories, onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!product

  const defaultTitle = product?.title || lemonProduct?.attributes.name || ""
  const defaultSlug = product?.slug || slugify(defaultTitle, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      lemon_product_id: product?.lemon_product_id || lemonProduct?.id || "",
      title: defaultTitle,
      slug: defaultSlug,
      description: product?.description || lemonProduct?.attributes.description || "",
      thumb_url: product?.thumb_url || lemonProduct?.attributes.thumb_url || "",
      price: product?.price ?? lemonProduct?.attributes.price ?? undefined,
      status: (product?.status || "active") as "active" | "inactive",
      category_ids: product?.category_ids || [],
    },
  })

  const availableCategories = useMemo(() => categories, [categories])

  const handleSubmit = async (rawData: ProductFormInput) => {
    const data: ProductFormData = productSchema.parse(rawData)
    setIsSubmitting(true)
    try {
      const result = isEditing ? await updateProduct({ ...data, id: product!.id }) : await upsertProduct(data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Product ${isEditing ? "updated" : "saved"} successfully`)
      onSuccess()
    } catch (e) {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
            <Input id="title" {...form.register("title")} placeholder="Product title" className="h-11 px-4 text-sm" />
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-foreground">Slug</Label>
            <Input id="slug" {...form.register("slug")} placeholder="product-slug" className="h-11 px-4 text-sm" />
            {form.formState.errors.slug && <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
          <Textarea id="description" {...form.register("description")} rows={4} className="px-4 py-3 text-sm" />
          {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="thumb_url" className="text-sm font-medium text-foreground">Thumbnail URL</Label>
            <Input id="thumb_url" {...form.register("thumb_url")} placeholder="https://..." className="h-11 px-4 text-sm" />
            {form.formState.errors.thumb_url && <p className="text-sm text-destructive">{form.formState.errors.thumb_url.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-foreground">Price (cents)</Label>
            <Input id="price" type="number" {...form.register("price", { valueAsNumber: true })} placeholder="999" className="h-11 px-4 text-sm" />
            {form.formState.errors.price && <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
            <Select value={form.watch("status")} onValueChange={(value: "active" | "inactive") => form.setValue("status", value)}>
              <SelectTrigger className="h-11 px-4 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Categories</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableCategories.map((cat) => {
              const checked = form.watch("category_ids")?.includes(cat.id) ?? false
              return (
                <label key={cat.id} className="flex items-center gap-2 text-sm p-2 rounded border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const current = new Set(form.watch("category_ids") ?? [])
                      if (e.target.checked) current.add(cat.id)
                      else current.delete(cat.id)
                      form.setValue("category_ids", Array.from(current))
                    }}
                  />
                  <span>{cat.title}</span>
                </label>
              )
            })}
          </div>
          {form.formState.errors.category_ids && <p className="text-sm text-destructive">{form.formState.errors.category_ids.message as string}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6 text-sm font-medium">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="h-11 px-6 text-sm font-medium">
          {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </form>
  )
}
