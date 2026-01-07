"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Menu01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  MicroscopeIcon,
  ChartLineData01Icon,
  Rocket01Icon,
  PaintBrush01Icon,
  Settings01Icon,
  GraduationCap,
  Briefcase01Icon,
  FavouriteIcon,
  Home01Icon,
  ShoppingBag01Icon,
  Notebook01Icon,
} from "@hugeicons/core-free-icons";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { MegaMenuCategory } from "@/types/storefront";
import { PERSONAS } from "@/types/storefront";

interface MobileNavProps {
  categories: MegaMenuCategory[];
}

// Icon mapping with proper type
const categoryIcons: Record<string, IconSvgElement> = {
  "academic-bio-med": MicroscopeIcon,
  "wealth-finance": ChartLineData01Icon,
  "life-legacy": Rocket01Icon,
  "digital-aesthetic": PaintBrush01Icon,
  "work-flow": Settings01Icon,
};

const personaIcons: Record<string, IconSvgElement> = {
  student: GraduationCap,
  professional: Briefcase01Icon,
  couple: FavouriteIcon,
};

type NavView = "main" | "categories";

export function MobileNav({ categories }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<NavView>("main");

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setView("main"), 300);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 min-h-[44px] w-11 min-w-[44px] lg:hidden"
        >
          <HugeiconsIcon icon={Menu01Icon} size={24} />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        hideCloseButton
        className="flex h-full w-full flex-col p-0 sm:w-[400px]"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        {/* Header - fixed at top */}
        <div className="flex shrink-0 items-center justify-between border-b p-4">
          {view !== "main" ? (
            <Button variant="ghost" size="sm" onClick={() => setView("main")} className="gap-2">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
              Back
            </Button>
          ) : (
            <span className="text-lg font-semibold">Menu</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-11 min-h-[44px] w-11 min-w-[44px]"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {view === "main" && <MainView onNavigate={setView} onClose={handleClose} />}
          {view === "categories" && (
            <CategoriesView categories={categories} onClose={handleClose} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MainView({
  onNavigate,
  onClose,
}: {
  onNavigate: (view: NavView) => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-2 p-4">
      <NavLink href="/" icon={Home01Icon} onClick={onClose}>
        Home
      </NavLink>

      <NavLink href="/new-arrivals" icon={Rocket01Icon} onClick={onClose}>
        New Arrivals
      </NavLink>

      <NavLink href="/best-sellers" icon={ChartLineData01Icon} onClick={onClose}>
        Best Sellers
      </NavLink>

      <NavButton icon={ShoppingBag01Icon} onClick={() => onNavigate("categories")}>
        Shop by
      </NavButton>

      <NavLink href="/sale" icon={ShoppingBag01Icon} onClick={onClose} className="text-rose-500">
        On Sale
      </NavLink>

      <Separator className="my-4" />

      <NavLink href="/blog" icon={Notebook01Icon} onClick={onClose}>
        Blog
      </NavLink>

      <Separator className="my-4" />

      <div className="space-y-1">
        <Link
          href="/about"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground block min-h-[44px] px-3 py-3 text-sm transition-colors"
        >
          About Us
        </Link>
        <Link
          href="/contact"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground block min-h-[44px] px-3 py-3 text-sm transition-colors"
        >
          Contact
        </Link>
        <Link
          href="/help/faq"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground block min-h-[44px] px-3 py-3 text-sm transition-colors"
        >
          Help & FAQ
        </Link>
      </div>
    </div>
  );
}

function CategoriesView({
  categories,
  onClose,
}: {
  categories: MegaMenuCategory[];
  onClose: () => void;
}) {
  return (
    <div className="space-y-2 p-4">
      {/* Categories Section */}
      <h3 className="text-muted-foreground mb-4 px-3 text-sm font-semibold tracking-wide uppercase">
        Categories
      </h3>
      {categories.map((category) => {
        const iconElement = categoryIcons[category.slug] ?? Settings01Icon;
        return (
          <div key={category.slug}>
            <Link
              href={category.href}
              onClick={onClose}
              className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-3 transition-colors"
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <HugeiconsIcon icon={iconElement} size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <span className="text-foreground font-medium">{category.title}</span>
                {category.description && (
                  <p className="text-muted-foreground line-clamp-1 text-xs">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
            {category.subcategories.length > 0 && (
              <div className="mt-1 mb-3 ml-16 space-y-1">
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
            )}
          </div>
        );
      })}

      <Separator className="my-4" />

      {/* Personas Section */}
      <h3 className="text-muted-foreground mb-4 px-3 text-sm font-semibold tracking-wide uppercase">
        Shop for
      </h3>
      {PERSONAS.map((persona) => {
        const iconElement = personaIcons[persona.id] ?? GraduationCap;
        return (
          <Link
            key={persona.id}
            href={`/shop/${persona.slug}`}
            onClick={onClose}
            className="hover:bg-accent flex items-center gap-4 rounded-lg px-3 py-3 transition-colors"
          >
            <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
              <HugeiconsIcon icon={iconElement} size={24} className="text-muted-foreground" />
            </div>
            <div>
              <span className="text-foreground font-medium">{persona.title}</span>
              <p className="text-muted-foreground text-xs">
                {persona.id === "student" && "Ace your studies"}
                {persona.id === "professional" && "Level up your career"}
                {persona.id === "couple" && "Celebrate together"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
  onClick,
  className,
}: {
  href: string;
  icon: IconSvgElement;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-3 transition-colors"
    >
      <HugeiconsIcon icon={icon} size={20} className={className ?? "text-muted-foreground"} />
      <span className={className ?? "text-foreground font-medium"}>{children}</span>
    </Link>
  );
}

function NavButton({
  icon,
  children,
  onClick,
}: {
  icon: IconSvgElement;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="hover:bg-accent flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors"
    >
      <div className="flex items-center gap-3">
        <HugeiconsIcon icon={icon} size={20} className="text-muted-foreground" />
        <span className="text-foreground font-medium">{children}</span>
      </div>
      <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-muted-foreground" />
    </button>
  );
}
