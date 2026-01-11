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

export async function BundleBanner({ className, variant = "full" }: BundleBannerProps) {
  const bundle = await getFeaturedBundle();

  // If no bundle, show a generic bundles CTA
  if (!bundle) {
    return (
      <section className={className}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="from-primary to-primary/80 relative overflow-hidden rounded-2xl bg-gradient-to-r p-8 md:p-12">
            <div className="relative z-10 max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                <HugeiconsIcon icon={Discount01Icon} size={16} />
                Save More with Bundles
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                Bundle & Save Up to 40%
              </h2>
              <p className="mb-6 text-white/90">
                Get more value with our curated product bundles. Perfect combinations at unbeatable
                prices.
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link href="/bundles">
                  Shop Bundles
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
                </Link>
              </Button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/5" />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "compact") {
    return (
      <section className={className}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/bundles/${bundle.slug}`}
            className="group relative block overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <HugeiconsIcon icon={Discount01Icon} size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Featured Bundle</p>
                  <p className="font-bold text-white">{bundle.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-semibold text-white">
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
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
          <div className="grid gap-8 p-8 md:grid-cols-2 md:p-12">
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                <HugeiconsIcon icon={Discount01Icon} size={16} />
                Save {(bundle.products?.length ?? 0) > 2 ? "40%" : "25%"} with this bundle
              </div>
              <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">{bundle.title}</h2>
              <p className="mb-6 line-clamp-2 text-lg text-white/90">
                {bundle.shortDescription ||
                  `Get ${bundle.products?.length ?? 0} premium products in one bundle`}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href={`/bundles/${bundle.slug}`}>
                    Get the Bundle
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/20">
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
                  className="rounded-xl object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />
        </div>
      </div>
    </section>
  );
}
