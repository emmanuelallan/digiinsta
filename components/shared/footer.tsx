import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, ArrowRight } from "lucide-react"
import {SiPinterest, SiX, SiInstagram, SiFacebook} from 'react-icons/si'
import Image from "next/image"

// Footer link data - easy to maintain and update
const footerLinks = {
  aboutUs: [
    { href: "/about/our-story", label: "Our Story" },
    { href: "/about/affiliates", label: "Affiliates" },
    { href: "/about/press", label: "Press Page" },
    { href: "/about/careers", label: "Careers" },
    { href: "/blog", label: "Blog" },
    { href: "/about/corporate-gifting", label: "Corporate Gifting" },
  ],
  shop: [
    { href: "/categories/planners", label: "Planners" },
    { href: "/categories/journals", label: "Journals" },
    { href: "/categories/notebooks", label: "Notebooks" },
    { href: "/categories/templates", label: "Templates" },
    { href: "/wholesale", label: "Wholesale" },
    { href: "/gift-cards", label: "Gift Cards" },
  ],
  help: [
    { href: "/help/shipping", label: "Shipping Info" },
    { href: "/help/holiday-shopping", label: "Holiday Shopping" },
    { href: "/help/returns", label: "Returns" },
    { href: "/help/faq", label: "FAQs" },
    { href: "/contact", label: "Contact Us" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms" },
    { href: "/cookies", label: "Cookies" },
  ],
}

const socialLinks = [
  {
    href: "https://www.instagram.com/digiinsta",
    label: "Instagram",
    icon: SiInstagram,
  },
  {
    href: "https://www.pinterest.com/digiinsta",
    label: "Pinterest",
    icon: SiPinterest,
  },
  {
    href: "https://x.com/digiinsta",
    label: "X (Twitter)",
    icon: SiX,
  },
  {
    href: "https://www.facebook.com/digiinsta",
    label: "Facebook",
    icon: SiFacebook,
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <Image 
                src="/images/icons/logo.svg" 
                alt="DigiInsta Logo" 
                width={100} 
                height={100} 
                className="h-20 w-auto"
              />
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Premium digital products and resources to elevate your digital presence and boost your productivity. 
              Discover our curated collection of planners, journals, and organizational tools.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <Link 
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground border rounded-full border-transparent hover:border-border transition-all duration-300 p-4 hover:bg-muted/50"
                    aria-label={social.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>
          <div></div>

          {/* About Us */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground text-lg">About Us</h3>
            <div className="space-y-3">
              {footerLinks.aboutUs.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground text-lg">Shop</h3>
            <div className="space-y-3">
              {footerLinks.shop.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground text-lg">Help</h3>
            <div className="space-y-3">
              {footerLinks.help.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-border/40 pt-12 pb-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground">Stay Updated</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get notified about new products, exclusive offers, and productivity tips delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                placeholder="Enter your email address"
                className="flex-1 h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                type="email"
              />
              <Button 
                size="default" 
                className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group"
              >
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>© 2024 DigiInsta. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Made with</span>
            <Heart className="hidden sm:inline h-4 w-4 text-red-500" />
            <span className="hidden sm:inline">for creators</span>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            {footerLinks.legal.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}