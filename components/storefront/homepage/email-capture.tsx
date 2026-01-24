"use client";

import * as React from "react";
import { Input } from "@/components/storefront/shared/input";
import { Button } from "@/components/storefront/shared/button";
import { cn } from "@/lib/utils";

interface EmailCaptureProps {
  onSubmit: (email: string) => Promise<void>;
  className?: string;
}

export function EmailCapture({ onSubmit, className }: EmailCaptureProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate email format
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await onSubmit(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      // Keep the email value on error as per requirements
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={cn("py-16 md:py-24 bg-gradient-to-b from-brand-pink-soft to-white", className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          {/* Title */}
          <h2 className="text-3xl font-bold text-brand-gray-warm-dark md:text-4xl">
            Stay Connected 💌
          </h2>

          {/* Description */}
          <p className="mt-4 text-lg text-brand-gray-warm">
            Get thoughtful relationship tips, new product releases, and exclusive offers delivered to your inbox.
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  disabled={loading || success}
                  aria-label="Email address"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="default"
                loading={loading}
                disabled={loading || success}
                className="sm:w-auto"
              >
                Subscribe
              </Button>
            </div>
          </form>

          {/* Success Message */}
          {success && (
            <div
              className="mt-4 rounded-lg bg-green-50 p-4 text-green-800"
              role="alert"
            >
              <p className="font-medium">✓ Thank you for subscribing!</p>
              <p className="mt-1 text-sm">
                You&apos;ll receive our next update in your inbox soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
