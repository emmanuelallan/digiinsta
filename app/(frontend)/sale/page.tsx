import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PercentCircleIcon,
  SaleTag01Icon,
  Clock01Icon,
  ArrowRight01Icon,
  GiftIcon,
} from "@hugeicons/core-free-icons";
import { getSaleProducts } from "@/lib/storefront";
import { ProductGrid } from "@/components/storefront/product";
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
import { SITE_URL, SITE_NAME, getOfferCatalogSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sale | Discounts on Digital Planners & Templates",
  description:
    "Shop DigiInsta sale items and save big on premium digital planners, templates, and productivity tools. Limited time offers on top products.",
  alternates: {
    canonical: `${SITE_URL}/sale`,
  },
  openGraph: {
    title: `Sale & Discounts | ${SITE_NAME}`,
    description:
      "Shop our best deals and discounts on premium digital products. Limited time offers on templates, tools, and more.",
    url: `${SITE_URL}/sale`,
  },
};

export default async function SalePage() {
  const products = await getSaleProducts(24);

  // Calculate total savings available
  const totalSavings = products.reduce((sum, product) => {
    if (product.price && product.compareAtPrice && product.compareAtPrice > product.price) {
      return sum + (product.compareAtPrice - product.price);
    }
    return sum;
  }, 0);

  // Find max discount percentage
  const maxDiscount = products.reduce((max, product) => {
    if (product.price && product.compareAtPrice && product.compareAtPrice > product.price) {
      const discount = Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      );
      return Math.max(max, discount);
    }
    return max;
  }, 0);

  // Structured data for sale catalog
  const saleCatalogSchema = getOfferCatalogSchema(
    "Sale & Discounts",
    "Limited time offers on premium digital products at DigiInsta",
    products
  );

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(saleCatalogSchema) }}
      />

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
                  <BreadcrumbPage>Sale</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-red-500 to-pink-600 py-16 lg:py-24">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl" />
            <div className="absolute top-1/4 left-1/2 h-64 w-64 rounded-full bg-red-300/20 blur-2xl" />
            {/* Sale Tags Decoration */}
            <div className="absolute top-10 left-10 rotate-[-15deg] opacity-20">
              <HugeiconsIcon icon={SaleTag01Icon} size={80} className="text-white" />
            </div>
            <div className="absolute right-10 bottom-10 rotate-[15deg] opacity-20">
              <HugeiconsIcon icon={PercentCircleIcon} size={100} className="text-white" />
            </div>
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <Badge className="mb-6 bg-yellow-400 text-yellow-900 hover:bg-yellow-300">
                <HugeiconsIcon icon={SaleTag01Icon} size={14} className="mr-1.5" />
                Limited Time Offers
              </Badge>

              {/* Title */}
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Sale & Discounts
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg text-white/90 sm:text-xl">
                Don&apos;t miss out on these amazing deals! Premium digital products at special
                prices. Grab them before they&apos;re gone.
              </p>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {maxDiscount > 0 && (
                  <div className="flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-yellow-900">
                    <HugeiconsIcon icon={PercentCircleIcon} size={20} />
                    <span className="text-sm font-bold">Up to {maxDiscount}% Off</span>
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <HugeiconsIcon icon={GiftIcon} size={18} className="text-white/80" />
                  <span className="text-sm font-medium text-white">
                    {products.length} {products.length === 1 ? "Deal" : "Deals"} Available
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white">
                      Save up to ${(totalSavings / 100).toFixed(0)}+
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Urgency Banner */}
        {products.length > 0 && (
          <section className="bg-yellow-400 py-3">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center gap-2 text-center">
                <HugeiconsIcon icon={Clock01Icon} size={18} className="text-yellow-900" />
                <p className="text-sm font-medium text-yellow-900">
                  These prices won&apos;t last forever! Shop now and save big.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {products.length === 0 ? (
              <div className="py-12">
                <div className="mx-auto max-w-md text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <HugeiconsIcon
                      icon={SaleTag01Icon}
                      size={32}
                      className="text-muted-foreground"
                    />
                  </div>
                  <h2 className="text-foreground text-xl font-semibold">No Sales Right Now</h2>
                  <p className="text-muted-foreground mt-2">
                    Check back soon! We regularly add new deals and discounts.
                  </p>
                  <Button asChild className="mt-6">
                    <Link href="/products">Browse All Products</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Section Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-foreground text-2xl font-bold">All Deals</h2>
                    <p className="text-muted-foreground mt-1">
                      {products.length} products on sale right now
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
        {products.length > 0 && (
          <section className="border-t bg-gradient-to-r from-rose-50 to-pink-50 py-12 lg:py-16 dark:from-rose-950/20 dark:to-pink-950/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <HugeiconsIcon icon={GiftIcon} size={48} className="mx-auto mb-4 text-rose-500" />
                <h2 className="text-foreground text-2xl font-bold">Want Even More Savings?</h2>
                <p className="text-muted-foreground mt-2">
                  Check out our bundles for the best value. Get multiple products at a fraction of
                  the price.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <Button asChild className="bg-rose-500 hover:bg-rose-600">
                    <Link href="/bundles">View Bundles</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/best-sellers">Best Sellers</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
