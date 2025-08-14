"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Search, User, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold text-foreground">DigiInsta</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Home
            </Link>
            {/* Products link removed */}
            <Link 
              href="/categories" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Categories
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="w-64 pl-10 h-10 border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden h-10 w-10 p-0"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Cart removed for single product checkout */}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Sign In */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex h-10 px-4 border-border bg-background hover:bg-muted/50"
              asChild
            >
              <Link href="/admin/auth/login">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-10 w-10 p-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link 
                    href="/" 
                    className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                  >
                    Home
                  </Link>
                  {/* Products link removed */}
                  <Link 
                    href="/categories" 
                    className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                  >
                    Categories
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                  >
                    About
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                  >
                    Contact
                  </Link>
                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      className="w-full h-11 border-border bg-background hover:bg-muted/50"
                      asChild
                    >
                      <Link href="/admin/auth/login">
                        <User className="mr-2 h-4 w-4" />
                        Sign In
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="sm:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="w-full pl-10 h-11 border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
