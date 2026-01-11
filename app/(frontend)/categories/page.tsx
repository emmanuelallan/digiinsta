import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategoriesWithCounts } from "@/lib/storefront";
import { NoCategoriesFound } from "@/components/storefront/shared";
import { SITE_URL, SITE_NAME } from "@/lib/seo/jsonld";
import { urlFor } from "@/lib/sanity/image";

export const metadata: Metadata = {
  title: "All Categories | Browse Digital Products",
  description:
    "Browse all categories of premium digital products at DigiInsta. Find student planners, finance trackers, SME tools, and more organized by category.",
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
  openGraph: {
    title: `All Categories | ${SITE_NAME}`,
    description:
      "Browse all categories of premium digital products at DigiInsta. Find student planners, finance trackers, SME tools, and more.",
    url: `${SITE_URL}/categories`,
  },
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  if (!categories || categories.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <NoCategoriesFound />
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Page Header */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              All Categories
            </h1>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg">
              Explore our curated collection of premium digital products and templates
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {categories.map((category) => {
              const imageUrl = category.image
                ? urlFor(category.image).width(600).height(800).url()
                : null;

              return (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug.current}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                    {/* Background Image */}
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={category.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="from-muted to-muted/60 absolute inset-0 bg-gradient-to-br" />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content at Bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <h2 className="group-hover:text-primary-foreground text-lg font-semibold text-white transition-colors sm:text-xl">
                        {category.title}
                      </h2>
                      {category.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-white/70">
                          {category.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-white/60">
                          {category.productCount ?? 0} products
                        </span>
                        <span className="text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Browse →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
