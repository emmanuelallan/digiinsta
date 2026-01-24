import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using Digital love for the heart and purchasing our digital products.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
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
        name: "Terms of Service",
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
              <span className="text-gray-900 font-medium">Terms of Service</span>
            </nav>
          </div>

          <div className="py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Agreement to Terms</h2>
              <p>
                By accessing and using Digital love for the heart, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Digital Products</h2>
              <p>
                All products sold on our website are digital products delivered electronically. Upon successful payment, you will receive immediate access to download your purchased products.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">License and Usage Rights</h2>
              <p>When you purchase a digital product from us, you receive:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>A personal, non-exclusive, non-transferable license to use the product</li>
                <li>The right to edit and customize the product for personal use</li>
                <li>The right to print the product for personal use</li>
              </ul>
              <p>You may NOT:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Resell, redistribute, or share the digital files</li>
                <li>Claim the designs as your own</li>
                <li>Use the products for commercial purposes without explicit permission</li>
                <li>Share your download links with others</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">No Refund Policy</h2>
              <p className="font-semibold text-gray-900">
                Due to the digital nature of our products, all sales are final and non-refundable.
              </p>
              <p>
                Once a digital product is purchased and the download link is provided, we cannot offer refunds, exchanges, or cancellations. By completing your purchase, you acknowledge and agree to this no-refund policy.
              </p>
              <p>
                We encourage you to carefully review product descriptions, preview images, and any available samples before making a purchase. If you have questions about a product, please contact us before purchasing.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Intellectual Property</h2>
              <p>
                All content on this website, including but not limited to text, graphics, logos, images, and digital products, is the property of Digital love for the heart and is protected by copyright laws.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Product Delivery</h2>
              <p>
                Digital products are delivered via email immediately after purchase. Please ensure you provide a valid email address. If you do not receive your product within 24 hours, please check your spam folder and contact our support team.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Technical Requirements</h2>
              <p>
                You are responsible for ensuring you have the necessary software and technical capabilities to access and use our digital products. Most products require PDF reader software and may require additional software for editing (such as Adobe Acrobat, Canva, or similar programs).
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
              <p>
                Digital love for the heart shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our products or services.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes constitutes acceptance of the modified terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at support@digiinsta.store
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
