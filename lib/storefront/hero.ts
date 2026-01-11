/**
 * Hero Slides Data Fetching Utilities
 * Server-side functions for fetching hero carousel slides from Sanity
 *
 * Requirements: 14.1, 14.2 - Hero slides management and display
 */

import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { groq } from "next-sanity";
import type { SanityHeroSlide, SanityImage } from "@/types/sanity";

/**
 * Hero slide with resolved image URLs for the storefront
 */
export interface HeroSlide {
  id: string;
  title: string;
  headline: string;
  subheadline?: string;
  image: {
    url: string;
    alt: string;
  };
  mobileImage?: {
    url: string;
    alt: string;
  };
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  textPosition: "left" | "center" | "right";
  textColor: "white" | "black";
  overlayOpacity: number;
  displayOrder: number;
}

/**
 * GROQ query for active hero slides ordered by displayOrder
 */
const heroSlidesQuery = groq`
  *[_type == "heroSlide" && status == "active"] | order(displayOrder asc) {
    _id,
    title,
    headline,
    subheadline,
    image,
    mobileImage,
    primaryCta,
    secondaryCta,
    textPosition,
    textColor,
    overlayOpacity,
    displayOrder
  }
`;

/**
 * Transform Sanity image to URL with alt text
 */
function transformImage(
  image: SanityImage | undefined,
  alt: string
): { url: string; alt: string } | undefined {
  if (!image?.asset) return undefined;
  return {
    url: urlFor(image).width(1920).quality(85).url(),
    alt,
  };
}

/**
 * Transform Sanity hero slide to storefront format
 */
function transformHeroSlide(slide: SanityHeroSlide): HeroSlide {
  const mainImage = transformImage(slide.image, slide.headline || slide.title);

  return {
    id: slide._id,
    title: slide.title,
    headline: slide.headline,
    subheadline: slide.subheadline,
    image: mainImage || { url: "/images/bgs/hero.webp", alt: slide.title },
    mobileImage: slide.mobileImage
      ? transformImage(slide.mobileImage, slide.headline || slide.title)
      : undefined,
    primaryCta: slide.primaryCta?.text
      ? {
          label: slide.primaryCta.text,
          href: slide.primaryCta.url || "/categories",
        }
      : undefined,
    secondaryCta: slide.secondaryCta?.text
      ? {
          label: slide.secondaryCta.text,
          href: slide.secondaryCta.url || "/products",
        }
      : undefined,
    textPosition: slide.textPosition || "left",
    textColor: slide.textColor || "white",
    overlayOpacity: slide.overlayOpacity ?? 40,
    displayOrder: slide.displayOrder ?? 0,
  };
}

/**
 * Get all active hero slides ordered by display order
 * Requirements: 14.2 - Hero slides ordered by displayOrder ascending
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const slides = await sanityClient.fetch<SanityHeroSlide[]>(heroSlidesQuery);

  if (!slides || slides.length === 0) {
    // Return a default slide if no slides are configured
    return [
      {
        id: "default",
        title: "Welcome to DigiInsta",
        headline: "Professional Digital Planners & Finance Tools",
        subheadline:
          "Elevate your life with expert-led student planners, couples finance tools, and SME systems engineered for productivity.",
        image: {
          url: "/images/bgs/hero.webp",
          alt: "DigiInsta Hero",
        },
        primaryCta: {
          label: "Shop Now",
          href: "/categories",
        },
        secondaryCta: {
          label: "View All Products",
          href: "/products",
        },
        textPosition: "left",
        textColor: "white",
        overlayOpacity: 40,
        displayOrder: 0,
      },
    ];
  }

  return slides.map(transformHeroSlide);
}
