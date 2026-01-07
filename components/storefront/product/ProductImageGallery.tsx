"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/storefront/shared";
import type { Media } from "@/types/storefront";

interface ProductImageGalleryProps {
  images?: Array<{
    image: Media;
    alt?: string | null;
    id?: string | null;
    /** Optional blur data URL for placeholder */
    blurDataURL?: string;
  }> | null;
  title: string;
}

/**
 * Custom hook for swipe gesture detection
 * Provides additional swipe feedback beyond Embla's built-in touch support
 */
function useSwipeGesture(onSwipeLeft?: () => void, onSwipeRight?: () => void, threshold = 50) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch ? touch.clientX : null;
    touchEndX.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchEndX.current = touch ? touch.clientX : null;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diff < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Main carousel with enhanced touch support
  const [mainRef, mainApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    // Enhanced touch/swipe settings
    dragFree: false,
    skipSnaps: false,
    // Improve touch responsiveness
    duration: 20,
  });

  // Thumbnail carousel (vertical)
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    axis: "y",
  });

  const scrollPrev = useCallback(() => {
    if (mainApi) mainApi.scrollPrev();
  }, [mainApi]);

  const scrollNext = useCallback(() => {
    if (mainApi) mainApi.scrollNext();
  }, [mainApi]);

  // Swipe gesture handlers for additional feedback
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture(
    scrollNext,
    scrollPrev
  );

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const newIndex = mainApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    thumbApi.scrollTo(newIndex);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;

    // Initial selection
    const initialIndex = mainApi.selectedScrollSnap();
    if (initialIndex !== selectedIndex) {
      setSelectedIndex(initialIndex);
    }

    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi, onSelect, selectedIndex]);

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
                      "bg-muted relative aspect-square min-h-[44px] w-full min-w-[44px] flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200",
                      selectedIndex === index
                        ? "ring-primary ring-2 ring-offset-2"
                        : "opacity-50 hover:opacity-100"
                    )}
                  >
                    <OptimizedImage
                      src={thumbUrl}
                      alt={thumbAlt}
                      sizes="thumbnail"
                      blurDataURL={img.blurDataURL}
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
        <div
          className="touch-pan-y overflow-hidden rounded-xl"
          ref={mainRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex touch-pan-x">
            {images.map((img, index) => {
              const imageUrl = img.image?.url ?? "/images/placeholder-product.jpg";
              const imageAlt = img.alt ?? `${title} - Image ${index + 1}`;
              // First image gets priority loading for LCP optimization
              const isPriority = index === 0;

              return (
                <div key={img.id ?? index} className="min-w-0 flex-[0_0_100%]">
                  <Zoom zoomMargin={40}>
                    <div className="bg-muted relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xl">
                      <OptimizedImage
                        src={imageUrl}
                        alt={imageAlt}
                        sizes="productGallery"
                        priority={isPriority}
                        blurDataURL={img.blurDataURL}
                        className="h-full w-full"
                      />
                    </div>
                  </Zoom>
                </div>
              );
            })}
          </div>
        </div>

        {/* Swipe hint for mobile - shown only on first visit */}
        {images.length > 1 && (
          <p className="text-muted-foreground mt-2 text-center text-xs xl:hidden">
            Swipe to see more images
          </p>
        )}

        {/* Image counter indicator */}
        {images.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 xl:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onThumbClick(index)}
                className={cn(
                  "flex h-2 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-all duration-200",
                  selectedIndex === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
                )}
                aria-label={`Go to image ${index + 1}`}
              >
                <span
                  className={cn(
                    "h-2 rounded-full transition-all duration-200",
                    selectedIndex === index ? "bg-primary w-6" : "bg-muted-foreground/30 w-2"
                  )}
                />
              </button>
            ))}
          </div>
        )}

        {/* Horizontal Thumbnails - Mobile/Tablet */}
        {images.length > 1 && (
          <div className="mt-4 xl:hidden">
            <div className="flex touch-pan-x gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => {
                const thumbUrl = img.image?.url ?? "/images/placeholder-product.jpg";
                const thumbAlt = img.alt ?? `${title} - Thumbnail ${index + 1}`;

                return (
                  <button
                    key={img.id ?? index}
                    onClick={() => onThumbClick(index)}
                    className={cn(
                      "bg-muted relative h-16 min-h-[44px] w-16 min-w-[44px] flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200",
                      selectedIndex === index
                        ? "ring-primary ring-2 ring-offset-1"
                        : "opacity-50 hover:opacity-100"
                    )}
                  >
                    <OptimizedImage
                      src={thumbUrl}
                      alt={thumbAlt}
                      sizes="thumbnailSmall"
                      blurDataURL={img.blurDataURL}
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
