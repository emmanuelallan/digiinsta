"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { cn } from "@/lib/utils";
import type { Media } from "@/types/storefront";

interface ProductImageGalleryProps {
  images?: Array<{
    image: Media;
    alt?: string | null;
    id?: string | null;
  }> | null;
  title: string;
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Main carousel
  const [mainRef, mainApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });

  // Thumbnail carousel (vertical)
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    axis: "y",
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
    thumbApi.scrollTo(mainApi.selectedScrollSnap());
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi, onSelect]);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="bg-muted flex aspect-[4/3] w-full items-center justify-center rounded-xl">
        <div className="text-center">
          <div className="bg-muted-foreground/20 mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full">
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-muted-foreground text-sm">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-4">
      {/* Vertical Thumbnails - Left Side (Desktop) */}
      {images.length > 1 && (
        <div className="hidden w-20 flex-shrink-0 xl:block">
          <div className="sticky top-24 max-h-[500px] overflow-y-auto" ref={thumbRef}>
            <div className="flex flex-col gap-2">
              {images.map((img, index) => {
                const thumbUrl = img.image?.url ?? "/images/placeholder-product.jpg";
                const thumbAlt = img.alt ?? `${title} - Thumbnail ${index + 1}`;

                return (
                  <button
                    key={img.id ?? index}
                    onClick={() => onThumbClick(index)}
                    className={cn(
                      "bg-muted relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200",
                      selectedIndex === index
                        ? "ring-primary ring-2 ring-offset-2"
                        : "opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={thumbUrl}
                      alt={thumbAlt}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Image Carousel */}
      <div className="min-w-0 flex-1">
        <div className="overflow-hidden rounded-xl" ref={mainRef}>
          <div className="flex">
            {images.map((img, index) => {
              const imageUrl = img.image?.url ?? "/images/placeholder-product.jpg";
              const imageAlt = img.alt ?? `${title} - Image ${index + 1}`;

              return (
                <div key={img.id ?? index} className="min-w-0 flex-[0_0_100%]">
                  <Zoom zoomMargin={40}>
                    <div className="bg-muted relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={imageAlt} className="h-full w-full object-cover" />
                    </div>
                  </Zoom>
                </div>
              );
            })}
          </div>
        </div>

        {/* Image counter indicator */}
        {images.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 xl:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onThumbClick(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  selectedIndex === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Horizontal Thumbnails - Mobile/Tablet */}
        {images.length > 1 && (
          <div className="mt-4 xl:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => {
                const thumbUrl = img.image?.url ?? "/images/placeholder-product.jpg";
                const thumbAlt = img.alt ?? `${title} - Thumbnail ${index + 1}`;

                return (
                  <button
                    key={img.id ?? index}
                    onClick={() => onThumbClick(index)}
                    className={cn(
                      "bg-muted relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200",
                      selectedIndex === index
                        ? "ring-primary ring-2 ring-offset-1"
                        : "opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={thumbUrl}
                      alt={thumbAlt}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
