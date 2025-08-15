"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0])

  return (
    <div className="space-y-4">
      <div className="aspect-video overflow-hidden rounded-lg border border-border">
        <Image
          src={selectedImage}
          alt="Product image"
          width={1280}
          height={720}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={cn(
              "aspect-video overflow-hidden rounded-md border border-border transition-all",
              selectedImage === image ? "ring-2 ring-primary" : "hover:border-primary/50"
            )}
          >
            <Image
              src={image}
              alt={`Product thumbnail ${index + 1}`}
              width={200}
              height={112}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  )
}