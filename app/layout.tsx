/**
 * Root Layout
 *
 * Next.js 16 requires html/body tags in the root layout.
 * Nested layouts should NOT include html/body tags.
 */

import type { Metadata } from "next";
import { Josefin_Sans, Geist_Mono } from "next/font/google";

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
  title: "DigiInsta",
  description: "Digital products marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${josefinSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
