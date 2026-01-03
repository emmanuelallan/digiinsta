import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GraduationCap,
  Briefcase01Icon,
  FavouriteIcon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { getProductsByPersona, getProductsByCategory } from "@/lib/storefront";
import { ProductGrid } from "@/components/storefront/product";
import { NoProductsFound } from "@/components/storefront/shared";
import { PERSONAS, MAIN_CATEGORIES } from "@/types/storefront";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ShopByPersonaPageProps {
  params: Promise<{ persona: string }>;
}

const personaIcons: Record<string, IconSvgElement> = {
  student: GraduationCap,
  professional: Briefcase01Icon,
  couple: FavouriteIcon,
};

export async function generateMetadata({ params }: ShopByPersonaPageProps): Promise<Metadata> {
  const { persona: personaSlug } = await params;
  const persona = PERSONAS.find((p) => p.slug === personaSlug);

  if (!persona) {
    return {
      title: "Shop Not Found",
    };
  }

  return {
    title: `Shop for ${persona.title}`,
    description: persona.description,
  };
}

export default async function ShopByPersonaPage({ params }: ShopByPersonaPageProps) {
  const { persona: personaSlug } = await params;
  const persona = PERSONAS.find((p) => p.slug === personaSlug);

  if (!persona) {
    notFound();
  }

  // Get products for each category in this persona
  const categoryProducts = await Promise.all(
    persona.categories.map(async (categorySlug) => {
      const products = await getProductsByCategory(categorySlug, 4);
      const categoryInfo = MAIN_CATEGORIES.find((c) => c.slug === categorySlug);
      return {
        slug: categorySlug,
        title: categoryInfo?.title ?? categorySlug,
        description: categoryInfo?.description,
        gradient: categoryInfo?.gradient ?? "from-gray-500 to-gray-600",
        products,
      };
    })
  );

  // Get all products for this persona
  const allProducts = await getProductsByPersona(persona.categories, 50);
  const iconElement = personaIcons[persona.id] ?? GraduationCap;

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
                <BreadcrumbLink asChild>
                  <Link href="/#shop-by-persona">Shop by Persona</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{persona.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${persona.gradient} py-16 lg:py-24`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:gap-12 lg:text-left">
            {/* Icon */}
            <div className="mb-6 flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm lg:mb-0 lg:h-32 lg:w-32">
              <HugeiconsIcon icon={iconElement} size={48} className="text-white lg:hidden" />
              <HugeiconsIcon icon={iconElement} size={64} className="hidden text-white lg:block" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium tracking-wider text-white/80 uppercase">
                {persona.tagline}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {persona.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/90 sm:text-xl">
                {persona.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                  {allProducts.length} products curated for you
                </span>
                {persona.categories.map((catSlug) => {
                  const cat = MAIN_CATEGORIES.find((c) => c.slug === catSlug);
                  return cat ? (
                    <span
                      key={catSlug}
                      className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm text-white/80"
                    >
                      {cat.title}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      {categoryProducts.map(
        (category) =>
          category.products.length > 0 && (
            <section key={category.slug} className="border-b py-12 last:border-b-0 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Category Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                      {category.title}
                    </h2>
                    {category.description && (
                      <p className="text-muted-foreground mt-2">{category.description}</p>
                    )}
                  </div>
                  <Button variant="outline" asChild className="shrink-0">
                    <Link href={`/categories/${category.slug}`}>
                      View all
                      <HugeiconsIcon icon={ArrowRight02Icon} className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Products Grid */}
                <ProductGrid products={category.products} columns={4} />
              </div>
            </section>
          )
      )}

      {/* All Products Section */}
      {allProducts.length > 0 && (
        <section className="bg-muted/30 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                All Products for {persona.title}
              </h2>
              <p className="text-muted-foreground mt-2">
                Browse our complete collection curated just for you
              </p>
            </div>

            <ProductGrid products={allProducts} columns={4} />
          </div>
        </section>
      )}

      {/* Empty State */}
      {allProducts.length === 0 && (
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <NoProductsFound />
          </div>
        </section>
      )}

      {/* Other Personas CTA */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-foreground text-xl font-semibold">
              Not quite right? Try another persona
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {PERSONAS.filter((p) => p.id !== persona.id).map((otherPersona) => {
              const otherIcon = personaIcons[otherPersona.id] ?? GraduationCap;
              return (
                <Link
                  key={otherPersona.id}
                  href={`/shop/${otherPersona.slug}`}
                  className="group bg-card hover:border-primary flex items-center gap-3 rounded-xl border px-5 py-3 transition-all hover:shadow-md"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${otherPersona.gradient} text-white`}
                  >
                    <HugeiconsIcon icon={otherIcon} size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-foreground group-hover:text-primary font-medium transition-colors">
                      {otherPersona.title}
                    </p>
                    <p className="text-muted-foreground text-xs">{otherPersona.tagline}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
