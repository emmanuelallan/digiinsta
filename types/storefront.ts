/**
 * Storefront Type Definitions
 * Types for the customer-facing storefront components
 */

import type { Product, Category, Subcategory, Bundle, Media } from "@/payload-types";

// Re-export Payload types for convenience
export type { Product, Category, Subcategory, Bundle, Media };

/**
 * Subcategory with populated category
 */
export interface StorefrontSubcategory extends Omit<Subcategory, "category"> {
  category: StorefrontCategory;
}

/**
 * Product with populated relations for storefront display
 */
export interface StorefrontProduct extends Omit<
  Product,
  "subcategory" | "images" | "file" | "price" | "compareAtPrice"
> {
  subcategory: StorefrontSubcategory;
  images?: Array<{
    image: Media;
    alt?: string | null;
    id?: string | null;
  }> | null;
  file: Media;
  // Price fields (from Payload, but made optional for display flexibility)
  price?: number;
  compareAtPrice?: number | null;
}

/**
 * Category with subcategories and computed fields
 */
export interface StorefrontCategory extends Omit<Category, "image"> {
  subcategories?: StorefrontSubcategory[];
  productCount?: number;
  image?: Media | null;
}

/**
 * Bundle with populated products for storefront display
 */
export interface StorefrontBundle extends Omit<
  Bundle,
  "products" | "heroImage" | "price" | "compareAtPrice"
> {
  products: StorefrontProduct[];
  heroImage?: Media | null;
  // Price fields (from Payload, but made optional for display flexibility)
  price?: number;
  compareAtPrice?: number | null;
  // Computed fields
  savings?: number;
  savingsPercentage?: number;
}

/**
 * Persona definition for "Shop by Persona" section
 */
export interface Persona {
  id: string;
  title: string;
  slug: string;
  description: string;
  tagline: string;
  iconName: string;
  image: string;
  gradient: string;
  categories: string[];
}

/**
 * Search result types
 */
export interface SearchResult {
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  bundles: StorefrontBundle[];
  totalResults: number;
}

/**
 * Product card display variant
 */
export type ProductCardVariant = "default" | "compact" | "featured" | "horizontal";

/**
 * Product tray/section types
 */
export type ProductTrayType = "new-arrivals" | "editors-pick" | "best-sellers" | "related";

/**
 * Navigation menu item
 */
export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  children?: NavItem[];
  featured?: boolean;
}

/**
 * Mega menu category with subcategories
 */
export interface MegaMenuCategory {
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  href: string;
  subcategories: Array<{
    title: string;
    slug: string;
    href: string;
  }>;
  featuredProducts?: StorefrontProduct[];
}

/**
 * Hero section configuration
 */
export interface HeroConfig {
  headline: string;
  subheadline: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  backgroundImage?: string;
  backgroundVideo?: string;
}

/**
 * Bundle banner configuration
 */
export interface BundleBannerConfig {
  title: string;
  description: string;
  savings: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundImage?: string;
  bundle?: StorefrontBundle;
}

/**
 * Category card for showcase section
 */
export interface CategoryCardData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon: string;
  productCount: number;
  image?: string;
  gradient: string;
}

/**
 * Predefined personas for the storefront
 */
export const PERSONAS: Persona[] = [
  {
    id: "student",
    title: "The Student",
    slug: "student",
    description: "Academic success tools for ambitious learners",
    tagline: "Ace your studies",
    iconName: "GraduationCap",
    image: "/images/personas/student.jpg",
    gradient: "from-blue-500 to-indigo-600",
    categories: ["academic-bio-med", "work-flow"],
  },
  {
    id: "professional",
    title: "The Professional",
    slug: "professional",
    description: "Wealth & efficiency tools for career growth",
    tagline: "Level up your career",
    iconName: "Briefcase",
    image: "/images/personas/professional.jpg",
    gradient: "from-emerald-500 to-teal-600",
    categories: ["wealth-finance", "work-flow"],
  },
  {
    id: "couple",
    title: "The Couple",
    slug: "couple",
    description: "Connection & planning tools for your journey together",
    tagline: "Build your future",
    iconName: "Heart",
    image: "/images/personas/couple.jpg",
    gradient: "from-rose-500 to-pink-600",
    categories: ["life-legacy", "wealth-finance"],
  },
];

/**
 * Main category definitions with icons and gradients
 * These are fallback values - actual data comes from the database
 */
export const MAIN_CATEGORIES: CategoryCardData[] = [
  {
    id: "academic-bio-med",
    title: "Academic & Bio-Med",
    slug: "academic-bio-med",
    description: "Study systems, lab templates, and scientific resources",
    icon: "Microscope",
    productCount: 0,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "wealth-finance",
    title: "Wealth & Finance",
    slug: "wealth-finance",
    description: "Budgeting, investment tracking, and financial tools",
    icon: "ChartLine",
    productCount: 0,
    gradient: "from-emerald-500 to-green-500",
  },
  {
    id: "life-legacy",
    title: "Life & Legacy",
    slug: "life-legacy",
    description: "Journals, wedding planning, and goal setting",
    icon: "Sparkles",
    productCount: 0,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "digital-aesthetic",
    title: "Digital Aesthetic",
    slug: "digital-aesthetic",
    description: "Device customization, presets, and branding",
    icon: "Palette",
    productCount: 0,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "work-flow",
    title: "Work & Flow",
    slug: "work-flow",
    description: "Career growth, data viz, and productivity systems",
    icon: "Workflow",
    productCount: 0,
    gradient: "from-indigo-500 to-violet-500",
  },
];
