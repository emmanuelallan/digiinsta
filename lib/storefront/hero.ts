/**
 * Hero Slides Data Fetching Utilities
 * Server-side functions for fetching hero carousel slides
 */

import { getPayload } from "payload";
import config from "@payload-config";
import type { Media } from "@/payload-types";

export interface HeroSlide {
  id: number;
  title: string;
  headline: string;
  subheadline?: string;
  image: Media;
  mobileImage?: Media | null;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label?: string;
    href?: string;
  };
  textPosition: "left" | "center" | "right";
  textColor: "light" | "dark";
  overlayOpacity: "0" | "20" | "40" | "60";
  order: number;
}

/**
 * Get Payload instance
 */
async function getPayloadClient() {
  return getPayload({ config });
}

/**
 * Get all active hero slides ordered by display order
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "hero-slides",
    where: { status: { equals: "active" } },
    sort: "order",
    limit: 10,
    depth: 1,
  });

  return result.docs.map((slide) => ({
    id: slide.id,
    title: slide.title,
    headline: slide.headline,
    subheadline: slide.subheadline ?? undefined,
    image: slide.image as Media,
    mobileImage: slide.mobileImage as Media | null,
    primaryCta: {
      label: slide.primaryCta?.label ?? "Shop Now",
      href: slide.primaryCta?.href ?? "/categories",
    },
    secondaryCta: slide.secondaryCta?.label
      ? {
          label: slide.secondaryCta.label,
          href: slide.secondaryCta.href ?? undefined,
        }
      : undefined,
    textPosition: (slide.textPosition as HeroSlide["textPosition"]) ?? "left",
    textColor: (slide.textColor as HeroSlide["textColor"]) ?? "light",
    overlayOpacity:
      (slide.overlayOpacity as HeroSlide["overlayOpacity"]) ?? "40",
    order: slide.order ?? 0,
  }));
}
