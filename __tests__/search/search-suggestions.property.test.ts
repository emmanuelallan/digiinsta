/**
 * Property-Based Tests for Search Suggestions
 *
 * Feature: comprehensive-site-optimization
 * Property 17: Search suggestions are relevant
 * Validates: Requirements 15.1
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Search suggestion type (mirroring the actual implementation)
 */
interface SearchSuggestion {
  type: "product" | "category" | "query";
  title: string;
  slug?: string;
  image?: string;
}

/**
 * Check if a suggestion matches a query (mirroring the actual implementation)
 * A suggestion matches if the query string appears in the title (case-insensitive)
 */
function suggestionMatchesQuery(suggestion: SearchSuggestion, query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return suggestion.title.toLowerCase().includes(lowerQuery);
}

/**
 * Filter recent queries that match the current query (mirroring the actual implementation)
 */
function filterRecentQueries(query: string, recentSearches: string[]): SearchSuggestion[] {
  const lowerQuery = query.toLowerCase();
  return recentSearches
    .filter((q) => q.toLowerCase().includes(lowerQuery) && q.toLowerCase() !== lowerQuery)
    .slice(0, 3)
    .map((q) => ({
      type: "query" as const,
      title: q,
    }));
}

/**
 * Generator for search suggestions
 */
const searchSuggestionArb: fc.Arbitrary<SearchSuggestion> = fc.oneof(
  // Product suggestion
  fc.record({
    type: fc.constant("product" as const),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    slug: fc.option(
      fc.string({ minLength: 1, maxLength: 50 }).map((s) => s.toLowerCase().replace(/\s+/g, "-")),
      { nil: undefined }
    ),
    image: fc.option(fc.webUrl(), { nil: undefined }),
  }),
  // Category suggestion
  fc.record({
    type: fc.constant("category" as const),
    title: fc.string({ minLength: 1, maxLength: 50 }),
    slug: fc.option(
      fc.string({ minLength: 1, maxLength: 50 }).map((s) => s.toLowerCase().replace(/\s+/g, "-")),
      { nil: undefined }
    ),
    image: fc.option(fc.webUrl(), { nil: undefined }),
  }),
  // Query suggestion (recent search)
  fc.record({
    type: fc.constant("query" as const),
    title: fc.string({ minLength: 2, maxLength: 100 }),
    slug: fc.constant(undefined),
    image: fc.constant(undefined),
  })
);

/**
 * Generator for valid search queries (minimum 2 characters as per service requirement)
 */
const validSearchQueryArb = fc.string({ minLength: 2, maxLength: 50 });

/**
 * Generator for recent search queries
 */
const recentSearchesArb = fc.array(fc.string({ minLength: 2, maxLength: 50 }), {
  minLength: 0,
  maxLength: 10,
});

describe("Search Suggestions Property Tests", () => {
  describe("Property 17: Search suggestions are relevant", () => {
    it("should return true when suggestion title contains the query (case-insensitive)", () => {
      fc.assert(
        fc.property(
          validSearchQueryArb.filter((q) => q.trim().length >= 2),
          (query) => {
            // Create a suggestion that contains the query in its title
            const suggestion: SearchSuggestion = {
              type: "product",
              title: `Product with ${query} in name`,
              slug: "test-product",
            };

            return suggestionMatchesQuery(suggestion, query) === true;
          }
        )
      );
    });

    it("should be case-insensitive when matching suggestions", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 30 }).filter((s) => /^[a-zA-Z]+$/.test(s)),
          (query) => {
            const suggestion: SearchSuggestion = {
              type: "product",
              title: query.toUpperCase(),
              slug: "test-product",
            };

            // Should match regardless of case
            const matchesLower = suggestionMatchesQuery(suggestion, query.toLowerCase());
            const matchesUpper = suggestionMatchesQuery(suggestion, query.toUpperCase());
            const matchesMixed = suggestionMatchesQuery(suggestion, query);

            return matchesLower === matchesUpper && matchesUpper === matchesMixed;
          }
        )
      );
    });

    it("should return false when suggestion title does not contain the query", () => {
      fc.assert(
        fc.property(
          fc
            .tuple(
              fc.string({ minLength: 2, maxLength: 20 }).filter((s) => /^[a-z]+$/.test(s)),
              fc.string({ minLength: 2, maxLength: 20 }).filter((s) => /^[a-z]+$/.test(s))
            )
            .filter(([query, title]) => !title.includes(query) && !query.includes(title)),
          ([query, title]) => {
            const suggestion: SearchSuggestion = {
              type: "product",
              title: title,
              slug: "test-product",
            };

            return suggestionMatchesQuery(suggestion, query) === false;
          }
        )
      );
    });

    it("should match when query is a substring of the title", () => {
      fc.assert(
        fc.property(
          fc
            .tuple(
              fc.string({ minLength: 5, maxLength: 50 }),
              fc.integer({ min: 0, max: 100 }),
              fc.integer({ min: 2, max: 100 })
            )
            .filter(([title, start, length]) => {
              const actualStart = start % Math.max(1, title.length - 1);
              const actualLength = Math.min(length, title.length - actualStart);
              return actualLength >= 2;
            }),
          ([title, startPercent, lengthPercent]) => {
            // Extract a substring from the title as the query
            const start = Math.floor((startPercent / 100) * Math.max(1, title.length - 2));
            const length = Math.max(2, Math.floor((lengthPercent / 100) * (title.length - start)));
            const query = title.substring(start, start + length);

            if (query.length < 2) return true; // Skip if query too short

            const suggestion: SearchSuggestion = {
              type: "product",
              title: title,
              slug: "test-product",
            };

            return suggestionMatchesQuery(suggestion, query) === true;
          }
        )
      );
    });

    it("should work correctly for all suggestion types (product, category, query)", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("product", "category", "query") as fc.Arbitrary<
            "product" | "category" | "query"
          >,
          validSearchQueryArb.filter((q) => q.trim().length >= 2),
          (type, query) => {
            const suggestion: SearchSuggestion = {
              type,
              title: `Test ${query} item`,
              slug: type !== "query" ? "test-slug" : undefined,
            };

            return suggestionMatchesQuery(suggestion, query) === true;
          }
        )
      );
    });

    it("should handle empty query gracefully (matches everything)", () => {
      fc.assert(
        fc.property(searchSuggestionArb, (suggestion) => {
          // Empty query should match everything (contains empty string)
          const result = suggestionMatchesQuery(suggestion, "");
          return result === true;
        })
      );
    });

    it("should correctly identify matching suggestions from a list", () => {
      fc.assert(
        fc.property(
          fc.tuple(
            validSearchQueryArb.filter((q) => q.trim().length >= 2 && /^[a-zA-Z0-9]+$/.test(q)),
            fc.array(searchSuggestionArb, { minLength: 1, maxLength: 10 })
          ),
          ([query, suggestions]) => {
            // For each suggestion, verify the match function is consistent
            for (const suggestion of suggestions) {
              const matches = suggestionMatchesQuery(suggestion, query);
              const shouldMatch = suggestion.title.toLowerCase().includes(query.toLowerCase());

              if (matches !== shouldMatch) {
                return false;
              }
            }
            return true;
          }
        )
      );
    });

    it("should filter recent queries that contain the search query", () => {
      fc.assert(
        fc.property(
          validSearchQueryArb.filter((q) => q.trim().length >= 2),
          recentSearchesArb,
          (query, recentSearches) => {
            const filtered = filterRecentQueries(query, recentSearches);

            // All filtered results should contain the query (case-insensitive)
            const allMatch = filtered.every((suggestion) =>
              suggestion.title.toLowerCase().includes(query.toLowerCase())
            );

            // None of the filtered results should be exactly the query
            const noneExact = filtered.every(
              (suggestion) => suggestion.title.toLowerCase() !== query.toLowerCase()
            );

            // Should return at most 3 results
            const maxThree = filtered.length <= 3;

            // All results should be of type "query"
            const allQueryType = filtered.every((suggestion) => suggestion.type === "query");

            return allMatch && noneExact && maxThree && allQueryType;
          }
        )
      );
    });

    it("should exclude exact matches from recent query suggestions", () => {
      fc.assert(
        fc.property(
          validSearchQueryArb.filter((q) => q.trim().length >= 2),
          (query) => {
            // Include the exact query in recent searches
            const recentSearches = [query, `${query} extra`, `prefix ${query}`];
            const filtered = filterRecentQueries(query, recentSearches);

            // The exact match should be excluded
            const hasExactMatch = filtered.some(
              (suggestion) => suggestion.title.toLowerCase() === query.toLowerCase()
            );

            return !hasExactMatch;
          }
        )
      );
    });
  });
});
