import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityClient } from "./client";

type SanityImageSource = any;

const builder = createImageUrlBuilder(sanityClient);

/**
 * Generate optimized image URLs from Sanity image assets
 * @param source - Sanity image reference
 * @returns Image URL builder for chaining transformations
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Get a thumbnail URL (200x200)
 */
export function thumbnailUrl(source: SanityImageSource): string {
  return urlFor(source).width(200).height(200).fit("crop").url();
}

/**
 * Get a card image URL (400x300)
 */
export function cardImageUrl(source: SanityImageSource): string {
  return urlFor(source).width(400).height(300).fit("crop").url();
}

/**
 * Get a feature image URL (800x600)
 */
export function featureImageUrl(source: SanityImageSource): string {
  return urlFor(source).width(800).height(600).fit("crop").url();
}

/**
 * Get a hero image URL (1920x1080)
 */
export function heroImageUrl(source: SanityImageSource): string {
  return urlFor(source).width(1920).height(1080).fit("crop").url();
}
