import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug, getRelatedProducts } from "@/lib/storefront";
import { ProductImageGallery, ProductGrid } from "@/components/storefront/product";
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
import { RichText } from "@/components/storefront/shared";

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

  return {
    title: product.title,
    description: product.shortDescription ?? `Get ${product.title} at DigiInsta`,
    openGraph: {
      title: product.title,
      description: product.shortDescription ?? undefined,
      images: product.images?.[0]?.image?.url ? [product.images[0].image.url] : undefined,
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

  return (
    <div className="bg-background">
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
                <BreadcrumbPage className="max-w-[200px] truncate">{product.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Product Details - 4/6 images, 2/6 info */}
      <section className="py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-y-8 xl:grid-cols-6 xl:gap-x-8 xl:gap-y-4">
            {/* Left: Image Gallery - 4/6 width */}
            <div className="flex justify-center xl:col-span-4 xl:row-span-3 xl:justify-start">
              <ProductImageGallery images={product.images} title={product.title} />
            </div>

            {/* Right: Product Info - 2/6 width */}
            <div className="xl:col-span-2">
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
            </div>
          </div>
        </div>
      </section>

      {/* Product Description & Feature Badges */}
      {product.description && (
        <section className="border-t py-10 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
              {/* Left: Description */}
              <div className="flex-1">
                <h2 className="text-foreground mb-5 text-lg font-semibold">About this product</h2>
                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                  <RichText content={product.description} />
                </div>
              </div>

              {/* Right: Feature Badges */}
              <div className="flex-shrink-0 lg:w-72">
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
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t py-10 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-foreground mb-6 text-lg font-semibold">Pairs Well With</h2>
            <ProductGrid products={relatedProducts} columns={4} />
          </div>
        </section>
      )}
    </div>
  );
}
