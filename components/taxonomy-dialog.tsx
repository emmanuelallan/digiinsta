"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { TaxonomyType } from "./taxonomy-selector"

export interface SimpleTaxonomyInput {
  title: string
}

export interface ComplexTaxonomyInput {
  title: string
  description: string
  image: File
}

export interface TaxonomyDialogProps {
  type: TaxonomyType
  isOpen: boolean
  onClose: () => void
  onSave: (data: SimpleTaxonomyInput | ComplexTaxonomyInput) => Promise<void>
}

const taxonomyLabels: Record<TaxonomyType, string> = {
  product_type: 'Product Type',
  format: 'Format',
  occasion: 'Occasion',
  collection: 'Collection'
}

const isComplexTaxonomy = (type: TaxonomyType): boolean => {
  return type === 'occasion' || type === 'collection'
}

export function TaxonomyDialog({
  type,
  isOpen,
  onClose,
  onSave
}: TaxonomyDialogProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [image, setImage] = React.useState<File | null>(null)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const isComplex = isComplexTaxonomy(type)

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setImage(null)
    setErrors({})
    setIsSubmitting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Handle ESC key press
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isSubmitting])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (isComplex) {
      if (!description.trim()) {
        newErrors.description = "Description is required"
      }
      if (!image) {
        newErrors.image = "Image is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate image format
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validFormats.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: "Invalid image format. Please use JPEG, PNG, or WebP"
        }))
        return
      }

      // Validate image size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          image: "Image size must be less than 5MB"
        }))
        return
      }

      setImage(file)
      setErrors(prev => {
        const { image: _image, ...rest } = prev
        return rest
      })
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isComplex && image) {
        await onSave({
          title: title.trim(),
          description: description.trim(),
          image
        } as ComplexTaxonomyInput)
      } else {
        await onSave({
          title: title.trim()
        } as SimpleTaxonomyInput)
      }
      handleClose()
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to save taxonomy"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Add New {taxonomyLabels[type]}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isComplex 
              ? `Create a new ${taxonomyLabels[type].toLowerCase()} with title, description, and image.`
              : `Create a new ${taxonomyLabels[type].toLowerCase()}.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title Field */}
          <div className="grid gap-2">
            <Label htmlFor="taxonomy-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="taxonomy-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) {
                  setErrors(prev => {
                    const { title: _title, ...rest } = prev
                    return rest
                  })
                }
              }}
              placeholder={`Enter ${taxonomyLabels[type].toLowerCase()} title`}
              aria-invalid={!!errors.title}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description Field (Complex Taxonomies Only) */}
          {isComplex && (
            <div className="grid gap-2">
              <Label htmlFor="taxonomy-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="taxonomy-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (errors.description) {
                    setErrors(prev => {
                      const { description: _description, ...rest } = prev
                      return rest
                    })
                  }
                }}
                placeholder={`Enter ${taxonomyLabels[type].toLowerCase()} description`}
                aria-invalid={!!errors.description}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          )}

          {/* Image Upload Field (Complex Taxonomies Only) */}
          {isComplex && (
            <div className="grid gap-2">
              <Label htmlFor="taxonomy-image">
                Image <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={fileInputRef}
                id="taxonomy-image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                aria-invalid={!!errors.image}
                disabled={isSubmitting}
              />
              {image && (
                <p className="text-sm text-muted-foreground">
                  Selected: {image.name} ({(image.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image}</p>
              )}
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
