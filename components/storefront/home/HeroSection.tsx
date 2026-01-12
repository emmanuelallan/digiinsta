"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { StorefrontCategory } from "@/types/storefront";
import type { HeroSlide } from "@/lib/storefront/hero";

interface HeroSectionProps {
  categories: StorefrontCategory[];
  heroSlides?: HeroSlide[];
}

export function HeroSection({ categories, heroSlides = [] }: HeroSectionProps) {
  const [heroApi, setHeroApi] = useState<CarouselApi>();
  const [categoryApi, setCategoryApi] = useState<CarouselApi>();
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroCount, setHeroCount] = useState(0);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  // Hero carousel state
  useEffect(() => {
    if (!heroApi) return;

    setHeroCount(heroApi.scrollSnapList().length);
    setHeroIndex(heroApi.selectedScrollSnap());

    heroApi.on("select", () => {
      setHeroIndex(heroApi.selectedScrollSnap());
    });
  }, [heroApi]);

  // Category carousel state
  useEffect(() => {
    if (!categoryApi) return;

    setCategoryCount(categoryApi.scrollSnapList().length);
    setCategoryIndex(categoryApi.selectedScrollSnap());

    categoryApi.on("select", () => {
      setCategoryIndex(categoryApi.selectedScrollSnap());
    });
  }, [categoryApi]);

  const scrollHeroTo = useCallback(
    (index: number) => {
      heroApi?.scrollTo(index);
    },
    [heroApi]
  );

  const scrollCategoryTo = useCallback(
    (index: number) => {
      categoryApi?.scrollTo(index);
    },
    [categoryApi]
  );

  // Auto-advance hero slides
  useEffect(() => {
    if (!heroApi || heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (heroApi.selectedScrollSnap() + 1) % heroSlides.length;
      heroApi.scrollTo(nextIndex);
    }, 6000); // 6 seconds per slide

    return () => clearInterval(interval);
  }, [heroApi, heroSlides.length]);

  return (
    <div className="bg-background">
      {/* Hero Carousel Section */}
      {heroSlides.length > 0 ? (
        <section className="relative overflow-hidden">
          <Carousel
            setApi={setHeroApi}
            opts={{
              loop: true,
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {heroSlides.map((slide) => (
                <CarouselItem key={slide.id} className="relative">
                  <div className="relative h-[250px] w-full sm:h-[200px] lg:h-[350px]">
                    {/* Background Image */}
                    <Image
                      src={slide.image.url}
                      alt={slide.image.alt}
                      fill
                      priority
                      className="object-cover"
                      sizes="100vw"
                    />

                    {/* Overlay */}
                    <div
                      className="absolute inset-0 bg-black"
                      style={{ opacity: slide.overlayOpacity / 100 }}
                    />

                    {/* Content */}
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center",
                        slide.textPosition === "left" && "justify-start",
                        slide.textPosition === "center" && "justify-center text-center",
                        slide.textPosition === "right" && "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-2xl px-4 sm:px-8 lg:px-12",
                          slide.textPosition === "center" && "mx-auto"
                        )}
                      >
                        <h1
                          className={cn(
                            "mb-2 text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl",
                            slide.textColor === "white" ? "text-white" : "text-gray-900"
                          )}
                        >
                          {slide.headline}
                        </h1>
                        {slide.subheadline && (
                          <p
                            className={cn(
                              "mb-4 max-w-lg text-sm sm:mb-5 sm:text-base lg:text-lg",
                              slide.textColor === "white" ? "text-white/90" : "text-gray-700"
                            )}
                          >
                            {slide.subheadline}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {slide.primaryCta && (
                            <Button asChild size="default" className="px-5 text-sm sm:px-6">
                              <Link href={slide.primaryCta.href}>{slide.primaryCta.label}</Link>
                            </Button>
                          )}
                          {slide.secondaryCta && (
                            <Button
                              asChild
                              variant="outline"
                              size="default"
                              className={cn(
                                "px-5 text-sm sm:px-6",
                                slide.textColor === "white" &&
                                  "border-white text-white hover:bg-white/10"
                              )}
                            >
                              <Link href={slide.secondaryCta.href}>{slide.secondaryCta.label}</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Buttons - Desktop only */}
            {heroSlides.length > 1 && (
              <>
                <CarouselPrevious className="left-2 hidden h-8 w-8 border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 sm:left-4 sm:flex sm:h-10 sm:w-10" />
                <CarouselNext className="right-2 hidden h-8 w-8 border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 sm:right-4 sm:flex sm:h-10 sm:w-10" />
              </>
            )}
          </Carousel>

          {/* Dot indicators */}
          {heroCount > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {Array.from({ length: heroCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollHeroTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-200",
                    heroIndex === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Fallback static hero */
        <section className="bg-background relative overflow-hidden py-6 sm:py-8 lg:py-10">
          <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:space-y-8 sm:px-6 lg:px-8">
            <Link href="/categories">
              <Image
                src="/images/bgs/hero.webp"
                height={250}
                width={1400}
                alt="hero image"
                className="h-auto w-full rounded-lg"
              />
            </Link>
          </div>
        </section>
      )}

      {/* Categories Carousel Section */}
      {categories.length > 0 && (
        <section className="bg-muted/20 py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center sm:mb-12">
              <h2 className="text-foreground mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">
                Explore Our Categories
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl px-4 text-base sm:text-lg">
                Discover our carefully curated collection of planners, journals, and organizational
                tools
              </p>
            </div>

            <Carousel
              setApi={setCategoryApi}
              opts={{
                loop: true,
                align: "start",
              }}
              className="w-full"
            >
              {/* Partial peek on mobile: 85% width shows ~15% of next card */}
              <CarouselContent className="-ml-3 sm:-ml-4 lg:-ml-6">
                {categories.map((category) => {
                  const imageUrl =
                    typeof category.image === "object" && category.image?.asset
                      ? category.image.asset._ref
                      : null;

                  return (
                    <CarouselItem
                      key={category._id}
                      className="basis-[85%] pl-3 sm:basis-1/2 sm:pl-4 md:basis-1/3 lg:basis-1/4 lg:pl-6"
                    >
                      <Link
                        href={`/categories/${category.slug?.current || category.slug}`}
                        className="group block"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                          {/* Background Image */}
                          {imageUrl ? (
                            <Image
                              src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${imageUrl.replace("image-", "").replace("-webp", ".webp").replace("-jpg", ".jpg").replace("-png", ".png")}`}
                              alt={category.title}
                              fill
                              sizes="(max-width: 640px) 85vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="from-muted to-muted/60 absolute inset-0 bg-gradient-to-br" />
                          )}

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Content at Bottom */}
                          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                            <h3 className="text-lg font-bold text-white transition-colors sm:text-xl">
                              {category.title}
                            </h3>
                            {category.description && (
                              <p className="mt-1 line-clamp-2 text-sm text-white/70">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              {/* Navigation Buttons - Desktop only */}
              <CarouselPrevious className="bg-background/80 border-border hover:bg-background -left-4 hidden h-10 w-10 shadow-lg backdrop-blur-sm sm:-left-5 sm:flex sm:h-12 sm:w-12" />
              <CarouselNext className="bg-background/80 border-border hover:bg-background -right-4 hidden h-10 w-10 shadow-lg backdrop-blur-sm sm:-right-5 sm:flex sm:h-12 sm:w-12" />
            </Carousel>

            {/* Dot indicators - Mobile only */}
            {categoryCount > 1 && (
              <div className="mt-4 flex items-center justify-center gap-1.5 sm:hidden">
                {Array.from({ length: categoryCount }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollCategoryTo(index)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-200",
                      categoryIndex === index
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
