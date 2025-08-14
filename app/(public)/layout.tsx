import type { Metadata } from "next"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"

export const metadata: Metadata = {
  title: "DigiInsta - Digital Products Store",
  description: "Discover premium digital products, templates, and resources to elevate your digital presence",
  keywords: "digital products, templates, resources, digital downloads",
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
} 