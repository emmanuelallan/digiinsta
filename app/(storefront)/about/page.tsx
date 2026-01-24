import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Digital love for the heart and our mission to create meaningful connections through thoughtfully designed digital products.",
  openGraph: {
    title: "About Us | Digital love for the heart",
    description: "Learn about our mission to create meaningful connections through thoughtfully designed digital products.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store";

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About Us",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-6 border-b border-gray-200">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-pink-600 transition-colors">
                Home
              </Link>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              <span className="text-gray-900 font-medium">About Us</span>
            </nav>
          </div>

          {/* Content */}
          <div className="py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>

            <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
              <p>
                Welcome to Digital love for the heart, where we believe that meaningful connections are the foundation of a fulfilling life.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Our Mission</h2>
              <p>
                We create thoughtfully designed digital products that help people strengthen their relationships and celebrate the connections that matter most. Whether it's deepening romantic bonds, nurturing family ties, or fostering personal growth, our tools are crafted with intention and care.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What We Offer</h2>
              <p>
                Our collection includes instant-download digital products such as journals, planners, conversation cards, and activity guides. Each product is:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Thoughtfully designed to create genuine connection</li>
                <li>Instantly accessible after purchase</li>
                <li>Fully editable to personalize your experience</li>
                <li>Created with love and attention to detail</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Why Choose Us</h2>
              <p>
                We understand that building and maintaining meaningful relationships takes effort and intention. That's why we've made it our mission to provide tools that make this journey easier, more enjoyable, and more impactful.
              </p>
              <p>
                Join over 200,000 happy users who have discovered the power of intentional connection through our digital products.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Get in Touch</h2>
              <p>
                Have questions or feedback? We'd love to hear from you. Reach out to us and let's create meaningful moments together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
