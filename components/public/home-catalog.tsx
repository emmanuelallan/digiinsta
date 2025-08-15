"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import type { PublicCategory } from "@/actions/public/categories"

interface HomeCatalogProps {
  categories: PublicCategory[]
}

export function HomeCatalog({ categories }: HomeCatalogProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 1,
    align: "start",
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 1 },
    },
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  const categoryTabs = useMemo(
    () => [{ id: "all", title: "All" }, ...categories.map((c) => ({ id: c.id, title: c.title }))],
    [categories],
  )

  if (!categories.length) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-6 sm:py-8 lg:py-14">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.05),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <Image 
            src="/images/hero.webp" 
            height={250} 
            width={1400} 
            alt="hero image" 
            className="rounded-lg w-full h-auto"
          />

          {/* Quick Categories */}
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex flex-wrap justify-center gap-2 px-2">
              {categoryTabs.map((c) => (
                <Button
                  key={c.id}
                  size="sm"
                  variant={c.id === "all" ? "outline" : "ghost"}
                  className="rounded-md bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
                >
                  {c.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Carousel Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Explore Our Categories</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Discover our carefully curated collection of planners, journals, and organizational tools
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3 sm:gap-4 lg:gap-6">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex-[0_0_calc(100%-6px)] sm:flex-[0_0_calc(50%-8px)] md:flex-[0_0_calc(33.333%-11px)] lg:flex-[0_0_calc(25%-18px)] min-w-0"
                  >
                    <Link href={`/categories/${category.slug}`} className="group cursor-pointer block">
                      <Card className="group h-full transition-all duration-300 border bg-background/80 backdrop-blur-sm shadow-none rounded-lg p-0 gap-2">
                        <div className="aspect-[4/3] overflow-hidden relative rounded-t-lg">
                          {category.image_url ? (
                            <Image
                              src={category.image_url}
                              alt={category.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                              <div className="text-center space-y-2">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted/50 rounded-full mx-auto flex items-center justify-center">
                                  <span className="text-xl sm:text-2xl">📁</span>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">No image</p>
                              </div>
                            </div>
                          )}
                          {/* NEW Ribbon */}
                          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                            <div className="bg-primary text-primary-foreground text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg">
                              NEW
                            </div>
                          </div>
                        </div>
                        <CardContent className="text-center p-3 sm:p-4 lg:p-6">
                          <h3 className="font-bold text-lg sm:text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                            {category.title}
                          </h3>
                          {category.tagline && (
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              {category.tagline}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons - Hidden on mobile, visible on larger screens */}
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/80 backdrop-blur-sm border-border shadow-lg hover:bg-background"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/80 backdrop-blur-sm border-border shadow-lg hover:bg-background"
              onClick={scrollNext}
              disabled={!canScrollNext}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
