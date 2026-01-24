import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Download01Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { getProductsByCollection } from "@/lib/db/products";

export const metadata: Metadata = {
  title: "Valentine's Collection - Thoughtful Digital Gifts for Love",
  description: "Perfect Valentine's gifts ready in minutes. Editable, printable, and instantly downloadable. No shipping needed.",
  openGraph: {
    title: "Valentine's Collection | Digital love for the heart",
    description: "Thoughtful digital gifts for love — ready in minutes. Perfect last-minute Valentine's gifts.",
    images: ["/images/valentines-og.jpg"],
  },
  alternates: {
    canonical: "/collections/valentines",
  },
};

export default async function ValentinesCollectionPage() {
  const products = await getProductsByCollection("valentines");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store";

  // Separate bundles and individual products
  const bundles = products.filter(p => p.name.toLowerCase().includes("bundle"));
  const individualProducts = products.filter(p => !p.name.toLowerCase().includes("bundle"));

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
        name: "Collections",
        item: `${baseUrl}/collections`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Valentine's Collection",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-gradient-to-b from-pink-50 to-white">
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-6 border-b border-pink-200">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-pink-600 transition-colors">
                Home
              </Link>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              <Link href="/collections" className="hover:text-pink-600 transition-colors">
                Collections
              </Link>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              <span className="text-pink-600 font-medium">Valentine's Collection</span>
            </nav>
          </div>

          {/* Hero Content */}
          <div className="py-16 text-center">
            <div className="inline-block mb-4">
              <span className="bg-pink-100 text-pink-600 text-sm font-bold uppercase px-4 py-2 rounded-full">
                💝 Valentine's Special
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Thoughtful Digital Gifts for Love
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ready in minutes. No shipping needed. Perfect for last-minute gifts.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Download01Icon} size={20} className="text-pink-600" />
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Edit02Icon} size={20} className="text-pink-600" />
                <span>Editable & Personal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-pink-600 text-xl">🎁</span>
                <span>Perfect Last-Minute Gift</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Bundles Section */}
        {bundles.length > 0 && (
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  ⭐ Best Value Bundles
                </h2>
                <p className="text-xl text-pink-100">
                  Everything you need for a meaningful Valentine's
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {bundles.map((bundle) => (
                  <BundleCard key={bundle.id} product={bundle} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Individual Products Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              💕 Individual Products
            </h2>
            <p className="text-xl text-gray-600">
              Choose exactly what you need
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {individualProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {individualProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Valentine's products coming soon! Check back shortly.
              </p>
            </div>
          )}
        </div>

        {/* Why Choose Section */}
        <div className="bg-pink-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Our Valentine's Gifts Are Special
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Instant & Easy</h3>
                <p className="text-gray-600">
                  Download immediately after purchase. No waiting, no shipping delays.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fully Editable</h3>
                <p className="text-gray-600">
                  Personalize with names, messages, and photos. Make it uniquely yours.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thoughtfully Designed</h3>
                <p className="text-gray-600">
                  Created to spark connection and create meaningful moments together.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Make This Valentine's Special?
            </h2>
            <p className="text-xl text-pink-100 mb-8">
              Join 200,000+ couples creating meaningful moments
            </p>
            <Link href="#products">
              <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 font-bold">
                Shop Valentine's Collection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function BundleCard({ product }: { product: any }) {
  const savings = product.salePrice ? product.price - product.salePrice : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
        {product.images[0] && (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-yellow-400 text-gray-900 text-xs font-bold uppercase px-3 py-1 rounded-full">
            ⭐ Best Value
          </span>
        </div>
        {savings > 0 && (
          <div className="absolute top-4 right-4">
            <span className="bg-green-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
              Save ${savings}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
          {product.name}
        </h3>
        <div
          className="text-sm text-gray-600 mb-4 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-pink-600">
              ${product.salePrice || product.price}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ${product.price}
              </span>
            )}
          </div>
          <span className="text-pink-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            View Bundle
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductCard({ product }: { product: any }) {
  const badge = product.badges[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold uppercase px-3 py-1 rounded-full">
                {badge.text}
              </span>
            </div>
          )}
          {product.images[0] && (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
            {product.name}
          </h3>
          <div
            className="text-sm text-gray-600 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-pink-600">
              ${product.salePrice || product.price}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product.price}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
