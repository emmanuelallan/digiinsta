import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { generateMetadata as generateBaseMetadata } from "@/lib/utils/seo";
import { generateOrganizationStructuredData } from "@/lib/utils/seo";
import { UmamiScript } from "@/components/analytics/umami-script";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Base SEO metadata for the entire site
export const metadata: Metadata = generateBaseMetadata({
  title: "DigiInsta Store",
  description:
    "Premium digital products including planners, templates, and resources for faith, family, business, and personal growth.",
  url: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationStructuredData = generateOrganizationStructuredData();

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <UmamiScript />
      </body>
    </html>
  );
}
