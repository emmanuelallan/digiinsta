import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItemType = "product" | "bundle";

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  slug: string;
  quantity: number;
  lsVariantId: string; // Required - product must be synced to Lemon Squeezy
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, type: CartItemType) => void;
  updateQuantity: (id: string, type: CartItemType, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.id === item.id && i.type === item.type
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id && i.type === item.type
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }

        get().openCart();
      },

      removeItem: (id, type) => {
        set({
          items: get().items.filter((i) => !(i.id === id && i.type === type)),
        });
      },

      updateQuantity: (id, type, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, type);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.id === id && i.type === type ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);
