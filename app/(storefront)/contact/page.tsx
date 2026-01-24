import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Digital love for the heart. We're here to help with any questions about our digital products.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store";

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
        name: "Contact",
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
          <div className="py-6 border-b border-gray-200">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-pink-600 transition-colors">
                Home
              </Link>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              <span className="text-gray-900 font-medium">Contact</span>
            </nav>
          </div>

          <div className="py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

            <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
              <p>
                We'd love to hear from you! Whether you have a question about our products, need support, or just want to share feedback, we're here to help.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Get in Touch</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                  <p>
                    <a href="mailto:support@digiinsta.store" className="text-pink-600 hover:text-pink-700">
                      support@digiinsta.store
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
                  <p>
                    We typically respond to all inquiries within 24-48 hours during business days.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Frequently Asked Questions</h2>
              <p>
                Before reaching out, you might find answers to common questions in our FAQ section or product descriptions.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Product Support</h2>
              <p>
                If you're experiencing issues with a product download or have questions about how to use a product, please include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your order number</li>
                <li>The product name</li>
                <li>A detailed description of your question or issue</li>
                <li>Any relevant screenshots (if applicable)</li>
              </ul>

              <p className="mt-8">
                We're committed to providing excellent customer service and ensuring you have a great experience with our digital products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
