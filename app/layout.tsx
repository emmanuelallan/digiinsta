import type { Metadata } from "next";
import { Cormorant_Garamond, Josefin_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store"),
  title: {
    default: "Digital love for the heart 💖 | Intentional moments made simple",
    template: "%s | Digital love for the heart",
  },
  description:
    "Discover meaningful digital products for relationships. Thoughtfully designed tools for self-love, couples, family, and friendship. Instant download, editable templates.",
  keywords: [
    "digital products",
    "relationship tools",
    "couples activities",
    "self-love",
    "family bonding",
    "friendship",
    "printable templates",
    "editable PDFs",
    "instant download",
    "meaningful gifts",
  ],
  authors: [{ name: "Digital love for the heart" }],
  creator: "Digital love for the heart",
  publisher: "Digital love for the heart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Digital love for the heart",
    title: "Digital love for the heart 💖 | Intentional moments made simple",
    description:
      "Discover meaningful digital products for relationships. Thoughtfully designed tools for self-love, couples, family, and friendship.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Digital love for the heart",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital love for the heart 💖 | Intentional moments made simple",
    description:
      "Discover meaningful digital products for relationships. Thoughtfully designed tools for self-love, couples, family, and friendship.",
    images: ["/images/twitter-image.jpg"],
    creator: "@digitallove",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    other: {
      "facebook-domain-verification": "qarep7ni5a8figt69q8m55kcgvf48r",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${cormorantGaramond.variable} ${josefinSans.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
