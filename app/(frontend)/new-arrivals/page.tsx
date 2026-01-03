import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon, Clock01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { getNewArrivals } from "@/lib/storefront";
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
  title: "New Arrivals | Fresh Digital Products",
  description:
    "Discover our latest digital products and templates. Fresh additions to help you achieve more.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(24);

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
                <BreadcrumbPage>New Arrivals</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 py-16 lg:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/4 left-1/3 h-64 w-64 rounded-full bg-pink-400/20 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <Badge className="mb-6 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
              <HugeiconsIcon icon={SparklesIcon} size={14} className="mr-1.5" />
              Fresh & New
            </Badge>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              New Arrivals
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              Be the first to explore our latest digital products. Fresh templates, tools, and
              resources added regularly to help you stay ahead.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <HugeiconsIcon icon={Clock01Icon} size={18} className="text-white/80" />
                <span className="text-sm font-medium text-white">Updated Weekly</span>
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
                  <h2 className="text-foreground text-2xl font-bold">Latest Products</h2>
                  <p className="text-muted-foreground mt-1">
                    Discover what&apos;s new in our collection
                  </p>
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
      <section className="bg-muted/30 border-t py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-foreground text-2xl font-bold">Don&apos;t Miss Out</h2>
            <p className="text-muted-foreground mt-2">
              New products are added every week. Check back often or browse our full catalog.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/bundles">View Bundles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
