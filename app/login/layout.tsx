/**
 * Login Layout
 *
 * Simple layout for the login page without admin authentication.
 */

import type { Metadata } from "next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "@/app/(frontend)/globals.css";

export const metadata: Metadata = {
  title: "Login | DigiInsta Admin",
  description: "Sign in to DigiInsta Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
