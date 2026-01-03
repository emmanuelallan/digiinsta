"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import type { SearchResult } from "@/types/storefront";

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = "Search products..." }: SearchBarProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Keyboard shortcut to open search
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="relative h-11 min-h-[44px] w-11 min-w-[44px] p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={Search01Icon} size={18} className="xl:mr-2" />
        <span className="hidden xl:inline-flex">{placeholder}</span>
        <kbd className="bg-muted pointer-events-none absolute top-1.5 right-1.5 hidden h-6 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <HugeiconsIcon
                icon={Loading03Icon}
                size={24}
                className="text-muted-foreground animate-spin"
              />
            </div>
          )}

          {!isLoading && query.length >= 2 && !results?.totalResults && (
            <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
          )}

          {!isLoading && results && results.totalResults > 0 && (
            <>
              {/* Products */}
              {results.products.length > 0 && (
                <CommandGroup heading="Products">
                  {results.products.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.title}
                      onSelect={() => handleSelect(`/products/${product.slug}`)}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                        {product.images?.[0]?.image?.url ? (
                          <Image
                            src={product.images[0].image.url}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="bg-muted h-full w-full" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {product.subcategory?.title}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Categories */}
              {results.categories.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Categories">
                    {results.categories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.title}
                        onSelect={() => handleSelect(`/categories/${category.slug}`)}
                      >
                        <span>{category.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {/* Bundles */}
              {results.bundles.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Bundles">
                    {results.bundles.map((bundle) => (
                      <CommandItem
                        key={bundle.id}
                        value={bundle.title}
                        onSelect={() => handleSelect(`/bundles/${bundle.slug}`)}
                        className="flex items-center gap-3 py-3"
                      >
                        <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                          {bundle.heroImage?.url ? (
                            <Image
                              src={bundle.heroImage.url}
                              alt={bundle.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="bg-muted h-full w-full" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{bundle.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {bundle.products.length} products
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </>
          )}

          {/* Quick Links when no query */}
          {!query && (
            <CommandGroup heading="Quick Links">
              <CommandItem onSelect={() => handleSelect("/products")}>
                Browse all products
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/bundles")}>View bundles</CommandItem>
              <CommandItem onSelect={() => handleSelect("/categories")}>
                Browse categories
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
