"use client";

import * as React from "react";
import Link from "next/link";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    // Log error to error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16 text-center">
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
              <h1 className="mb-3 text-4xl font-semibold text-gray-900 md:text-5xl">
                Something Went Wrong
              </h1>
              <p className="text-lg text-gray-600">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-full bg-pink-500 px-6 py-2.5 text-base font-medium text-white shadow-sm transition-all hover:bg-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-pink-300 bg-pink-50 px-6 py-2.5 text-base font-medium text-gray-800 transition-all hover:bg-pink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
              >
                Back to Homepage
              </Link>
            </div>

            {/* Support Contact */}
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <a
                href="mailto:support@digitallove.com"
                className="text-pink-500 underline hover:text-pink-600"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
