import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getCategoriesWithCounts } from "@/lib/storefront";
import { ProductGrid } from "@/components/storefront/product";
import { NoProductsFound } from "@/components/storefront/shared";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse all premium digital products, templates, and tools at DigiInsta.",
};

interface ProductsPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const categorySlug = params.category;

  const { products, totalDocs, totalPages } = await getProducts({
    page: currentPage,
    limit: 12,
    categorySlug,
    sort: "-createdAt",
  });

  const categories = await getCategoriesWithCounts();

  return (
    <div className="bg-background min-h-screen">
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
                <BreadcrumbPage>All Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Page Header */}
      <section className="bg-muted/30 py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              All Products
            </h1>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg">
              Discover our complete collection of premium digital products and templates
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {totalDocs} {totalDocs === 1 ? "product" : "products"} available
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* Sidebar - Categories Filter */}
            <aside className="flex-shrink-0 lg:w-56">
              <div className="lg:sticky lg:top-24">
                <h2 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                  Categories
                </h2>
                <nav className="space-y-1">
                  <Link
                    href="/products"
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      !categorySlug
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    All Products
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.slug}`}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        categorySlug === category.slug
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {category.title}
                      <span className="text-muted-foreground/60 ml-2 text-xs">
                        ({category.productCount ?? 0})
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {products.length === 0 ? (
                <NoProductsFound />
              ) : (
                <>
                  <ProductGrid products={products} columns={3} />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious
                                href={`/products?page=${currentPage - 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
                              />
                            </PaginationItem>
                          )}

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              // Show first, last, current, and adjacent pages
                              return (
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                              );
                            })
                            .map((page, index, array) => {
                              // Add ellipsis if there's a gap
                              const prevPage = array[index - 1];
                              const showEllipsisBefore =
                                index > 0 && prevPage !== undefined && page - prevPage > 1;

                              return (
                                <span key={page} className="flex items-center">
                                  {showEllipsisBefore && (
                                    <PaginationItem>
                                      <span className="text-muted-foreground px-2">...</span>
                                    </PaginationItem>
                                  )}
                                  <PaginationItem>
                                    <PaginationLink
                                      href={`/products?page=${page}${categorySlug ? `&category=${categorySlug}` : ""}`}
                                      isActive={page === currentPage}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                </span>
                              );
                            })}

                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext
                                href={`/products?page=${currentPage + 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
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
          </div>
        </div>
      </section>
    </div>
  );
}
