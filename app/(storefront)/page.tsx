import type { Metadata } from "next";
import {
  HeroSection,
  CollectionCards,
  ValentineHighlight,
  BestSellers,
  NewProducts,
  WhyPeopleLove,
  EmailCaptureWrapper,
} from "@/components/storefront/homepage";
import { getBestSellerProducts, getFeaturedProducts, getNewProducts } from "@/lib/db/products";
import { getAllCollections } from "@/lib/db/collections";

export const metadata: Metadata = {
  title: "Digital love for the heart 💖 | Intentional moments made simple",
  description:
    "Discover meaningful digital products for relationships. Thoughtfully designed tools for self-love, couples, family, and friendship. Instant download, editable templates.",
  openGraph: {
    title: "Digital love for the heart 💖 | Intentional moments made simple",
    description:
      "Discover meaningful digital products for relationships. Thoughtfully designed tools for self-love, couples, family, and friendship.",
    type: "website",
    url: "https://digitallove.com",
    siteName: "Digital love for the heart",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital love for the heart 💖 | Intentional moments made simple",
    description:
      "Discover meaningful digital products for relationships. Thoughtfully designed tools for self-love, couples, family, and friendship.",
  },
};

const whyPeopleLovePoints = [
  {
    icon: "💝",
    title: "Thoughtfully Designed",
    description:
      "Every product is crafted with intention to create genuine connection and meaningful moments.",
  },
  {
    icon: "⚡",
    title: "Instant & Easy",
    description:
      "Download immediately and start using right away. No complicated setup or technical skills needed.",
  },
  {
    icon: "✨",
    title: "Fully Editable",
    description:
      "Personalize every detail to make it uniquely yours. Works with common tools you already have.",
  },
];

export default async function HomePage() {
  // Fetch data for homepage sections
  const [bestSellers, valentineProducts, newProducts, collections] = await Promise.all([
    getBestSellerProducts(4),
    getFeaturedProducts("Valentine's Day", 4),
    getNewProducts(4),
    getAllCollections(),
  ]);

  return (
    <div className="flex flex-col">
      <HeroSection
        headline="The Ultimate Valentine's Gift"
        subheadline="Made for couples who want more. Join 200,000+ happy users."
        ctaText="SHOP NOW"
        ctaHref="/collections/valentines"
      />

      <CollectionCards collections={collections.slice(0, 4)} />

      {valentineProducts.length > 0 && (
        <ValentineHighlight featuredProducts={valentineProducts} />
      )}

      {bestSellers.length > 0 && <BestSellers products={bestSellers} />}

      <WhyPeopleLove valuePoints={whyPeopleLovePoints} />

      {newProducts.length > 0 && <NewProducts products={newProducts} />}

      <EmailCaptureWrapper />
    </div>
  );
}
