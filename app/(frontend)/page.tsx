import type { Metadata } from "next";
import { Suspense } from "react";
import {
  HeroSection,
  PersonaCards,
  NewArrivals,
  EditorsPick,
  BestSellers,
  OnSale,
  BundleBanner,
  BundleShowcase,
} from "@/components/storefront";
import {
  ProductTraySkeleton,
  BundleBannerSkeleton,
  BundleShowcaseSkeleton,
} from "@/components/storefront/shared";
import { getCategoriesWithCounts, getBestSellers, getHeroSlides } from "@/lib/storefront";
import { getProductListSchema, SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Professional Digital Planners & Finance Tools`,
  description:
    "Elevate your life with DigiInsta. Shop expert-led student planners, couples finance tools, and SME systems engineered for 2026 productivity. No fluff—just high-yield digital tools.",
  keywords: [
    "digital planners 2026",
    "student planners",
    "couple finance tools",
    "SME productivity systems",
    "notion templates",
    "budget trackers",
    "academic planners",
    "wedding planners",
    "business templates",
    "digital downloads",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | Professional Digital Planners & Finance Tools`,
    description:
      "Elevate your life with DigiInsta. Shop expert-led student planners, couples finance tools, and SME systems engineered for 2026 productivity.",
    url: SITE_URL,
    type: "website",
  },
};

export default async function HomePage() {
  const [categories, bestSellerProducts, heroSlides] = await Promise.all([
    getCategoriesWithCounts(),
    getBestSellers(8),
    getHeroSlides(),
  ]);

  // Product list schema for best sellers
  const productListSchema = getProductListSchema(
    bestSellerProducts,
    "Best Selling Digital Products"
  );

  return (
    <>
      {/* JSON-LD for product list */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productListSchema),
        }}
      />

      <main className="flex flex-col">
        {/* Hero Section with Sanity slides */}
        <HeroSection categories={categories} heroSlides={heroSlides} />

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

        {/* On Sale Products */}
        <Suspense fallback={<ProductTraySkeleton className="bg-muted/30 py-16 lg:py-24" />}>
          <OnSale className="bg-muted/30 py-16 lg:py-24" />
        </Suspense>

        {/* Bundle Promotion Banner */}
        <Suspense fallback={<BundleBannerSkeleton className="py-16 lg:py-24" />}>
          <BundleBanner className="py-16 lg:py-24" />
        </Suspense>

        {/* Editor's Pick */}
        <Suspense fallback={<ProductTraySkeleton className="bg-muted/30 py-16 lg:py-24" />}>
          <EditorsPick className="bg-muted/30 py-16 lg:py-24" />
        </Suspense>

        {/* Bundle Showcase */}
        <Suspense fallback={<BundleShowcaseSkeleton className="py-16 lg:py-24" />}>
          <BundleShowcase className="py-16 lg:py-24" />
        </Suspense>
      </main>
    </>
  );
}
