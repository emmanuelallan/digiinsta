import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FireIcon,
  StarIcon,
  ChampionIcon,
  ArrowRight01Icon,
  ThumbsUpIcon,
} from "@hugeicons/core-free-icons";
import { getBestSellers } from "@/lib/storefront";
import { ProductGrid } from "@/components/storefront/product";
import { NoProductsFound } from "@/components/storefront/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Best Sellers | Top Digital Products",
  description:
    "Shop our most popular digital products loved by thousands. Proven templates and tools that deliver results.",
};

export default async function BestSellersPage() {
  const products = await getBestSellers(24);

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Best Sellers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 py-16 lg:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute -right-1/4 -bottom-1/2 h-96 w-96 rounded-full bg-red-400/20 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-orange-300/20 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <Badge className="mb-6 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
              <HugeiconsIcon icon={FireIcon} size={14} className="mr-1.5" />
              Hot & Trending
            </Badge>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Best Sellers
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              Our most loved products, chosen by thousands of happy customers. These proven
              templates and tools consistently deliver exceptional results.
            </p>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <HugeiconsIcon icon={StarIcon} size={18} className="text-yellow-300" />
                <span className="text-sm font-medium text-white">Top Rated</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <HugeiconsIcon icon={ThumbsUpIcon} size={18} className="text-white/80" />
                <span className="text-sm font-medium text-white">Customer Favorites</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="text-sm font-medium text-white">
                  {products.length} {products.length === 1 ? "Product" : "Products"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Best Sellers Section */}
      <section className="bg-muted/30 border-b py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ChampionIcon,
                title: "Proven Results",
                description: "Templates that have helped thousands achieve their goals",
              },
              {
                icon: StarIcon,
                title: "Highly Rated",
                description: "Consistently receiving 5-star reviews from customers",
              },
              {
                icon: ThumbsUpIcon,
                title: "Customer Approved",
                description: "Recommended by users who've seen real improvements",
              },
              {
                icon: FireIcon,
                title: "Trending Now",
                description: "The most popular products in our collection",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                  <HugeiconsIcon icon={item.icon} size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <NoProductsFound />
          ) : (
            <>
              {/* Section Header */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-foreground text-2xl font-bold">Top Products</h2>
                  <p className="text-muted-foreground mt-1">The products our customers love most</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/products">
                    View All Products
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Products Grid */}
              <ProductGrid products={products} columns={4} />
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-r from-orange-50 to-amber-50 py-12 lg:py-16 dark:from-orange-950/20 dark:to-amber-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <HugeiconsIcon icon={ChampionIcon} size={48} className="mx-auto mb-4 text-orange-500" />
            <h2 className="text-foreground text-2xl font-bold">
              Join Thousands of Happy Customers
            </h2>
            <p className="text-muted-foreground mt-2">
              These best sellers have helped people just like you achieve their goals. Start your
              journey today.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/products">Explore All Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/bundles">Save with Bundles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
