import { Suspense } from "react";
import {
  HeroSection,
  PersonaCards,
  NewArrivals,
  EditorsPick,
  BestSellers,
  BundleBanner,
  BundleShowcase,
} from "@/components/storefront";
import {
  ProductTraySkeleton,
  BundleBannerSkeleton,
  BundleShowcaseSkeleton,
} from "@/components/storefront/shared";
import { getCategoriesWithCounts } from "@/lib/storefront";

export const metadata = {
  title: "DigiInsta - Premium Digital Products & Templates",
  description:
    "Discover premium digital templates, planners, and tools designed by experts. Transform your productivity, finances, and goals with beautifully crafted resources.",
};

export default async function HomePage() {
  const categories = await getCategoriesWithCounts();

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <HeroSection categories={categories} />

      {/* Best Sellers - between Hero and Persona */}
      <Suspense fallback={<ProductTraySkeleton className="py-16 lg:py-24" />}>
        <BestSellers className="py-16 lg:py-24" />
      </Suspense>

      {/* Shop by Persona */}
      <PersonaCards className="bg-muted/30 py-16 lg:py-24" />

      {/* New Arrivals */}
      <Suspense fallback={<ProductTraySkeleton className="py-16 lg:py-24" />}>
        <NewArrivals className="py-16 lg:py-24" />
      </Suspense>

      {/* Bundle Promotion Banner */}
      <Suspense fallback={<BundleBannerSkeleton className="bg-muted/30 py-16 lg:py-24" />}>
        <BundleBanner className="bg-muted/30 py-16 lg:py-24" />
      </Suspense>

      {/* Editor's Pick */}
      <Suspense fallback={<ProductTraySkeleton className="py-16 lg:py-24" />}>
        <EditorsPick className="py-16 lg:py-24" />
      </Suspense>

      {/* Bundle Showcase */}
      <Suspense fallback={<BundleShowcaseSkeleton className="bg-muted/30 py-16 lg:py-24" />}>
        <BundleShowcase className="bg-muted/30 py-16 lg:py-24" />
      </Suspense>
    </main>
  );
}
