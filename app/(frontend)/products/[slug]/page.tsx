import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import {
  getProductBySlug,
  getRelatedProducts,
  getFrequentlyBoughtTogether,
  getProducts,
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
import { generateProductJsonLd, generateBreadcrumbJsonLd, SITE_URL } from "@/lib/seo/jsonld";
import { generateProductMeta } from "@/lib/seo/meta";
import { COLLECTION_TAGS } from "@/lib/revalidation/tags";
import { urlFor } from "@/lib/sanity/image";

// ISR revalidation: 1 hour for product pages (fallback)
export const revalidate = 3600;

/**
 * Generate static params for all active products
 * Pre-renders product pages at build time for better performance
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const { products } = await getProducts({ limit: 1000 });
  return products.map((product) => ({
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

/**
 * Cached product data fetching with tag-based invalidation
 * Tags include: product slug and collection tags for on-demand revalidation
 * Validates: Requirements 3.5
 */
const getCachedProduct = (slug: string) =>
  unstable_cache(
    async () => {
      const product = await getProductBySlug(slug);
      return product;
    },
    [`product-${slug}`],
    {
      revalidate: 3600, // 1 hour fallback
      tags: [`product:${slug}`, COLLECTION_TAGS.allProducts],
    }
  )();

/**
 * Cached related products fetching with subcategory tag
 */
const getCachedRelatedProducts = (
  productId: string,
  subcategoryId: string,
  tags: string[],
  subcategorySlug: string
) =>
  unstable_cache(
    async () => {
      return getRelatedProducts(productId, subcategoryId, tags, 4);
    },
    [`related-products-${productId}`],
    {
      revalidate: 3600,
      tags: [`subcategory:${subcategorySlug}`, COLLECTION_TAGS.allProducts],
    }
  )();

/**
 * Cached frequently bought together products
 */
const getCachedFrequentlyBoughtTogether = (productId: string) =>
  unstable_cache(
    async () => {
      return getFrequentlyBoughtTogether(productId, 3);
    },
    [`fbt-${productId}`],
    {
      revalidate: 3600,
      tags: [COLLECTION_TAGS.allProducts],
    }
  )();

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return generateProductMeta({
    title: product.title,
    slug: product.slug.current,
    shortDescription: product.shortDescription,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    images: product.images,
    price: product.resolvedPrice.price,
    compareAtPrice: product.resolvedPrice.compareAtPrice,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) {
    notFound();
  }

  // Get related products from the same subcategory (with cache tags)
  const relatedProducts = await getCachedRelatedProducts(
    product._id,
    product.subcategory._id,
    product.tags ?? [],
    product.subcategory.slug.current
  );

  // Get frequently bought together products (with cache tags)
  const frequentlyBoughtTogether = await getCachedFrequentlyBoughtTogether(product._id);

  // Structured data - JSON-LD
  const productSchema = generateProductJsonLd({
    title: product.title,
    slug: product.slug.current,
    shortDescription: product.shortDescription,
    images: product.images,
    price: product.resolvedPrice.price,
    compareAtPrice: product.resolvedPrice.compareAtPrice,
    category: product.subcategory.category?.title,
  });

  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    {
      name: product.subcategory.category.title,
      url: `${SITE_URL}/categories/${product.subcategory.category.slug.current}`,
    },
    {
      name: product.subcategory.title,
      url: `${SITE_URL}/subcategories/${product.subcategory.slug.current}`,
    },
    { name: product.title, url: `${SITE_URL}/products/${product.slug.current}` },
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
                    <Link href={`/categories/${product.subcategory.category.slug.current}`}>
                      {product.subcategory.category.title}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/subcategories/${product.subcategory.slug.current}`}>
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
                    id: product._id,
                    title: product.title,
                    price: product.resolvedPrice.price,
                    compareAtPrice: product.resolvedPrice.compareAtPrice,
                    polarProductId: product.polarProductId,
                    images: product.images?.map((img) => ({
                      image: img ? { url: urlFor(img).width(200).url() } : null,
                      alt: product.title,
                    })),
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
                        id: product._id,
                        title: product.title,
                        price: product.resolvedPrice.price,
                        compareAtPrice: product.resolvedPrice.compareAtPrice,
                        polarProductId: product.polarProductId,
                        images: product.images?.map((img) => ({
                          image: img ? { url: urlFor(img).width(200).url() } : null,
                          alt: product.title,
                        })),
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
                          {product.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
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
        {frequentlyBoughtTogether.length > 0 &&
          product.polarProductId &&
          product.resolvedPrice.price && (
            <section className="border-t py-10 lg:py-12">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <FrequentlyBoughtTogether
                  sourceProduct={{
                    id: product._id,
                    title: product.title,
                    price: product.resolvedPrice.price,
                    compareAtPrice: product.resolvedPrice.compareAtPrice,
                    polarProductId: product.polarProductId,
                    images: product.images?.map((img) => ({
                      image: img ? { url: urlFor(img).width(200).url() } : null,
                      alt: product.title,
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
