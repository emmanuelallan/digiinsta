"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Cart, CartItem, CartContextType } from "./types";
import { trackAddToCart, trackRemoveFromCart } from "@/components/analytics";

const CART_STORAGE_KEY = "digiinsta_cart";

const defaultCart: Cart = {
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadCartFromStorage(): Cart {
  if (typeof window === "undefined") return defaultCart;

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Cart;
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load cart from storage:", error);
  }

  return defaultCart;
}

function saveCartToStorage(cart: Cart): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart to storage:", error);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = loadCartFromStorage();
    // Only update if different from default
    if (storedCart.items.length > 0 || storedCart !== defaultCart) {
      setCart(storedCart);
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage(cart);
    }
  }, [cart, isLoading]);

  const addItem = useCallback((item: Omit<CartItem, "id" | "quantity">) => {
    setCart((prev) => {
      // Check if item already exists (same productId/bundleId and type)
      const exists = prev.items.some((i) => {
        if (item.type === "bundle") {
          return i.bundleId === item.bundleId && i.type === "bundle";
        }
        return i.productId === item.productId && i.type === "product";
      });

      if (exists) {
        // Digital products don't need quantity increase, just return
        return prev;
      }

      const newItem: CartItem = {
        ...item,
        id: generateId(),
        quantity: 1, // Digital products always have quantity 1
      };

      // Track add to cart event
      trackAddToCart({
        id: item.type === "bundle" ? item.bundleId! : item.productId!,
        title: item.title,
        price: item.price,
        type: item.type,
      });

      return {
        ...prev,
        items: [...prev.items, newItem],
        updatedAt: new Date().toISOString(),
      };
    });

    // Open cart when item is added
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => {
      // Find the item being removed for tracking
      const itemToRemove = prev.items.find((item) => item.id === id);
      if (itemToRemove) {
        trackRemoveFromCart({
          id: itemToRemove.type === "bundle" ? itemToRemove.bundleId! : itemToRemove.productId!,
          title: itemToRemove.title,
          type: itemToRemove.type,
        });
      }

      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const isInCart = useCallback(
    (id: number, type: "product" | "bundle") => {
      return cart.items.some((item) => {
        if (type === "bundle") {
          return item.bundleId === id && item.type === "bundle";
        }
        return item.productId === id && item.type === "product";
      });
    },
    [cart.items]
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const itemCount = useMemo(() => cart.items.length, [cart.items]);

  const subtotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.price, 0),
    [cart.items]
  );

  const savings = useMemo(
    () =>
      cart.items.reduce((sum, item) => {
        if (item.compareAtPrice && item.compareAtPrice > item.price) {
          return sum + (item.compareAtPrice - item.price);
        }
        return sum;
      }, 0),
    [cart.items]
  );

  const value: CartContextType = {
    cart,
    itemCount,
    subtotal,
    savings,
    isOpen,
    isLoading,
    addItem,
    removeItem,
    clearCart,
    isInCart,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
