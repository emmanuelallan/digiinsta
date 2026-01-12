/**
 * Admin App Layout
 *
 * Provides the base layout for admin pages with authentication check.
 * Validates session and provides shared header/navigation.
 * Note: html/body tags are in root layout (Next.js 16 requirement)
 *
 * Requirements: 3.1, 3.5
 */

import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { validateSession } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNav } from "@/components/admin/AdminNav";
import "@/app/(frontend)/globals.css";

export const metadata: Metadata = {
  title: "Admin | DigiInsta",
  description: "DigiInsta Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Validate session in layout
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin-session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const session = await validateSession(sessionToken);

  if (!session) {
    redirect("/login");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="bg-background min-h-screen">
        <AdminHeader email={session.email} />
        <AdminNav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
