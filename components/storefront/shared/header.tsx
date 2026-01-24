"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="gap-1">
            {/* Shop Mega Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="uppercase text-sm font-bold text-gray-900 hover:text-pink-600 data-[state=open]:text-pink-600">
                Shop
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[800px] p-8 bg-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-gray-500">Loading collections...</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-6">
                      {/* Shop All - First Item */}
                      <Link
                        href="/products"
                        className="group relative overflow-hidden rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                      >
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-white/30"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                              />
                            </svg>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                            <h3 className="text-white text-left font-semibold text-lg mb-1">
                              Shop All
                            </h3>
                            <span className="text-white text-xs font-bold uppercase tracking-wider">
                              SHOP NOW
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Collections - Show first 3 */}
                      {collections.slice(0, 3).map((collection) => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.slug}`}
                          className="group relative overflow-hidden rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                        >
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <Image
                              src={collection.imageUrl}
                              width={240}
                              height={240}
                              alt={collection.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white text-left font-semibold text-lg mb-1 line-clamp-2">
                                {collection.title}
                              </h3>
                              <span className="text-white text-xs font-bold uppercase tracking-wider">
                                SHOP NOW
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </NavigationMenuContent>
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
