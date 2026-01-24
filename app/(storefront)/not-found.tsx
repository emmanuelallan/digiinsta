import Link from "next/link";
import { Button } from "@/components/storefront/shared/button";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6">
        {/* Decorative Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-pink-soft">
          <svg
            className="h-10 w-10 text-brand-pink-accent"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <div>
          <h1 className="mb-3 text-4xl font-semibold text-brand-gray-warm-dark md:text-5xl">
            Page Not Found
          </h1>
          <p className="text-lg text-brand-gray-warm">
            We couldn't find the page you're looking for. It may have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="primary" className="w-full sm:w-auto">
              Back to Homepage
            </Button>
          </Link>
          <Link href="/collections/all">
            <Button variant="secondary" className="w-full sm:w-auto">
              Browse Collections
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
