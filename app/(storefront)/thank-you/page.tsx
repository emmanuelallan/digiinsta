import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/storefront/shared/button";

export const metadata: Metadata = {
  title: "Thank You for Your Purchase | Digital love for the heart 💖",
  description:
    "Your digital products are ready! Check your email for download instructions and access to your purchase.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-pink-accent/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-10 w-10 text-brand-pink-accent"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Confirmation Message */}
        <h1 className="mb-4 text-3xl font-semibold text-brand-gray-warm-dark md:text-4xl">
          Thank you for your purchase! 💖
        </h1>

        <p className="mb-8 text-lg leading-relaxed text-brand-gray-warm-dark">
          Your digital products are on their way to your inbox.
        </p>

        {/* Instructions */}
        <div className="mb-10 space-y-6 rounded-lg bg-brand-pink-soft p-6 text-left md:p-8">
          <h2 className="text-xl font-semibold text-brand-gray-warm-dark">
            What happens next?
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-pink-accent text-white">
                <span className="text-sm font-semibold">1</span>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-base leading-relaxed text-brand-gray-warm-dark">
                  <strong>Check your email</strong> – You&apos;ll receive a
                  confirmation email with download links to all your digital
                  products within the next few minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-pink-accent text-white">
                <span className="text-sm font-semibold">2</span>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-base leading-relaxed text-brand-gray-warm-dark">
                  <strong>Download your files</strong> – Click the download
                  links in your email to access your products. Save them to your
                  device for easy access.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-pink-accent text-white">
                <span className="text-sm font-semibold">3</span>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-base leading-relaxed text-brand-gray-warm-dark">
                  <strong>Start creating meaningful moments</strong> –
                  Personalize your products and share them with the people you
                  love.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-white p-4">
            <p className="text-sm text-brand-gray-warm">
              💌 <strong>Didn&apos;t receive your email?</strong> Check your
              spam folder or contact us at{" "}
              <a
                href="mailto:support@digitallove.com"
                className="text-brand-pink-accent underline hover:text-brand-pink-accent/80"
              >
                support@digitallove.com
              </a>
            </p>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button variant="primary" size="lg">
              Back to Homepage
            </Button>
          </Link>
          <Link href="/collections/all">
            <Button variant="secondary" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
