"use client"

import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

export function CartSidebar() {
  const { state, removeItem, updateQuantity, closeCart, getTotalPrice } = useCart()

  if (!state.isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeCart} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-serif font-semibold text-xl text-gray-900">Shopping Cart</h2>
          <Button variant="ghost" size="sm" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-lg text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <Button onClick={closeCart} className="bg-cyan-600 hover:bg-cyan-700">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex space-x-4">
                  <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-semibold text-sm text-gray-900 mb-1">{item.product.title}</h4>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {item.product.category}
                    </Badge>
                    <p className="font-semibold text-gray-900">${item.product.price}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-transparent"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-transparent"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif font-semibold text-lg text-gray-900">Total</span>
              <span className="font-serif font-bold text-2xl text-gray-900">${getTotalPrice().toFixed(2)}</span>
            </div>

            <Separator />

            <div className="space-y-3">
              <Link href="/cart" onClick={closeCart}>
                <Button variant="outline" className="w-full bg-transparent">
                  View Cart
                </Button>
              </Link>
              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Checkout</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
