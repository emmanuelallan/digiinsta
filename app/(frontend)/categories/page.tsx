import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategoriesWithCounts } from "@/lib/storefront";
import { NoCategoriesFound } from "@/components/storefront/shared";

export const metadata: Metadata = {
  title: "All Categories",
  description:
    "Browse all categories of premium digital products and templates at DigiInsta.",
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  if (!categories || categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <NoCategoriesFound />
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Page Header */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              All Categories
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Explore our curated collection of premium digital products and
              templates
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const imageUrl =
                typeof category.image === "object" && category.image?.url
                  ? category.image.url
                  : null;

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                    {/* Background Image */}
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={category.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60" />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content at Bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <h2 className="text-lg sm:text-xl font-semibold text-white group-hover:text-primary-foreground transition-colors">
                        {category.title}
                      </h2>
                      {category.description && (
                        <p className="mt-1 text-sm text-white/70 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-white/60">
                          {category.productCount ?? 0} products
                        </span>
                        <span className="text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
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
