"use client"

import Link from "next/link"
import { CheckCircle, Download, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="font-serif font-bold text-4xl text-gray-900 mb-4">Thank You!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your order has been successfully placed. You can now download your digital products.
          </p>

          {/* Order Details */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-mono font-medium text-gray-900">#DIGI-{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-lg">
              <Download className="h-5 w-5 mr-2" />
              Download Your Products
            </Button>
            
            <Button variant="outline" className="w-full h-12 text-lg">
              <Mail className="h-5 w-5 mr-2" />
              Check Your Email
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-600">
            <p className="mb-2">
              A confirmation email has been sent to your email address with download links and instructions.
            </p>
            <p>
              If you have any questions, please don&apos;t hesitate to contact our support team.
            </p>
          </div>

          {/* Continue Shopping */}
          <div className="mt-12">
            <Link href="/">
              <Button variant="ghost" className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
