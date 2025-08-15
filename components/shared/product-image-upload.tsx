"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, ImageIcon, Loader2, Plus, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { uploadProductImage, deleteProductImage } from "@/actions/admin/products"
import { toast } from "sonner"

interface ProductImage {
  id: string
  image_url: string
  caption?: string | null
  sort_order?: number | null
}

interface ProductImageUploadProps {
  value?: ProductImage[]
  onChange: (images: ProductImage[]) => void
  productId?: string
  onImageUpload?: (image: ProductImage) => void
  onImageRemove?: (index: number) => void
  images?: ProductImage[]
}

export function ProductImageUpload({ value = [], onChange, productId }: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      // Check if adding these files would exceed the 10 image limit
      if (value.length + acceptedFiles.length > 10) {
        toast.error(`You can only upload up to 10 images. You currently have ${value.length} images.`)
        return
      }

      setIsUploading(true)

      try {
        const uploadPromises = acceptedFiles.map(async (file, index) => {
          // Validate file type
          if (!file.type.startsWith("image/")) {
            throw new Error(`File ${file.name} is not an image`)
          }

          // Validate file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`File ${file.name} must be less than 5MB`)
          }

          const { data, error } = await uploadProductImage(file, productId)

          if (error) {
            throw new Error(error)
          }

          if (data) {
            return {
              id: data.id,
              image_url: data.image_url,
              caption: null,
              sort_order: value.length + index
            }
          }
        })

        const newImages = await Promise.all(uploadPromises)
        const validImages = newImages.filter(Boolean) as ProductImage[]
        
        if (validImages.length > 0) {
          onChange([...value, ...validImages])
          toast.success(`${validImages.length} image${validImages.length > 1 ? 's' : ''} uploaded successfully`)
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to upload images")
      } finally {
        setIsUploading(false)
      }
    },
    [value, onChange, productId],
  )

  const handleRemove = async (imageId: string) => {
    setDeletingIds(prev => new Set(prev).add(imageId))

    try {
      // Delete from storage and database
      await deleteProductImage(imageId)
      
      // Remove from local state
      onChange(value.filter(img => img.id !== imageId))
      toast.success("Image removed successfully")
    } catch (error) {
      toast.error("Failed to remove image")
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(imageId)
        return newSet
      })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 10 - value.length,
    disabled: isUploading || value.length >= 10,
  })

  const remainingSlots = 10 - value.length

  return (
    <div className="space-y-4">
      {/* Image Count and Upload Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {value.length}/10 images
          </Badge>
          {remainingSlots > 0 && (
            <span className="text-sm text-muted-foreground">
              {remainingSlots} slot{remainingSlots > 1 ? 's' : ''} remaining
            </span>
          )}
        </div>
        {remainingSlots > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement
              input?.click()
            }}
            disabled={isUploading}
            className="h-8 px-3 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Images
          </Button>
        )}
      </div>

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {value.map((image, index) => (
            <div key={image.id} className="relative group aspect-square">
              <div className="relative w-full h-full overflow-hidden rounded-lg border border-border bg-muted/20">
                <img 
                  src={image.image_url} 
                  alt={`Product image ${index + 1}`} 
                  className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(image.id)}
                    disabled={deletingIds.has(image.id)}
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    {deletingIds.has(image.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Image number badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs h-6 px-2 bg-black/50 text-white border-0">
                    {index + 1}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {remainingSlots > 0 && (
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${isUploading ? "pointer-events-none opacity-50" : "hover:border-primary hover:bg-primary/5"}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <Grid3X3 className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-sm">
              {isUploading ? (
                <p className="font-medium text-primary">Uploading...</p>
              ) : isDragActive ? (
                <p className="font-medium text-primary">Drop images here</p>
              ) : (
                <div>
                  <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-muted-foreground">
                    PNG, JPG, GIF, WEBP up to 5MB • Max {remainingSlots} image{remainingSlots > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Max images reached message */}
      {value.length >= 10 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <Grid3X3 className="h-5 w-5 mx-auto mb-2 opacity-50" />
          Maximum of 10 images reached. Remove some images to add more.
        </div>
      )}
    </div>
  )
}
