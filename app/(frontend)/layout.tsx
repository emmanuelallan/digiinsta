import React from "react";
import { Analytics } from "@/components/analytics";
import "./globals.css";

export const metadata = {
  description: "Digital Products Ecommerce - Premium digital products for creators",
  title: {
    default: "Digital Products",
    template: "%s | Digital Products",
  },
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
