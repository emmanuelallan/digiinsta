"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { ImageLightbox } from "@/components/image-lightbox"
import { cn } from "@/lib/utils"
import Image from "next/image"

export interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
}

export function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [lightboxOpen, setLightboxOpen] = React.useState(false)
  const [lightboxIndex, setLightboxIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Keyboard navigation
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (!api) return

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      api.scrollPrev()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      api.scrollNext()
    } else if (event.key === 'Home') {
      event.preventDefault()
      api.scrollTo(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      api.scrollTo(count - 1)
    }
  }, [api, count])

  const handleImageClick = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-lg aspect-video",
        className
      )}>
        <p className="text-muted-foreground text-sm">No images available</p>
      </div>
    )
  }

  return (
    <>
      <div className={cn("relative", className)}>
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent 
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Product images carousel"
            aria-roledescription="carousel"
          >
            {images.map((image, index) => (
              <CarouselItem key={index} role="group" aria-roledescription="slide" aria-label={`Image ${index + 1} of ${images.length}`}>
                <div 
                  className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted cursor-zoom-in group"
                  onClick={() => handleImageClick(index)}
                >
                  <Image
                    src={image}
                    alt={`${alt} - Image ${index + 1}`}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                  />
                  {/* Zoom hint overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                      <svg
                        className="w-6 h-6 text-gray-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious 
                className="left-4 bg-white/90 hover:bg-white shadow-lg border-gray-200" 
                aria-label="Previous image" 
              />
              <CarouselNext 
                className="right-4 bg-white/90 hover:bg-white shadow-lg border-gray-200" 
                aria-label="Next image" 
              />
            </>
          )}
        </Carousel>

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  current === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to image ${index + 1}`}
                aria-current={current === index ? "true" : "false"}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-md text-sm font-medium">
            {current + 1} / {count}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={alt}
      />
    </>
  )
}
