"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CreditCard, Lock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"

export default function CheckoutPage() {
  const { state, getTotalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    setIsProcessing(true)
    // Simulate checkout process
    setTimeout(() => {
      clearCart()
      setIsProcessing(false)
      // Redirect to success page
      window.location.href = "/checkout/success"
    }, 2000)
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="font-serif font-bold text-3xl text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products to your cart before checking out.</p>
            <Link href="/">
              <Button className="bg-cyan-600 hover:bg-cyan-700">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-cyan-600 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop</span>
          </Link>
          <h1 className="font-serif font-bold text-3xl text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-semibold text-sm text-gray-900">{item.product.title}</h4>
                        <Badge variant="secondary" className="text-xs mb-1">
                          {item.product.category}
                        </Badge>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-semibold text-lg text-gray-900">Total</span>
                    <span className="font-serif font-bold text-2xl text-gray-900">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        required
                        className="w-full pl-10"
                      />
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-lg"
                  >
                    {isProcessing ? "Processing..." : `Pay $${getTotalPrice().toFixed(2)}`}
                  </Button>
                </form>

                {/* Security Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>256-bit SSL</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
