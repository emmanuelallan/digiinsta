import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import {
  getCategoryBySlug,
  getProductsGroupedBySubcategory,
  getRelatedCategories,
  getCategories,
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
import { generateCategoryJsonLd, generateBreadcrumbJsonLd, SITE_URL } from "@/lib/seo/jsonld";
import { generateCategoryMeta } from "@/lib/seo/meta";
import { COLLECTION_TAGS } from "@/lib/revalidation/tags";

// ISR revalidation: 5 minutes for category pages (reduced for fresher data)
export const revalidate = 300;

/**
 * Generate static params for all active categories
 * Pre-renders category pages at build time for better performance
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug.current,
  }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Cached category data fetching with tag-based invalidation
 * Tags include: category slug for on-demand revalidation
 * Validates: Requirements 2.4
 */
const getCachedCategory = (slug: string) =>
  unstable_cache(
    async () => {
      const category = await getCategoryBySlug(slug);
      return category;
    },
    [`category-${slug}`],
    {
      revalidate: 300, // 5 minute fallback - reduced for fresher data
      tags: [`category:${slug}`, COLLECTION_TAGS.allCategories],
    }
  )();

/**
 * Cached products grouped by subcategory with category tag
 */
const getCachedProductsGroupedBySubcategory = (categorySlug: string) =>
  unstable_cache(
    async () => {
      return getProductsGroupedBySubcategory(categorySlug, 12);
    },
    [`products-by-subcategory-${categorySlug}`],
    {
      revalidate: 300, // 5 minute fallback - reduced for fresher data
      tags: [`category:${categorySlug}`, COLLECTION_TAGS.allProducts],
    }
  )();

/**
 * Cached related categories
 */
const getCachedRelatedCategories = (categoryId: string) =>
  unstable_cache(
    async () => {
      return getRelatedCategories(categoryId, 4);
    },
    [`related-categories-${categoryId}`],
    {
      revalidate: 300, // 5 minute fallback - reduced for fresher data
      tags: [COLLECTION_TAGS.allCategories],
    }
  )();

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
  const category = await getCachedCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return generateCategoryMeta({
    title: category.title,
    slug: category.slug.current,
    description: category.description,
    metaTitle: category.metaTitle,
    metaDescription: category.metaDescription,
    image: category.image,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCachedCategory(slug);

  if (!category) {
    notFound();
  }

  // Get products grouped by subcategory (with cache tags)
  const groupedProducts = await getCachedProductsGroupedBySubcategory(slug);

  // Get related categories for internal linking (with cache tags)
  const relatedCategoriesData = await getCachedRelatedCategories(category._id);

  // Calculate total product count
  const totalProducts = groupedProducts.reduce((sum, group) => sum + group.totalProducts, 0);

  // Structured data - JSON-LD
  const categorySchema = generateCategoryJsonLd({
    title: category.title,
    slug: category.slug.current,
    description: category.description,
    image: category.image,
    productCount: totalProducts,
  });

  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Categories", url: `${SITE_URL}/categories` },
    { name: category.title, url: `${SITE_URL}/categories/${category.slug.current}` },
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
                  <div key={group.subcategory._id}>
                    {/* Subcategory Header */}
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="text-foreground text-xl font-bold sm:text-2xl">
                          {group.subcategory.title}
                        </h2>
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
