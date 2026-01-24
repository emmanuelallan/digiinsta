"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/storefront/shared/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log error to error reporting service
    console.error("Storefront error:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6">
        {/* Decorative Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <svg
            className="h-10 w-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <div>
          <h1 className="mb-3 text-4xl font-semibold text-brand-gray-warm-dark md:text-5xl">
            Something Went Wrong
          </h1>
          <p className="text-lg text-brand-gray-warm">
            We encountered an unexpected error. Please try again or return to the homepage.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="primary" onClick={reset} className="w-full sm:w-auto">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary" className="w-full sm:w-auto">
              Back to Homepage
            </Button>
          </Link>
        </div>

        {/* Support Contact */}
        <p className="text-sm text-brand-gray-warm">
          Need help?{" "}
          <a
            href="mailto:support@digitallove.com"
            className="text-brand-pink-accent underline hover:text-brand-pink-accent/80"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
