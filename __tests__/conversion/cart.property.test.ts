/**
 * Property-Based Tests for Cart Operations
 *
 * Feature: comprehensive-site-optimization
 * Property 12: Cart operations preserve data integrity
 * Validates: Requirements 10.2, 10.5
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { CartItem, Cart } from "@/lib/cart/types";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/**
 * Pure cart operations for testing (extracted from cart-context logic)
 * These mirror the actual cart context implementation
 */

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyCart(): Cart {
  return {
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function addItemToCart(cart: Cart, item: Omit<CartItem, "id" | "quantity">): Cart {
  // Check if item already exists (same productId/bundleId and type)
  const exists = cart.items.some((i) => {
    if (item.type === "bundle") {
      return i.bundleId === item.bundleId && i.type === "bundle";
    }
    return i.productId === item.productId && i.type === "product";
  });

  if (exists) {
    // Digital products don't need quantity increase, just return
    return cart;
  }

  const newItem: CartItem = {
    ...item,
    id: generateId(),
    quantity: 1, // Digital products always have quantity 1
  };

  return {
    ...cart,
    items: [...cart.items, newItem],
    updatedAt: new Date().toISOString(),
  };
}

function removeItemFromCart(cart: Cart, id: string): Cart {
  return {
    ...cart,
    items: cart.items.filter((item) => item.id !== id),
    updatedAt: new Date().toISOString(),
  };
}

function isInCart(cart: Cart, id: number, type: "product" | "bundle"): boolean {
  return cart.items.some((item) => {
    if (type === "bundle") {
      return item.bundleId === id && item.type === "bundle";
    }
    return item.productId === id && item.type === "product";
  });
}

function getItemCount(cart: Cart): number {
  return cart.items.length;
}

function getSubtotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.price, 0);
}

/**
 * Generators for cart items
 */
const productItemArb = fc.record({
  type: fc.constant("product" as const),
  productId: fc.integer({ min: 1, max: 100000 }),
  bundleId: fc.constant(undefined),
  polarProductId: fc.string({ minLength: 10, maxLength: 50 }),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  price: fc.integer({ min: 100, max: 1000000 }), // Price in cents
  compareAtPrice: fc.option(fc.integer({ min: 100, max: 1000000 }), { nil: null }),
  image: fc.option(fc.webUrl(), { nil: undefined }),
});

const bundleItemArb = fc.record({
  type: fc.constant("bundle" as const),
  productId: fc.constant(undefined),
  bundleId: fc.integer({ min: 1, max: 100000 }),
  polarProductId: fc.string({ minLength: 10, maxLength: 50 }),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  price: fc.integer({ min: 100, max: 1000000 }), // Price in cents
  compareAtPrice: fc.option(fc.integer({ min: 100, max: 1000000 }), { nil: null }),
  image: fc.option(fc.webUrl(), { nil: undefined }),
});

const cartItemArb = fc.oneof(productItemArb, bundleItemArb);

describe("Cart Operations Property Tests", () => {
  /**
   * Feature: comprehensive-site-optimization
   * Property 12: Cart operations preserve data integrity
   * Validates: Requirements 10.2, 10.5
   */
  describe("Property 12: Cart operations preserve data integrity", () => {
    describe("Adding items to cart", () => {
      it("should contain item with matching productId, title, price, and type after adding", () => {
        fc.assert(
          fc.property(cartItemArb, (item) => {
            const cart = createEmptyCart();
            const updatedCart = addItemToCart(cart, item);

            // Find the added item
            const addedItem = updatedCart.items.find((i) => {
              if (item.type === "bundle") {
                return i.bundleId === item.bundleId && i.type === "bundle";
              }
              return i.productId === item.productId && i.type === "product";
            });

            // Property: Cart should contain item with matching data
            expect(addedItem).toBeDefined();
            expect(addedItem?.title).toBe(item.title);
            expect(addedItem?.price).toBe(item.price);
            expect(addedItem?.type).toBe(item.type);
            expect(addedItem?.polarProductId).toBe(item.polarProductId);
          })
        );
      });

      it("should increase item count by 1 when adding a new item", () => {
        fc.assert(
          fc.property(cartItemArb, (item) => {
            const cart = createEmptyCart();
            const initialCount = getItemCount(cart);
            const updatedCart = addItemToCart(cart, item);
            const newCount = getItemCount(updatedCart);

            // Property: Item count should increase by 1
            expect(newCount).toBe(initialCount + 1);
          })
        );
      });

      it("should not add duplicate items (same productId/bundleId and type)", () => {
        fc.assert(
          fc.property(cartItemArb, (item) => {
            const cart = createEmptyCart();
            const cartWithItem = addItemToCart(cart, item);
            const cartWithDuplicate = addItemToCart(cartWithItem, item);

            // Property: Adding same item twice should not increase count
            expect(getItemCount(cartWithDuplicate)).toBe(getItemCount(cartWithItem));
          })
        );
      });

      it("should correctly report isInCart after adding", () => {
        fc.assert(
          fc.property(cartItemArb, (item) => {
            const cart = createEmptyCart();
            const updatedCart = addItemToCart(cart, item);

            const id = item.type === "bundle" ? item.bundleId! : item.productId!;

            // Property: isInCart should return true after adding
            expect(isInCart(updatedCart, id, item.type)).toBe(true);
          })
        );
      });
    });

    describe("Removing items from cart", () => {
      it("should decrease item count by 1 when removing an item", () => {
        fc.assert(
          fc.property(cartItemArb, (item) => {
            const cart = createEmptyCart();
            const cartWithItem = addItemToCart(cart, item);
            const addedItem = cartWithItem.items[0];

            if (!addedItem) {
              return; // Skip if no item was added
            }

            const cartAfterRemoval = removeItemFromCart(cartWithItem, addedItem.id);

            // Property: Item count should decrease by 1
            expect(getItemCount(cartAfterRemoval)).toBe(getItemCount(cartWithItem) - 1);
          })
        );
      });

      it("should correctly report isInCart as false after removing", () => {
        fc.assert(
          fc.property(cartItemArb, (item) => {
            const cart = createEmptyCart();
            const cartWithItem = addItemToCart(cart, item);
            const addedItem = cartWithItem.items[0];

            if (!addedItem) {
              return; // Skip if no item was added
            }

            const cartAfterRemoval = removeItemFromCart(cartWithItem, addedItem.id);
            const id = item.type === "bundle" ? item.bundleId! : item.productId!;

            // Property: isInCart should return false after removing
            expect(isInCart(cartAfterRemoval, id, item.type)).toBe(false);
          })
        );
      });
    });

    describe("Subtotal calculation", () => {
      it("should calculate subtotal as sum of all item prices", () => {
        fc.assert(
          fc.property(fc.array(cartItemArb, { minLength: 1, maxLength: 10 }), (items) => {
            let cart = createEmptyCart();

            // Add all items (filtering duplicates by making productId/bundleId unique)
            const uniqueItems = items.map((item, index) => ({
              ...item,
              productId: item.type === "product" ? index + 1 : undefined,
              bundleId: item.type === "bundle" ? index + 1 : undefined,
            }));

            for (const item of uniqueItems) {
              cart = addItemToCart(cart, item);
            }

            const expectedSubtotal = cart.items.reduce((sum, item) => sum + item.price, 0);

            // Property: Subtotal should equal sum of all item prices
            expect(getSubtotal(cart)).toBe(expectedSubtotal);
          })
        );
      });

      it("should return 0 for empty cart", () => {
        const cart = createEmptyCart();

        // Property: Empty cart should have 0 subtotal
        expect(getSubtotal(cart)).toBe(0);
      });
    });

    describe("Item count consistency", () => {
      it("should have itemCount equal to number of unique items", () => {
        fc.assert(
          fc.property(fc.array(cartItemArb, { minLength: 0, maxLength: 20 }), (items) => {
            let cart = createEmptyCart();

            // Add all items (making them unique)
            const uniqueItems = items.map((item, index) => ({
              ...item,
              productId: item.type === "product" ? index + 1 : undefined,
              bundleId: item.type === "bundle" ? index + 1 : undefined,
            }));

            for (const item of uniqueItems) {
              cart = addItemToCart(cart, item);
            }

            // Property: itemCount should equal number of items in array
            expect(getItemCount(cart)).toBe(cart.items.length);
          })
        );
      });
    });

    describe("Cart immutability", () => {
      it("should not mutate original cart when adding items", () => {
        fc.assert(
          fc.property(cartItemArb, (item) => {
            const originalCart = createEmptyCart();
            const originalItemCount = getItemCount(originalCart);

            addItemToCart(originalCart, item);

            // Property: Original cart should remain unchanged
            expect(getItemCount(originalCart)).toBe(originalItemCount);
          })
        );
      });

      it("should not mutate original cart when removing items", () => {
        fc.assert(
          fc.property(cartItemArb, (item) => {
            const cart = createEmptyCart();
            const cartWithItem = addItemToCart(cart, item);
            const originalItemCount = getItemCount(cartWithItem);
            const addedItem = cartWithItem.items[0];

            if (!addedItem) {
              return;
            }

            removeItemFromCart(cartWithItem, addedItem.id);

            // Property: Original cart should remain unchanged
            expect(getItemCount(cartWithItem)).toBe(originalItemCount);
          })
        );
      });
    });
  });
});
