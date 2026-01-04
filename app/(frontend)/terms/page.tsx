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
  title: "Terms of Service",
  description: `Terms of Service for ${SITE_NAME}. Read our terms and conditions for using our digital products and services.`,
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
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
                <BreadcrumbPage>Terms of Service</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-foreground mb-2 text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground mb-8 text-sm">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">1. Agreement to Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using {SITE_NAME}, you agree to be bound by these Terms of Service. If
              you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">2. Digital Products</h2>
            <p className="text-muted-foreground mb-4">
              {SITE_NAME} sells digital products including but not limited to templates, planners,
              spreadsheets, and educational resources. All products are delivered electronically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">3. License and Usage</h2>
            <p className="text-muted-foreground mb-4">
              When you purchase a digital product, you receive:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>A personal, non-exclusive, non-transferable license to use the product</li>
              <li>The right to use the product on any device you own for personal use</li>
              <li>
                Access to download the product a limited number of times (typically 5 downloads)
              </li>
            </ul>
            <p className="text-muted-foreground mb-4">You may NOT:</p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>Redistribute, resell, or share the product files</li>
              <li>Use the product for commercial purposes without a commercial license</li>
              <li>Claim ownership or authorship of the product</li>
              <li>Remove any copyright or attribution notices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">4. Refund Policy</h2>
            <p className="text-muted-foreground mb-4">
              Due to the digital nature of our products, <strong>all sales are final</strong>. We do
              not offer refunds once a product has been downloaded. However, if you experience
              technical issues or receive a defective product, please contact us and we will work to
              resolve the issue.
            </p>
            <p className="text-muted-foreground mb-4">
              We encourage you to review product descriptions, previews, and specifications
              carefully before making a purchase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">5. Download Access</h2>
            <p className="text-muted-foreground mb-4">
              After purchase, you will receive download links via email. Please note:
            </p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>Download links are valid for 30 days after purchase</li>
              <li>Each product has a limited number of downloads (typically 5)</li>
              <li>We recommend downloading and backing up your files immediately</li>
              <li>If you need additional downloads, please contact support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">6. Payment</h2>
            <p className="text-muted-foreground mb-4">
              All payments are processed securely through our payment provider, Polar (powered by
              Stripe). By making a purchase, you agree to their terms of service. All prices are
              displayed in USD unless otherwise noted.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">7. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content on {SITE_NAME}, including products, designs, text, graphics, and logos, is
              the property of {SITE_NAME} or its content creators and is protected by copyright and
              intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">8. User Conduct</h2>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="text-muted-foreground mb-4 list-disc space-y-2 pl-6">
              <li>Use our services for any illegal purpose</li>
              <li>Attempt to circumvent download limits or security measures</li>
              <li>Share your account or download links with others</li>
              <li>Interfere with the proper functioning of our website</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">9. Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              Our products are provided &quot;as is&quot; without warranties of any kind. We do not
              guarantee that our products will meet your specific requirements or that they will be
              error-free. Use of our products is at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">
              10. Limitation of Liability
            </h2>
            <p className="text-muted-foreground mb-4">
              {SITE_NAME} shall not be liable for any indirect, incidental, special, or
              consequential damages arising from your use of our products or services. Our total
              liability shall not exceed the amount you paid for the product in question.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">11. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective
              immediately upon posting. Your continued use of our services after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-foreground mb-4 text-xl font-semibold">12. Contact</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these terms, please contact us at{" "}
              <a href="mailto:support@digiinsta.store" className="text-primary hover:underline">
                support@digiinsta.store
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
