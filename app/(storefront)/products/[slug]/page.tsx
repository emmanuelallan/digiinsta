import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/products";
import { Button } from "@/components/ui/button";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store";

  return {
    title: product.name,
    description: product.description.replace(/<[^>]*>/g, "").substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.replace(/<[^>]*>/g, "").substring(0, 160),
      url: `/products/${slug}`,
      siteName: "Digital love for the heart",
      images: product.images.map((img) => ({
        url: img.url,
        width: 1200,
        height: 630,
        alt: img.alt,
      })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description.replace(/<[^>]*>/g, "").substring(0, 160),
      images: [product.images[0]?.url],
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, 4);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store";

  // Product JSON-LD
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.replace(/<[^>]*>/g, ""),
    image: product.images.map((img) => img.url),
    brand: {
      "@type": "Brand",
      name: "Digital love for the heart",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${slug}`,
      priceCurrency: "USD",
      price: product.salePrice || product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Digital love for the heart",
      },
    },
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${baseUrl}/collections/all`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-6 border-b border-gray-200">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-pink-600 transition-colors">
                Home
              </Link>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              <Link href="/collections/all" className="hover:text-pink-600 transition-colors">
                Products
              </Link>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>

          {/* Product Details */}
          <div className="py-12">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={product.images[0]?.url || "/placeholder.webp"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.slice(1, 5).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                      >
                        <Image
                          src={image.url}
                          alt={image.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Badges */}
                {product.badges.length > 0 && (
                  <div className="flex gap-2">
                    {product.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold uppercase px-3 py-1 rounded-full"
                      >
                        {badge.text}
                      </span>
                    ))}
                  </div>
                )}

                <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>

                <div
                  className="text-lg text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />

                {/* Price */}
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-blue-600">
                    ${product.salePrice || product.price}
                  </span>
                  {product.salePrice && (
                    <span className="text-xl text-gray-400 line-through">
                      ${product.price}
                    </span>
                  )}
                </div>

                {/* Buy Button */}
                <a
                  href={product.lemonSqueezyCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button size="lg" className="w-full">
                    Buy Now
                  </Button>
                </a>

                {/* Taxonomies */}
                {product.taxonomies.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {product.taxonomies.map((taxonomy, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                        >
                          {taxonomy.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="py-16 border-t border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                You May Also Like
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug}`}
                    className="group block"
                  >
                    <div className="space-y-4">
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={relatedProduct.images[0]?.url || "/placeholder.webp"}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            ${relatedProduct.salePrice || relatedProduct.price}
                          </span>
                          {relatedProduct.salePrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${relatedProduct.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
