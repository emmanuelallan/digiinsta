import { notFound } from "next/navigation"
import { getPublicProductById } from "@/actions/public/products"
import { ProductGallery } from "@/components/public/product-gallery"
import { BuyNowButton } from "@/components/public/buy-now-button"
import { formatCurrency, mapDatabaseProductToComprehensive } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params
  const result = await getPublicProductById(id)

  if (result.error || !result.data) {
    return notFound()
  }

  const product = result.data

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Product Gallery */}
        <ProductGallery images={product.images?.map(img => img.image_url) || ["/placeholder.svg?height=400&width=600"]} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {product.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-2xl md:text-3xl font-semibold text-primary">
                {product.price ? formatCurrency(product.price) : "Price not available"}
              </p>

            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">(12 reviews)</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {product.description && (
            <div
              className="prose prose-sm sm:prose-base max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          <div className="pt-6">
            <BuyNowButton product={mapDatabaseProductToComprehensive(product)} />
          </div>
        </div>
      </div>
    </div>
  )
}