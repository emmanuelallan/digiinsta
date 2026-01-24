import Link from "next/link";

const navigationLinks = [
  { label: "Shop", href: "/collections/all" },
  { label: "Valentine's", href: "/collections/valentines" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-pink-soft bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8" aria-label="Footer navigation">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-brand-gray-warm-dark hover:text-brand-pink-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink-accent focus-visible:ring-offset-2 rounded-md px-2 py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-sm text-brand-gray-warm">
          © {currentYear} Digital love for the heart 💖. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
