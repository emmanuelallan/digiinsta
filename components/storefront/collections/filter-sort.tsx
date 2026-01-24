"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SortOption = 'price-asc' | 'price-desc' | 'popularity' | 'newest';

export interface FilterOptions {
  priceRange?: [number, number];
  badges?: string[];
}

interface FilterSortProps {
  onFilterChange: (filter: FilterOptions) => void;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

export function FilterSort({
  onFilterChange,
  onSortChange,
  className,
}: FilterSortProps) {
  const [sortValue, setSortValue] = React.useState<SortOption>('popularity');
  const [priceRange, setPriceRange] = React.useState<string>('all');

  const handleSortChange = (value: string) => {
    const sortOption = value as SortOption;
    setSortValue(sortOption);
    onSortChange(sortOption);
  };

  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value);
    
    const filterOptions: FilterOptions = {};
    
    if (value === 'under-10') {
      filterOptions.priceRange = [0, 10];
    } else if (value === '10-25') {
      filterOptions.priceRange = [10, 25];
    } else if (value === '25-50') {
      filterOptions.priceRange = [25, 50];
    } else if (value === 'over-50') {
      filterOptions.priceRange = [50, Infinity];
    }
    
    onFilterChange(filterOptions);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-brand-gray-warm-light bg-white p-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Filter Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="text-sm font-medium text-brand-gray-warm-dark">
          Filter by:
        </span>
        
        <div className="flex items-center gap-2">
          <label
            htmlFor="price-range"
            className="text-sm text-brand-gray-warm"
          >
            Price
          </label>
          <Select value={priceRange} onValueChange={handlePriceRangeChange}>
            <SelectTrigger id="price-range" className="w-[140px]">
              <SelectValue placeholder="All prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All prices</SelectItem>
              <SelectItem value="under-10">Under $10</SelectItem>
              <SelectItem value="10-25">$10 - $25</SelectItem>
              <SelectItem value="25-50">$25 - $50</SelectItem>
              <SelectItem value="over-50">Over $50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="sort-by"
          className="text-sm text-brand-gray-warm"
        >
          Sort by:
        </label>
        <Select value={sortValue} onValueChange={handleSortChange}>
          <SelectTrigger id="sort-by" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
