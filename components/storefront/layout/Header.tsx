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

type HeaderMode = "full" | "compact" | "hidden";

// Hook to track scroll and determine header mode with debouncing to prevent jitter
function useHeaderMode(): HeaderMode {
  const [mode, setMode] = useState<HeaderMode>("full");
  const lastScrollY = useRef(0);
  const lastMode = useRef<HeaderMode>("full");
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scrollThreshold = 50; // Minimum scroll delta to trigger change
    const topThreshold = 150; // Show full header when within this range of top
    const debounceMs = 50; // Debounce time to prevent rapid mode changes

    const updateMode = () => {
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY.current;

      let newMode: HeaderMode = lastMode.current;

      // At top - always show full header
      if (scrollY < topThreshold) {
        newMode = "full";
      }
      // Scrolling down significantly - hide header
      else if (scrollDelta > scrollThreshold) {
        newMode = "hidden";
      }
      // Scrolling up significantly - show compact header
      else if (scrollDelta < -scrollThreshold) {
        newMode = "compact";
      }

      // Only update if mode actually changed
      if (newMode !== lastMode.current) {
        lastMode.current = newMode;
        setMode(newMode);
      }

      lastScrollY.current = Math.max(0, scrollY);
    };

    const onScroll = () => {
      // Clear any pending timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Debounce the mode update
      scrollTimeout.current = setTimeout(updateMode, debounceMs);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return mode;
}

export function Header({ categories }: HeaderProps) {
  const isClient = useIsClient();
  const mode = useHeaderMode();

  return (
    <header
      className={cn(
        "border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur",
        "transition-transform duration-200 ease-in-out will-change-transform",
        mode === "hidden" && "-translate-y-full"
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Compact Header (shown when scrolling up, not at top) - Desktop only */}
        <div
          className={cn(
            "hidden items-center justify-between gap-4 lg:flex",
            "transition-[height,opacity] duration-200 ease-in-out",
            mode === "compact" ? "h-16 opacity-100" : "pointer-events-none h-0 opacity-0"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logos/logo-line.svg"
              alt="DigiInsta"
              width={70}
              height={38}
              className="h-[38px] w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <div className="flex flex-1 justify-center">
            {isClient ? <MegaMenu categories={categories} /> : <div className="h-10" />}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {isClient ? <SearchBar /> : <div className="h-10 w-60" />}
            <ThemeToggle />
            <CartButton />
          </div>
        </div>

        {/* Full Header (shown at top or on mobile) */}
        <div
          className={cn(
            "transition-[height,opacity] duration-200 ease-in-out",
            mode === "compact" && "lg:pointer-events-none lg:h-0 lg:opacity-0"
          )}
        >
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
      </div>
    </header>
  );
}
