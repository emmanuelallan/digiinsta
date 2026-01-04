import React from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/analytics";
import { Josefin_Sans, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/storefront/layout";
import { Footer } from "@/components/shared/footer";
import { getCategoriesForMegaMenu } from "@/lib/storefront";
import { CartProvider } from "@/lib/cart";
import { CartSlideOut } from "@/components/storefront/cart/CartSlideOut";
import { baseMetadata, getOrganizationSchema, getWebsiteSchema, SITE_URL } from "@/lib/seo";
import "./globals.css";

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

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

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  // Fetch categories for mega menu
  const categories = await getCategoriesForMegaMenu();

  // JSON-LD structured data
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${josefinSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <div className="bg-background flex min-h-screen flex-col">
              <Header categories={categories} />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CartSlideOut />
          </CartProvider>
        </ThemeProvider>
        <Toaster />
        <Analytics />
        {/* JSON-LD structured data - placed in body to avoid hydration mismatch */}
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
      </body>
    </html>
  );
}
