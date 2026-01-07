"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { SearchSuggestion } from "@/lib/storefront/search-suggestions";
import type { SearchFilters } from "@/lib/storefront/search-utils";
import { formatPrice } from "@/lib/cart/utils";
import { trackSearch } from "@/components/analytics";

interface AdvancedSearchProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether to show the filter sidebar/sheet */
  showFilters?: boolean;
  /** Whether to show autocomplete suggestions */
  showSuggestions?: boolean;
  /** Available categories for filtering */
  categories?: Array<{ slug: string; title: string; count?: number }>;
  /** Available tags for filtering */
  tags?: Array<{ tag: string; count?: number }>;
  /** Price range bounds */
  priceRange?: { min: number; max: number };
  /** Initial filters */
  initialFilters?: SearchFilters;
  /** Initial query */
  initialQuery?: string;
  /** Callback when search is submitted */
  onSearch?: (query: string, filters: SearchFilters) => void;
  /** Custom class name */
  className?: string;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
] as const;

export function AdvancedSearch({
  placeholder = "Search products...",
  showFilters = true,
  showSuggestions = true,
  categories = [],
  tags = [],
  priceRange = { min: 0, max: 10000 },
  initialFilters = {},
  initialQuery = "",
  onSearch,
  className,
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [query, setQuery] = React.useState(initialQuery || searchParams.get("q") || "");
  const [filters, setFilters] = React.useState<SearchFilters>({
    ...initialFilters,
    category: initialFilters.category || searchParams.get("category") || undefined,
    sortBy: (initialFilters.sortBy ||
      searchParams.get("sort") ||
      "relevance") as SearchFilters["sortBy"],
  });
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = React.useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);
  const [lastSearchResultsCount, setLastSearchResultsCount] = React.useState<number | undefined>(
    undefined
  );

  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions when query changes
  React.useEffect(() => {
    if (!showSuggestions || query.length < 2) {
      setSuggestions([]);
      setLastSearchResultsCount(undefined);
      return;
    }

    // Debounce the API call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          const suggestionsList = data.suggestions || [];
          setSuggestions(suggestionsList);
          // Store the count of suggestions as an approximation of results
          setLastSearchResultsCount(suggestionsList.length);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, showSuggestions]);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestionsDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = React.useCallback(() => {
    setShowSuggestionsDropdown(false);

    // Track the search query
    if (query && query.trim().length >= 2) {
      trackSearch(query.trim(), lastSearchResultsCount);
    }

    if (onSearch) {
      onSearch(query, filters);
    } else {
      // Build URL with search params
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (filters.category) params.set("category", filters.category);
      if (filters.sortBy && filters.sortBy !== "relevance") params.set("sort", filters.sortBy);
      if (filters.priceRange) {
        if (filters.priceRange.min > 0) params.set("minPrice", String(filters.priceRange.min));
        if (filters.priceRange.max > 0) params.set("maxPrice", String(filters.priceRange.max));
      }
      if (filters.tags && filters.tags.length > 0) {
        params.set("tags", filters.tags.join(","));
      }

      router.push(`/products?${params.toString()}`);
    }
  }, [query, filters, onSearch, router, lastSearchResultsCount]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestionsDropdown(false);

    // Track the search when a suggestion is clicked
    if (suggestion.type === "query") {
      trackSearch(suggestion.title, 1); // Query suggestion clicked
    }

    if (suggestion.type === "product" && suggestion.slug) {
      router.push(`/products/${suggestion.slug}`);
    } else if (suggestion.type === "category" && suggestion.slug) {
      router.push(`/categories/${suggestion.slug}`);
    } else if (suggestion.type === "query") {
      setQuery(suggestion.title);
      handleSearch();
    }
  };

  // Handle filter changes
  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setQuery("");
  };

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.priceRange) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    return count;
  }, [filters]);

  return (
    <div className={cn("w-full", className)}>
      {/* Search Bar Row */}
      <div className="flex items-center gap-2">
        {/* Main Search Input */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestionsDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                } else if (e.key === "Escape") {
                  setShowSuggestionsDropdown(false);
                }
              }}
              className="h-11 pr-10 pl-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions &&
            showSuggestionsDropdown &&
            (suggestions.length > 0 || isLoadingSuggestions) && (
              <div
                ref={suggestionsRef}
                className="bg-popover border-border absolute top-full left-0 z-50 mt-1 w-full rounded-lg border shadow-lg"
              >
                {isLoadingSuggestions ? (
                  <div className="text-muted-foreground p-4 text-center text-sm">Searching...</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.title}-${index}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="hover:bg-accent flex w-full items-center gap-3 px-4 py-2 text-left"
                      >
                        {suggestion.image ? (
                          <div className="bg-muted relative h-10 w-10 overflow-hidden rounded">
                            <Image
                              src={suggestion.image}
                              alt={suggestion.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                            <Search className="text-muted-foreground h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate text-sm font-medium">
                            {suggestion.title}
                          </p>
                          <p className="text-muted-foreground text-xs capitalize">
                            {suggestion.type}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} className="h-11 px-6">
          Search
        </Button>

        {/* Filter Button (Mobile/Tablet) */}
        {showFilters && (
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative h-11 lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <FilterContent
                filters={filters}
                categories={categories}
                tags={tags}
                priceRange={priceRange}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
                onApply={() => {
                  setIsFilterSheetOpen(false);
                  handleSearch();
                }}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Filter Bar (Desktop) */}
      {showFilters && (
        <div className="mt-4 hidden items-center gap-4 lg:flex">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Category:</span>
              <select
                value={filters.category || ""}
                onChange={(e) => updateFilter("category", e.target.value || undefined)}
                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.title} {cat.count !== undefined && `(${cat.count})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="border-input bg-background hover:bg-accent flex h-9 items-center gap-2 rounded-md border px-3 text-sm"
            >
              <span className="text-muted-foreground">Sort:</span>
              <span>
                {SORT_OPTIONS.find((o) => o.value === (filters.sortBy || "relevance"))?.label}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showSortDropdown && (
              <div className="bg-popover border-border absolute top-full left-0 z-50 mt-1 min-w-[180px] rounded-md border py-1 shadow-lg">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      updateFilter("sortBy", option.value);
                      setShowSortDropdown(false);
                    }}
                    className={cn(
                      "hover:bg-accent w-full px-3 py-2 text-left text-sm",
                      filters.sortBy === option.value && "bg-accent"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Active filters:</span>
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find((c) => c.slug === filters.category)?.title || filters.category}
                  <button
                    type="button"
                    onClick={() => updateFilter("category", undefined)}
                    className="hover:text-foreground ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.priceRange && (
                <Badge variant="secondary" className="gap-1">
                  {formatPrice(filters.priceRange.min)} - {formatPrice(filters.priceRange.max)}
                  <button
                    type="button"
                    onClick={() => updateFilter("priceRange", undefined)}
                    className="hover:text-foreground ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() =>
                      updateFilter(
                        "tags",
                        filters.tags?.filter((t) => t !== tag)
                      )
                    }
                    className="hover:text-foreground ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Filter Content Component
 * Used in both the mobile sheet and desktop sidebar
 */
interface FilterContentProps {
  filters: SearchFilters;
  categories: Array<{ slug: string; title: string; count?: number }>;
  tags: Array<{ tag: string; count?: number }>;
  priceRange: { min: number; max: number };
  onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  onClearFilters: () => void;
  onApply: () => void;
}

function FilterContent({
  filters,
  categories,
  tags,
  priceRange,
  onFilterChange,
  onClearFilters,
  onApply,
}: FilterContentProps) {
  const [localPriceMin, setLocalPriceMin] = React.useState(
    filters.priceRange?.min?.toString() || ""
  );
  const [localPriceMax, setLocalPriceMax] = React.useState(
    filters.priceRange?.max?.toString() || ""
  );

  // Apply price range filter
  const applyPriceRange = () => {
    const min = parseInt(localPriceMin) || 0;
    const max = parseInt(localPriceMax) || 0;
    if (min > 0 || max > 0) {
      onFilterChange("priceRange", { min, max });
    } else {
      onFilterChange("priceRange", undefined);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h4 className="text-foreground mb-3 font-medium">Categories</h4>
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <label key={category.slug} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category.slug}
                  onChange={() => onFilterChange("category", category.slug)}
                  className="text-primary h-4 w-4"
                />
                <span className="text-sm">{category.title}</span>
                {category.count !== undefined && (
                  <span className="text-muted-foreground text-xs">({category.count})</span>
                )}
              </label>
            ))}
            {filters.category && (
              <button
                type="button"
                onClick={() => onFilterChange("category", undefined)}
                className="text-primary text-left text-sm hover:underline"
              >
                Clear category
              </button>
            )}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="text-foreground mb-3 font-medium">Price Range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={`Min (${formatPrice(priceRange.min)})`}
            value={localPriceMin}
            onChange={(e) => setLocalPriceMin(e.target.value)}
            onBlur={applyPriceRange}
            className="h-9"
            min={0}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder={`Max (${formatPrice(priceRange.max)})`}
            value={localPriceMax}
            onChange={(e) => setLocalPriceMax(e.target.value)}
            onBlur={applyPriceRange}
            className="h-9"
            min={0}
          />
        </div>
        {filters.priceRange && (
          <button
            type="button"
            onClick={() => {
              setLocalPriceMin("");
              setLocalPriceMax("");
              onFilterChange("priceRange", undefined);
            }}
            className="text-primary mt-2 text-sm hover:underline"
          >
            Clear price range
          </button>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h4 className="text-foreground mb-3 font-medium">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 15).map((tagItem) => {
              const isSelected = filters.tags?.includes(tagItem.tag);
              return (
                <button
                  key={tagItem.tag}
                  type="button"
                  onClick={() => {
                    const currentTags = filters.tags || [];
                    if (isSelected) {
                      onFilterChange(
                        "tags",
                        currentTags.filter((t) => t !== tagItem.tag)
                      );
                    } else {
                      onFilterChange("tags", [...currentTags, tagItem.tag]);
                    }
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  )}
                >
                  {tagItem.tag}
                  {tagItem.count !== undefined && (
                    <span className="ml-1 opacity-70">({tagItem.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={onClearFilters} className="flex-1">
          Clear All
        </Button>
        <Button onClick={onApply} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

export { FilterContent };
