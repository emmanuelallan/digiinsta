"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { Product } from "./products"

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "UPDATE_QUANTITY"; productId: number; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.product.id === action.product.id)

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.product.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }

      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1 }],
      }
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.productId),
      }

    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.product.id !== action.productId),
        }
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId ? { ...item, quantity: action.quantity } : item,
        ),
      }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      }

    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      }

    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      }

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("digitalcraft-cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        parsedCart.items.forEach((item: CartItem) => {
          dispatch({ type: "ADD_ITEM", product: item.product })
          if (item.quantity > 1) {
            dispatch({ type: "UPDATE_QUANTITY", productId: item.product.id, quantity: item.quantity })
          }
        })
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("digitalcraft-cart", JSON.stringify({ items: state.items }))
  }, [state.items])

  const addItem = (product: Product) => {
    dispatch({ type: "ADD_ITEM", product })
  }

  const removeItem = (productId: number) => {
    dispatch({ type: "REMOVE_ITEM", productId })
  }

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" })
  }

  const openCart = () => {
    dispatch({ type: "OPEN_CART" })
  }

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" })
  }

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    getTotalItems,
    getTotalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
