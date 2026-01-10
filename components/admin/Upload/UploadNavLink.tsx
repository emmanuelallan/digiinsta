"use client";

/**
 * Navigation link for the custom upload view
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const UploadNavLink: React.FC = () => {
  const pathname = usePathname();
  const isActive = pathname === "/admin/upload";

  return (
    <Link
      href="/admin/upload"
      className={`nav-link ${isActive ? "active" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 16px",
        color: isActive ? "var(--theme-success-500)" : "inherit",
        textDecoration: "none",
        borderRadius: "4px",
        background: isActive ? "var(--theme-elevation-100)" : "transparent",
      }}
    >
      <span style={{ fontSize: "18px" }}>📤</span>
      <span>Quick Upload</span>
    </Link>
  );
};

export default UploadNavLink;
