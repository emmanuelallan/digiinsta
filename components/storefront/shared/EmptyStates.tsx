"use client";

import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Search01Icon,
  ShoppingBag01Icon,
  FolderOpenIcon,
  SadIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  className?: string;
}

interface EmptyStateWithActionProps extends EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: IconSvgElement;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon = FolderOpenIcon,
  className,
}: EmptyStateWithActionProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <HugeiconsIcon
          icon={icon}
          size={28}
          className="text-muted-foreground"
        />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export function NoProductsFound({ className }: EmptyStateProps) {
  return (
    <EmptyState
      title="No products found"
      description="We couldn't find any products matching your criteria. Try adjusting your filters or browse our categories."
      actionLabel="Browse All Products"
      actionHref="/products"
      icon={ShoppingBag01Icon}
      className={className}
    />
  );
}

export function NoSearchResults({
  query,
  className,
}: EmptyStateProps & { query?: string }) {
  return (
    <EmptyState
      title="No results found"
      description={
        query
          ? `We couldn't find anything for "${query}". Try different keywords or browse our categories.`
          : "Try searching for products, categories, or bundles."
      }
      actionLabel="Browse Products"
      actionHref="/products"
      icon={Search01Icon}
      className={className}
    />
  );
}

export function NoCategoriesFound({ className }: EmptyStateProps) {
  return (
    <EmptyState
      title="No categories available"
      description="Categories are being set up. Check back soon!"
      icon={FolderOpenIcon}
      className={className}
    />
  );
}

export function NoBundlesFound({ className }: EmptyStateProps) {
  return (
    <EmptyState
      title="No bundles available"
      description="We're preparing some amazing bundles for you. Check back soon!"
      actionLabel="Browse Products"
      actionHref="/products"
      icon={ShoppingBag01Icon}
      className={className}
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error loading this content. Please try again.",
  onRetry,
  className,
}: EmptyStateProps & {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <HugeiconsIcon icon={SadIcon} size={28} className="text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
