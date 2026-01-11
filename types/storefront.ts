/**
 * Storefront Type Definitions
 *
 * Types for the customer-facing storefront components.
 * Updated to use Sanity types instead of Payload CMS.
 *
 * Requirements: 3.1, 6.5, 11.1-11.5 - Storefront types with Sanity integration
 */

import type {
  SanityCategory,
  SanitySubcategory,
  SanitySubcategoryExpanded,
  SanityProduct,
  SanityProductExpanded,
  SanityBundle,
  SanityBundleExpanded,
  SanityCreator,
  SanityTargetGroup,
  SanityTargetGroupExpanded,
  SanityPost,
  SanityPostExpanded,
  SanityPostCategory,
  SanityHeroSlide,
  SanitySiteSettings,
  SanityImage,
  SanitySlug,
  ProductListItem,
  BundleListItem,
  PostListItem,
} from "./sanity";

import type { PriceResult } from "@/lib/pricing/resolver";

// Re-export Sanity types for convenience
export type {
  SanityCategory,
  SanitySubcategory,
  SanitySubcategoryExpanded,
  SanityProduct,
  SanityProductExpanded,
  SanityBundle,
  SanityBundleExpanded,
  SanityCreator,
  SanityTargetGroup,
  SanityTargetGroupExpanded,
  SanityPost,
  SanityPostExpanded,
  SanityPostCategory,
  SanityHeroSlide,
  SanitySiteSettings,
  SanityImage,
  SanitySlug,
  ProductListItem,
  BundleListItem,
  PostListItem,
};

// ============================================================================
// Resolved Price Types
// ============================================================================

export type { PriceResult };

/**
 * Product with resolved price information
 * Includes computed properties for component compatibility
 */
export interface StorefrontProduct extends Omit<ProductListItem, "slug"> {
  resolvedPrice: PriceResult;
  // Computed properties for component compatibility
  id: string; // Alias for _id
  slug: string; // Flattened from slug.current
  price: number; // Resolved price in cents
  createdAt: string; // Alias for _createdAt
}

/**
 * Full product detail with all expanded references and resolved price
 * Includes computed properties for component compatibility
 */
export interface StorefrontProductDetail extends SanityProductExpanded {
  resolvedPrice: PriceResult;
  // Computed properties for component compatibility
  id?: string; // Alias for _id
  price?: number; // Resolved price in cents
  createdAt?: string; // Alias for _createdAt
}

/**
 * Full product detail with all expanded references and resolved price
 */
export interface StorefrontProductDetail extends SanityProductExpanded {
  resolvedPrice: PriceResult;
}

/**
 * Bundle with resolved price information
 */
export interface StorefrontBundle extends BundleListItem {
  resolvedPrice: PriceResult;
  products?: StorefrontProductDetail[];
  // Computed properties for component compatibility
  id?: string; // Alias for _id
}

/**
 * Full bundle detail with expanded products and resolved price
 */
export interface StorefrontBundleDetail extends Omit<SanityBundleExpanded, "products"> {
  products: StorefrontProductDetail[];
  resolvedPrice: PriceResult;
}

// ============================================================================
// Category Types
// ============================================================================

/**
 * Category with subcategories and computed fields
 */
export interface StorefrontCategory extends SanityCategory {
  subcategories?: SanitySubcategory[];
  productCount?: number;
  // Computed alias for _id
  id?: string;
}

/**
 * Subcategory with category and product count
 */
export interface StorefrontSubcategory extends SanitySubcategoryExpanded {
  productCount?: number;
}

// ============================================================================
// Discovery Types
// ============================================================================

/**
 * New arrivals response
 */
export interface NewArrivalsResult {
  products: StorefrontProduct[];
  total: number;
}

/**
 * Best sellers response
 */
export interface BestSellersResult {
  products: StorefrontProduct[];
  total: number;
}

/**
 * On sale products response
 */
export interface OnSaleResult {
  products: StorefrontProduct[];
  bundles: StorefrontBundle[];
  total: number;
}

/**
 * Related products response
 */
export interface RelatedProductsResult {
  products: StorefrontProduct[];
}

/**
 * Frequently bought together response
 */
export interface FrequentlyBoughtTogetherResult {
  products: StorefrontProduct[];
}

// ============================================================================
// Search Types
// ============================================================================

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
 * Search filters
 */
export interface SearchFilters {
  query?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  targetGroupSlug?: string;
  onSale?: boolean;
  sortBy?: "newest" | "price-asc" | "price-desc" | "popular";
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================================================
// Target Group / Persona Types
// ============================================================================

/**
 * Persona definition for "Shop by Persona" section
 */
export interface Persona extends SanityTargetGroupExpanded {
  productCount?: number;
}

// ============================================================================
// UI Component Types
// ============================================================================

/**
 * Product card display variant
 */
export type ProductCardVariant = "default" | "compact" | "featured" | "horizontal";

/**
 * Product tray/section types
 */
export type ProductTrayType =
  | "new-arrivals"
  | "editors-pick"
  | "best-sellers"
  | "related"
  | "on-sale";

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
 * Hero section configuration (from Sanity HeroSlide)
 */
export interface HeroConfig {
  headline: string;
  subheadline?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  backgroundImage?: SanityImage;
  mobileImage?: SanityImage;
  textPosition?: "left" | "center" | "right";
  textColor?: "white" | "black";
  overlayOpacity?: number;
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
  backgroundImage?: SanityImage;
  bundle?: StorefrontBundleDetail;
}

/**
 * Category card for showcase section
 */
export interface CategoryCardData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  productCount: number;
  image?: SanityImage;
  gradient?: string;
}

// ============================================================================
// Blog Types
// ============================================================================

/**
 * Blog post for storefront display
 */
export type StorefrontPost = PostListItem;

/**
 * Full blog post detail
 */
export type StorefrontPostDetail = SanityPostExpanded;

/**
 * Blog category with post count
 */
export interface StorefrontPostCategory extends SanityPostCategory {
  postCount?: number;
}

// ============================================================================
// Cart Types
// ============================================================================

/**
 * Cart item (product or bundle)
 */
export interface CartItem {
  id: string;
  type: "product" | "bundle";
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image?: SanityImage;
  polarProductId: string;
  quantity: number;
}

/**
 * Cart state
 */
export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ============================================================================
// Order Types (for customer-facing order history)
// ============================================================================

/**
 * Order item for display
 */
export interface OrderItem {
  id: number;
  type: "product" | "bundle";
  sanityId: string;
  title: string;
  price: number;
  fileKey?: string;
  maxDownloads: number;
  downloadsUsed: number;
  canDownload: boolean;
}

/**
 * Order for display
 */
export interface Order {
  id: number;
  polarOrderId: string;
  email: string;
  status: string;
  totalAmount: number;
  currency: string;
  fulfilled: boolean;
  createdAt: string;
  items: OrderItem[];
}

// ============================================================================
// Fallback Data (for when Sanity data is unavailable)
// ============================================================================

/**
 * Predefined personas for the storefront
 * These are fallback values - actual data should come from Sanity TargetGroups
 */
export const PERSONAS = [
  {
    id: "student",
    title: "The Student",
    slug: "student",
    description: "Academic success tools for ambitious learners",
    tagline: "Ace your studies",
    icon: "GraduationCap",
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
    icon: "Briefcase",
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
    icon: "Heart",
    image: "/images/personas/couple.jpg",
    gradient: "from-rose-500 to-pink-600",
    categories: ["life-legacy", "wealth-finance"],
  },
] as const;

/**
 * Main category definitions with icons and gradients
 * These are fallback values - actual data comes from Sanity
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
