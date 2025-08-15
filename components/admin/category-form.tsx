"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounce } from "use-debounce"
import slugify from "slugify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/shared/image-upload"
import { categorySchema, type CategoryFormData } from "@/schema/categories"
import { createCategory, updateCategory } from "@/actions/admin/categories"
import type { Tables } from "@/types/supabase"
import { toast } from "sonner"

interface CategoryFormProps {
  category?: Tables<"categories">
  onSuccess: () => void
  onCancel: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!category

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: category?.title || "",
      slug: category?.slug || "",
      tagline: category?.tagline || "",
      description: category?.description || "",
      image_url: category?.image_url || "",
      status: category?.status || "active",
    },
  })

  const watchedTitle = form.watch("title")
  const [debouncedTitle] = useDebounce(watchedTitle, 300)

  // Auto-generate slug from title
  useEffect(() => {
    if (debouncedTitle && !isEditing) {
      const generatedSlug = slugify(debouncedTitle, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      })
      form.setValue("slug", generatedSlug)
    }
  }, [debouncedTitle, form, isEditing])

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)

    try {
      let result

      if (isEditing) {
        result = await updateCategory({ ...data, id: category.id })
      } else {
        result = await createCategory(data)
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`Category ${isEditing ? "updated" : "created"} successfully`)
      onSuccess()
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
          <Input 
            id="title" 
            {...form.register("title")} 
            placeholder="Enter category title" 
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
            placeholder="category-slug" 
            className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {form.formState.errors.slug && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline" className="text-sm font-medium text-foreground">Tagline</Label>
          <Input 
            id="tagline" 
            {...form.register("tagline")} 
            placeholder="Short tagline (optional)" 
            className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {form.formState.errors.tagline && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.tagline.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Enter category description"
            rows={4}
            className="px-4 py-3 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Category Image</Label>
          <ImageUpload
            value={form.watch("image_url")}
            onChange={(url) => form.setValue("image_url", url)}
            onRemove={() => form.setValue("image_url", "")}
          />
          {form.formState.errors.image_url && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.image_url.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value: "active" | "archived") => form.setValue("status", value)}
          >
            <SelectTrigger className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
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
          {isSubmitting ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  )
}
