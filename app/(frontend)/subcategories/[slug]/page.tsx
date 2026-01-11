import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSubcategoryBySlug, getProducts, getSubcategories } from "@/lib/storefront";
import { ProductGrid } from "@/components/storefront/product";
import { NoProductsFound } from "@/components/storefront/shared";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateCategoryJsonLd, generateBreadcrumbJsonLd, SITE_URL } from "@/lib/seo/jsonld";
import { generateSubcategoryMeta } from "@/lib/seo/meta";

// ISR revalidation: 24 hours for subcategory pages
export const revalidate = 86400;

/**
 * Generate static params for all active subcategories
 * Pre-renders subcategory pages at build time for better performance
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const subcategories = await getSubcategories();
  return subcategories.map((subcategory) => ({
    slug: subcategory.slug.current,
  }));
}

interface SubcategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
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

const PRODUCTS_PER_PAGE = 12;

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const subcategory = await getSubcategoryBySlug(slug);

  if (!subcategory) {
    return {
      title: "Subcategory Not Found",
    };
  }

  return generateSubcategoryMeta({
    title: subcategory.title,
    slug: subcategory.slug.current,
    description: subcategory.description,
    metaTitle: subcategory.metaTitle,
    metaDescription: subcategory.metaDescription,
    category: subcategory.category
      ? {
          title: subcategory.category.title,
          slug: subcategory.category.slug.current,
        }
      : null,
  });
}

function generatePaginationItems(currentPage: number, totalPages: number) {
  const items: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    items.push(1);

    if (currentPage > 3) {
      items.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (currentPage < totalPages - 2) {
      items.push("ellipsis");
    }

    items.push(totalPages);
  }

  return items;
}

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));

  const subcategory = await getSubcategoryBySlug(slug);

  if (!subcategory) {
    notFound();
  }

  const { products, totalDocs, totalPages } = await getProducts({
    subcategorySlug: slug,
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
  });

  const paginationItems = generatePaginationItems(currentPage, totalPages);

  // Structured data - JSON-LD
  const subcategorySchema = generateCategoryJsonLd({
    title: subcategory.title,
    slug: subcategory.slug.current,
    description: subcategory.description,
    productCount: totalDocs,
  });

  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Categories", url: `${SITE_URL}/categories` },
    {
      name: subcategory.category.title,
      url: `${SITE_URL}/categories/${subcategory.category.slug.current}`,
    },
    { name: subcategory.title, url: `${SITE_URL}/subcategories/${subcategory.slug.current}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(subcategorySchema) }}
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
                  <BreadcrumbLink asChild>
                    <Link href={`/categories/${subcategory.category.slug.current}`}>
                      {subcategory.category.title}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{subcategory.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Header Content */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              {/* Left: Subcategory Info */}
              <div className="max-w-xl">
                <p className="text-primary mb-2 text-sm font-medium">
                  {subcategory.category.title}
                </p>
                <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                  {subcategory.title}
                </h1>
                {subcategory.description && (
                  <p className="text-muted-foreground mt-4 text-base">{subcategory.description}</p>
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
            {products.length === 0 ? (
              <NoProductsFound />
            ) : (
              <>
                {/* Products Count */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-
                    {Math.min(currentPage * PRODUCTS_PER_PAGE, totalDocs)} of {totalDocs}{" "}
                    {totalDocs === 1 ? "product" : "products"}
                  </p>
                </div>

                {/* Products Grid */}
                <ProductGrid products={products} columns={4} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination>
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious
                              href={`/subcategories/${slug}?page=${currentPage - 1}`}
                            />
                          </PaginationItem>
                        )}

                        {paginationItems.map((item, index) =>
                          item === "ellipsis" ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={item}>
                              <PaginationLink
                                href={`/subcategories/${slug}?page=${item}`}
                                isActive={item === currentPage}
                              >
                                {item}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        )}

                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationNext
                              href={`/subcategories/${slug}?page=${currentPage + 1}`}
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
