/**
 * Admin Navigation Component
 *
 * Displays navigation links with active state highlighting.
 * Used across all admin pages for consistent navigation.
 *
 * Requirements: 3.2, 3.4
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/creators", label: "Creators" },
  { href: "/upload", label: "Upload" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 text-sm font-medium ${
                  isActive
                    ? "border-primary text-foreground border-b-2"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
