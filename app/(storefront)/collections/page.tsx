import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { getAllCollections } from "@/lib/db/collections";

export const metadata: Metadata = {
  title: "Collections | Digital love for the heart 💖",
  description: "Browse our collections of digital products for meaningful relationships",
  openGraph: {
    title: "Collections | Digital love for the heart 💖",
    description: "Browse our collections of digital products for meaningful relationships",
    type: "website",
    url: "https://digitallove.com/collections",
    siteName: "Digital love for the heart",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collections | Digital love for the heart 💖",
    description: "Browse our collections of digital products for meaningful relationships",
  },
};

export default async function CollectionsPage() {
  const collections = await getAllCollections();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store";

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
        name: "Collections",
      },
    ],
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="py-6 border-b border-gray-200">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            <span className="text-gray-900 font-medium">Collections</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All Collections
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Explore our curated collections of digital products designed to strengthen relationships and create meaningful moments.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pb-16">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="group block"
            >
              <div className="space-y-4">
                {/* Collection Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={collection.icon}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {collection.name}
                    </h2>
                    <p className="text-sm text-white/90 line-clamp-2">
                      {collection.emotionalCopy || collection.description}
                    </p>
                  </div>
                </div>

                {/* View Collection Link */}
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                  View Collection
                  <HugeiconsIcon 
                    icon={ArrowRight01Icon} 
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {collections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No collections available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
