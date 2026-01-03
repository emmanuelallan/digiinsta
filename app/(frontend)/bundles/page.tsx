import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PackageIcon,
  PercentCircleIcon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { getBundles } from "@/lib/storefront";
import { NoBundlesFound } from "@/components/storefront/shared";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/cart/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Product Bundles | Save Up to 40%",
  description:
    "Save up to 40% with DigiInsta bundles. Get curated collections of digital planners, finance tools, and productivity templates at discounted prices.",
  alternates: {
    canonical: `${SITE_URL}/bundles`,
  },
  openGraph: {
    title: `Product Bundles | Save Up to 40% | ${SITE_NAME}`,
    description:
      "Save up to 40% with DigiInsta bundles. Get curated collections of digital planners, finance tools, and productivity templates.",
    url: `${SITE_URL}/bundles`,
  },
};

export default async function BundlesPage() {
  const { bundles, totalDocs } = await getBundles({ limit: 20 });

  if (!bundles || bundles.length === 0) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <NoBundlesFound />
        </div>
      </div>
    );
  }

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
                <BreadcrumbPage>Bundles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Page Header */}
      <section className="from-primary/5 via-primary/10 to-background bg-gradient-to-br py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              <HugeiconsIcon icon={PackageIcon} size={14} className="mr-1.5" />
              Bundle & Save
            </Badge>
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Product Bundles
            </h1>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg">
              Get more value with our curated collections. Save up to 40% when you buy together.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {totalDocs} {totalDocs === 1 ? "bundle" : "bundles"} available
            </p>
          </div>
        </div>
      </section>

      {/* Bundles Grid */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {bundles.map((bundle) => {
              const heroImageUrl = bundle.heroImage?.url;
              const productCount = bundle.products?.length ?? 0;
              const hasDiscount =
                bundle.compareAtPrice && bundle.price && bundle.compareAtPrice > bundle.price;
              const savingsAmount = hasDiscount ? bundle.compareAtPrice! - bundle.price! : 0;
              const savingsPercent = hasDiscount
                ? Math.round((savingsAmount / bundle.compareAtPrice!) * 100)
                : 0;

              return (
                <Link
                  key={bundle.id}
                  href={`/bundles/${bundle.slug}`}
                  className="group bg-card relative flex flex-col overflow-hidden rounded-2xl border transition-all hover:shadow-xl sm:flex-row"
                >
                  {/* Image Section */}
                  <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden sm:aspect-square sm:w-2/5">
                    {heroImageUrl ? (
                      <Image
                        src={heroImageUrl}
                        alt={bundle.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 40vw"
                      />
                    ) : (
                      <div className="from-primary/10 to-primary/5 flex h-full items-center justify-center bg-gradient-to-br">
                        <HugeiconsIcon
                          icon={PackageIcon}
                          size={48}
                          className="text-muted-foreground/30"
                        />
                      </div>
                    )}

                    {/* Savings Badge */}
                    {hasDiscount && (
                      <Badge className="absolute top-3 left-3 bg-green-500 text-white hover:bg-green-600">
                        <HugeiconsIcon icon={PercentCircleIcon} size={14} className="mr-1" />
                        Save {savingsPercent}%
                      </Badge>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {/* Product Count Badge */}
                    <Badge variant="outline" className="mb-3 w-fit text-xs">
                      {productCount} {productCount === 1 ? "product" : "products"} included
                    </Badge>

                    {/* Title */}
                    <h2 className="text-foreground group-hover:text-primary line-clamp-1 text-xl font-bold transition-colors sm:text-2xl">
                      {bundle.title}
                    </h2>

                    {/* Description */}
                    {bundle.shortDescription && (
                      <p className="text-muted-foreground mt-2 line-clamp-2 flex-1 text-sm">
                        {bundle.shortDescription}
                      </p>
                    )}

                    {/* Product Thumbnails */}
                    {bundle.products && bundle.products.length > 0 && (
                      <div className="mt-4 flex -space-x-2">
                        {bundle.products.slice(0, 4).map((product, idx) => {
                          const productImage = product.images?.[0]?.image?.url;
                          return (
                            <div
                              key={product.id}
                              className="border-background bg-muted relative h-8 w-8 overflow-hidden rounded-full border-2"
                              style={{ zIndex: 4 - idx }}
                            >
                              {productImage ? (
                                <Image
                                  src={productImage}
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                  sizes="32px"
                                />
                              ) : (
                                <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center text-xs font-medium">
                                  {product.title.charAt(0)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {bundle.products.length > 4 && (
                          <div className="border-background bg-muted text-muted-foreground relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium">
                            +{bundle.products.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price & CTA */}
                    <div className="mt-4 flex items-end justify-between border-t pt-4">
                      <div>
                        {bundle.price ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-foreground text-2xl font-bold">
                              {formatPrice(bundle.price)}
                            </span>
                            {hasDiscount && (
                              <span className="text-muted-foreground text-sm line-through">
                                {formatPrice(bundle.compareAtPrice!)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Price varies</span>
                        )}
                        {bundle.price && productCount > 0 && (
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {formatPrice(Math.round(bundle.price / productCount))} per product
                          </p>
                        )}
                      </div>

                      <span className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                        View Bundle
                        <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Buy Bundles Section */}
      <section className="bg-muted/30 border-t py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-foreground text-2xl font-bold">Why Buy Bundles?</h2>
            <p className="text-muted-foreground mt-2">
              Get more value and save money with our curated collections
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Save Up to 40%",
                description: "Bundles are priced lower than buying products individually",
              },
              {
                title: "Curated Collections",
                description: "Products that work perfectly together for your needs",
              },
              {
                title: "Instant Access",
                description: "Download all products immediately after purchase",
              },
              {
                title: "Lifetime Updates",
                description: "Get free updates for all products in the bundle",
              },
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    size={18}
                    className="text-green-600"
                  />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
