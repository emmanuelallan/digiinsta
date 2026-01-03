"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { SearchBar } from "./SearchBar";
import { CartButton } from "@/components/storefront/cart/CartButton";
import type { MegaMenuCategory } from "@/types/storefront";

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

export function Header({ categories }: HeaderProps) {
  const isClient = useIsClient();

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
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
            {/* Search */}
            {isClient ? (
              <SearchBar />
            ) : (
              <div className="h-11 min-h-[44px] w-11 min-w-[44px] xl:h-10 xl:w-60" />
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart */}
            <CartButton />
          </div>
        </div>

        {/* Bottom Row: Desktop Navigation */}
        <div className="border-border/50 hidden h-12 items-center justify-center border-t lg:flex">
          {isClient ? <MegaMenu categories={categories} /> : <div className="h-10" />}
        </div>
      </div>
    </header>
  );
}
