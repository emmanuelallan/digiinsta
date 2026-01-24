'use client';

import { useState, useCallback } from 'react';

export interface TaxonomyOption {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

type TaxonomyType = 'product_type' | 'format' | 'occasion' | 'collection';

interface TaxonomyCache {
  [key: string]: {
    data: TaxonomyOption[];
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache: TaxonomyCache = {};

/**
 * Custom hook for caching taxonomy data
 * Reduces API calls by caching taxonomy data for 5 minutes
 */
export function useTaxonomyCache() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchTaxonomies = useCallback(async (type: TaxonomyType): Promise<TaxonomyOption[]> => {
    // Check cache first
    const cached = cache[type];
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    // Fetch from API
    setIsLoading(true);
    try {
      const response = await fetch(`/api/taxonomies/${type}`);
      const data = await response.json();

      if (data.success) {
        const taxonomies = data.taxonomies || [];
        
        // Update cache
        cache[type] = {
          data: taxonomies,
          timestamp: now,
        };

        return taxonomies;
      }

      return [];
    } catch (error) {
      console.error(`Error fetching ${type} taxonomies:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllTaxonomies = useCallback(async () => {
    const types: TaxonomyType[] = ['product_type', 'format', 'occasion', 'collection'];
    
    const results = await Promise.all(
      types.map(type => fetchTaxonomies(type))
    );

    return {
      productTypes: results[0],
      formats: results[1],
      occasions: results[2],
      collections: results[3],
    };
  }, [fetchTaxonomies]);

  const invalidateCache = useCallback((type?: TaxonomyType) => {
    if (type) {
      delete cache[type];
    } else {
      // Clear all cache
      Object.keys(cache).forEach(key => delete cache[key]);
    }
  }, []);

  const addToCache = useCallback((type: TaxonomyType, taxonomy: TaxonomyOption) => {
    const cached = cache[type];
    if (cached) {
      cached.data.push(taxonomy);
      cached.timestamp = Date.now();
    }
  }, []);

  return {
    fetchTaxonomies,
    fetchAllTaxonomies,
    invalidateCache,
    addToCache,
    isLoading,
  };
}
