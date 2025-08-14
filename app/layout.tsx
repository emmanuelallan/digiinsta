import type { Metadata } from "next";
import { Questrial, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const questrialSans = Questrial({
  variable: "--font-questrial-sans",
  subsets: ["latin"],
  weight: ['400']
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DigiInsta - Digital Products Store",
  description: "Discover premium digital products, templates, and resources to elevate your digital presence",
  keywords: "digital products, templates, resources, digital downloads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${questrialSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
      </body>
    </html>
  );
}
