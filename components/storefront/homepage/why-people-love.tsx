"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ValuePoint {
  icon: string;
  title: string;
  description: string;
}

interface WhyPeopleLoveProps {
  valuePoints: ValuePoint[];
  className?: string;
}

export function WhyPeopleLove({ valuePoints, className }: WhyPeopleLoveProps) {
  // Display exactly three value points as per requirements
  const displayPoints = valuePoints.slice(0, 3);

  return (
    <section className={cn("py-16 md:py-24 bg-white", className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-brand-gray-warm-dark md:text-4xl">
            Why People Love Us
          </h2>
          <p className="mt-4 text-lg text-brand-gray-warm">
            Thoughtfully designed for real connection
          </p>
        </div>

        {/* Value Points Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {displayPoints.map((point, index) => (
            <div key={index} className="text-center">
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink-soft text-3xl">
                  {point.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="mb-3 text-xl font-semibold text-brand-gray-warm-dark">
                {point.title}
              </h3>

              {/* Description */}
              <p className="text-base text-brand-gray-warm leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
