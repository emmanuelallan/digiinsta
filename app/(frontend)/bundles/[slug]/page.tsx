import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PackageIcon,
  CheckmarkCircle01Icon,
  Download01Icon,
  InfinityCircleIcon,
  RefreshIcon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { getBundleBySlug, getBundles } from "@/lib/storefront";
import { ProductGrid } from "@/components/storefront/product";
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
import { BundleActions } from "@/components/storefront/bundle/BundleActions";
import { getBundleSchema, getBreadcrumbSchema, SITE_URL, SITE_NAME } from "@/lib/seo";
import { urlFor } from "@/lib/sanity/image";
import type { StorefrontProduct } from "@/types/storefront";

// ISR revalidation: 1 hour for bundle pages
export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const { bundles } = await getBundles();
  return bundles.map((bundle) => ({
    slug: bundle.slug.current,
  }));
}

const bundleFeatures = [
  {
    icon: Download01Icon,
    title: "Instant Download",
    description: "Get all products immediately after purchase",
  },
  {
    icon: InfinityCircleIcon,
    title: "Lifetime Access",
    description: "Access your products forever, no subscriptions",
  },
  {
    icon: RefreshIcon,
    title: "Free Updates",
    description: "Receive all future updates at no extra cost",
  },
  {
    icon: SecurityCheckIcon,
    title: "Secure Checkout",
    description: "Your payment is protected and encrypted",
  },
];

interface BundlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);

  if (!bundle) {
    return { title: "Bundle Not Found" };
  }

  const description =
    bundle.shortDescription ??
    `Get the ${bundle.title} bundle at ${SITE_NAME}. Save more with our curated product bundles.`;
  const imageUrl = bundle.heroImage
    ? urlFor(bundle.heroImage).width(1200).height(630).url()
    : undefined;
  const price = bundle.price ? `${(bundle.price / 100).toFixed(2)}` : "";

  return {
    title: `${bundle.title} | Bundle`,
    description,
    alternates: { canonical: `${SITE_URL}/bundles/${slug}` },
    openGraph: {
      title: `${bundle.title} ${price ? `- ${price}` : ""} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/bundles/${slug}`,
      type: "website",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: bundle.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${bundle.title} ${price ? `- ${price}` : ""} | ${SITE_NAME}`,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BundlePage({ params }: BundlePageProps) {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);

  if (!bundle) {
    notFound();
  }

  const heroImageUrl = bundle.heroImage
    ? urlFor(bundle.heroImage).width(800).height(600).url()
    : undefined;
  const productCount = bundle.products?.length ?? 0;
  const hasDiscount = bundle.compareAtPrice && bundle.price && bundle.compareAtPrice > bundle.price;
  const savingsAmount = hasDiscount ? bundle.compareAtPrice! - bundle.price! : 0;
  const savingsPercent = hasDiscount
    ? Math.round((savingsAmount / bundle.compareAtPrice!) * 100)
    : 0;

  const bundleSchema = getBundleSchema({
    title: bundle.title,
    slug: bundle.slug.current,
    shortDescription: bundle.shortDescription,
    price: bundle.price,
    compareAtPrice: bundle.compareAtPrice,
    heroImage: bundle.heroImage ? { url: heroImageUrl } : undefined,
    products: bundle.products?.map((p) => ({
      title: p.title,
      slug: p.slug.current,
      price: p.resolvedPrice.price,
    })),
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Bundles", url: `${SITE_URL}/bundles` },
    { name: bundle.title, url: `${SITE_URL}/bundles/${bundle.slug.current}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bundleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-background min-h-screen">
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
                    <Link href="/bundles">Bundles</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">{bundle.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <section className="py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="relative">
                <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-2xl">
                  {heroImageUrl ? (
                    <Image
                      src={heroImageUrl}
                      alt={bundle.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="from-primary/10 to-primary/5 flex h-full items-center justify-center bg-gradient-to-br">
                      <HugeiconsIcon
                        icon={PackageIcon}
                        size={80}
                        className="text-muted-foreground/30"
                      />
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-600">
                        Save {savingsPercent}%
                      </Badge>
                    </div>
                  )}
                </div>
                {bundle.products && bundle.products.length > 0 && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {bundle.products.slice(0, 5).map((product, idx) => {
                        const productImage = product.images?.[0]
                          ? urlFor(product.images[0]).width(48).height(48).url()
                          : undefined;
                        return (
                          <div
                            key={product._id}
                            className="border-background bg-muted relative h-12 w-12 overflow-hidden rounded-lg border-2 shadow-sm"
                            style={{ zIndex: 5 - idx }}
                          >
                            {productImage ? (
                              <Image
                                src={productImage}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center text-sm font-medium">
                                {product.title.charAt(0)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {bundle.products.length > 5 && (
                        <div className="border-background bg-muted text-muted-foreground relative flex h-12 w-12 items-center justify-center rounded-lg border-2 text-sm font-medium shadow-sm">
                          +{bundle.products.length - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {productCount} {productCount === 1 ? "product" : "products"} included
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <Badge variant="secondary" className="mb-4 w-fit">
                  <HugeiconsIcon icon={PackageIcon} size={14} className="mr-1.5" />
                  Bundle Deal
                </Badge>
                <h1 className="text-foreground text-3xl font-bold tracking-tight lg:text-4xl">
                  {bundle.title}
                </h1>
                {bundle.shortDescription && (
                  <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                    {bundle.shortDescription}
                  </p>
                )}
                <div className="mt-6">
                  <BundleActions
                    bundle={{
                      id: bundle._id,
                      title: bundle.title,
                      price: bundle.price,
                      compareAtPrice: bundle.compareAtPrice,
                      polarProductId: bundle.polarProductId,
                      heroImageUrl,
                      productCount,
                    }}
                  />
                </div>
                <div className="bg-muted/30 mt-8 rounded-xl border p-5">
                  <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
                    What&apos;s Included
                  </h3>
                  <ul className="space-y-2">
                    {bundle.products?.slice(0, 4).map((product) => (
                      <li key={product._id} className="flex items-center gap-2 text-sm">
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          size={16}
                          className="shrink-0 text-green-500"
                        />
                        <span className="text-foreground truncate">{product.title}</span>
                      </li>
                    ))}
                    {bundle.products && bundle.products.length > 4 && (
                      <li className="text-muted-foreground pl-6 text-sm">
                        + {bundle.products.length - 4} more products
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 border-y py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {bundleFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <HugeiconsIcon icon={feature.icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-foreground text-sm font-semibold">{feature.title}</h4>
                    <p className="text-muted-foreground text-xs">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {bundle.description && (
          <section className="py-10 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-foreground mb-6 text-2xl font-bold">About This Bundle</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <RichText content={bundle.description} />
                </div>
              </div>
            </div>
          </section>
        )}

        {bundle.products && bundle.products.length > 0 && (
          <section className="border-t py-10 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-foreground text-2xl font-bold">
                    All {productCount} Products Included
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Everything you get when you purchase this bundle
                  </p>
                </div>
                {hasDiscount && (
                  <div className="hidden text-right sm:block">
                    <p className="text-muted-foreground text-sm">Bundle savings</p>
                    <p className="text-lg font-bold text-green-600">
                      ${(savingsAmount / 100).toFixed(2)} off
                    </p>
                  </div>
                )}
              </div>
              <ProductGrid
                products={bundle.products.map(
                  (p): StorefrontProduct => ({
                    _id: p._id,
                    _createdAt: p._createdAt,
                    title: p.title,
                    shortDescription: p.shortDescription,
                    images: p.images,
                    status: p.status,
                    tags: p.tags,
                    customPrice: p.customPrice,
                    compareAtPrice: p.compareAtPrice,
                    polarProductId: p.polarProductId,
                    subcategory: p.subcategory,
                    creator: p.creator
                      ? { _id: p.creator._id, name: p.creator.name, slug: p.creator.slug }
                      : undefined,
                    resolvedPrice: p.resolvedPrice,
                    id: p._id,
                    slug: p.slug.current,
                    price: p.resolvedPrice.price,
                    createdAt: p._createdAt,
                  })
                )}
                columns={4}
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
