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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
          className="lg:hidden h-11 w-11 min-h-[44px] min-w-[44px]"
        >
          <HugeiconsIcon icon={Menu01Icon} size={24} />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            {view !== "main" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("main")}
                className="gap-2"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                Back
              </Button>
            ) : (
              <span className="font-semibold text-lg">Menu</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-11 w-11 min-h-[44px] min-w-[44px]"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {view === "main" && (
              <MainView onNavigate={setView} onClose={handleClose} />
            )}
            {view === "categories" && (
              <CategoriesView categories={categories} onClose={handleClose} />
            )}
          </ScrollArea>
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
    <div className="p-4 space-y-2">
      <NavLink href="/" icon={Home01Icon} onClick={onClose}>
        Home
      </NavLink>

      <NavLink href="/new-arrivals" icon={Rocket01Icon} onClick={onClose}>
        New Arrivals
      </NavLink>

      <NavLink
        href="/best-sellers"
        icon={ChartLineData01Icon}
        onClick={onClose}
      >
        Best Sellers
      </NavLink>

      <NavButton
        icon={ShoppingBag01Icon}
        onClick={() => onNavigate("categories")}
      >
        Shop by
      </NavButton>

      <NavLink
        href="/sale"
        icon={ShoppingBag01Icon}
        onClick={onClose}
        className="text-rose-500"
      >
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
          className="block px-3 py-3 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          About Us
        </Link>
        <Link
          href="/contact"
          onClick={onClose}
          className="block px-3 py-3 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Contact
        </Link>
        <Link
          href="/help/faq"
          onClick={onClose}
          className="block px-3 py-3 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors"
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
    <div className="p-4 space-y-2">
      {/* Categories Section */}
      <h3 className="px-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Categories
      </h3>
      {categories.map((category) => {
        const iconElement = categoryIcons[category.slug] ?? Settings01Icon;
        return (
          <div key={category.slug}>
            <Link
              href={category.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon
                  icon={iconElement}
                  size={20}
                  className="text-muted-foreground"
                />
              </div>
              <div className="flex-1">
                <span className="font-medium text-foreground">
                  {category.title}
                </span>
                {category.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
            {category.subcategories.length > 0 && (
              <div className="ml-16 mt-1 mb-3 space-y-1">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={sub.href}
                    onClick={onClose}
                    className="block py-3 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors"
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
      <h3 className="px-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Shop for
      </h3>
      {PERSONAS.map((persona) => {
        const iconElement = personaIcons[persona.id] ?? GraduationCap;
        return (
          <Link
            key={persona.id}
            href={`/shop/${persona.slug}`}
            onClick={onClose}
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted shrink-0">
              <HugeiconsIcon
                icon={iconElement}
                size={24}
                className="text-muted-foreground"
              />
            </div>
            <div>
              <span className="font-medium text-foreground">
                {persona.title}
              </span>
              <p className="text-xs text-muted-foreground">
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
      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
    >
      <HugeiconsIcon
        icon={icon}
        size={20}
        className={className ?? "text-muted-foreground"}
      />
      <span className={className ?? "font-medium text-foreground"}>
        {children}
      </span>
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
      className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-accent transition-colors"
    >
      <div className="flex items-center gap-3">
        <HugeiconsIcon
          icon={icon}
          size={20}
          className="text-muted-foreground"
        />
        <span className="font-medium text-foreground">{children}</span>
      </div>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={18}
        className="text-muted-foreground"
      />
    </button>
  );
}
