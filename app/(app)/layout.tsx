/**
 * Admin App Layout
 *
 * Provides the base layout for admin pages with authentication check.
 * Note: html/body tags are in root layout (Next.js 16 requirement)
 */

import React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "@/app/(frontend)/globals.css";

export const metadata: Metadata = {
  title: "Admin | DigiInsta",
  description: "DigiInsta Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
