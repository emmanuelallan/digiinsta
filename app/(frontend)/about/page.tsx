import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  SecurityCheckIcon,
  Rocket01Icon,
  HeartCheckIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
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
  title: "About Us | DigiInsta",
  description:
    "Learn about DigiInsta - your trusted source for premium digital templates, planners, and productivity tools.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: `About Us | ${SITE_NAME}`,
    description:
      "Learn about DigiInsta - your trusted source for premium digital templates and productivity tools.",
    url: `${SITE_URL}/about`,
  },
};

const values = [
  {
    icon: CheckmarkCircle01Icon,
    title: "Quality First",
    description:
      "Every template is carefully crafted and tested to ensure it meets our high standards before release.",
  },
  {
    icon: SecurityCheckIcon,
    title: "Secure & Private",
    description:
      "Your purchases are protected with secure payment processing and private download links.",
  },
  {
    icon: Rocket01Icon,
    title: "Instant Delivery",
    description:
      "Get immediate access to your digital products right after purchase - no waiting required.",
  },
  {
    icon: HeartCheckIcon,
    title: "Customer Focused",
    description:
      "We're here to help you succeed with responsive support and regular product updates.",
  },
];

export default function AboutPage() {
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
                <BreadcrumbPage>About Us</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              About DigiInsta
            </h1>
            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              We create premium digital templates and tools to help you organize your life, boost
              productivity, and achieve your goals.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                Our Story
              </h2>
              <div className="text-muted-foreground mt-6 space-y-4 text-lg">
                <p>
                  DigiInsta was born from a simple idea: everyone deserves access to beautiful,
                  functional digital tools that make life easier.
                </p>
                <p>
                  We noticed that many people struggle with organization, planning, and tracking
                  their goals. Traditional paper planners are great, but they lack the flexibility
                  and power of digital solutions.
                </p>
                <p>
                  That&apos;s why we created DigiInsta - a curated collection of premium digital
                  templates designed for modern life. From Notion templates to digital planners,
                  finance trackers to study guides, we&apos;ve got you covered.
                </p>
              </div>
            </div>
            <div className="bg-muted relative aspect-square overflow-hidden rounded-2xl lg:aspect-auto">
              <Image
                src="/images/about-hero.jpg"
                alt="DigiInsta workspace"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="from-primary/20 to-primary/5 absolute inset-0 bg-gradient-to-br" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Our Values
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              These principles guide everything we do at DigiInsta.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="bg-background rounded-xl border p-6">
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <HugeiconsIcon icon={value.icon} size={24} className="text-primary" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">{value.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-primary relative overflow-hidden rounded-2xl px-6 py-16 sm:px-12 lg:px-16">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-primary-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="text-primary-foreground/90 mt-4 text-lg">
                Browse our collection of premium digital templates and find the perfect tools for
                your needs.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/products">Browse Products</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
