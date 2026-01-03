import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  MicroscopeIcon,
  ChartLineData01Icon,
  Rocket01Icon,
  PaintBrush01Icon,
  Settings01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CategoryCardData } from "@/types/storefront";

interface CategoryCardProps {
  category: CategoryCardData;
  className?: string;
}

// Icon mapping
const categoryIcons: Record<string, IconSvgElement> = {
  Microscope: MicroscopeIcon,
  ChartLine: ChartLineData01Icon,
  Sparkles: Rocket01Icon,
  Palette: PaintBrush01Icon,
  Workflow: Settings01Icon,
};

export function CategoryCard({ category, className }: CategoryCardProps) {
  const iconElement = categoryIcons[category.icon] ?? Settings01Icon;
  const hasImage = !!category.image;

  return (
    <Link href={`/categories/${category.slug}`} className={cn("group block", className)}>
      <Card className="hover:border-primary/50 relative h-full overflow-hidden border transition-all duration-300 hover:shadow-lg">
        {/* Background Image or Gradient */}
        {hasImage ? (
          <div className="absolute inset-0">
            <Image
              src={category.image!}
              alt={category.title}
              fill
              className="object-cover opacity-20 transition-opacity group-hover:opacity-30"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
            <div className="from-background via-background/80 to-background/40 absolute inset-0 bg-gradient-to-t" />
          </div>
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity group-hover:opacity-10",
              category.gradient
            )}
          />
        )}

        <div className="relative p-6">
          {/* Icon */}
          <div
            className={cn(
              "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white",
              category.gradient
            )}
          >
            <HugeiconsIcon icon={iconElement} size={24} />
          </div>

          {/* Title */}
          <h3 className="text-foreground mb-2 text-lg font-semibold transition-colors">
            {category.title}
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
              {category.description}
            </p>
          )}

          {/* Product Count & CTA */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {category.productCount} {category.productCount === 1 ? "product" : "products"}
            </span>
            <span className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
              Browse
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
