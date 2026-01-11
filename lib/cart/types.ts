/**
 * Cart Types
 * Type definitions for the shopping cart system
 */

export interface CartItem {
  id: string; // Unique cart item ID
  type: "product" | "bundle";
  productId?: string; // Sanity product ID (for products)
  bundleId?: string; // Sanity bundle ID (for bundles)
  polarProductId: string; // Polar product ID for checkout
  title: string;
  price: number; // Price in cents
  compareAtPrice?: number | null; // Original price for sale display
  image?: string; // Product image URL
  quantity: number; // Always 1 for digital products
}

export interface Cart {
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartContextType {
  cart: Cart;
  itemCount: number;
  subtotal: number;
  savings: number;
  isOpen: boolean;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (productId: string, type: "product" | "bundle") => boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export interface CheckoutPayload {
  items: Array<{
    polarProductId: string;
    productId?: string;
    bundleId?: string;
    type: "product" | "bundle";
  }>;
  metadata?: Record<string, string>;
}
