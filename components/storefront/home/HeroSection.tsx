"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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

interface HeroSectionProps {
  categories: StorefrontCategory[];
}

export function HeroSection({ categories }: HeroSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-background relative overflow-hidden py-6 sm:py-8 lg:py-10">
        <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:space-y-8 sm:px-6 lg:px-8">
          <Link href="#">
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
              setApi={setApi}
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
                    typeof category.image === "object" && category.image?.url
                      ? category.image.url
                      : null;

                  return (
                    <CarouselItem
                      key={category.id}
                      className="basis-[85%] pl-3 sm:basis-1/2 sm:pl-4 md:basis-1/3 lg:basis-1/4 lg:pl-6"
                    >
                      <Link href={`/categories/${category.slug}`} className="group block">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                          {/* Background Image */}
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={category.title}
                              fill
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
            {count > 1 && (
              <div className="mt-4 flex items-center justify-center gap-1.5 sm:hidden">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-200",
                      current === index
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
