import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PinterestIcon,
  InstagramIcon,
  Facebook02Icon,
  TiktokIcon,
  YoutubeIcon,
  ThreadsIcon,
  CheckmarkBadge01Icon,
  // NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
// import { Newsletter } from "@/components/public/newsletter";

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
};

const socialLinks = [
  {
    href: "https://www.instagram.com/digiinstastore/",
    label: "Instagram",
    icon: <HugeiconsIcon icon={InstagramIcon} size={24} color="currentColor" strokeWidth={1.5} />,
  },
  {
    href: "https://www.tiktok.com/@digiinstastore",
    label: "TikTok",
    icon: <HugeiconsIcon icon={TiktokIcon} size={24} color="currentColor" strokeWidth={1.5} />,
  },
  {
    href: "https://www.pinterest.com/digiinstastore",
    label: "Pinterest",
    icon: <HugeiconsIcon icon={PinterestIcon} size={24} color="currentColor" strokeWidth={1.5} />,
  },
  // {
  //   href: "https://x.com/digiinstastore",
  //   label: "X (Twitter)",
  //   icon: (
  //     <HugeiconsIcon
  //       icon={NewTwitterIcon}
  //       size={24}
  //       color="currentColor"
  //       strokeWidth={1.5}
  //     />
  //   ),
  // },
  {
    href: "https://www.youtube.com/@Digiinsta",
    label: "YouTube",
    icon: <HugeiconsIcon icon={YoutubeIcon} size={24} color="currentColor" strokeWidth={1.5} />,
  },
  {
    href: "https://www.facebook.com/digiinstastore",
    label: "Facebook",
    icon: <HugeiconsIcon icon={Facebook02Icon} size={24} color="currentColor" strokeWidth={1.5} />,
  },
  {
    href: "https://www.threads.com/@digiinstastore",
    label: "Threads",
    icon: <HugeiconsIcon icon={ThreadsIcon} size={24} color="currentColor" strokeWidth={1.5} />,
  },
];

export function Footer() {
  return (
    <footer className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur">
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* Main Footer Content */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center space-x-3">
              <Image
                src="/logos/logo.svg"
                alt="DigiInsta Logo"
                width={100}
                height={100}
                className="h-20 w-auto"
              />
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Premium digital products and resources to elevate your digital presence and boost your
              productivity. Discover our curated collection of planners, journals, and
              organizational tools.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:border-border hover:bg-muted/50 rounded-full border border-transparent p-4 transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
          <div></div>

          {/* About Us */}
          <div className="space-y-6">
            <h3 className="text-foreground text-lg font-semibold">About Us</h3>
            <div className="space-y-3">
              {footerLinks.aboutUs.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <h3 className="text-foreground text-lg font-semibold">Shop</h3>
            <div className="space-y-3">
              {footerLinks.shop.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="space-y-6">
            <h3 className="text-foreground text-lg font-semibold">Help</h3>
            <div className="space-y-3">
              {footerLinks.help.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-border/40 flex items-center justify-center border-t pt-12 pb-8">
          {/* <Newsletter /> */}
          <div className="text-muted-foreground flex items-center space-x-2 rounded-lg border-3 border-green-800/30 p-6 text-sm font-medium">
            <span className="hidden text-green-400 sm:inline">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} strokeWidth={1.5} />
            </span>
            <span className="hidden sm:inline">100% Human-Designed & Verified.</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-border/40 flex flex-col items-center justify-between space-y-4 border-t pt-8 md:flex-row md:space-y-0">
          <div className="text-muted-foreground flex items-center space-x-2 text-sm">
            <span>© 2024 DigiInsta. All rights reserved.</span>
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
  );
}
