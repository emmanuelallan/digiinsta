"use client";

import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  UserGroupIcon,
  GraduationCap,
  Briefcase01Icon,
  FavouriteIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import type { MegaMenuCategory } from "@/types/storefront";
import { PERSONAS } from "@/types/storefront";

interface MegaMenuProps {
  categories: MegaMenuCategory[];
}

// Icon mapping for personas
const personaIcons: Record<string, IconSvgElement> = {
  student: GraduationCap,
  professional: Briefcase01Icon,
  couple: FavouriteIcon,
};

export function MegaMenu({ categories }: MegaMenuProps) {
  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList className="gap-1">
        {/* New Arrivals Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/new-arrivals">New</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Best Sellers Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/best-sellers">Bestsellers</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Shop by Menu (Categories + Personas) */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">
            Shop by
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[600px] gap-6 p-6 lg:grid-cols-[1fr_1fr]">
              {/* Categories Column */}
              <div>
                <h3 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Categories
                </h3>
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={category.href}
                          className="group block rounded-md px-3 py-2 hover:bg-accent transition-colors"
                        >
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {category.title}
                          </span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/categories"
                  className="mt-4 inline-flex items-center gap-1 px-3 text-sm font-medium text-primary hover:underline"
                >
                  View all
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </Link>
              </div>

              {/* Personas Column */}
              <div className="border-l border-border pl-6">
                <h3 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Shop for
                </h3>
                <ul className="space-y-2">
                  {PERSONAS.map((persona) => {
                    const iconElement =
                      personaIcons[persona.id] ?? UserGroupIcon;
                    return (
                      <li key={persona.id}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={`/shop/${persona.slug}`}
                            className="group flex flex-row items-center gap-4 rounded-lg p-3 hover:bg-accent transition-colors"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                              <HugeiconsIcon
                                icon={iconElement}
                                size={24}
                                className="text-muted-foreground group-hover:text-primary transition-colors"
                              />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block">
                                {persona.title}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {persona.id === "student" && "Ace your studies"}
                                {persona.id === "professional" &&
                                  "Level up your career"}
                                {persona.id === "couple" &&
                                  "Celebrate together"}
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* On Sale Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/sale" className="text-rose-500 hover:text-rose-600">
              Sale
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Blog Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/blog">Blog</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
