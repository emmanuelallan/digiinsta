import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  GraduationCap,
  Briefcase01Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { SectionHeader } from "../shared/SectionHeader";
import { PERSONAS } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface PersonaCardsProps {
  className?: string;
}

// Icon mapping
const personaIcons: Record<string, IconSvgElement> = {
  GraduationCap: GraduationCap,
  Briefcase: Briefcase01Icon,
  Heart: FavouriteIcon,
};

// Image mapping to the actual feature images
const personaImages: Record<string, string> = {
  student: "/images/features/student.png",
  professional: "/images/features/professional.png",
  couple: "/images/features/couples.png",
};

export function PersonaCards({ className }: PersonaCardsProps) {
  return (
    <section id="shop-by-persona" className={className}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Shop by Persona"
          subtitle="Find products curated for your specific needs and goals"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {PERSONAS.map((persona) => {
            const iconElement = personaIcons[persona.iconName] || GraduationCap;
            const imageUrl = personaImages[persona.id] || persona.image;

            return (
              <Link
                key={persona.id}
                href={`/shop/${persona.slug}`}
                className="group relative block overflow-hidden rounded-2xl"
              >
                {/* Card Container */}
                <div className="relative aspect-[3/4] sm:aspect-[4/5]">
                  {/* Background Image */}
                  <Image
                    src={imageUrl}
                    alt={persona.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Gradient Overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 transition-opacity group-hover:opacity-90"
                    )}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-8">
                    {/* Icon Badge */}
                    <div className="mb-4">
                      <div
                        className={cn(
                          "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br backdrop-blur-sm",
                          persona.gradient
                        )}
                      >
                        <HugeiconsIcon icon={iconElement} size={24} />
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="mb-1 text-sm font-medium tracking-wider text-white/80 uppercase">
                      {persona.tagline}
                    </p>

                    {/* Title */}
                    <h3 className="mb-2 text-2xl font-bold sm:text-3xl">{persona.title}</h3>

                    {/* Description */}
                    <p className="mb-4 line-clamp-2 text-sm text-white/80 sm:text-base">
                      {persona.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3">
                      <span>Shop Now</span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
