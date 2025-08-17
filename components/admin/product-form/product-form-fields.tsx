"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { type ProductFormInput } from "@/schema/products"
import type { Tables } from "@/types/supabase"
import type { Product } from "@/types/products"
import { Tag, X, Plus } from "lucide-react"
import { ProductImageUpload } from "@/components/shared/product-image-upload"
import { ProductDescriptionEditor } from "@/components/shared/product-description-editor"

interface ProductFormFieldsProps {
  form: UseFormReturn<ProductFormInput>
  categories: Tables<"categories">[]
  subcategories: Tables<"subcategories">[]
  selectedCategoryId: string
  setSelectedCategoryId: (id: string) => void
  productImages: Array<{ id: string; image_url: string; caption?: string | null; sort_order?: number | null }>
  setProductImages: (images: Array<{ id: string; image_url: string; caption?: string | null; sort_order?: number | null }>) => void
  onSubmit: (data: ProductFormInput) => void
  onCancel: () => void
  isSubmitting: boolean
  isEditing: boolean
  product?: Product
}

export function ProductFormFields({
  form,
  categories,
  subcategories,
  selectedCategoryId,
  setSelectedCategoryId,
  productImages,
  setProductImages,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing,
  product
}: ProductFormFieldsProps) {
  const addTag = (tag: string) => {
    const currentTags = form.watch("tags") || []
    if (!currentTags.includes(tag)) {
      form.setValue("tags", [...currentTags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.watch("tags") || []
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove))
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Product title"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-foreground">Slug</Label>
            <Input
              id="slug"
              {...form.register("slug")}
              placeholder="product-slug"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
            <ProductDescriptionEditor
              value={form.watch("description") || ""}
              onChange={(content) => form.setValue("description", content)}
              placeholder="Enter product description..."
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Details (JSON)</Label>
            <Textarea
              id="details"
              placeholder="Enter product details as JSON (e.g., {'color': 'red', 'size': 'large'})"
              rows={4}
              className="px-4 py-3 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              value={form.watch("details") ? JSON.stringify(form.watch("details"), null, 2) : ""}
              onChange={(e) => {
                try {
                  const parsed = e.target.value ? JSON.parse(e.target.value) : null
                  form.setValue("details", parsed)
                } catch {
                  // Invalid JSON, don't set the value
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Enter additional product details as JSON. This will be stored as structured data.
            </p>
          </div>
        </div>

        {/* Right Column - Settings & Images */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-foreground">Price (cents)</Label>
              <Input
                id="price"
                type="number"
                {...form.register("price", { valueAsNumber: true })}
                placeholder="999"
                className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value: "active" | "draft" | "archived") => form.setValue("status", value)}
              >
                <SelectTrigger className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_physical" className="text-sm font-medium text-foreground">Physical Product</Label>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_physical"
                checked={form.watch("is_physical")}
                onChange={(e) => form.setValue("is_physical", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="is_physical" className="text-sm">Requires shipping</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Category & Subcategory</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.watch("subcategory_id") || ""}
                onValueChange={(value) => form.setValue("subcategory_id", value || null)}
                disabled={!selectedCategoryId}
              >
                <SelectTrigger className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Tags</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      if (input.value.trim()) {
                        addTag(input.value.trim())
                        input.value = ''
                      }
                    }
                  }}
                  className="flex-1 h-10 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement
                    if (input?.value.trim()) {
                      addTag(input.value.trim())
                      input.value = ''
                    }
                  }}
                  className="h-10 px-4 border-border bg-background hover:bg-muted/50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.watch("tags") || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Full Width - Images */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Product Images</Label>
            <ProductImageUpload
              value={productImages}
              onChange={setProductImages}
              productId={product?.id}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11 px-6 text-sm font-medium border-border bg-background hover:bg-muted/50 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}
