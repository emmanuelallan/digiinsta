import type { Metadata } from "next";
import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { generateMetadata as generateBaseMetadata } from "@/lib/utils/seo";
import { generateOrganizationStructuredData } from "@/lib/utils/seo";
import { UmamiScript } from "@/components/analytics/umami-script";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
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
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={`${cormorantGaramond.variable} ${josefinSans.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
      </head>
      <body
        className={`${cormorantGaramond.variable} ${josefinSans.variable} antialiased`}
      >
        {children}
        <UmamiScript />
      </body>
    </html>
  );
}
