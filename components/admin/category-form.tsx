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
import type { Category } from "@/types/categories"
import { toast } from "sonner"

interface CategoryFormProps {
  category?: Category
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
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register("title")} placeholder="Enter category title" />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...form.register("slug")} placeholder="category-slug" />
          {form.formState.errors.slug && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.slug.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Enter category description"
            rows={4}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div>
          <Label>Category Image</Label>
          <ImageUpload
            value={form.watch("image_url")}
            onChange={(url) => form.setValue("image_url", url)}
            onRemove={() => form.setValue("image_url", "")}
          />
          {form.formState.errors.image_url && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.image_url.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value: "active" | "inactive") => form.setValue("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  )
}
