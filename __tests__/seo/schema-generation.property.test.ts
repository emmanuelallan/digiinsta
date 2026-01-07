/**
 * Property-Based Tests for SEO Schema Generation
 *
 * Feature: comprehensive-site-optimization
 * Tests Properties 3, 4, 5, 6 for structured data generation
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getEnhancedProductSchema,
  getProductGroupSchema,
  getArticleSchema,
  type ProductReview,
  type EnhancedProductInput,
  type EnhancedBundleInput,
  type BlogPostInput,
  SITE_URL,
  SITE_NAME,
  calculateReadingTime,
  formatDurationISO8601,
  countWords,
} from "../../lib/seo";

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
 * Generator for valid ISO date strings using timestamps
 */
const isoDateArb = fc
  .integer({ min: 1577836800000, max: 1924905600000 }) // 2020-01-01 to 2030-12-31
  .map((ts) => new Date(ts).toISOString());

/**
 * Generator for product reviews
 */
const reviewArb: fc.Arbitrary<ProductReview> = fc.record({
  author: fc.string({ minLength: 1, maxLength: 100 }),
  reviewBody: fc.string({ minLength: 1, maxLength: 500 }),
  reviewRating: fc.integer({ min: 1, max: 5 }),
  datePublished: fc.option(isoDateArb),
});

/**
 * Generator for non-empty review arrays
 */
const reviewsArb = fc.array(reviewArb, { minLength: 1, maxLength: 10 });

/**
 * Generator for product with reviews
 */
const productWithReviewsArb: fc.Arbitrary<EnhancedProductInput> = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  slug: validSlugArb,
  shortDescription: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  price: fc.integer({ min: 100, max: 100000 }),
  compareAtPrice: fc.option(fc.integer({ min: 100, max: 100000 })),
  saleEndDate: fc.option(isoDateArb),
  images: fc.option(
    fc.array(
      fc.record({
        image: fc.option(fc.record({ url: fc.option(fc.webUrl()) })),
      }),
      { minLength: 0, maxLength: 5 }
    )
  ),
  subcategory: fc.option(
    fc.record({
      title: fc.string({ minLength: 1, maxLength: 100 }),
      category: fc.option(fc.record({ title: fc.string({ minLength: 1, maxLength: 100 }) })),
    })
  ),
  reviews: reviewsArb,
});

/**
 * Generator for sale products (compareAtPrice > price with saleEndDate)
 */
const saleProductArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 200 }),
    validSlugArb,
    fc.option(fc.string({ minLength: 1, maxLength: 500 })),
    fc.integer({ min: 100, max: 50000 }),
    fc.integer({ min: 100, max: 50000 }),
    isoDateArb
  )
  .map(([title, slug, shortDescription, price, extraPrice, saleEndDate]) => ({
    title,
    slug,
    shortDescription,
    price,
    compareAtPrice: price + extraPrice, // Ensure compareAtPrice > price
    saleEndDate,
  }));

/**
 * Generator for bundle products
 */
const bundleProductArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  slug: validSlugArb,
  price: fc.oneof(fc.constant(undefined), fc.integer({ min: 100, max: 50000 })),
});

/**
 * Generator for bundles with products
 */
const bundleWithProductsArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  slug: validSlugArb,
  shortDescription: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  price: fc.integer({ min: 100, max: 100000 }),
  compareAtPrice: fc.option(fc.integer({ min: 100, max: 100000 })),
  heroImage: fc.option(fc.record({ url: fc.option(fc.webUrl()) })),
  products: fc.array(bundleProductArb, { minLength: 1, maxLength: 10 }),
});

describe("SEO Schema Generation Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 3: Product schema includes valid review data when available
   * Validates: Requirements 6.1, 6.2
   */
  describe("Property 3: Product schema includes valid review data when available", () => {
    it("should include AggregateRating with valid values when reviews exist", () => {
      fc.assert(
        fc.property(productWithReviewsArb, (product) => {
          const schema = getEnhancedProductSchema(product);

          // Property: Schema should have aggregateRating when reviews exist
          expect(schema.aggregateRating).toBeDefined();

          const aggRating = schema.aggregateRating as {
            "@type": string;
            ratingValue: number;
            reviewCount: number;
            bestRating: number;
            worstRating: number;
          };

          // Property: AggregateRating type should be correct
          expect(aggRating["@type"]).toBe("AggregateRating");

          // Property: ratingValue should be between 1 and 5
          expect(aggRating.ratingValue).toBeGreaterThanOrEqual(1);
          expect(aggRating.ratingValue).toBeLessThanOrEqual(5);

          // Property: reviewCount should match number of reviews
          expect(aggRating.reviewCount).toBe(product.reviews!.length);

          // Property: bestRating should be 5
          expect(aggRating.bestRating).toBe(5);

          // Property: worstRating should be 1
          expect(aggRating.worstRating).toBe(1);
        })
      );
    });

    it("should include Review objects with required fields", () => {
      fc.assert(
        fc.property(productWithReviewsArb, (product) => {
          const schema = getEnhancedProductSchema(product);

          // Property: Schema should have review array when reviews exist
          expect(schema.review).toBeDefined();
          expect(Array.isArray(schema.review)).toBe(true);

          const reviews = schema.review as Array<{
            "@type": string;
            author: { "@type": string; name: string };
            reviewBody: string;
            reviewRating: {
              "@type": string;
              ratingValue: number;
              bestRating: number;
              worstRating: number;
            };
          }>;

          // Property: Number of reviews should match input
          expect(reviews.length).toBe(product.reviews!.length);

          // Property: Each review should have required fields
          reviews.forEach((review, index) => {
            const inputReview = product.reviews?.[index];
            if (inputReview) {
              expect(review["@type"]).toBe("Review");
              expect(review.author["@type"]).toBe("Person");
              expect(review.author.name).toBe(inputReview.author);
              expect(review.reviewBody).toBe(inputReview.reviewBody);
              expect(review.reviewRating["@type"]).toBe("Rating");
              expect(review.reviewRating.ratingValue).toBe(inputReview.reviewRating);
              expect(review.reviewRating.bestRating).toBe(5);
              expect(review.reviewRating.worstRating).toBe(1);
            }
          });
        })
      );
    });

    it("should calculate average rating correctly", () => {
      fc.assert(
        fc.property(productWithReviewsArb, (product) => {
          const schema = getEnhancedProductSchema(product);
          const aggRating = schema.aggregateRating as { ratingValue: number };

          // Calculate expected average
          const totalRating = product.reviews!.reduce((sum, r) => sum + r.reviewRating, 0);
          const expectedAvg = Number((totalRating / product.reviews!.length).toFixed(1));

          // Property: Calculated average should match
          expect(aggRating.ratingValue).toBe(expectedAvg);
        })
      );
    });

    it("should not include aggregateRating when no reviews exist", () => {
      const productWithoutReviews: EnhancedProductInput = {
        title: "Test Product",
        slug: "test-product",
        price: 999,
        reviews: null,
      };

      const schema = getEnhancedProductSchema(productWithoutReviews);

      // Property: No aggregateRating when no reviews
      expect(schema.aggregateRating).toBeUndefined();
      expect(schema.review).toBeUndefined();
    });

    it("should not include aggregateRating when reviews array is empty", () => {
      const productWithEmptyReviews: EnhancedProductInput = {
        title: "Test Product",
        slug: "test-product",
        price: 999,
        reviews: [],
      };

      const schema = getEnhancedProductSchema(productWithEmptyReviews);

      // Property: No aggregateRating when reviews array is empty
      expect(schema.aggregateRating).toBeUndefined();
      expect(schema.review).toBeUndefined();
    });
  });
});

describe("Property 4: Sale items include priceValidUntil in Offer schema", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 4: Sale items include priceValidUntil in Offer schema
   * Validates: Requirements 6.3
   */
  it("should include priceValidUntil when product is on sale with end date", () => {
    fc.assert(
      fc.property(saleProductArb, (product) => {
        const schema = getEnhancedProductSchema(product);

        // Property: Offer schema should exist
        expect(schema.offers).toBeDefined();

        const offer = schema.offers as {
          "@type": string;
          price: string;
          priceCurrency: string;
          priceValidUntil?: string;
        };

        // Property: Offer type should be correct
        expect(offer["@type"]).toBe("Offer");

        // Property: priceValidUntil should be present for sale items with end date
        expect(offer.priceValidUntil).toBeDefined();
        expect(offer.priceValidUntil).toBe(product.saleEndDate);
      })
    );
  });

  it("should NOT include priceValidUntil when product is not on sale", () => {
    const regularProduct: EnhancedProductInput = {
      title: "Regular Product",
      slug: "regular-product",
      price: 999,
      compareAtPrice: null, // No sale
      saleEndDate: "2025-12-31T00:00:00.000Z",
    };

    const schema = getEnhancedProductSchema(regularProduct);
    const offer = schema.offers as { priceValidUntil?: string };

    // Property: No priceValidUntil when not on sale
    expect(offer.priceValidUntil).toBeUndefined();
  });

  it("should NOT include priceValidUntil when sale has no end date", () => {
    const saleWithoutEndDate: EnhancedProductInput = {
      title: "Sale Product",
      slug: "sale-product",
      price: 799,
      compareAtPrice: 999, // On sale
      saleEndDate: null, // No end date
    };

    const schema = getEnhancedProductSchema(saleWithoutEndDate);
    const offer = schema.offers as { priceValidUntil?: string };

    // Property: No priceValidUntil when no end date
    expect(offer.priceValidUntil).toBeUndefined();
  });

  it("should format priceValidUntil as ISO 8601 date", () => {
    fc.assert(
      fc.property(saleProductArb, (product) => {
        const schema = getEnhancedProductSchema(product);
        const offer = schema.offers as { priceValidUntil?: string };

        if (offer.priceValidUntil) {
          // Property: priceValidUntil should be valid ISO 8601 date
          const date = new Date(offer.priceValidUntil);
          expect(date.toISOString()).toBe(offer.priceValidUntil);
        }
      })
    );
  });
});

describe("Property 5: Bundle schema includes all product references", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 5: Bundle schema includes all product references
   * Validates: Requirements 6.4
   */
  it("should include exactly N isRelatedTo product references for N products", () => {
    fc.assert(
      fc.property(bundleWithProductsArb, (bundle) => {
        const schema = getProductGroupSchema(bundle as EnhancedBundleInput);

        // Property: Schema should be ProductGroup type
        expect(schema["@type"]).toBe("ProductGroup");

        // Property: isRelatedTo should exist when products exist
        expect(schema.isRelatedTo).toBeDefined();
        expect(Array.isArray(schema.isRelatedTo)).toBe(true);

        const relatedProducts = schema.isRelatedTo as Array<{
          "@type": string;
          name: string;
          url: string;
        }>;

        // Property: Number of related products should match input
        expect(relatedProducts.length).toBe(bundle.products.length);
      })
    );
  });

  it("should include valid URLs for all product references", () => {
    fc.assert(
      fc.property(bundleWithProductsArb, (bundle) => {
        const schema = getProductGroupSchema(bundle as EnhancedBundleInput);
        const relatedProducts = schema.isRelatedTo as Array<{
          "@type": string;
          name: string;
          url: string;
        }>;

        // Property: Each product reference should have valid URL
        relatedProducts.forEach((product, index) => {
          const bundleProduct = bundle.products[index];
          if (bundleProduct) {
            const expectedUrl = `${SITE_URL}/products/${bundleProduct.slug}`;
            expect(product.url).toBe(expectedUrl);
            expect(product["@type"]).toBe("Product");
            expect(product.name).toBe(bundleProduct.title);
          }
        });
      })
    );
  });

  it("should include hasVariant with all products", () => {
    fc.assert(
      fc.property(bundleWithProductsArb, (bundle) => {
        const schema = getProductGroupSchema(bundle as EnhancedBundleInput);

        // Property: hasVariant should contain all products
        expect(schema.hasVariant).toBeDefined();
        expect(Array.isArray(schema.hasVariant)).toBe(true);

        const variants = schema.hasVariant as Array<{ "@type": string; name: string }>;
        expect(variants.length).toBe(bundle.products.length);
      })
    );
  });

  it("should NOT include isRelatedTo when bundle has no products", () => {
    const emptyBundle: EnhancedBundleInput = {
      title: "Empty Bundle",
      slug: "empty-bundle",
      price: 999,
      products: [],
    };

    const schema = getProductGroupSchema(emptyBundle);

    // Property: No isRelatedTo when no products
    expect(schema.isRelatedTo).toBeUndefined();
  });

  it("should include AggregateOffer with correct offerCount", () => {
    fc.assert(
      fc.property(bundleWithProductsArb, (bundle) => {
        const schema = getProductGroupSchema(bundle as EnhancedBundleInput);

        // Property: offers should be AggregateOffer
        expect(schema.offers).toBeDefined();
        const offers = schema.offers as {
          "@type": string;
          offerCount: number;
        };

        expect(offers["@type"]).toBe("AggregateOffer");
        expect(offers.offerCount).toBe(bundle.products.length);
      })
    );
  });
});

/**
 * Generator for blog posts
 */
const blogPostArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  slug: validSlugArb,
  excerpt: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  content: fc.option(fc.string({ minLength: 0, maxLength: 5000 })),
  featuredImage: fc.option(fc.record({ url: fc.option(fc.webUrl()) })),
  category: fc.option(fc.record({ title: fc.string({ minLength: 1, maxLength: 100 }) })),
  createdBy: fc.option(fc.record({ name: fc.option(fc.string({ minLength: 1, maxLength: 100 })) })),
  createdAt: isoDateArb,
  updatedAt: isoDateArb,
});

describe("Property 6: Blog post schema contains required article fields", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 6: Blog post schema contains required article fields
   * Validates: Requirements 8.1, 8.2
   */
  it("should include headline, author, datePublished, dateModified", () => {
    fc.assert(
      fc.property(blogPostArb, (post) => {
        const schema = getArticleSchema(post as BlogPostInput);

        // Property: Schema should be Article type
        expect(schema["@type"]).toBe("Article");

        // Property: headline should match title
        expect(schema.headline).toBe(post.title);

        // Property: author should exist with name
        expect(schema.author).toBeDefined();
        expect(schema.author["@type"]).toBe("Person");
        expect(typeof schema.author.name).toBe("string");
        expect(schema.author.name.length).toBeGreaterThan(0);

        // Property: datePublished should match createdAt
        expect(schema.datePublished).toBe(post.createdAt);

        // Property: dateModified should match updatedAt
        expect(schema.dateModified).toBe(post.updatedAt);
      })
    );
  });

  it("should include wordCount greater than or equal to 0", () => {
    fc.assert(
      fc.property(blogPostArb, (post) => {
        const schema = getArticleSchema(post as BlogPostInput);

        // Property: wordCount should be non-negative integer
        expect(schema.wordCount).toBeDefined();
        expect(typeof schema.wordCount).toBe("number");
        expect(schema.wordCount).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(schema.wordCount)).toBe(true);
      })
    );
  });

  it("should include timeRequired in ISO 8601 duration format", () => {
    fc.assert(
      fc.property(blogPostArb, (post) => {
        const schema = getArticleSchema(post as BlogPostInput);

        // Property: timeRequired should be in PT{n}M format
        expect(schema.timeRequired).toBeDefined();
        expect(typeof schema.timeRequired).toBe("string");
        expect(schema.timeRequired).toMatch(/^PT\d+M$/);
      })
    );
  });

  it("should calculate wordCount correctly", () => {
    fc.assert(
      fc.property(blogPostArb, (post) => {
        const schema = getArticleSchema(post as BlogPostInput);

        // Calculate expected word count
        const expectedWordCount = post.content ? countWords(post.content) : 0;

        // Property: wordCount should match calculated value
        expect(schema.wordCount).toBe(expectedWordCount);
      })
    );
  });

  it("should calculate reading time correctly based on word count", () => {
    fc.assert(
      fc.property(blogPostArb, (post) => {
        const schema = getArticleSchema(post as BlogPostInput);

        // Calculate expected reading time
        const wordCount = post.content ? countWords(post.content) : 0;
        const expectedReadingTime = calculateReadingTime(wordCount);
        const expectedTimeRequired = formatDurationISO8601(expectedReadingTime);

        // Property: timeRequired should match calculated value
        expect(schema.timeRequired).toBe(expectedTimeRequired);
      })
    );
  });

  it("should use author name when provided", () => {
    const postWithAuthor: BlogPostInput = {
      title: "Test Post",
      slug: "test-post",
      createdBy: { name: "John Doe" },
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-02T00:00:00.000Z",
    };

    const schema = getArticleSchema(postWithAuthor);

    // Property: Author name should be used when provided
    expect(schema.author.name).toBe("John Doe");
  });

  it("should use SITE_NAME as fallback author when not provided", () => {
    const postWithoutAuthor: BlogPostInput = {
      title: "Test Post",
      slug: "test-post",
      createdBy: null,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-02T00:00:00.000Z",
    };

    const schema = getArticleSchema(postWithoutAuthor);

    // Property: SITE_NAME should be used as fallback
    expect(schema.author.name).toBe(SITE_NAME);
  });

  it("should include publisher with organization details", () => {
    fc.assert(
      fc.property(blogPostArb, (post) => {
        const schema = getArticleSchema(post as BlogPostInput);

        // Property: publisher should be Organization
        expect(schema.publisher).toBeDefined();
        expect(schema.publisher["@type"]).toBe("Organization");
        expect(schema.publisher.name).toBe(SITE_NAME);
        expect(schema.publisher.logo).toBeDefined();
        expect(schema.publisher.logo["@type"]).toBe("ImageObject");
      })
    );
  });

  it("should include articleSection when category is provided", () => {
    const postWithCategory: BlogPostInput = {
      title: "Test Post",
      slug: "test-post",
      category: { title: "Technology" },
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-02T00:00:00.000Z",
    };

    const schema = getArticleSchema(postWithCategory);

    // Property: articleSection should match category title
    expect(schema.articleSection).toBe("Technology");
  });

  it("should NOT include articleSection when category is not provided", () => {
    const postWithoutCategory: BlogPostInput = {
      title: "Test Post",
      slug: "test-post",
      category: null,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-02T00:00:00.000Z",
    };

    const schema = getArticleSchema(postWithoutCategory);

    // Property: articleSection should not exist
    expect(schema.articleSection).toBeUndefined();
  });
});
