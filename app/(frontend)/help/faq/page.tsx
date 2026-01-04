import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { QuestionIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  title: "FAQ | Help Center",
  description:
    "Find answers to frequently asked questions about DigiInsta products, downloads, payments, and more.",
  alternates: {
    canonical: `${SITE_URL}/help/faq`,
  },
  openGraph: {
    title: `FAQ | ${SITE_NAME}`,
    description:
      "Find answers to frequently asked questions about DigiInsta products and services.",
    url: `${SITE_URL}/help/faq`,
  },
};

const faqCategories = [
  {
    title: "Products & Downloads",
    faqs: [
      {
        question: "How do I download my purchased products?",
        answer:
          "After completing your purchase, you'll receive an email with download links for all your products. You can also access your downloads from the order confirmation page. Each product has a limited number of downloads (typically 5), so please save your files after downloading.",
      },
      {
        question: "What file formats are included?",
        answer:
          "Our products come in various formats depending on the type. Digital planners are typically in PDF format compatible with apps like GoodNotes, Notability, and others. Notion templates include a direct duplication link. Spreadsheets are provided in Excel (.xlsx) format.",
      },
      {
        question: "How long do I have access to my downloads?",
        answer:
          "Your download links are available for 30 days after purchase. We recommend downloading and saving your files immediately after purchase. If you need to re-download after this period, please contact our support team.",
      },
      {
        question: "Can I use the products on multiple devices?",
        answer:
          "Yes! Once you download a product, you can use it on any device you own. There are no device restrictions for personal use.",
      },
    ],
  },
  {
    title: "Payments & Pricing",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and various local payment methods through our secure payment processor, Polar. Apple Pay and Google Pay are also supported.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Absolutely. We use Polar (powered by Stripe) for payment processing, which is PCI-DSS compliant. We never store your full credit card details on our servers.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "Due to the digital nature of our products, we generally do not offer refunds once a product has been downloaded. However, if you experience technical issues or receive a defective product, please contact us and we'll work to resolve the issue.",
      },
      {
        question: "Are prices in USD?",
        answer:
          "Yes, all prices on our website are displayed in US Dollars (USD). Your bank may convert the charge to your local currency.",
      },
    ],
  },
  {
    title: "Technical Support",
    faqs: [
      {
        question: "My download link isn't working. What should I do?",
        answer:
          "First, try refreshing the page or using a different browser. If the issue persists, check that you haven't exceeded your download limit. If you still have issues, contact our support team with your order number and we'll help you out.",
      },
      {
        question: "The product doesn't look right on my device. Help!",
        answer:
          "Make sure you're using a compatible app for the product type. For PDF planners, we recommend GoodNotes, Notability, or PDF Expert. If you're still having issues, reach out to us with screenshots and your device/app information.",
      },
      {
        question: "Can I get help customizing a template?",
        answer:
          "Our products are designed to be used as-is, but many include customization options. For basic questions, feel free to contact us. For extensive customization, we may be able to offer custom services at an additional cost.",
      },
    ],
  },
  {
    title: "Account & Orders",
    faqs: [
      {
        question: "Do I need an account to make a purchase?",
        answer:
          "No, you can checkout as a guest using just your email address. Your order confirmation and download links will be sent to the email you provide.",
      },
      {
        question: "How can I track my order?",
        answer:
          "After purchase, you'll receive an order confirmation email with your order details and download links. Since our products are digital, there's no shipping to track - you get instant access!",
      },
      {
        question: "I didn't receive my order confirmation email. What now?",
        answer:
          "First, check your spam/junk folder. If you still can't find it, contact us with the email address you used for the purchase and we'll resend your order details.",
      },
    ],
  },
];

export default function FAQPage() {
  // Generate FAQ schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((category) =>
      category.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
                  <BreadcrumbLink asChild>
                    <Link href="/help/faq">Help</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>FAQ</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 py-16 lg:py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <HugeiconsIcon icon={QuestionIcon} size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="mt-4 text-lg text-white/90">
                Find answers to common questions about our products and services.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={category.title} className={categoryIndex > 0 ? "mt-12" : ""}>
                <h2 className="text-foreground mb-6 text-xl font-bold">{category.title}</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="bg-card rounded-lg border px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        {/* Still Need Help */}
        <section className="bg-muted/30 border-t py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-foreground text-2xl font-bold">Still have questions?</h2>
              <p className="text-muted-foreground mt-2">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <Button asChild className="mt-6">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
