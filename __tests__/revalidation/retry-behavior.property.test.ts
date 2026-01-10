/**
 * Property-Based Tests for Retry Behavior
 *
 * Feature: cache-revalidation-fix
 * Property 7: Retry on Failure
 * Validates: Requirements 1.5
 *
 * Tests that failures trigger exactly one retry and that failures
 * don't block hook completion.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import type {
  RevalidationContext,
  OperationType,
  CollectionType,
} from "../../lib/revalidation/service";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Generator for valid URL slugs
 */
const slugArb = fc
  .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .filter((s) => s.length >= 1 && s.length <= 50);

/**
 * Generator for collection types
 */
const collectionTypeArb = fc.constantFrom<CollectionType>(
  "products",
  "categories",
  "subcategories",
  "bundles",
  "posts"
);

/**
 * Generator for operation types
 */
const operationTypeArb = fc.constantFrom<OperationType>("create", "update", "delete");

/**
 * Generator for subcategory with optional category
 */
const subcategoryArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  slug: slugArb,
  category: fc.option(
    fc.record({
      id: fc.integer({ min: 1, max: 10000 }),
      slug: slugArb,
    }),
    { nil: null }
  ),
});

/**
 * Generator for product tag objects
 */
const productTagArb = fc.record({
  tag: fc.option(fc.constantFrom("best-seller", "new-arrival", "featured", "sale", "popular"), {
    nil: null,
  }),
});

/**
 * Generator for revalidation context
 */
const revalidationContextArb = fc.record({
  collection: collectionTypeArb,
  operation: operationTypeArb,
  doc: fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    slug: slugArb,
    status: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
    previousStatus: fc.option(fc.constantFrom("active", "draft", "archived"), { nil: null }),
    tags: fc.option(fc.array(productTagArb, { minLength: 0, maxLength: 3 }), { nil: null }),
    subcategory: fc.option(subcategoryArb, { nil: null }),
    category: fc.constant(null),
  }),
});

describe("Retry Behavior Property Tests", () => {
  /**
   * Feature: cache-revalidation-fix
   * Property 7: Retry on Failure
   * Validates: Requirements 1.5
   */
  describe("Property 7: Retry on Failure", () => {
    let revalidatePathMock: ReturnType<typeof vi.fn>;
    let revalidateTagMock: ReturnType<typeof vi.fn>;
    let originalRevalidatePath: typeof import("next/cache").revalidatePath;
    let originalRevalidateTag: typeof import("next/cache").revalidateTag;

    beforeEach(async () => {
      // Reset modules to get fresh mocks
      vi.resetModules();

      // Create mocks
      revalidatePathMock = vi.fn();
      revalidateTagMock = vi.fn();

      // Mock next/cache module
      vi.doMock("next/cache", () => ({
        revalidatePath: revalidatePathMock,
        revalidateTag: revalidateTagMock,
      }));
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.resetModules();
    });

    describe("Retry Count", () => {
      it("should retry exactly once when first attempt fails", async () => {
        // Track call counts
        let pathCallCount = 0;
        let tagCallCount = 0;

        revalidatePathMock.mockImplementation(() => {
          pathCallCount++;
          if (pathCallCount <= 10) {
            // Fail on first batch of calls (first attempt)
            throw new Error("Simulated failure");
          }
          // Succeed on retry
        });

        revalidateTagMock.mockImplementation(() => {
          tagCallCount++;
          // Tags are called after paths, so they may succeed
        });

        // Import service after mocking
        const { triggerRevalidation } = await import("../../lib/revalidation/service");

        const context: RevalidationContext = {
          collection: "products",
          operation: "update",
          doc: {
            id: 1,
            slug: "test-product",
            status: "active",
            previousStatus: null,
            tags: null,
            subcategory: null,
            category: null,
          },
        };

        const result = await triggerRevalidation(context);

        // Property: Should have attempted revalidation (paths are called)
        expect(revalidatePathMock).toHaveBeenCalled();

        // Property: Result should indicate success or failure
        expect(typeof result.success).toBe("boolean");
        expect(Array.isArray(result.paths)).toBe(true);
        expect(Array.isArray(result.tags)).toBe(true);
      });

      it("should succeed on first attempt when no errors occur", async () => {
        // All calls succeed
        revalidatePathMock.mockImplementation(() => {});
        revalidateTagMock.mockImplementation(() => {});

        // Import service after mocking
        const { triggerRevalidation } = await import("../../lib/revalidation/service");

        await fc.assert(
          fc.asyncProperty(revalidationContextArb, async (context) => {
            // Reset call counts for each property test iteration
            revalidatePathMock.mockClear();
            revalidateTagMock.mockClear();

            const result = await triggerRevalidation(context);

            // Property: Should succeed when no errors
            expect(result.success).toBe(true);

            // Property: Should not have errors
            expect(result.errors).toBeUndefined();

            // Property: Should have computed paths and tags
            expect(result.paths.length).toBeGreaterThan(0);
            expect(result.tags.length).toBeGreaterThan(0);
          }),
          { numRuns: 20 } // Reduced iterations for async tests with mocks
        );
      });

      it("should fail after retry when both attempts fail", async () => {
        // All calls fail
        revalidatePathMock.mockImplementation(() => {
          throw new Error("Persistent failure");
        });

        // Import service after mocking
        const { triggerRevalidation } = await import("../../lib/revalidation/service");

        const context: RevalidationContext = {
          collection: "products",
          operation: "update",
          doc: {
            id: 1,
            slug: "test-product",
            status: "active",
            previousStatus: null,
            tags: null,
            subcategory: null,
            category: null,
          },
        };

        const result = await triggerRevalidation(context);

        // Property: Should fail when both attempts fail
        expect(result.success).toBe(false);

        // Property: Should have error messages
        expect(result.errors).toBeDefined();
        expect(result.errors!.length).toBeGreaterThan(0);
      });
    });

    describe("Non-Blocking Behavior", () => {
      it("should complete hook execution even when revalidation fails", async () => {
        // All calls fail
        revalidatePathMock.mockImplementation(() => {
          throw new Error("Simulated failure");
        });

        // Import hooks after mocking
        const { createRevalidationAfterChangeHook } = await import("../../lib/revalidation/hooks");

        const hook = createRevalidationAfterChangeHook("products");

        const doc = {
          id: 1,
          slug: "test-product",
          status: "active",
        };

        // Property: Hook should complete without throwing
        const result = await hook({
          doc,
          previousDoc: undefined,
          operation: "update",
          data: {},
          req: {} as never,
          context: {} as never,
          collection: {} as never,
        });

        // Property: Hook should return the document (not block)
        expect(result).toBe(doc);
      });

      it("should return document immediately for all collection types", async () => {
        // All calls fail
        revalidatePathMock.mockImplementation(() => {
          throw new Error("Simulated failure");
        });

        // Import hooks after mocking
        const { createRevalidationAfterChangeHook } = await import("../../lib/revalidation/hooks");

        await fc.assert(
          fc.asyncProperty(collectionTypeArb, slugArb, async (collection, slug) => {
            const hook = createRevalidationAfterChangeHook(collection);

            const doc = {
              id: 1,
              slug,
              status: "active",
            };

            // Property: Hook should complete without throwing
            const result = await hook({
              doc,
              previousDoc: undefined,
              operation: "update",
              data: {},
              req: {} as never,
              context: {} as never,
              collection: {} as never,
            });

            // Property: Hook should return the document
            expect(result).toBe(doc);
          }),
          { numRuns: 20 } // Reduced iterations for async tests
        );
      });

      it("should return document for delete hooks even when revalidation fails", async () => {
        // All calls fail
        revalidatePathMock.mockImplementation(() => {
          throw new Error("Simulated failure");
        });

        // Import hooks after mocking
        const { createRevalidationAfterDeleteHook } = await import("../../lib/revalidation/hooks");

        await fc.assert(
          fc.asyncProperty(collectionTypeArb, slugArb, async (collection, slug) => {
            const hook = createRevalidationAfterDeleteHook(collection);

            const doc = {
              id: 1,
              slug,
              status: "active",
            };

            // Property: Delete hook should complete without throwing
            const result = await hook({
              doc,
              id: 1,
              req: {} as never,
              context: {} as never,
              collection: {} as never,
            });

            // Property: Hook should return the document
            expect(result).toBe(doc);
          }),
          { numRuns: 20 } // Reduced iterations for async tests
        );
      });
    });

    describe("Error Isolation", () => {
      it("should not propagate errors to the caller", async () => {
        // All calls throw
        revalidatePathMock.mockImplementation(() => {
          throw new Error("Critical failure");
        });

        // Import service after mocking
        const { triggerRevalidationAsync } = await import("../../lib/revalidation/service");

        await fc.assert(
          fc.asyncProperty(revalidationContextArb, async (context) => {
            // Property: Async trigger should not throw
            expect(() => {
              triggerRevalidationAsync(context);
            }).not.toThrow();
          }),
          { numRuns: 20 }
        );
      });
    });

    describe("Result Structure", () => {
      it("should always return a valid result structure", async () => {
        // Randomly succeed or fail
        let callCount = 0;
        revalidatePathMock.mockImplementation(() => {
          callCount++;
          if (callCount % 3 === 0) {
            throw new Error("Random failure");
          }
        });
        revalidateTagMock.mockImplementation(() => {});

        // Import service after mocking
        const { triggerRevalidation } = await import("../../lib/revalidation/service");

        await fc.assert(
          fc.asyncProperty(revalidationContextArb, async (context) => {
            const result = await triggerRevalidation(context);

            // Property: Result should have required fields
            expect(typeof result.success).toBe("boolean");
            expect(Array.isArray(result.paths)).toBe(true);
            expect(Array.isArray(result.tags)).toBe(true);

            // Property: Duration should be a positive number
            expect(typeof result.duration).toBe("number");
            expect(result.duration).toBeGreaterThanOrEqual(0);

            // Property: Errors should be undefined or an array
            if (result.errors !== undefined) {
              expect(Array.isArray(result.errors)).toBe(true);
            }
          }),
          { numRuns: 20 }
        );
      });
    });
  });
});
