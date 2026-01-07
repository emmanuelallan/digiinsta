import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StorefrontCategory } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface RelatedCategoriesProps {
  /** Current category (optional, for context) */
  currentCategory?: StorefrontCategory | null;
  /** Sibling/related categories to display */
  siblingCategories: StorefrontCategory[];
  /** Maximum categories to show (default: 4) */
  limit?: number;
  /** Section title */
  title?: string;
  /** Custom class name */
  className?: string;
  /** Display variant */
  variant?: "cards" | "compact";
}

export function RelatedCategories({
  siblingCategories,
  limit = 4,
  title = "Explore More Categories",
  className,
  variant = "cards",
}: RelatedCategoriesProps) {
  // Limit categories
  const displayCategories = siblingCategories.slice(0, limit);

  // Don't render if no categories
  if (displayCategories.length === 0) {
    return null;
  }

  if (variant === "compact") {
    return (
      <section className={cn("py-6", className)} aria-labelledby="related-categories">
        <h2 id="related-categories" className="text-foreground mb-4 text-base font-semibold">
          {title}
        </h2>
        <div className="flex flex-wrap gap-2">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="bg-muted hover:bg-muted/80 text-foreground inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              {category.image?.url && (
                <Image
                  src={category.image.url}
                  alt={category.title}
                  width={20}
                  height={20}
                  className="rounded-full object-cover"
                />
              )}
              {category.title}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Default cards variant
  return (
    <section className={cn("py-8", className)} aria-labelledby="related-categories">
      <div className="mb-6 flex items-center justify-between">
        <h2 id="related-categories" className="text-foreground text-lg font-semibold">
          {title}
        </h2>
        <Link
          href="/categories"
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative overflow-hidden rounded-xl"
          >
            {/* Background Image or Gradient */}
            <div className="bg-muted relative aspect-[4/3]">
              {category.image?.url ? (
                <Image
                  src={category.image.url}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="from-primary/20 to-primary/5 absolute inset-0 bg-gradient-to-br" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                {category.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/80">{category.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
