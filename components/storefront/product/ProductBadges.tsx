"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Flame, Sparkles, Tag, Clock } from "lucide-react";
import { SaleCountdown } from "./SaleCountdown";

/**
 * Badge type definitions
 */
export type BadgeType = "new" | "sale" | "popular" | "limited";

interface ProductBadgeInfo {
  type: BadgeType;
  label: string;
  icon?: React.ReactNode;
  className: string;
}

interface ProductBadgesProps {
  product: {
    createdAt: string;
    compareAtPrice?: number | null;
    price: number;
    salesCount?: number;
    saleEndDate?: string | Date | null;
  };
  /** Threshold for "Popular" badge (default: 10) */
  popularThreshold?: number;
  /** Days to consider product as "New" (default: 14) */
  newDaysThreshold?: number;
  /** Show countdown timer for sales with end dates */
  showCountdown?: boolean;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Additional class name */
  className?: string;
  /** Maximum number of badges to show */
  maxBadges?: number;
}

/**
 * Determine if a product is new (created within threshold days)
 */
export function isNewProduct(createdAt: string, daysThreshold: number = 14): boolean {
  const createdTime = new Date(createdAt).getTime();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
  const now = Date.now();
  return createdTime > now - thresholdMs;
}

/**
 * Determine if a product is on sale
 */
export function isOnSale(price: number, compareAtPrice?: number | null): boolean {
  return !!compareAtPrice && compareAtPrice > price;
}

/**
 * Determine if a product is popular (meets sales threshold)
 */
export function isPopular(salesCount?: number, threshold: number = 10): boolean {
  return !!salesCount && salesCount >= threshold;
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercent(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Determine all applicable badges for a product
 */
export function determineBadges(
  product: ProductBadgesProps["product"],
  options: {
    popularThreshold?: number;
    newDaysThreshold?: number;
  } = {}
): BadgeType[] {
  const { popularThreshold = 10, newDaysThreshold = 14 } = options;
  const badges: BadgeType[] = [];

  // Check for "New" badge - created within threshold days
  if (isNewProduct(product.createdAt, newDaysThreshold)) {
    badges.push("new");
  }

  // Check for "Sale" badge - compareAtPrice > price
  if (isOnSale(product.price, product.compareAtPrice)) {
    badges.push("sale");
  }

  // Check for "Popular" badge - salesCount >= threshold
  if (isPopular(product.salesCount, popularThreshold)) {
    badges.push("popular");
  }

  return badges;
}

/**
 * Get badge configuration for a badge type
 */
function getBadgeConfig(type: BadgeType, savingsPercent?: number): ProductBadgeInfo {
  switch (type) {
    case "new":
      return {
        type: "new",
        label: "New",
        icon: <Sparkles className="h-3 w-3" />,
        className: "bg-emerald-500 text-white hover:bg-emerald-600",
      };
    case "sale":
      return {
        type: "sale",
        label: savingsPercent ? `${savingsPercent}% Off` : "Sale",
        icon: <Tag className="h-3 w-3" />,
        className: "bg-red-500 text-white hover:bg-red-600",
      };
    case "popular":
      return {
        type: "popular",
        label: "Popular",
        icon: <Flame className="h-3 w-3" />,
        className: "bg-amber-500 text-white hover:bg-amber-600",
      };
    case "limited":
      return {
        type: "limited",
        label: "Limited Time",
        icon: <Clock className="h-3 w-3" />,
        className: "bg-purple-500 text-white hover:bg-purple-600",
      };
  }
}

/**
 * ProductBadges Component
 * Displays badges for product status (New, Sale, Popular, Limited Time)
 */
export function ProductBadges({
  product,
  popularThreshold = 10,
  newDaysThreshold = 14,
  showCountdown = true,
  direction = "horizontal",
  className,
  maxBadges = 3,
}: ProductBadgesProps) {
  const badges = determineBadges(product, { popularThreshold, newDaysThreshold });

  // Limit badges if maxBadges is set
  const displayBadges = badges.slice(0, maxBadges);

  // Calculate savings percent for sale badge
  const savingsPercent = isOnSale(product.price, product.compareAtPrice)
    ? calculateSavingsPercent(product.compareAtPrice!, product.price)
    : undefined;

  // Check if we should show countdown (sale with end date)
  const showSaleCountdown =
    showCountdown && product.saleEndDate && isOnSale(product.price, product.compareAtPrice);

  if (displayBadges.length === 0 && !showSaleCountdown) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex gap-1.5",
        direction === "vertical" ? "flex-col items-start" : "flex-row flex-wrap items-center",
        className
      )}
    >
      {displayBadges.map((badgeType) => {
        const config = getBadgeConfig(badgeType, savingsPercent);
        return (
          <Badge key={badgeType} className={cn("gap-1 text-xs", config.className)}>
            {config.icon}
            {config.label}
          </Badge>
        );
      })}

      {/* Sale countdown timer */}
      {showSaleCountdown && product.saleEndDate && (
        <SaleCountdown endDate={product.saleEndDate} variant="badge" showIcon={true} />
      )}
    </div>
  );
}
