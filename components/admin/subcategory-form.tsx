"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounce } from "use-debounce"
import slugify from "slugify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/shared/image-upload"
import { subcategorySchema, type SubcategoryFormData } from "@/schema/categories"
import { createSubcategory, updateSubcategory } from "@/actions/admin/categories"
import type { Tables } from "@/types/supabase"
import { toast } from "sonner"

interface SubcategoryFormProps {
  categoryId: string
  subcategory?: Tables<"subcategories">
  onSuccess: () => void
  onCancel: () => void
}

export function SubcategoryForm({ categoryId, subcategory, onSuccess, onCancel }: SubcategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!subcategory

  const form = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      category_id: categoryId,
      title: subcategory?.title || "",
      slug: subcategory?.slug || "",
      tagline: subcategory?.tagline || "",
      description: subcategory?.description || "",
      image_url: subcategory?.image_url || "",
    },
  })

  const watchedTitle = form.watch("title")
  const [debouncedTitle] = useDebounce(watchedTitle, 300)

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

  const onSubmit = async (data: SubcategoryFormData) => {
    setIsSubmitting(true)
    try {
      let result
      if (isEditing) {
        result = await updateSubcategory({ ...data, id: subcategory!.id })
      } else {
        result = await createSubcategory(data)
      }
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Subcategory ${isEditing ? "updated" : "created"} successfully`)
      onSuccess()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" value={categoryId} {...form.register("category_id")} />
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
          <Input id="title" {...form.register("title")} placeholder="Enter subcategory title" className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-sm font-medium text-foreground">Slug</Label>
          <Input id="slug" {...form.register("slug")} placeholder="subcategory-slug" className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline" className="text-sm font-medium text-foreground">Tagline</Label>
          <Input id="tagline" {...form.register("tagline")} placeholder="Short tagline (optional)" className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
          <Textarea id="description" {...form.register("description")} placeholder="Enter subcategory description" rows={4} className="px-4 py-3 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Subcategory Image</Label>
          <ImageUpload value={form.watch("image_url")} onChange={(url) => form.setValue("image_url", url)} onRemove={() => form.setValue("image_url", "")} />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6 text-sm font-medium border-border bg-background hover:bg-muted/50 transition-colors">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">{isSubmitting ? "Saving..." : isEditing ? "Update Subcategory" : "Create Subcategory"}</Button>
      </div>
    </form>
  )
}


