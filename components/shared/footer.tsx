import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold text-foreground">DigiInsta</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium digital products and resources to elevate your digital presence and boost your productivity.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get notified about new products and exclusive offers.
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter your email"
                className="flex-1 h-10 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Button size="sm" className="h-10 px-3 bg-primary text-primary-foreground hover:bg-primary/90">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/40 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2024 DigiInsta. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-4 w-4" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
