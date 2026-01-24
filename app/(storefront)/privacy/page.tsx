import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Digital love for the heart collects, uses, and protects your personal information.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
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
        name: "Privacy Policy",
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
              <span className="text-gray-900 font-medium">Privacy Policy</span>
            </nav>
          </div>

          <div className="py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Introduction</h2>
              <p>
                Digital love for the heart ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase our digital products.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and email address when you make a purchase</li>
                <li>Payment information (processed securely through our payment processor)</li>
                <li>Communication preferences and email subscription data</li>
                <li>Any information you provide when contacting customer support</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send you order confirmations and product delivery emails</li>
                <li>Respond to your questions and provide customer support</li>
                <li>Send marketing communications (if you've opted in)</li>
                <li>Improve our products and services</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment processors to complete transactions</li>
                <li>Email service providers to send communications</li>
                <li>Analytics providers to understand website usage</li>
                <li>Legal authorities when required by law</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to processing of your information</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to improve your browsing experience, analyze website traffic, and understand where our visitors are coming from.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at privacy@digiinsta.store
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
