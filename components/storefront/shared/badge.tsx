import * as React from "react";
import { Badge as BadgeType } from "@/lib/types/storefront";
import { cn } from "@/lib/utils";

interface BadgeProps {
  badge: BadgeType;
  className?: string;
}

const badgeStyles = {
  bestseller: "bg-brand-pink-accent text-white",
  valentine: "bg-red-500 text-white",
  editable: "bg-brand-pink-medium text-brand-gray-warm-dark",
  instant: "bg-brand-pink-soft text-brand-gray-warm-dark",
  new: "bg-brand-pink-medium text-white",
};

const badgeIcons = {
  bestseller: "⭐",
  valentine: "💖",
  editable: "✏️",
  instant: "⚡",
  new: "✨",
};

export function Badge({ badge, className }: BadgeProps) {
  const icon = badge.icon || badgeIcons[badge.type];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeStyles[badge.type],
        className
      )}
    >
      {icon && <span className="text-sm" aria-hidden="true">{icon}</span>}
      <span>{badge.text}</span>
    </span>
  );
}
