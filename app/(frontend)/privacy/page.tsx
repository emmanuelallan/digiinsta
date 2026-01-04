import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE_NAME}. Learn how we collect, use, and protect your personal information.`,
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  const lastUpdated = "January 4, 2026";

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-foreground mb-2 text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8 text-sm">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to {SITE_NAME}. We respect your privacy and are committed to protecting your
              personal data. This privacy policy explains how we collect, use, and safeguard your
              information when you visit our website and purchase our digital products.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground mb-4">
              We collect information that you provide directly to us:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>Email address (required for purchase and delivery)</li>
              <li>Payment information (processed securely by our payment provider, Polar)</li>
              <li>Contact information when you reach out to support</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              We automatically collect certain information:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>Device and browser information</li>
              <li>IP address (for fraud prevention and download tracking)</li>
              <li>Pages visited and interactions with our site</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-4">We use your information to:</p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>Process and fulfill your orders</li>
              <li>Send purchase confirmations and download links</li>
              <li>Provide customer support</li>
              <li>Prevent fraud and abuse of our download system</li>
              <li>Improve our products and services</li>
              <li>Send marketing communications (only with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">4. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>All data is transmitted over secure HTTPS connections</li>
              <li>Payment processing is handled by PCI-DSS compliant providers</li>
              <li>We never store your full credit card details</li>
              <li>Download links are time-limited and secured</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">5. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">We use trusted third-party services:</p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>
                <strong>Polar (Stripe)</strong> - Payment processing
              </li>
              <li>
                <strong>Resend</strong> - Email delivery
              </li>
              <li>
                <strong>Cloudflare</strong> - Content delivery and security
              </li>
              <li>
                <strong>Analytics</strong> - Privacy-friendly website analytics
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">7. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We use essential cookies to ensure our website functions properly. We also use
              privacy-friendly analytics that do not require cookie consent. We do not use
              third-party tracking cookies for advertising purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">8. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your order information for as long as necessary to provide you with access
              to your purchases and to comply with legal obligations. You can request deletion of
              your data at any time by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">9. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this privacy policy or your personal data, please contact
              us at{" "}
              <a href="mailto:support@digiinsta.store" className="text-primary hover:underline">
                support@digiinsta.store
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">
              10. Changes to This Policy
            </h2>
            <p className="text-muted-foreground mb-4">
              We may update this privacy policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page and updating the &quot;Last
              updated&quot; date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
