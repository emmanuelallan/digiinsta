"use client";

import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface Collection {
  slug: string;
  name: string;
  icon: string; // This is actually the imageUrl from the database
}

interface CollectionCardsProps {
  collections: Collection[];
  className?: string;
}

export function CollectionCards({
  collections,
  className,
}: CollectionCardsProps) {
  return (
    <section className={cn("py-16 bg-white", className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="group block"
            >
              <div className="space-y-3">
                {/* Collection Image */}
                <div className="relative aspect-[1/1] overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={collection.icon}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-300"
                  />
                </div>

                {/* Title and Arrow Below */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    {collection.name}
                  </h3>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    className="text-gray-900 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
