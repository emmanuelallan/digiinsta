"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * Responsive sizes configuration for different image contexts
 */
export const RESPONSIVE_SIZES = {
  /** Full-width hero images */
  hero: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px",
  /** Product card images in grid */
  productCard: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  /** Product gallery main image */
  productGallery: "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 800px",
  /** Thumbnail images */
  thumbnail: "80px",
  /** Small thumbnail images */
  thumbnailSmall: "64px",
  /** Category card images */
  categoryCard: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw",
  /** Bundle showcase images */
  bundleShowcase: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px",
} as const;

export type ResponsiveSizeKey = keyof typeof RESPONSIVE_SIZES;

/**
 * Aspect ratio presets for consistent image dimensions
 */
export const ASPECT_RATIOS = {
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
  "3/4": "aspect-[3/4]",
  "2/3": "aspect-[2/3]",
} as const;

export type AspectRatioKey = keyof typeof ASPECT_RATIOS;

export interface OptimizedImageProps extends Omit<ImageProps, "sizes"> {
  /** Use priority for above-fold images (LCP optimization) */
  priority?: boolean;
  /** Responsive sizes configuration - use preset key or custom string */
  sizes?: ResponsiveSizeKey | string;
  /** Aspect ratio preset for consistent dimensions */
  aspectRatio?: AspectRatioKey;
  /** Base64 blur data URL for placeholder */
  blurDataURL?: string;
  /** Container className for aspect ratio wrapper */
  containerClassName?: string;
  /** Whether to use fill mode (requires parent with position relative) */
  fill?: boolean;
}

/**
 * OptimizedImage Component
 *
 * A wrapper around Next.js Image component with built-in optimizations:
 * - Priority loading for above-fold images (LCP improvement)
 * - Responsive sizes configuration with presets
 * - Blur placeholder support for better perceived performance
 * - Aspect ratio presets for consistent layouts (CLS prevention)
 * - Automatic lazy loading for below-fold images
 *
 * @example
 * // Above-fold hero image with priority
 * <OptimizedImage
 *   src="/hero.jpg"
 *   alt="Hero"
 *   priority
 *   sizes="hero"
 *   aspectRatio="16/9"
 * />
 *
 * @example
 * // Product card with blur placeholder
 * <OptimizedImage
 *   src={product.image}
 *   alt={product.title}
 *   sizes="productCard"
 *   aspectRatio="4/3"
 *   blurDataURL={product.blurDataURL}
 * />
 */
export function OptimizedImage({
  src,
  alt,
  priority = false,
  sizes = "productCard",
  aspectRatio,
  blurDataURL,
  containerClassName,
  fill = true,
  className,
  ...props
}: OptimizedImageProps) {
  // Resolve sizes - use preset if key matches, otherwise use as custom string
  const resolvedSizes =
    sizes in RESPONSIVE_SIZES ? RESPONSIVE_SIZES[sizes as ResponsiveSizeKey] : sizes;

  // Determine placeholder configuration
  const placeholderProps = blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {};

  // If using aspect ratio, wrap in container
  if (aspectRatio) {
    return (
      <div
        className={cn("relative overflow-hidden", ASPECT_RATIOS[aspectRatio], containerClassName)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={resolvedSizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={cn("object-cover", className)}
          {...placeholderProps}
          {...props}
        />
      </div>
    );
  }

  // Without aspect ratio, render image directly
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={resolvedSizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={cn("object-cover", className)}
      {...placeholderProps}
      {...props}
    />
  );
}

export default OptimizedImage;
