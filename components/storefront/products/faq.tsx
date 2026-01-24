"use client";

import * as React from "react";
import { FAQ as FAQType } from "@/lib/types/storefront";
import { cn } from "@/lib/utils";

interface FAQProps {
  faqs: FAQType[];
  className?: string;
}

export function FAQ({ faqs, className }: FAQProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // Sort FAQs by order and display 3-5 items
  const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order).slice(0, 5);

  if (sortedFaqs.length === 0) {
    return null;
  }

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-semibold text-brand-gray-warm-dark">
        Frequently asked questions
      </h2>
      
      <div className="space-y-3">
        {sortedFaqs.map((faq, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-brand-gray-warm-light bg-white"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-brand-pink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink-accent focus-visible:ring-offset-2"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="font-semibold text-brand-gray-warm-dark">
                {faq.question}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={cn(
                  "h-5 w-5 flex-shrink-0 text-brand-pink-accent transition-transform",
                  openIndex === index && "rotate-180"
                )}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {openIndex === index && (
              <div
                id={`faq-answer-${index}`}
                className="border-t border-brand-gray-warm-light bg-brand-pink-soft/30 p-5"
              >
                <p className="text-base leading-relaxed text-brand-gray-warm-dark">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
