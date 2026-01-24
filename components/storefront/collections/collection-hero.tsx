import * as React from "react";
import { Collection } from "@/lib/types/storefront";
import { cn } from "@/lib/utils";

interface CollectionHeroProps {
  collection: Collection;
  className?: string;
}

export function CollectionHero({ collection, className }: CollectionHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-brand-pink-soft to-white py-12 md:py-16 lg:py-20",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Collection Icon */}
          {collection.icon && (
            <div className="mb-4 flex justify-center text-4xl md:text-5xl">
              {collection.icon}
            </div>
          )}

          {/* Collection Name */}
          <h1 className="mb-4 text-3xl font-semibold text-brand-gray-warm-dark md:text-4xl lg:text-5xl">
            {collection.name}
          </h1>

          {/* Emotional Description */}
          <p className="text-base text-brand-gray-warm md:text-lg lg:text-xl">
            {collection.emotionalCopy}
          </p>
        </div>
      </div>
    </section>
  );
}
