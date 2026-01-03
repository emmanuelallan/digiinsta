import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Discount01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { getFeaturedBundle } from "@/lib/storefront";

interface BundleBannerProps {
  className?: string;
  variant?: "full" | "compact";
}

export async function BundleBanner({
  className,
  variant = "full",
}: BundleBannerProps) {
  const bundle = await getFeaturedBundle();

  // If no bundle, show a generic bundles CTA
  if (!bundle) {
    return (
      <section className={className}>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12">
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                <HugeiconsIcon icon={Discount01Icon} size={16} />
                Save More with Bundles
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Bundle & Save Up to 40%
              </h2>
              <p className="text-white/90 mb-6">
                Get more value with our curated product bundles. Perfect
                combinations at unbeatable prices.
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link href="/bundles">
                  Shop Bundles
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={18}
                    className="ml-2"
                  />
                </Link>
              </Button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/5" />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "compact") {
    return (
      <section className={className}>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/bundles/${bundle.slug}`}
            className="group block relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <HugeiconsIcon
                    icon={Discount01Icon}
                    size={24}
                    className="text-white"
                  />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">
                    Featured Bundle
                  </p>
                  <p className="text-white font-bold">{bundle.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold">
                <span>Shop Now</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4 w-fit">
                <HugeiconsIcon icon={Discount01Icon} size={16} />
                Save {bundle.products.length > 2 ? "40%" : "25%"} with this
                bundle
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {bundle.title}
              </h2>
              <p className="text-white/90 text-lg mb-6 line-clamp-2">
                {bundle.shortDescription ||
                  `Get ${bundle.products.length} premium products in one bundle`}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href={`/bundles/${bundle.slug}`}>
                    Get the Bundle
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={18}
                      className="ml-2"
                    />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Link href="/bundles">View All Bundles</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            {bundle.heroImage?.url && (
              <div className="relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-orange-500/50" />
                <Image
                  src={bundle.heroImage.url}
                  alt={bundle.title}
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white/5" />
        </div>
      </div>
    </section>
  );
}
