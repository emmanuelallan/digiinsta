import { SectionHeader } from "../shared/SectionHeader";
import { CategoryCard } from "./CategoryCard";
import { getCategoriesWithCounts } from "@/lib/storefront";
import { MAIN_CATEGORIES, type CategoryCardData } from "@/types/storefront";

interface CategoryShowcaseProps {
  className?: string;
}

// Default gradients for categories without a match
const defaultGradients = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-green-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-violet-500",
];

// Default icons for categories without a match
const defaultIcons = [
  "Microscope",
  "ChartLine",
  "Sparkles",
  "Palette",
  "Workflow",
];

export async function CategoryShowcase({ className }: CategoryShowcaseProps) {
  // Fetch categories with product counts from database
  const categories = await getCategoriesWithCounts();

  // Map database categories to card data
  const categoryCards: CategoryCardData[] = categories.map((cat, index) => {
    // Try to find matching predefined category for fallback values
    const predefined = MAIN_CATEGORIES.find(
      (m) =>
        m.slug === cat.slug ||
        m.title.toLowerCase() === cat.title.toLowerCase(),
    );

    return {
      id: String(cat.id),
      title: cat.title,
      slug: cat.slug,
      description: cat.description ?? predefined?.description ?? "",
      icon:
        cat.icon ??
        predefined?.icon ??
        defaultIcons[index % defaultIcons.length] ??
        "Folder",
      productCount: cat.productCount ?? 0,
      image: cat.image?.url ?? undefined,
      gradient:
        cat.gradient ??
        predefined?.gradient ??
        defaultGradients[index % defaultGradients.length] ??
        "from-gray-500 to-gray-600",
    };
  });

  // If no categories in database, show nothing
  if (categoryCards.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Shop by Category"
          subtitle="Explore our curated collections"
          viewAllHref="/categories"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categoryCards.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
