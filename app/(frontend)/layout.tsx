import React from "react";
import { Analytics } from "@/components/analytics";
import { Josefin_Sans, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/storefront/layout";
import { Footer } from "@/components/shared/footer";
import { getCategoriesForMegaMenu } from "@/lib/storefront";
import { CartProvider } from "@/lib/cart";
import { CartSlideOut } from "@/components/storefront/cart/CartSlideOut";
import "./globals.css";

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  description:
    "Elevate your life with DigiInsta. Shop expert-led digital planners, finance trackers, and SME tools engineered for students, couples, and professionals.",
  title: {
    default: "DigiInsta",
    template: "%s | Professional Digital Systems, Planners & Assets",
  },
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  // Fetch categories for mega menu
  const categories = await getCategoriesForMegaMenu();

  return (
    <html lang="en" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
