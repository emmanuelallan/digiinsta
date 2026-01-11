/**
 * Property-Based Tests for SEO Meta Generation
 *
 * Feature: sanity-migration
 * Property 8: SEO Meta Generation
 * Validates: Requirements 7.5, 9.2, 9.3, 9.5, 15.2
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  generateProductJsonLd,
  generateArticleJsonLd,
  generateOrganizationJsonLd,
  generateBundleJsonLd,
  generateCategoryJsonLd,
  generateBreadcrumbJsonLd,
  generateWebsiteJsonLd,
} from "../../lib/seo/jsonld";

// Constants from meta.ts (duplicated to avoid Sanity client import)
const SITE_NAME = "DigiInsta";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.digiinsta.store";
const DEFAULT_OG_IMAGE_PATH = "/images/og-default.png";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for valid slug strings
 */
const validSlugArb = fc
  .stringMatching(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
  .filter((s) => s.length >= 1 && s.length <= 100);

/**
 * Generator for valid URL paths
 */
const validPathArb = fc
  .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 0, maxLength: 5 })
  .map((segments) => "/" + segments.join("/"));

/**
 * Generator for non-empty strings
 */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 200 });

/**
 * Generator for product input
 */
const productInputArb = fc.record({
  title: nonEmptyStringArb,
  slug: validSlugArb,
  shortDescription: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  price: fc.option(fc.integer({ min: 100, max: 100000 })),
  compareAtPrice: fc.option(fc.integer({ min: 100, max: 100000 })),
  category: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
});

/**
 * Generator for article input
 */
const articleInputArb = fc.record({
  title: nonEmptyStringArb,
  slug: validSlugArb,
  excerpt: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  content: fc.option(fc.string({ minLength: 0, maxLength: 2000 })),
  author: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
  publishedAt: fc.option(
    fc.integer({ min: 1577836800000, max: 1924905600000 }).map((ts) => new Date(ts).toISOString())
  ),
  updatedAt: fc.option(
    fc.integer({ min: 1577836800000, max: 1924905600000 }).map((ts) => new Date(ts).toISOString())
  ),
  category: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
});

/**
 * Generator for bundle input
 */
const bundleInputArb = fc.record({
  title: nonEmptyStringArb,
  slug: validSlugArb,
  shortDescription: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  price: fc.option(fc.integer({ min: 100, max: 100000 })),
  products: fc.option(
    fc.array(
      fc.record({
        title: nonEmptyStringArb,
        slug: validSlugArb,
        price: fc.option(fc.integer({ min: 100, max: 50000 })),
      }),
      { minLength: 0, maxLength: 5 }
    )
  ),
});

/**
 * Generator for category input
 */
const categoryInputArb = fc.record({
  title: nonEmptyStringArb,
  slug: validSlugArb,
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  productCount: fc.option(fc.integer({ min: 0, max: 1000 })),
});

/**
 * Generator for breadcrumb items
 */
const breadcrumbItemsArb = fc.array(
  fc.record({
    name: nonEmptyStringArb,
    url: validPathArb,
  }),
  { minLength: 1, maxLength: 5 }
);

/**
 * Pure function to get canonical URL (duplicated from meta.ts to avoid Sanity client import)
 */
function getCanonicalUrl(path: string): string {
  const pathWithoutQuery = path.split("?")[0] ?? "";
  const cleanPath = pathWithoutQuery.split("#")[0] ?? "";
  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  const finalPath =
    normalizedPath.length > 1 && normalizedPath.endsWith("/")
      ? normalizedPath.slice(0, -1)
      : normalizedPath;
  return `${SITE_URL}${finalPath === "/" ? "" : finalPath}`;
}

/**
 * Pure function to get image URL (duplicated from meta.ts to avoid Sanity client import)
 */
function getImageUrl(image: string | null | undefined, defaultImage?: string | null): string {
  if (!image && !defaultImage) {
    return `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
  }

  const imageSource = image || defaultImage;

  if (typeof imageSource === "string") {
    if (imageSource.startsWith("http")) {
      return imageSource;
    }
    return `${SITE_URL}${imageSource.startsWith("/") ? "" : "/"}${imageSource}`;
  }

  return `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
}

describe("SEO Meta Generation Property Tests", () => {
  /**
   * Feature: sanity-migration
   * Property 8: SEO Meta Generation
   * Validates: Requirements 7.5, 9.2, 9.3, 9.5, 15.2
   */
  describe("Property 8: SEO Meta Generation", () => {
    describe("Meta title generation", () => {
      it("should generate non-empty meta title for products", () => {
        fc.assert(
          fc.property(productInputArb, (product) => {
            const jsonLd = generateProductJsonLd(product);

            // Property: name (title) should be non-empty
            expect(jsonLd.name).toBeDefined();
            expect(typeof jsonLd.name).toBe("string");
            expect((jsonLd.name as string).length).toBeGreaterThan(0);
          })
        );
      });

      it("should generate non-empty meta title for articles", () => {
        fc.assert(
          fc.property(articleInputArb, (article) => {
            const jsonLd = generateArticleJsonLd(article);

            // Property: headline (title) should be non-empty
            expect(jsonLd.headline).toBeDefined();
            expect(typeof jsonLd.headline).toBe("string");
            expect((jsonLd.headline as string).length).toBeGreaterThan(0);
          })
        );
      });

      it("should generate non-empty meta title for bundles", () => {
        fc.assert(
          fc.property(bundleInputArb, (bundle) => {
            const jsonLd = generateBundleJsonLd(bundle);

            // Property: name (title) should be non-empty
            expect(jsonLd.name).toBeDefined();
            expect(typeof jsonLd.name).toBe("string");
            expect((jsonLd.name as string).length).toBeGreaterThan(0);
          })
        );
      });

      it("should generate non-empty meta title for categories", () => {
        fc.assert(
          fc.property(categoryInputArb, (category) => {
            const jsonLd = generateCategoryJsonLd(category);

            // Property: name (title) should be non-empty
            expect(jsonLd.name).toBeDefined();
            expect(typeof jsonLd.name).toBe("string");
            expect((jsonLd.name as string).length).toBeGreaterThan(0);
          })
        );
      });
    });

    describe("Meta description generation", () => {
      it("should generate non-empty description for products (falls back to default)", () => {
        fc.assert(
          fc.property(productInputArb, (product) => {
            const jsonLd = generateProductJsonLd(product);

            // Property: description should be non-empty
            expect(jsonLd.description).toBeDefined();
            expect(typeof jsonLd.description).toBe("string");
            expect((jsonLd.description as string).length).toBeGreaterThan(0);
          })
        );
      });

      it("should use shortDescription when provided for products", () => {
        const productWithDesc = {
          title: "Test Product",
          slug: "test-product",
          shortDescription: "This is a custom description",
        };

        const jsonLd = generateProductJsonLd(productWithDesc);

        // Property: description should use shortDescription
        expect(jsonLd.description).toBe("This is a custom description");
      });

      it("should generate fallback description when shortDescription is null", () => {
        const productWithoutDesc = {
          title: "Test Product",
          slug: "test-product",
          shortDescription: null,
        };

        const jsonLd = generateProductJsonLd(productWithoutDesc);

        // Property: description should fall back to generated text
        expect(jsonLd.description).toContain("Test Product");
        expect(jsonLd.description).toContain(SITE_NAME);
      });

      it("should generate non-empty description for articles (falls back to default)", () => {
        fc.assert(
          fc.property(articleInputArb, (article) => {
            const jsonLd = generateArticleJsonLd(article);

            // Property: description should be non-empty
            expect(jsonLd.description).toBeDefined();
            expect(typeof jsonLd.description).toBe("string");
            expect((jsonLd.description as string).length).toBeGreaterThan(0);
          })
        );
      });
    });

    describe("JSON-LD required fields", () => {
      it("should include @context and @type for products", () => {
        fc.assert(
          fc.property(productInputArb, (product) => {
            const jsonLd = generateProductJsonLd(product);

            // Property: @context should be schema.org
            expect(jsonLd["@context"]).toBe("https://schema.org");

            // Property: @type should be Product
            expect(jsonLd["@type"]).toBe("Product");
          })
        );
      });

      it("should include @context and @type for articles", () => {
        fc.assert(
          fc.property(articleInputArb, (article) => {
            const jsonLd = generateArticleJsonLd(article);

            // Property: @context should be schema.org
            expect(jsonLd["@context"]).toBe("https://schema.org");

            // Property: @type should be Article
            expect(jsonLd["@type"]).toBe("Article");
          })
        );
      });

      it("should include @context and @type for organization", () => {
        const jsonLd = generateOrganizationJsonLd();

        // Property: @context should be schema.org
        expect(jsonLd["@context"]).toBe("https://schema.org");

        // Property: @type should be Organization
        expect(jsonLd["@type"]).toBe("Organization");
      });

      it("should include @context and @type for website", () => {
        const jsonLd = generateWebsiteJsonLd();

        // Property: @context should be schema.org
        expect(jsonLd["@context"]).toBe("https://schema.org");

        // Property: @type should be WebSite
        expect(jsonLd["@type"]).toBe("WebSite");
      });

      it("should include @context and @type for breadcrumbs", () => {
        fc.assert(
          fc.property(breadcrumbItemsArb, (items) => {
            const jsonLd = generateBreadcrumbJsonLd(items);

            // Property: @context should be schema.org
            expect(jsonLd["@context"]).toBe("https://schema.org");

            // Property: @type should be BreadcrumbList
            expect(jsonLd["@type"]).toBe("BreadcrumbList");
          })
        );
      });
    });

    describe("URL generation", () => {
      it("should generate valid product URLs", () => {
        fc.assert(
          fc.property(productInputArb, (product) => {
            const jsonLd = generateProductJsonLd(product);

            // Property: url should be valid and contain slug
            expect(jsonLd.url).toBeDefined();
            expect(typeof jsonLd.url).toBe("string");
            expect(jsonLd.url).toContain(SITE_URL);
            expect(jsonLd.url).toContain(`/products/${product.slug}`);
          })
        );
      });

      it("should generate valid article URLs", () => {
        fc.assert(
          fc.property(articleInputArb, (article) => {
            const jsonLd = generateArticleJsonLd(article);

            // Property: url should be valid and contain slug
            expect(jsonLd.url).toBeDefined();
            expect(typeof jsonLd.url).toBe("string");
            expect(jsonLd.url).toContain(SITE_URL);
            expect(jsonLd.url).toContain(`/blog/${article.slug}`);
          })
        );
      });

      it("should generate valid bundle URLs", () => {
        fc.assert(
          fc.property(bundleInputArb, (bundle) => {
            const jsonLd = generateBundleJsonLd(bundle);

            // Property: url should be valid and contain slug
            expect(jsonLd.url).toBeDefined();
            expect(typeof jsonLd.url).toBe("string");
            expect(jsonLd.url).toContain(SITE_URL);
            expect(jsonLd.url).toContain(`/bundles/${bundle.slug}`);
          })
        );
      });

      it("should generate valid category URLs", () => {
        fc.assert(
          fc.property(categoryInputArb, (category) => {
            const jsonLd = generateCategoryJsonLd(category);

            // Property: url should be valid and contain slug
            expect(jsonLd.url).toBeDefined();
            expect(typeof jsonLd.url).toBe("string");
            expect(jsonLd.url).toContain(SITE_URL);
            expect(jsonLd.url).toContain(`/categories/${category.slug}`);
          })
        );
      });
    });

    describe("Canonical URL generation", () => {
      it("should generate absolute URLs with SITE_URL prefix", () => {
        fc.assert(
          fc.property(validPathArb, (path) => {
            const canonicalUrl = getCanonicalUrl(path);

            // Property: URL should start with SITE_URL
            expect(canonicalUrl.startsWith(SITE_URL)).toBe(true);
          })
        );
      });

      it("should remove query parameters from URLs", () => {
        fc.assert(
          fc.property(
            validPathArb,
            fc.string({ minLength: 1, maxLength: 50 }),
            (path, queryParam) => {
              const pathWithQuery = `${path}?param=${queryParam}`;
              const canonicalUrl = getCanonicalUrl(pathWithQuery);

              // Property: URL should not contain query parameters
              expect(canonicalUrl).not.toContain("?");
            }
          )
        );
      });

      it("should remove fragments from URLs", () => {
        fc.assert(
          fc.property(
            validPathArb,
            fc.string({ minLength: 1, maxLength: 50 }),
            (path, fragment) => {
              const pathWithFragment = `${path}#${fragment}`;
              const canonicalUrl = getCanonicalUrl(pathWithFragment);

              // Property: URL should not contain fragments
              expect(canonicalUrl).not.toContain("#");
            }
          )
        );
      });

      it("should handle root path correctly", () => {
        const canonicalUrl = getCanonicalUrl("/");

        // Property: Root path should return SITE_URL without trailing slash
        expect(canonicalUrl).toBe(SITE_URL);
      });
    });

    describe("Image URL generation", () => {
      it("should return default OG image when no image provided", () => {
        const imageUrl = getImageUrl(null, null);

        // Property: Should return default OG image
        expect(imageUrl).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`);
      });

      it("should return string URL as-is when it starts with http", () => {
        const testUrl = "https://example.com/image.jpg";
        const imageUrl = getImageUrl(testUrl, null);

        // Property: Should return the URL unchanged
        expect(imageUrl).toBe(testUrl);
      });

      it("should prepend SITE_URL to relative paths", () => {
        const relativePath = "/images/test.jpg";
        const imageUrl = getImageUrl(relativePath, null);

        // Property: Should prepend SITE_URL
        expect(imageUrl).toBe(`${SITE_URL}${relativePath}`);
      });
    });

    describe("Offer schema for products", () => {
      it("should include valid offer schema for products", () => {
        fc.assert(
          fc.property(productInputArb, (product) => {
            const jsonLd = generateProductJsonLd(product);

            // Property: offers should exist
            expect(jsonLd.offers).toBeDefined();

            const offers = jsonLd.offers as Record<string, unknown>;

            // Property: offers should have required fields
            expect(offers["@type"]).toBe("Offer");
            expect(offers.priceCurrency).toBe("USD");
            expect(offers.availability).toContain("schema.org");
          })
        );
      });

      it("should format price correctly (cents to dollars)", () => {
        const product = {
          title: "Test Product",
          slug: "test-product",
          price: 1999, // $19.99 in cents
        };

        const jsonLd = generateProductJsonLd(product);
        const offers = jsonLd.offers as Record<string, unknown>;

        // Property: price should be formatted as dollars
        expect(offers.price).toBe("19.99");
      });
    });

    describe("Brand information", () => {
      it("should include brand information for products", () => {
        fc.assert(
          fc.property(productInputArb, (product) => {
            const jsonLd = generateProductJsonLd(product);

            // Property: brand should exist
            expect(jsonLd.brand).toBeDefined();

            const brand = jsonLd.brand as Record<string, unknown>;

            // Property: brand should have required fields
            expect(brand["@type"]).toBe("Brand");
            expect(brand.name).toBeDefined();
            expect(typeof brand.name).toBe("string");
            expect((brand.name as string).length).toBeGreaterThan(0);
          })
        );
      });
    });

    describe("Publisher information for articles", () => {
      it("should include publisher information for articles", () => {
        fc.assert(
          fc.property(articleInputArb, (article) => {
            const jsonLd = generateArticleJsonLd(article);

            // Property: publisher should exist
            expect(jsonLd.publisher).toBeDefined();

            const publisher = jsonLd.publisher as Record<string, unknown>;

            // Property: publisher should have required fields
            expect(publisher["@type"]).toBe("Organization");
            expect(publisher.name).toBe(SITE_NAME);
            expect(publisher.logo).toBeDefined();
          })
        );
      });
    });

    describe("Breadcrumb list items", () => {
      it("should generate correct number of breadcrumb items", () => {
        fc.assert(
          fc.property(breadcrumbItemsArb, (items) => {
            const jsonLd = generateBreadcrumbJsonLd(items);

            // Property: itemListElement should have same length as input
            expect(jsonLd.itemListElement).toBeDefined();
            expect(Array.isArray(jsonLd.itemListElement)).toBe(true);
            expect((jsonLd.itemListElement as unknown[]).length).toBe(items.length);
          })
        );
      });

      it("should assign correct positions to breadcrumb items", () => {
        fc.assert(
          fc.property(breadcrumbItemsArb, (items) => {
            const jsonLd = generateBreadcrumbJsonLd(items);
            const listItems = jsonLd.itemListElement as Array<{
              "@type": string;
              position: number;
              name: string;
              item: string;
            }>;

            // Property: positions should be sequential starting from 1
            listItems.forEach((item, index) => {
              expect(item.position).toBe(index + 1);
              expect(item["@type"]).toBe("ListItem");
            });
          })
        );
      });
    });
  });
});
