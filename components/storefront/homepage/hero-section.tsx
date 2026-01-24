"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
  videoSrc?: string;
  videoPoster?: string;
  className?: string;
}

const brandLogos = [
  { name: "Brand 1", src: "/images/brands/logo1.svg" },
  { name: "Brand 2", src: "/images/brands/logo2.svg" },
  { name: "Brand 3", src: "/images/brands/logo3.svg" },
  { name: "Brand 4", src: "/images/brands/logo4.svg" },
  { name: "Brand 5", src: "/images/brands/logo5.svg" },
  { name: "Brand 6", src: "/images/brands/logo6.svg" },
  { name: "Brand 7", src: "/images/brands/logo7.svg" },
  { name: "Brand 8", src: "/images/brands/logo8.svg" },
  { name: "Brand 9", src: "/images/brands/logo9.svg" },
];

export function HeroSection({
  headline = "The Ultimate Valentine's Gift",
  subheadline = "Made for couples who want more. Join 200,000+ happy users.",
  ctaText = "SHOP NOW",
  ctaHref = "/collections/valentines",
  videoSrc = "/images/bgs/hero.mp4",
  videoPoster = "/images/bgs/hero.webp",
  className,
}: HeroSectionProps) {
  return (
    <>
      {/* Hero Section */}
      <section className={cn("relative w-full h-[calc(100vh-150px)] overflow-hidden", className)} aria-label="Hero banner">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={videoPoster}
          className="absolute inset-0 w-full h-full object-cover"
          aria-label="Background video showing romantic moments"
        >
          <source src={videoSrc} type="video/mp4" />
          <track kind="captions" srcLang="en" label="English" />
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-tight">
              {headline}
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
              {subheadline}
            </p>
            
            <div className="pt-4">
              <Link href={ctaHref}>
                <Button
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold uppercase rounded-full p-8 cursor-pointer gap-2 text-base"
                >
                  {ctaText}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Marquee Section */}
      <section className="bg-gray-900 py-6 overflow-hidden" aria-label="Featured in">
        <div className="flex animate-marquee whitespace-nowrap">
          <div className="flex gap-12 shrink-0 pr-12">
            {brandLogos.map((logo, index) => (
              <div
                key={`logo-${index}`}
                className="flex items-center justify-center shrink-0"
              >
                <Image
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  width={80}
                  height={40}
                  className="h-8 w-auto object-contain opacity-60 hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-12 shrink-0 pr-12" aria-hidden="true">
            {brandLogos.map((logo, index) => (
              <div
                key={`logo-duplicate-${index}`}
                className="flex items-center justify-center shrink-0"
              >
                <Image
                  src={logo.src}
                  alt=""
                  width={80}
                  height={40}
                  className="h-8 w-auto object-contain opacity-60 hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-12 shrink-0 pr-12" aria-hidden="true">
            {brandLogos.map((logo, index) => (
              <div
                key={`logo-triple-${index}`}
                className="flex items-center justify-center shrink-0"
              >
                <Image
                  src={logo.src}
                  alt=""
                  width={80}
                  height={40}
                  className="h-8 w-auto object-contain opacity-60 hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
