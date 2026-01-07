"use client";

import { useSyncExternalStore, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { CartButton } from "@/components/storefront/cart/CartButton";
import { cn } from "@/lib/utils";
import type { MegaMenuCategory } from "@/types/storefront";

/**
 * Lazy-load SearchBar to reduce initial bundle size
 * Validates: Requirements 5.1, 5.3
 */
const SearchBar = dynamic(() => import("./SearchBar").then((mod) => mod.SearchBar), {
  ssr: false,
  loading: () => <div className="bg-muted h-10 w-60 animate-pulse rounded-md" />,
});

interface HeaderProps {
  categories: MegaMenuCategory[];
}

// Hook to detect if we're on the client (prevents hydration mismatch)
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// Hook: returns whether compact header should be visible
// Shows when scrolling up AND not at top, hides otherwise
function useCompactHeaderVisible(): boolean {
  const [showCompact, setShowCompact] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const updateHeader = () => {
      const currentScrollY = window.scrollY;

      // At top - hide compact header (original is visible)
      if (currentScrollY <= 100) {
        setShowCompact(false);
      }
      // Scrolling up while not at top - show compact header
      else if (currentScrollY < lastScrollY.current) {
        setShowCompact(true);
      }
      // Scrolling down - hide compact header
      else if (currentScrollY > lastScrollY.current) {
        setShowCompact(false);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMounted]);

  return showCompact;
}

export function Header({ categories }: HeaderProps) {
  const isClient = useIsClient();
  const showCompactHeader = useCompactHeaderVisible();

  return (
    <>
      {/* Original Full Header - NOT sticky, stays at top of page */}
      <header className="border-border bg-background w-full border-b">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Row: Logo + Search + Icons */}
          <div className="flex h-24 items-center justify-between gap-4">
            {/* Mobile Nav + Logo */}
            <div className="flex items-center gap-2">
              {isClient ? (
                <MobileNav categories={categories} />
              ) : (
                <div className="h-11 min-h-[44px] w-11 min-w-[44px] lg:hidden" />
              )}
              <Link href="/" className="flex items-center">
                <Image
                  src="/logos/logo-line.svg"
                  alt="DigiInsta"
                  width={90}
                  height={48}
                  className="h-[50px] w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search - hidden on mobile, shown on desktop */}
              <div className="hidden lg:block">
                {isClient ? <SearchBar /> : <div className="h-10 w-60" />}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Cart - hidden on mobile (available in bottom nav), shown on desktop */}
              <div className="hidden lg:block">
                <CartButton />
              </div>
            </div>
          </div>

          {/* Bottom Row: Desktop Navigation */}
          <div className="border-border/50 hidden h-12 items-center justify-center border-t lg:flex">
            {isClient ? <MegaMenu categories={categories} /> : <div className="h-10" />}
          </div>
        </div>
      </header>

      {/* Compact Sticky Header - slides in when scrolling up */}
      <div
        className={cn(
          "border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur",
          "transition-transform duration-200 ease-out",
          isClient && showCompactHeader ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile Nav + Logo */}
            <div className="flex items-center gap-2">
              {isClient ? (
                <MobileNav categories={categories} />
              ) : (
                <div className="h-11 min-h-[44px] w-11 min-w-[44px] lg:hidden" />
              )}
              <Link href="/" className="flex items-center">
                <Image
                  src="/logos/logo-line.svg"
                  alt="DigiInsta"
                  width={70}
                  height={38}
                  className="h-[38px] w-auto"
                />
              </Link>
            </div>

            {/* Center: Navigation (desktop only) */}
            <div className="hidden flex-1 justify-center lg:flex">
              {isClient ? <MegaMenu categories={categories} /> : null}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search - hidden on mobile */}
              <div className="hidden lg:block">
                {isClient ? <SearchBar /> : <div className="h-10 w-48" />}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Cart - hidden on mobile */}
              <div className="hidden lg:block">
                <CartButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
