"use client";

import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Cancel01Icon,
  MicroscopeIcon,
  ChartLineData01Icon,
  Rocket01Icon,
  PaintBrush01Icon,
  Settings01Icon,
  GraduationCap,
  Briefcase01Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { MegaMenuCategory } from "@/types/storefront";
import { PERSONAS } from "@/types/storefront";

interface MobileMegaMenuProps {
  categories: MegaMenuCategory[];
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping for categories
const categoryIcons: Record<string, IconSvgElement> = {
  "academic-bio-med": MicroscopeIcon,
  "wealth-finance": ChartLineData01Icon,
  "life-legacy": Rocket01Icon,
  "digital-aesthetic": PaintBrush01Icon,
  "work-flow": Settings01Icon,
};

// Icon mapping for personas
const personaIcons: Record<string, IconSvgElement> = {
  student: GraduationCap,
  professional: Briefcase01Icon,
  couple: FavouriteIcon,
};

export function MobileMegaMenu({ categories, isOpen, onClose }: MobileMegaMenuProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
        <SheetTitle className="sr-only">Categories Menu</SheetTitle>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <span className="text-lg font-semibold">Browse Categories</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-11 min-h-[44px] w-11 min-w-[44px]"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {/* Categories Accordion */}
              <Accordion type="multiple" className="w-full">
                {categories.map((category) => {
                  const iconElement = categoryIcons[category.slug] ?? Settings01Icon;
                  const hasSubcategories = category.subcategories.length > 0;

                  if (!hasSubcategories) {
                    // Render as a simple link if no subcategories
                    return (
                      <div key={category.slug} className="border-b last:border-b-0">
                        <Link
                          href={category.href}
                          onClick={onClose}
                          className="hover:text-primary flex min-h-[44px] items-center gap-3 py-4 transition-colors"
                        >
                          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                            <HugeiconsIcon
                              icon={iconElement}
                              size={20}
                              className="text-muted-foreground"
                            />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{category.title}</span>
                            {category.description && (
                              <p className="text-muted-foreground line-clamp-1 text-xs">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      </div>
                    );
                  }

                  return (
                    <AccordionItem key={category.slug} value={category.slug}>
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                            <HugeiconsIcon
                              icon={iconElement}
                              size={20}
                              className="text-muted-foreground"
                            />
                          </div>
                          <div className="text-left">
                            <span className="font-medium">{category.title}</span>
                            {category.description && (
                              <p className="text-muted-foreground line-clamp-1 text-xs">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="ml-[52px] space-y-1">
                          {/* View all link for category */}
                          <Link
                            href={category.href}
                            onClick={onClose}
                            className="text-primary block min-h-[44px] py-3 text-sm font-medium hover:underline"
                          >
                            View all {category.title}
                          </Link>
                          {/* Subcategories */}
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={sub.href}
                              onClick={onClose}
                              className="text-muted-foreground hover:text-foreground block min-h-[44px] py-3 text-sm transition-colors"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              <Separator className="my-4" />

              {/* Shop for Personas */}
              <h3 className="text-muted-foreground mb-4 px-1 text-sm font-semibold tracking-wide uppercase">
                Shop for
              </h3>
              <div className="space-y-2">
                {PERSONAS.map((persona) => {
                  const iconElement = personaIcons[persona.id] ?? GraduationCap;
                  return (
                    <Link
                      key={persona.id}
                      href={`/shop/${persona.slug}`}
                      onClick={onClose}
                      className="hover:bg-accent flex min-h-[44px] items-center gap-4 rounded-lg px-1 py-3 transition-colors"
                    >
                      <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                        <HugeiconsIcon
                          icon={iconElement}
                          size={24}
                          className="text-muted-foreground"
                        />
                      </div>
                      <div>
                        <span className="text-foreground font-medium">{persona.title}</span>
                        <p className="text-muted-foreground text-xs">{persona.tagline}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <Separator className="my-4" />

              {/* Quick Links */}
              <div className="space-y-1">
                <Link
                  href="/categories"
                  onClick={onClose}
                  className="hover:text-primary block min-h-[44px] py-3 text-sm font-medium transition-colors"
                >
                  All Categories
                </Link>
                <Link
                  href="/bundles"
                  onClick={onClose}
                  className="hover:text-primary block min-h-[44px] py-3 text-sm font-medium transition-colors"
                >
                  Bundles
                </Link>
                <Link
                  href="/sale"
                  onClick={onClose}
                  className="block min-h-[44px] py-3 text-sm font-medium text-rose-500 transition-colors hover:text-rose-600"
                >
                  On Sale
                </Link>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
