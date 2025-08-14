"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadCategoryImage, deleteCategoryImage } from "@/actions/admin/categories"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB")
        return
      }

      setIsUploading(true)

      try {
        const { data, error } = await uploadCategoryImage(file)

        if (error) {
          toast.error(error)
          return
        }

        if (data) {
          onChange(data)
          toast.success("Image uploaded successfully")
        }
      } catch (error) {
        toast.error("Failed to upload image")
      } finally {
        setIsUploading(false)
      }
    },
    [onChange],
  )

  const handleRemove = async () => {
    if (!value) return

    setIsDeleting(true)
    try {
      // Delete from storage
      await deleteCategoryImage(value)
      // Clear the form value
      onRemove()
      toast.success("Image removed successfully")
    } catch (error) {
      toast.error("Failed to remove image")
    } finally {
      setIsDeleting(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    disabled: isUploading || isDeleting,
  })

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            <img src={value} alt="Category image" className="h-full w-full object-cover" />
          </div>
          <Button 
            type="button" 
            onClick={handleRemove} 
            variant="destructive" 
            size="sm" 
            className="absolute -right-2 -top-2 h-8 w-8 p-0 shadow-lg"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${isUploading || isDeleting ? "pointer-events-none opacity-50" : "hover:border-primary hover:bg-primary/5"}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-sm">
              {isUploading ? (
                <p className="font-medium text-primary">Uploading...</p>
              ) : isDragActive ? (
                <p className="font-medium text-primary">Drop the image here</p>
              ) : (
                <div>
                  <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
