import React from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/analytics";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header, MobileNavWrapper, SearchProvider } from "@/components/storefront/layout";
import { Footer } from "@/components/shared/footer";
import { getCategoriesForMegaMenu } from "@/lib/storefront";
import { CartProvider } from "@/lib/cart";
import { baseMetadata, getOrganizationSchema, getWebsiteSchema, SITE_URL } from "@/lib/seo";
import { CartSlideOutWrapper } from "@/components/storefront/cart/CartSlideOutWrapper";
import "./globals.css";

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function FrontendLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  // Fetch categories for mega menu
  const categories = await getCategoriesForMegaMenu();

  // JSON-LD structured data
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <CartProvider>
          <SearchProvider>
            <div className="bg-background flex min-h-screen flex-col">
              <Header categories={categories} />
              <main className="flex-1 pb-16 lg:pb-0">{children}</main>
              <Footer />
            </div>
            <CartSlideOutWrapper />
            <MobileNavWrapper categories={categories} />
          </SearchProvider>
        </CartProvider>
        <Toaster />
        <Analytics />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </ThemeProvider>
    </>
  );
}
