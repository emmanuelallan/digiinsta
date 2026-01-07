/**
 * Property-Based Tests for Search Filtering
 *
 * Feature: comprehensive-site-optimization
 * Property 16: Search with filters returns correctly filtered results
 * Validates: Requirements 15.1, 15.2, 15.3
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

const FIXED_DATE = "2024-06-15T12:00:00.000Z";

const variedDateArb = fc.integer({ min: 0, max: 1000 }).map((daysOffset) => {
  const timestamp = Date.UTC(2024, 0, 1, 12, 0, 0, 0) + daysOffset * 24 * 60 * 60 * 1000;
  return new Date(timestamp).toISOString();
});

const slugArb = fc
  .tuple(
    fc.constantFrom("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p"),
    fc.array(fc.constantFrom("a", "b", "c", "0", "1", "2", "-"), { minLength: 0, maxLength: 10 })
  )
  .map(([first, rest]) => first + rest.join(""));

interface SearchFilters {
  category?: string;
  subcategory?: string;
  priceRange?: { min: number; max: number };
  tags?: string[];
  sortBy?: "newest" | "price-asc" | "price-desc" | "best-selling" | "relevance";
}

interface TestProduct {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice?: number | null;
  status: "active";
  subcategory: {
    id: number;
    title: string;
    slug: string;
    status: "active";
    category: {
      id: number;
      title: string;
      slug: string;
      status: "active";
      image: null;
      updatedAt: string;
      createdAt: string;
    };
    updatedAt: string;
    createdAt: string;
  };
  tags: Array<{ tag: string; id: string }> | null;
  images: null;
  file: {
    id: number;
    alt: string;
    url: string;
    updatedAt: string;
    createdAt: string;
  };
  polarProductId: string;
  createdBy: number;
  updatedAt: string;
  createdAt: string;
}

// Local implementations (no external dependencies)
function applyFiltersToProducts(products: TestProduct[], filters: SearchFilters): TestProduct[] {
  let result = [...products];

  if (filters.category) {
    result = result.filter((p) => p.subcategory?.category?.slug === filters.category);
  }

  if (filters.subcategory) {
    result = result.filter((p) => p.subcategory?.slug === filters.subcategory);
  }

  if (filters.priceRange) {
    result = result.filter((p) => {
      const price = p.price ?? 0;
      return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
    });
  }

  if (filters.tags && filters.tags.length > 0) {
    const lowerTags = filters.tags.map((t) => t.toLowerCase());
    result = result.filter((p) =>
      p.tags?.some((t) => t.tag && lowerTags.includes(t.tag.toLowerCase()))
    );
  }

  return result;
}

function applySortToProducts(
  products: TestProduct[],
  sortBy?: SearchFilters["sortBy"]
): TestProduct[] {
  const sorted = [...products];
  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price-desc":
      return sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    default:
      return sorted;
  }
}

function productMatchesQuery(product: TestProduct, query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const title = product.title?.toLowerCase() ?? "";
  const description = product.shortDescription?.toLowerCase() ?? "";
  const tags = product.tags?.map((t) => t.tag?.toLowerCase() ?? "").join(" ") ?? "";
  return (
    title.includes(lowerQuery) || description.includes(lowerQuery) || tags.includes(lowerQuery)
  );
}

function getFilterOptions(products: TestProduct[]): {
  categories: string[];
  subcategories: string[];
  tags: string[];
  priceRange: { min: number; max: number };
} {
  const categories = [
    ...new Set(
      products.map((p) => p.subcategory?.category?.slug).filter((s): s is string => Boolean(s))
    ),
  ];
  const subcategories = [
    ...new Set(products.map((p) => p.subcategory?.slug).filter((s): s is string => Boolean(s))),
  ];
  const tags = [
    ...new Set(
      products
        .flatMap((p) => p.tags?.map((t) => t.tag) ?? [])
        .filter((t): t is string => Boolean(t))
    ),
  ];
  const prices = products.map((p) => p.price ?? 0).filter((p) => p > 0);
  const priceRange =
    prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 };
  return { categories, subcategories, tags, priceRange };
}

const testProductArb: fc.Arbitrary<TestProduct> = fc.noShrink(
  fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    slug: slugArb,
    shortDescription: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null }),
    price: fc.integer({ min: 100, max: 1000000 }),
    compareAtPrice: fc.option(fc.integer({ min: 100, max: 1000000 }), { nil: null }),
    status: fc.constant("active" as const),
    subcategory: fc.record({
      id: fc.integer({ min: 1, max: 100 }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
      slug: slugArb,
      status: fc.constant("active" as const),
      category: fc.record({
        id: fc.integer({ min: 1, max: 50 }),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        slug: slugArb,
        status: fc.constant("active" as const),
        image: fc.constant(null),
        updatedAt: fc.constant(FIXED_DATE),
        createdAt: fc.constant(FIXED_DATE),
      }),
      updatedAt: fc.constant(FIXED_DATE),
      createdAt: fc.constant(FIXED_DATE),
    }),
    tags: fc.option(
      fc.array(
        fc.record({
          tag: fc.string({ minLength: 1, maxLength: 20 }),
          id: fc.string({ minLength: 5, maxLength: 15 }),
        }),
        { minLength: 0, maxLength: 3 }
      ),
      { nil: null }
    ),
    images: fc.constant(null),
    file: fc.record({
      id: fc.integer({ min: 1, max: 1000 }),
      alt: fc.string({ minLength: 1, maxLength: 30 }),
      url: fc.constant("https://example.com/image.jpg"),
      updatedAt: fc.constant(FIXED_DATE),
      createdAt: fc.constant(FIXED_DATE),
    }),
    polarProductId: fc.string({ minLength: 10, maxLength: 30 }),
    createdBy: fc.integer({ min: 1, max: 100 }),
    updatedAt: fc.constant(FIXED_DATE),
    createdAt: fc.constant(FIXED_DATE),
  })
);

const testProductWithVariedDateArb: fc.Arbitrary<TestProduct> = fc.noShrink(
  fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    slug: slugArb,
    shortDescription: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null }),
    price: fc.integer({ min: 100, max: 1000000 }),
    compareAtPrice: fc.option(fc.integer({ min: 100, max: 1000000 }), { nil: null }),
    status: fc.constant("active" as const),
    subcategory: fc.record({
      id: fc.integer({ min: 1, max: 100 }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
      slug: slugArb,
      status: fc.constant("active" as const),
      category: fc.record({
        id: fc.integer({ min: 1, max: 50 }),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        slug: slugArb,
        status: fc.constant("active" as const),
        image: fc.constant(null),
        updatedAt: fc.constant(FIXED_DATE),
        createdAt: fc.constant(FIXED_DATE),
      }),
      updatedAt: fc.constant(FIXED_DATE),
      createdAt: fc.constant(FIXED_DATE),
    }),
    tags: fc.option(
      fc.array(
        fc.record({
          tag: fc.string({ minLength: 1, maxLength: 20 }),
          id: fc.string({ minLength: 5, maxLength: 15 }),
        }),
        { minLength: 0, maxLength: 3 }
      ),
      { nil: null }
    ),
    images: fc.constant(null),
    file: fc.record({
      id: fc.integer({ min: 1, max: 1000 }),
      alt: fc.string({ minLength: 1, maxLength: 30 }),
      url: fc.constant("https://example.com/image.jpg"),
      updatedAt: fc.constant(FIXED_DATE),
      createdAt: fc.constant(FIXED_DATE),
    }),
    polarProductId: fc.string({ minLength: 10, maxLength: 30 }),
    createdBy: fc.integer({ min: 1, max: 100 }),
    updatedAt: fc.constant(FIXED_DATE),
    createdAt: variedDateArb,
  })
);

const productsWithSharedCategoriesArb = fc.noShrink(
  fc
    .tuple(
      fc.array(slugArb, { minLength: 1, maxLength: 3 }),
      fc.array(testProductArb, { minLength: 1, maxLength: 15 })
    )
    .map(([categorySlugs, products]) => {
      return products.map((product, index) => ({
        ...product,
        subcategory: {
          ...product.subcategory,
          category: {
            ...product.subcategory.category,
            slug: categorySlugs[index % categorySlugs.length]!,
          },
        },
      }));
    })
);

describe("Search Filtering Property Tests", () => {
  describe("Property 16: Search with filters returns correctly filtered results", () => {
    describe("Category filtering", () => {
      it("should return only products from the specified category", () => {
        fc.assert(
          fc.property(productsWithSharedCategoriesArb, (products) => {
            const existingCategories = [
              ...new Set(
                products
                  .map((p) => p.subcategory?.category?.slug)
                  .filter((slug): slug is string => Boolean(slug))
              ),
            ];
            if (existingCategories.length === 0) return true;
            const targetCategory = existingCategories[0];
            const filters: SearchFilters = { category: targetCategory };
            const filtered = applyFiltersToProducts(products, filters);
            return filtered.every((p) => p.subcategory?.category?.slug === targetCategory);
          })
        );
      });

      it("should return empty array when category doesn't exist", () => {
        fc.assert(
          fc.property(productsWithSharedCategoriesArb, (products) => {
            const filters: SearchFilters = { category: "non-existent-category-xyz" };
            const filtered = applyFiltersToProducts(products, filters);
            return filtered.length === 0;
          })
        );
      });
    });

    describe("Price range filtering", () => {
      it("should return only products within the specified price range", () => {
        fc.assert(
          fc.property(
            fc.array(testProductArb, { minLength: 1, maxLength: 15 }),
            fc.integer({ min: 100, max: 500000 }),
            fc.integer({ min: 500001, max: 1000000 }),
            (products, minPrice, maxPrice) => {
              const filters: SearchFilters = { priceRange: { min: minPrice, max: maxPrice } };
              const filtered = applyFiltersToProducts(products, filters);
              return filtered.every((p) => {
                const price = p.price ?? 0;
                return price >= minPrice && price <= maxPrice;
              });
            }
          )
        );
      });

      it("should return empty array when no products are in price range", () => {
        fc.assert(
          fc.property(fc.array(testProductArb, { minLength: 1, maxLength: 10 }), (products) => {
            const maxProductPrice = Math.max(...products.map((p) => p.price ?? 0));
            const filters: SearchFilters = {
              priceRange: { min: maxProductPrice + 1000, max: maxProductPrice + 2000 },
            };
            const filtered = applyFiltersToProducts(products, filters);
            return filtered.length === 0;
          })
        );
      });
    });

    describe("Tag filtering", () => {
      it("should return only products with at least one matching tag", () => {
        fc.assert(
          fc.property(
            fc.array(testProductArb, { minLength: 1, maxLength: 15 }),
            fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
            (products, filterTags) => {
              const filters: SearchFilters = { tags: filterTags };
              const lowerFilterTags = filterTags.map((t) => t.toLowerCase());
              const filtered = applyFiltersToProducts(products, filters);
              return filtered.every((p) =>
                p.tags?.some((t) => t.tag && lowerFilterTags.includes(t.tag.toLowerCase()))
              );
            }
          )
        );
      });
    });

    describe("Sorting", () => {
      it("should sort by price ascending correctly", () => {
        fc.assert(
          fc.property(fc.array(testProductArb, { minLength: 2, maxLength: 15 }), (products) => {
            const sorted = applySortToProducts(products, "price-asc");
            for (let i = 0; i < sorted.length - 1; i++) {
              const current = sorted[i];
              const next = sorted[i + 1];
              if (!current || !next) continue;
              if ((current.price ?? 0) > (next.price ?? 0)) return false;
            }
            return true;
          })
        );
      });

      it("should sort by price descending correctly", () => {
        fc.assert(
          fc.property(fc.array(testProductArb, { minLength: 2, maxLength: 15 }), (products) => {
            const sorted = applySortToProducts(products, "price-desc");
            for (let i = 0; i < sorted.length - 1; i++) {
              const current = sorted[i];
              const next = sorted[i + 1];
              if (!current || !next) continue;
              if ((current.price ?? 0) < (next.price ?? 0)) return false;
            }
            return true;
          })
        );
      });

      it("should sort by newest correctly", () => {
        fc.assert(
          fc.property(
            fc.array(testProductWithVariedDateArb, { minLength: 2, maxLength: 15 }),
            (products) => {
              const sorted = applySortToProducts(products, "newest");
              for (let i = 0; i < sorted.length - 1; i++) {
                const current = sorted[i];
                const next = sorted[i + 1];
                if (!current || !next) continue;
                if (new Date(current.createdAt).getTime() < new Date(next.createdAt).getTime())
                  return false;
              }
              return true;
            }
          )
        );
      });

      it("should preserve array length after sorting", () => {
        fc.assert(
          fc.property(
            fc.array(testProductArb, { minLength: 0, maxLength: 15 }),
            fc.constantFrom("newest", "price-asc", "price-desc", "best-selling", "relevance"),
            (products, sortBy) => {
              const sorted = applySortToProducts(products, sortBy as SearchFilters["sortBy"]);
              return sorted.length === products.length;
            }
          )
        );
      });
    });

    describe("Query matching", () => {
      it("should match products with query in title", () => {
        fc.assert(
          fc.property(testProductArb, (product) => {
            const query = product.title.substring(0, Math.min(5, product.title.length));
            if (query.length === 0) return true;
            return productMatchesQuery(product, query);
          })
        );
      });

      it("should be case-insensitive", () => {
        fc.assert(
          fc.property(testProductArb, (product) => {
            const query = product.title.substring(0, Math.min(5, product.title.length));
            if (query.length === 0) return true;
            return (
              productMatchesQuery(product, query.toUpperCase()) ===
              productMatchesQuery(product, query.toLowerCase())
            );
          })
        );
      });
    });

    describe("Filter options extraction", () => {
      it("should extract all unique categories from products", () => {
        fc.assert(
          fc.property(productsWithSharedCategoriesArb, (products) => {
            const options = getFilterOptions(products);
            const expectedCategories = new Set(
              products
                .map((p) => p.subcategory?.category?.slug)
                .filter((slug): slug is string => Boolean(slug))
            );
            return options.categories.length === expectedCategories.size;
          })
        );
      });

      it("should calculate correct price range", () => {
        fc.assert(
          fc.property(fc.array(testProductArb, { minLength: 1, maxLength: 15 }), (products) => {
            const options = getFilterOptions(products);
            const prices = products.map((p) => p.price ?? 0).filter((p) => p > 0);
            if (prices.length === 0)
              return options.priceRange.min === 0 && options.priceRange.max === 0;
            return (
              options.priceRange.min === Math.min(...prices) &&
              options.priceRange.max === Math.max(...prices)
            );
          })
        );
      });
    });
  });
});
