"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Edit,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Copy,
  ExternalLink,
  User,
  Package,
  CreditCard,
  Receipt,
  ShoppingBag,
  PackageCheck,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock order data based on the JSON structure
const mockOrderData = {
  id: "1",
  order_number: 1,
  identifier: "104e18a2-d755-4d4b-80c4-a6c1dcbe1c10",
  user_name: "maxthestranger",
  user_email: "thestrangermax@gmail.com",
  status: "paid",
  status_formatted: "Completed",
  total_formatted: "$15.00",
  subtotal_formatted: "$12.50",
  tax_formatted: "$2.50",
  currency: "USD",
  tax_name: "VAT",
  tax_rate: "20.00",
  created_at: "2024-08-17T09:45:53.000000Z",
  first_order_item: {
    product_name: "Test Limited License for 2 years",
    variant_name: "Default",
    price: 1500,
  },
  urls: {
    receipt: "https://app.lemonsqueezy.com/my-orders/104e18a2-d755-4d4b-80c4-a6c1dcbe1c10",
  },
}

type Order = typeof mockOrderData

export default function AdminDashboard() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderModalOpen(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* User Details Section */}
      <div className="flex justify-between items-center rounded-lg border p-6 sm:flex-wrap flex-nowrap">
        {/* Profile Section */}
        <div className="sm:w-60 flex items-center w-full">
          <Avatar className="h-20 w-20">
            <AvatarImage src="https://cdn.buymeacoffee.com/uploads/profile_pictures/2024/08/lv4cV9uDzkofpelG.jpg@300w_0e.webp" />
            <AvatarFallback>EA</AvatarFallback>
          </Avatar>
          <div className="ml-6 xs:ml-0 w-full">
            <h4 className="font-medium sm:text-lg leading-6 text-base truncate">Hi, Emmanuel Allan</h4>
            <span className="block sm:text-base mt-1 text-sm">admin@digiinsta.store</span>
          </div>
        </div>

        {/* Edit Button */}
        <Button
          type="button"
          asChild
          className="inline-flex items-center gap-2 ml-auto h-12 min-w-24 py-4 !px-6 uppercase justify-center rounded border-0"
        >
          <Link href="/admin/profile">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border shadow-none">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[#222]">127</p>
                <div className="flex items-center mt-3 text-[#717171]">
                  <PackageCheck className="w-4 h-4 mr-2" />
                  <span className="text-base font-medium">Products</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[#222]">
                  2,847
                </p>
                <div className="flex items-center mt-3 text-[#717171]">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span className="text-base font-medium">Orders</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[#222]">
                  <span className="text-2xl">$</span>12,450
                </p>
                <div className="flex items-center mt-3 text-[#717171]">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span className="text-base font-medium">Total Sales</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-foreground">Recent Orders</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search by name or email" 
                  className="pl-10 w-64 h-10 border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4 flex items-center gap-2 border-border bg-background hover:bg-muted/50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Order Item */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">MT</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">maxthestranger</p>
                <p className="text-sm text-muted-foreground">thestrangermax@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-semibold text-foreground mb-2">
                  $15.00 <Badge variant="default" className="ml-2 bg-green-100 text-green-700 border-green-200">Completed</Badge>
                </p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleViewOrder(mockOrderData)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Order ID
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Receipt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Order Item */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">AL</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">Ali</p>
                <p className="text-sm text-muted-foreground">itsupcloud24@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-semibold text-foreground mb-2">
                  $25.00 <Badge variant="default" className="ml-2 bg-green-100 text-green-700 border-green-200">Completed</Badge>
                </p>
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleViewOrder(mockOrderData)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Order ID
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Receipt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Order Item */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">JS</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">John Smith</p>
                <p className="text-sm text-muted-foreground">john.smith@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-semibold text-foreground mb-2">
                  $8.50 <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700 border-orange-200">Pending</Badge>
                </p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleViewOrder(mockOrderData)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Order ID
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Receipt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <Package className="w-5 h-5 text-primary" />
              Order Details
              <Badge variant={selectedOrder?.status === "paid" ? "default" : "secondary"} className="ml-auto">
                {selectedOrder?.status_formatted}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">#{selectedOrder.order_number}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedOrder.order_number.toString())}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-foreground">{selectedOrder.identifier}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(selectedOrder.identifier)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-semibold text-foreground">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-semibold text-foreground">{selectedOrder.user_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-semibold text-foreground">{selectedOrder.user_email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Product Information */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Product</p>
                    <p className="font-semibold text-foreground">{selectedOrder.first_order_item.product_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Variant</p>
                    <p className="font-semibold text-foreground">{selectedOrder.first_order_item.variant_name}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">{selectedOrder.subtotal_formatted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {selectedOrder.tax_name} ({selectedOrder.tax_rate}%)
                    </span>
                    <span className="font-semibold text-foreground">{selectedOrder.tax_formatted}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{selectedOrder.total_formatted}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Currency</span>
                    <span className="text-muted-foreground">{selectedOrder.currency}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Receipt Link */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-primary" />
                    Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full h-11 border-border bg-background hover:bg-muted/50">
                    <Link href={selectedOrder.urls.receipt} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Receipt
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
