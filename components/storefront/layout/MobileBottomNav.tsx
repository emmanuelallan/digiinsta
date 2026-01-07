"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, GridIcon, Search01Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Home01Icon;
  label: string;
  href?: string;
  action?: "search" | "cart" | "categories";
}

const navItems: NavItem[] = [
  { icon: Home01Icon, label: "Home", href: "/" },
  { icon: GridIcon, label: "Categories", href: "/categories" },
  { icon: Search01Icon, label: "Search", action: "search" },
  { icon: ShoppingCart01Icon, label: "Cart", action: "cart" },
];

interface MobileBottomNavProps {
  onSearchClick?: () => void;
  onCategoriesClick?: () => void;
}

export function MobileBottomNav({ onSearchClick, onCategoriesClick }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();

  const handleItemClick = (item: NavItem) => {
    if (item.action === "search" && onSearchClick) {
      onSearchClick();
    } else if (item.action === "cart") {
      openCart();
    } else if (item.action === "categories" && onCategoriesClick) {
      onCategoriesClick();
    }
  };

  const isActive = (item: NavItem) => {
    if (!item.href) return false;
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur lg:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="safe-area-inset-bottom flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const isCartItem = item.action === "cart";

          if (item.href && !item.action) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex min-h-[44px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
                  "hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  active && "text-primary"
                )}
                aria-current={active ? "page" : undefined}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={24}
                  className={cn(
                    "transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className={cn(
                "relative flex min-h-[44px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
                "hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              )}
              aria-label={
                isCartItem && itemCount > 0 ? `${item.label} (${itemCount} items)` : item.label
              }
            >
              <div className="relative">
                <HugeiconsIcon icon={item.icon} size={24} className="text-muted-foreground" />
                {isCartItem && itemCount > 0 && (
                  <span
                    className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                    aria-hidden="true"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span className="text-muted-foreground text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
