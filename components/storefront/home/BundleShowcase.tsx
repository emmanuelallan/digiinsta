import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PackageIcon, PercentCircleIcon } from "@hugeicons/core-free-icons";
import { SectionHeader } from "../shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBundles } from "@/lib/storefront";
import { formatPrice } from "@/lib/cart/utils";

interface BundleShowcaseProps {
  className?: string;
}

export async function BundleShowcase({ className }: BundleShowcaseProps) {
  const { bundles } = await getBundles({ limit: 6 });

  if (bundles.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Bundle & Save"
          subtitle="Get more value with our curated product bundles"
          viewAllHref="/bundles"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => {
            const heroImageUrl = bundle.heroImage?.url;
            const productCount = bundle.products.length;
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
                className="group bg-card relative flex flex-col overflow-hidden rounded-2xl border transition-all hover:shadow-lg"
              >
                {/* Hero Image */}
                <div className="bg-muted relative aspect-[16/10] overflow-hidden">
                  {heroImageUrl ? (
                    <Image
                      src={heroImageUrl}
                      alt={bundle.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="from-primary/10 to-primary/5 flex h-full items-center justify-center bg-gradient-to-br">
                      <HugeiconsIcon
                        icon={PackageIcon}
                        size={48}
                        className="text-muted-foreground/40"
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

                  {/* Product Count Badge */}
                  <Badge variant="secondary" className="absolute top-3 right-3">
                    {productCount} {productCount === 1 ? "product" : "products"}
                  </Badge>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Title */}
                  <h3 className="text-foreground group-hover:text-primary mb-2 line-clamp-1 text-lg font-semibold transition-colors">
                    {bundle.title}
                  </h3>

                  {/* Description */}
                  {bundle.shortDescription && (
                    <p className="text-muted-foreground mb-4 line-clamp-2 flex-1 text-sm">
                      {bundle.shortDescription}
                    </p>
                  )}

                  {/* Product Thumbnails */}
                  {bundle.products.length > 0 && (
                    <div className="mb-4 flex -space-x-2">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      {bundle.price ? (
                        <>
                          <span className="text-foreground text-lg font-bold">
                            {formatPrice(bundle.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-muted-foreground text-sm line-through">
                              {formatPrice(bundle.compareAtPrice!)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm">Price varies</span>
                      )}
                    </div>

                    <span className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                      View Bundle
                      <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/bundles">
              View All Bundles
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
