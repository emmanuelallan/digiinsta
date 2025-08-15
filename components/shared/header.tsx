"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import Image from "next/image"
import { CartRibbon } from "@/components/shared/cart-ribbon"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/icons/logo.svg" alt="logo image" width={90} height={50} />
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-8">
            <ThemeToggle />
            <CartRibbon />
          </div>
        </div>
      </div>
    </header>
  )
}