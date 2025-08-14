import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Shield, RefreshCw, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPublicProductById } from "@/actions/public/products"
import type { Product } from "@/types/products"
import type { Category } from "@/types/categories"
import { CheckoutButton } from "@/components/public/checkout-button"

interface ProductPageProps { params: Promise<{ id: string }> }

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const res = await getPublicProductById(id)
  if (res.error || !res.data) notFound()
  const product = res.data as Product & { categories: Pick<Category, "id" | "title" | "slug">[] }
  return <ProductPageContent product={product} />
}

function ProductPageContent({ product }: { product: Product & { categories: Pick<Category, "id" | "title" | "slug">[] } }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="font-serif font-bold text-2xl text-gray-900 hover:text-cyan-600 transition-colors"
              >
                DigitalCraft
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-cyan-600 transition-colors">
                  Home
                </Link>
                <a href="#" className="text-gray-600 hover:text-cyan-600 transition-colors">
                  Categories
                </a>
                <a href="#" className="text-gray-600 hover:text-cyan-600 transition-colors">
                  About
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-cyan-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200">
              <img
                src={product.thumb_url || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Additional media could go here */}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-3">
                {product.categories?.map((c) => (
                  <Badge key={c.id} variant="secondary">{c.title}</Badge>
                ))}
              </div>
              <h1 className="font-serif font-bold text-3xl text-gray-900 mb-4">{product.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-serif font-bold text-4xl text-gray-900">
                {typeof product.price === "number" ? `$${(product.price / 100).toFixed(2)}` : ""}
              </span>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Instant Download</Badge>
            </div>

            <div className="flex space-x-4">
              <CheckoutButton productId={String(product.id)} className="flex-1 bg-cyan-600 hover:bg-cyan-700" />
            </div>

            <div className="flex items-center justify-center space-x-6 py-4 border-t border-b border-gray-200">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Save</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <Download className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Instant Download</p>
                <p className="text-xs text-gray-500">Available immediately</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-500">Protected checkout</p>
              </div>
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Free Updates</p>
                <p className="text-xs text-gray-500">Lifetime access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="font-serif font-semibold text-xl text-gray-900 mb-6">About this product</h3>
                  {product.description && <p className="text-gray-700">{product.description}</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-8">
              <Card><CardContent className="p-8">Coming soon</CardContent></Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <Card><CardContent className="p-8">Reviews coming soon</CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>

      </div>

      {/* Back to Top Button */}
      <div className="fixed bottom-8 right-8">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-white shadow-lg">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
