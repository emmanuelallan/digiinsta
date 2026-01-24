import * as React from "react";
import { cn } from "@/lib/utils";

interface WhyItWorksProps {
  statements: string[];
  className?: string;
}

export function WhyItWorks({ statements, className }: WhyItWorksProps) {
  // Display exactly three statements as per requirements
  const displayStatements = statements.slice(0, 3);

  if (displayStatements.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-semibold text-brand-gray-warm-dark">
        Why it works
      </h2>
      
      <div className="space-y-4">
        {displayStatements.map((statement, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-pink-soft">
              <span className="text-sm font-semibold text-brand-pink-accent">
                {index + 1}
              </span>
            </div>
            <p className="pt-1 text-base leading-relaxed text-brand-gray-warm-dark">
              {statement}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
