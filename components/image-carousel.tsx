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
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={image}
                  alt={`${alt} - Image ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" aria-label="Previous image" />
            <CarouselNext className="right-2" aria-label="Next image" />
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
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
          {current + 1} / {count}
        </div>
      )}
    </div>
  )
}
