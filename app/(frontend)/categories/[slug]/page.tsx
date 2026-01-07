import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  getCategoryBySlug,
  getProductsGroupedBySubcategory,
  getRelatedCategories,
} from "@/lib/storefront";
import { ProductGrid } from "@/components/storefront/product";
import { NoProductsFound, RelatedCategories } from "@/components/storefront/shared";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCategorySchema, getBreadcrumbSchema, SITE_URL, SITE_NAME } from "@/lib/seo";

// ISR revalidation: 24 hours for category pages
export const revalidate = 86400;

/**
 * Generate static params for all active categories
 * Pre-renders category pages at build time for better performance
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "categories",
    where: { status: { equals: "active" } },
    limit: 100,
    depth: 0,
    select: { slug: true },
  });

  return result.docs.map((category) => ({
    slug: category.slug,
  }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const description =
    category.description ??
    `Browse ${category.title} products at ${SITE_NAME}. Premium digital templates and tools.`;
  const imageUrl = category.image?.url;

  return {
    title: category.title,
    description,
    alternates: {
      canonical: `${SITE_URL}/categories/${slug}`,
    },
    openGraph: {
      title: `${category.title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/categories/${slug}`,
      type: "website",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: category.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.title} | ${SITE_NAME}`,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const groupedProducts = await getProductsGroupedBySubcategory(slug, 12);

  // Get related categories for internal linking
  const relatedCategoriesData = await getRelatedCategories(category.id, 4);

  // Calculate total product count
  const totalProducts = groupedProducts.reduce((sum, group) => sum + group.totalProducts, 0);

  // Structured data
  const categorySchema = getCategorySchema({
    title: category.title,
    slug: category.slug,
    description: category.description,
    image: category.image,
    productCount: totalProducts,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Categories", url: `${SITE_URL}/categories` },
    { name: category.title, url: `${SITE_URL}/categories/${category.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-background">
        {/* Hero Header */}
        <section className="bg-muted/30 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/categories">Categories</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{category.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Header Content */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              {/* Left: Category Info */}
              <div className="max-w-xl">
                <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                  {category.title}
                </h1>
                {category.description && (
                  <p className="text-muted-foreground mt-4 text-base">{category.description}</p>
                )}
              </div>

              {/* Right: Feature Badges */}
              <div className="flex flex-wrap gap-6 lg:gap-8">
                {featureBadges.map((badge, index) => (
                  <div key={index} className="flex min-w-[70px] flex-col items-center text-center">
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
        </section>

        {/* Products Section */}
        <section className="py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {groupedProducts.length === 0 ? (
              <NoProductsFound />
            ) : (
              <div className="space-y-16">
                {groupedProducts.map((group) => (
                  <div key={group.subcategory.id}>
                    {/* Subcategory Header */}
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="text-foreground text-xl font-bold sm:text-2xl">
                          {group.subcategory.title}
                        </h2>
                        {group.subcategory.description && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {group.subcategory.description}
                          </p>
                        )}
                      </div>
                      {group.totalProducts > 12 && (
                        <Link href={`/subcategories/${group.subcategory.slug}`}>
                          <Button variant="outline" size="sm">
                            View all {group.subcategory.title} →
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Products Grid */}
                    <ProductGrid products={group.products} columns={4} />

                    {/* View More Button (mobile) */}
                    {group.totalProducts > 12 && (
                      <div className="mt-6 text-center lg:hidden">
                        <Link href={`/subcategories/${group.subcategory.slug}`}>
                          <Button variant="outline">
                            View all {group.totalProducts} products →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Related Categories */}
        {relatedCategoriesData.siblings.length > 0 && (
          <section className="border-t py-10 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <RelatedCategories
                siblingCategories={relatedCategoriesData.siblings}
                limit={4}
                title="Explore More Categories"
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
