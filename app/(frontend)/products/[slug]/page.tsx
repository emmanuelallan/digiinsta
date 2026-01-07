import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  getProductBySlug,
  getRelatedProducts,
  getFrequentlyBoughtTogether,
} from "@/lib/storefront";
import {
  ProductImageGallery,
  ProductGrid,
  ProductPageClient,
  FrequentlyBoughtTogether,
} from "@/components/storefront/product";
import { ProductActions } from "@/components/storefront/product/ProductActions";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RichText, TrustSignals } from "@/components/storefront/shared";
import { getProductSchema, getBreadcrumbSchema, SITE_URL, SITE_NAME } from "@/lib/seo";

// ISR revalidation: 1 hour for product pages
export const revalidate = 3600;

/**
 * Generate static params for all active products
 * Pre-renders product pages at build time for better performance
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "products",
    where: { status: { equals: "active" } },
    limit: 1000,
    depth: 0,
    select: { slug: true },
  });

  return result.docs.map((product) => ({
    slug: product.slug,
  }));
}

// Feature badges data
const featureBadges = [
  {
    icon: "/images/icons/human.svg",
    title: "100% Human",
    subtitle: "Crafted",
  },
  {
    icon: "/images/icons/layout.svg",
    title: "Proven",
    subtitle: "Layouts",
  },
  {
    icon: "/images/icons/customizable.svg",
    title: "Highly",
    subtitle: "Customizable",
  },
  {
    icon: "/images/icons/kenya.svg",
    title: "Designed in",
    subtitle: "Kenya",
  },
];

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const imageUrl = product.images?.[0]?.image?.url;
  const price = product.price ? `$${(product.price / 100).toFixed(2)}` : "";
  const description =
    product.shortDescription ||
    `Get ${product.title} at ${SITE_NAME}. ${product.subcategory?.category?.title || "Premium digital product"} designed for productivity.`;

  return {
    title: product.title,
    description,
    keywords: [
      product.title,
      product.subcategory?.title,
      product.subcategory?.category?.title,
      "digital download",
      "template",
      "planner",
      ...((product.tags?.map((t) => t.tag).filter(Boolean) as string[]) || []),
    ].filter(Boolean),
    alternates: {
      canonical: `${SITE_URL}/products/${slug}`,
    },
    openGraph: {
      title: `${product.title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/products/${slug}`,
      type: "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: product.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} ${price ? `- ${price}` : ""} | ${SITE_NAME}`,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get related products from the same subcategory
  const relatedProducts = await getRelatedProducts(product.id, product.subcategory.id, 4);

  // Get frequently bought together products
  const frequentlyBoughtTogether = await getFrequentlyBoughtTogether(product.id, 3);

  // Structured data
  const productSchema = getProductSchema({
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    images: product.images,
    subcategory: product.subcategory,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    {
      name: product.subcategory.category.title,
      url: `${SITE_URL}/categories/${product.subcategory.category.slug}`,
    },
    {
      name: product.subcategory.title,
      url: `${SITE_URL}/subcategories/${product.subcategory.slug}`,
    },
    { name: product.title, url: `${SITE_URL}/products/${product.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-background">
        {/* Breadcrumb */}
        <nav className="border-b" aria-label="Breadcrumb">
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
                  <BreadcrumbLink asChild>
                    <Link href={`/categories/${product.subcategory.category.slug}`}>
                      {product.subcategory.category.title}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/subcategories/${product.subcategory.slug}`}>
                      {product.subcategory.title}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    {product.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </nav>

        {/* Product Details - 4/6 images, 2/6 info */}
        <article className="py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-y-8 xl:grid-cols-6 xl:gap-x-8 xl:gap-y-4">
              {/* Left: Image Gallery - 4/6 width */}
              <div className="flex justify-center xl:col-span-4 xl:row-span-3 xl:justify-start">
                <ProductImageGallery images={product.images} title={product.title} />
              </div>

              {/* Right: Product Info - 2/6 width */}
              <div className="xl:col-span-2">
                <ProductPageClient
                  product={{
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    polarProductId: product.polarProductId,
                    images: product.images,
                  }}
                >
                  <div className="space-y-5 xl:sticky xl:top-24">
                    {/* Title */}
                    <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                      {product.title}
                    </h1>

                    {/* Short Description */}
                    {product.shortDescription && (
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Price & CTA Buttons */}
                    <ProductActions
                      product={{
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        compareAtPrice: product.compareAtPrice,
                        polarProductId: product.polarProductId,
                        images: product.images,
                      }}
                    />

                    {/* Trust Signals */}
                    <TrustSignals variant="product" className="mt-6" />

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="border-t pt-6">
                        <p className="text-muted-foreground mb-3 text-xs tracking-wider uppercase">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag) =>
                            tag.tag ? (
                              <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.tag}
                              </Badge>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </ProductPageClient>
              </div>
            </div>
          </div>
        </article>

        {/* Product Description & Feature Badges */}
        {product.description && (
          <section className="border-t py-10 lg:py-12" aria-labelledby="product-description">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
                {/* Left: Description */}
                <div className="flex-1">
                  <h2
                    id="product-description"
                    className="text-foreground mb-5 text-lg font-semibold"
                  >
                    About this product
                  </h2>
                  <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                    <RichText content={product.description} />
                  </div>
                </div>

                {/* Right: Feature Badges */}
                <aside className="flex-shrink-0 lg:w-72">
                  <h3 className="text-foreground mb-5 text-lg font-semibold">Why DigiInsta?</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {featureBadges.map((badge, index) => (
                      <div key={index} className="flex flex-col items-center text-center">
                        <div className="mb-2 h-10 w-10">
                          <Image
                            src={badge.icon}
                            alt={badge.title}
                            width={40}
                            height={40}
                            className="h-full w-full object-contain dark:invert"
                          />
                        </div>
                        <span className="text-foreground text-xs font-semibold tracking-wide uppercase">
                          {badge.title}
                        </span>
                        <span className="text-muted-foreground text-xs tracking-wide uppercase">
                          {badge.subtitle}
                        </span>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </section>
        )}

        {/* Frequently Bought Together */}
        {frequentlyBoughtTogether.length > 0 && product.polarProductId && product.price && (
          <section className="border-t py-10 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <FrequentlyBoughtTogether
                sourceProduct={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  polarProductId: product.polarProductId,
                  images: product.images?.map((img) => ({
                    image: img.image ? { url: img.image.url ?? undefined } : null,
                    alt: img.alt,
                  })),
                }}
                relatedProducts={frequentlyBoughtTogether}
                limit={3}
              />
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t py-10 lg:py-12" aria-labelledby="related-products">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 id="related-products" className="text-foreground mb-6 text-lg font-semibold">
                Pairs Well With
              </h2>
              <ProductGrid products={relatedProducts} columns={4} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
