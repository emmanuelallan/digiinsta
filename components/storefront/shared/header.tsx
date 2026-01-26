"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Image from "next/image";

interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export function Header() {
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCollections() {
      try {
        const response = await fetch('/api/taxonomies/collections');
        const data = await response.json();
        
        if (data.success && data.collections) {
          setCollections(data.collections);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCollections();
  }, []);

  // Get first 4 collections for left menu, excluding Valentine's
  const menuCollections = collections
    .filter(c => c.slug !== 'valentines')
    .slice(0, 4);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Left - Collection Links */}
        <div className="hidden lg:flex items-center gap-6">
          {isLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </>
          ) : (
            menuCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="uppercase text-sm font-bold text-gray-900 hover:text-pink-600 transition-colors"
              >
                {collection.title}
              </Link>
            ))
          )}
        </div>

        {/* Center - Logo */}
        <Link
          href="/"
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded-md"
        >
          <Image
            src="/images/logo/logo-line.svg"
            alt="Digital love for the heart"
            width={100}
            height={100}
          />
          <span className="sr-only">Digital love for the heart</span>
        </Link>

        {/* Right - Shop & Other Links */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="gap-1">
            {/* Shop All */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/collections/all"
                  className="group uppercase inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:text-pink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                >
                  Shop All
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Best Seller */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/collections/best-sellers"
                  className="group uppercase inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:text-pink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                >
                  Best Sellers
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Bundle & Save */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/collections/bundles"
                  className="group uppercase inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:text-pink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                >
                  Bundle & Save
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Valentine's */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/collections/valentines"
                  className="group uppercase inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:text-pink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                >
                  Valentine&apos;s
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile menu button */}
        <button className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2">
          <svg
            className="h-6 w-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="sr-only">Open menu</span>
        </button>
      </nav>
    </header>
  );
}
