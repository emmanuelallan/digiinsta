import * as React from "react";
import { Step } from "@/lib/types/storefront";
import { cn } from "@/lib/utils";

interface HowToUseProps {
  steps: Step[];
  className?: string;
}

export function HowToUse({ steps, className }: HowToUseProps) {
  // Display exactly three steps as per requirements
  const sortedSteps = [...steps].sort((a, b) => a.number - b.number).slice(0, 3);

  if (sortedSteps.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-semibold text-brand-gray-warm-dark">
        How to use it
      </h2>
      
      <div className="space-y-6">
        {sortedSteps.map((step) => (
          <div key={step.number} className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-pink-accent text-white">
              <span className="text-lg font-semibold">{step.number}</span>
            </div>
            <div className="flex-1 space-y-1 pt-1">
              <h3 className="font-semibold text-brand-gray-warm-dark">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-brand-gray-warm">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reassurance text */}
      <p className="rounded-lg bg-brand-pink-soft p-4 text-sm text-brand-gray-warm-dark">
        💖 No experience needed. Everything is designed to be simple and intuitive.
      </p>
    </section>
  );
}
