"use client";

import * as React from "react";
import { Step } from "@/lib/types/storefront";
import { cn } from "@/lib/utils";

interface HowItWorksProps {
  steps: Step[];
  className?: string;
}

export function HowItWorks({ steps, className }: HowItWorksProps) {
  // Ensure exactly three steps as per requirements
  const displaySteps = steps.slice(0, 3);

  return (
    <section className={cn("py-16 md:py-24 bg-white", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-brand-gray-warm-dark md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-brand-gray-warm">
            Simple steps to meaningful connection
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {displaySteps.map((step) => (
            <div key={step.number} className="text-center">
              {/* Step Number */}
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink-accent text-2xl font-bold text-white">
                  {step.number}
                </div>
              </div>

              {/* Step Title */}
              <h3 className="mb-3 text-xl font-semibold text-brand-gray-warm-dark">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-base text-brand-gray-warm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Micro-text about instant download */}
        <div className="mt-12 text-center">
          <p className="text-sm text-brand-gray-warm italic">
            ✨ All products are delivered instantly after purchase. No waiting, no shipping.
          </p>
        </div>
      </div>
    </section>
  );
}
