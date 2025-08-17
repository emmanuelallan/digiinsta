"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type BundleFormInput } from "@/schema/products"
import type { Product } from "@/types/products"
import { ProductDescriptionEditor } from "@/components/shared/product-description-editor"

interface BundleFormFieldsProps {
  form: UseFormReturn<BundleFormInput>
  availableProducts: Product[]
  selectedProductIds: string[]
  setSelectedProductIds: (ids: string[]) => void
  onSubmit: (data: BundleFormInput) => void
  onCancel: () => void
  isSubmitting: boolean
  isEditing: boolean
}

export function BundleFormFields({
  form,
  availableProducts,
  selectedProductIds,
  setSelectedProductIds,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing
}: BundleFormFieldsProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bundle-title" className="text-sm font-medium text-foreground">Title</Label>
            <Input
              id="bundle-title"
              {...form.register("title")}
              placeholder="Bundle title"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundle-slug" className="text-sm font-medium text-foreground">Slug</Label>
            <Input
              id="bundle-slug"
              {...form.register("slug")}
              placeholder="bundle-slug"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundle-tagline" className="text-sm font-medium text-foreground">Tagline</Label>
            <Input
              id="bundle-tagline"
              {...form.register("tagline")}
              placeholder="Short tagline (optional)"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {form.formState.errors.tagline && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.tagline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundle-description" className="text-sm font-medium text-foreground">Description</Label>
            <ProductDescriptionEditor
              value={form.watch("description") || ""}
              onChange={(content) => form.setValue("description", content)}
              placeholder="Enter bundle description..."
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Right Column - Settings & Products */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bundle-price" className="text-sm font-medium text-foreground">Price (cents)</Label>
              <Input
                id="bundle-price"
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
              <Label htmlFor="bundle-status" className="text-sm font-medium text-foreground">Status</Label>
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
            <Label htmlFor="bundle-hero-image" className="text-sm font-medium text-foreground">Hero Image</Label>
            <Input
              id="bundle-hero-image"
              {...form.register("hero_image_url")}
              placeholder="https://example.com/image.jpg"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground">
              URL for the main bundle image (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Products in Bundle</Label>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Select the products that will be included in this bundle
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {availableProducts.map((product) => (
                  <label key={product.id} className="flex items-center gap-2 text-sm p-2 rounded border cursor-pointer hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds([...selectedProductIds, product.id])
                        } else {
                          setSelectedProductIds(selectedProductIds.filter(id => id !== product.id))
                        }
                      }}
                    />
                    <span>{product.title}</span>
                  </label>
                ))}
              </div>
              {availableProducts.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No products available for bundle selection
                </div>
              )}
            </div>
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
          {isSubmitting ? "Saving..." : isEditing ? "Update Bundle" : "Create Bundle"}
        </Button>
      </div>
    </form>
  )
}
