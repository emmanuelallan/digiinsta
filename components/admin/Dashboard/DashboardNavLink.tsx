"use client";

/**
 * DashboardNavLink - Navigation link for the admin dashboard
 * Added to Payload admin navigation via afterNavLinks config
 * Requirements: 7.2
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNavLink() {
  const pathname = usePathname();
  const isActive = pathname === "/admin/dashboard";

  return (
    <Link
      href="/admin/dashboard"
      className={`nav__link ${isActive ? "nav__link--active" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1rem",
        color: isActive ? "var(--theme-text)" : "var(--theme-elevation-600)",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: isActive ? 600 : 400,
        borderRadius: "4px",
        backgroundColor: isActive
          ? "var(--theme-elevation-100)"
          : "transparent",
        transition: "all 0.15s ease",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
      Revenue Dashboard
    </Link>
  );
}

export default DashboardNavLink;
