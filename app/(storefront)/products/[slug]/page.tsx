import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/products";
import {
  ImageCarousel,
  ProductInfo,
  BuyNowButton,
  WhatsIncluded,
  WhyItWorks,
  HowToUse,
  RelatedProducts,
  FAQ,
} from "@/components/storefront/products";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  // Get primary image for Open Graph
  const primaryImage = product.images[0]?.url;

  return {
    title: `${product.name} | Digital love for the heart 💖`,
    description: product.emotionalPromise || product.description,
    openGraph: {
      title: `${product.name} | Digital love for the heart 💖`,
      description: product.emotionalPromise || product.description,
      type: "website",
      url: `https://digitallove.com/products/${slug}`,
      siteName: "Digital love for the heart",
      images: primaryImage
        ? [
            {
              url: primaryImage,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Digital love for the heart 💖`,
      description: product.emotionalPromise || product.description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Await params to get the slug
  const { slug } = await params;
  
  // Fetch product by slug from database
  const product = await getProductBySlug(slug);

  // Handle 404 for invalid product slugs
  if (!product) {
    notFound();
  }

  // Fetch related products from database
  const relatedProducts = await getRelatedProducts(product.id, 3);

  // Generate structured data markup for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: product.salePrice || product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://digitallove.com/products/${slug}`,
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Product Header Section */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column: Image Carousel */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <ImageCarousel images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Product Info and Purchase */}
          <div className="space-y-8">
            <ProductInfo product={product} />

            {/* Buy Now Button */}
            <BuyNowButton
              checkoutUrl={product.lemonSqueezyCheckoutUrl}
              productName={product.name}
            />
          </div>
        </div>

        {/* Product Details Sections */}
        <div className="mt-16 space-y-16">
          {/* What's Included Section */}
          {product.whatsIncluded.length > 0 && (
            <WhatsIncluded items={product.whatsIncluded} />
          )}

          {/* Why It Works Section */}
          {product.whyItWorks.length > 0 && (
            <WhyItWorks statements={product.whyItWorks} />
          )}

          {/* How To Use Section */}
          {product.howToUse.length > 0 && (
            <HowToUse steps={product.howToUse} />
          )}

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <RelatedProducts
              products={relatedProducts}
              currentProductId={product.id}
            />
          )}

          {/* FAQ Section */}
          {product.faqs.length > 0 && <FAQ faqs={product.faqs} />}
        </div>
      </div>
    </>
  );
}
