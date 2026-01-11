/**
 * Sanity Type Definitions
 *
 * TypeScript interfaces for all Sanity document types.
 * These types match the schemas defined in sanity/schemas/
 *
 * Requirements: 1.1 - Type definitions for Sanity CMS
 */

// ============================================================================
// Base Types
// ============================================================================

/**
 * Sanity document base fields (present on all documents)
 */
export interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
}

/**
 * Sanity slug type
 */
export interface SanitySlug {
  _type: "slug";
  current: string;
}

/**
 * Sanity image asset reference
 */
export interface SanityImageAsset {
  _ref: string;
  _type: "reference";
}

/**
 * Sanity image with hotspot
 */
export interface SanityImage {
  _type: "image";
  _key?: string;
  asset: SanityImageAsset;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  // Computed URL (populated by urlFor helper)
  url?: string;
  // Alt text for accessibility
  alt?: string;
}

/**
 * Sanity reference type
 * The generic parameter indicates the referenced document type for documentation purposes
 */
export interface SanityReference<_T extends string = string> {
  _ref: string;
  _type: "reference";
  _key?: string;
}

/**
 * Sanity block content (portable text)
 */
export interface SanityBlock {
  _type: "block";
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  children: Array<{
    _type: "span";
    _key: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    [key: string]: unknown;
  }>;
}

export type BlockContent = Array<SanityBlock | SanityImage>;

// ============================================================================
// Document Types
// ============================================================================

/**
 * Category document
 */
export interface SanityCategory extends SanityDocument {
  _type: "category";
  title: string;
  slug: SanitySlug;
  description?: string;
  image?: SanityImage;
  icon?: "Microscope" | "ChartLine" | "Sparkles" | "Palette" | "Workflow" | "Folder";
  gradient?: string;
  displayOrder?: number;
  status?: "active" | "archived";
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Subcategory document
 */
export interface SanitySubcategory extends SanityDocument {
  _type: "subcategory";
  title: string;
  slug: SanitySlug;
  description?: string;
  category: SanityReference<"category">;
  defaultPrice: number;
  compareAtPrice?: number;
  status?: "active" | "archived";
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Subcategory with expanded category reference
 */
export interface SanitySubcategoryExpanded extends Omit<SanitySubcategory, "category"> {
  category: SanityCategory;
}

/**
 * Creator document
 */
export interface SanityCreator extends SanityDocument {
  _type: "creator";
  name: string;
  email: string;
  slug: SanitySlug;
  bio?: string;
  status?: "active" | "inactive";
}

/**
 * Target group document
 */
export interface SanityTargetGroup extends SanityDocument {
  _type: "targetGroup";
  title: string;
  slug: SanitySlug;
  description?: string;
  tagline?: string;
  icon?: "GraduationCap" | "Briefcase" | "Heart" | "Users" | "Star";
  image?: SanityImage;
  gradient?: string;
  relatedCategories?: SanityReference<"category">[];
}

/**
 * Target group with expanded category references
 */
export interface SanityTargetGroupExpanded extends Omit<SanityTargetGroup, "relatedCategories"> {
  relatedCategories?: SanityCategory[];
}

/**
 * Product document
 */
export interface SanityProduct extends SanityDocument {
  _type: "product";
  title: string;
  slug: SanitySlug;
  description?: BlockContent;
  shortDescription?: string;
  subcategory: SanityReference<"subcategory">;
  creator?: SanityReference<"creator">;
  polarProductId: string;
  customPrice?: number;
  compareAtPrice?: number;
  images?: SanityImage[];
  productFileKey?: string;
  productFileName?: string;
  productFileSize?: number;
  status?: "active" | "draft" | "archived";
  tags?: string[];
  targetGroups?: SanityReference<"targetGroup">[];
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Product with expanded references
 */
export interface SanityProductExpanded extends Omit<
  SanityProduct,
  "subcategory" | "creator" | "targetGroups"
> {
  subcategory: SanitySubcategoryExpanded;
  creator?: SanityCreator;
  targetGroups?: SanityTargetGroup[];
}

/**
 * Bundle document
 */
export interface SanityBundle extends SanityDocument {
  _type: "bundle";
  title: string;
  slug: SanitySlug;
  description?: BlockContent;
  shortDescription?: string;
  products: SanityReference<"product">[];
  polarProductId: string;
  price: number;
  compareAtPrice?: number;
  heroImage?: SanityImage;
  status?: "active" | "draft" | "archived";
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Bundle with expanded product references
 */
export interface SanityBundleExpanded extends Omit<SanityBundle, "products"> {
  products: SanityProductExpanded[];
}

/**
 * Post category document
 */
export interface SanityPostCategory extends SanityDocument {
  _type: "postCategory";
  title: string;
  slug: SanitySlug;
  description?: string;
  displayOrder?: number;
}

/**
 * Blog post document
 */
export interface SanityPost extends SanityDocument {
  _type: "post";
  title: string;
  slug: SanitySlug;
  content: BlockContent;
  excerpt?: string;
  coverImage?: SanityImage;
  category?: SanityReference<"postCategory">;
  author?: string;
  publishedAt?: string;
  status?: "published" | "draft" | "archived";
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Post with expanded category reference
 */
export interface SanityPostExpanded extends Omit<SanityPost, "category"> {
  category?: SanityPostCategory;
}

/**
 * CTA (Call to Action) object
 */
export interface SanityCta {
  text?: string;
  url?: string;
}

/**
 * Hero slide document
 */
export interface SanityHeroSlide extends SanityDocument {
  _type: "heroSlide";
  title: string;
  headline: string;
  subheadline?: string;
  image: SanityImage;
  mobileImage?: SanityImage;
  primaryCta?: SanityCta;
  secondaryCta?: SanityCta;
  textPosition?: "left" | "center" | "right";
  textColor?: "white" | "black";
  overlayOpacity?: number;
  displayOrder?: number;
  status?: "active" | "inactive";
}

/**
 * Social links object
 */
export interface SanitySocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

/**
 * Site settings document (singleton)
 */
export interface SanitySiteSettings extends SanityDocument {
  _type: "siteSettings";
  siteName: string;
  siteDescription?: string;
  defaultMetaImage?: SanityImage;
  socialLinks?: SanitySocialLinks;
  contactEmail?: string;
  footerText?: string;
}

/**
 * SEO object (reusable)
 */
export interface SanitySeo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
  noIndex?: boolean;
}

// ============================================================================
// Query Result Types
// ============================================================================

/**
 * Category with subcategories and product count
 */
export interface CategoryWithSubcategories extends SanityCategory {
  subcategories: SanitySubcategory[];
  productCount: number;
}

/**
 * Subcategory with product count
 */
export interface SubcategoryWithProductCount extends SanitySubcategoryExpanded {
  productCount: number;
}

/**
 * Product list item (minimal fields for lists)
 */
export interface ProductListItem {
  _id: string;
  _createdAt: string;
  title: string;
  slug: SanitySlug;
  shortDescription?: string;
  images?: SanityImage[];
  status?: "active" | "draft" | "archived";
  tags?: string[];
  customPrice?: number;
  compareAtPrice?: number;
  polarProductId?: string;
  subcategory: {
    _id: string;
    title: string;
    slug: SanitySlug;
    defaultPrice: number;
    compareAtPrice?: number;
    category: {
      _id: string;
      title: string;
      slug: SanitySlug;
    };
  };
  creator?: {
    _id: string;
    name: string;
    slug: SanitySlug;
  };
}

/**
 * Bundle list item (minimal fields for lists)
 */
export interface BundleListItem {
  _id: string;
  _createdAt: string;
  title: string;
  slug: SanitySlug;
  shortDescription?: string;
  heroImage?: SanityImage;
  price: number;
  compareAtPrice?: number;
  status?: "active" | "draft" | "archived";
  productCount: number;
}

/**
 * Post list item (minimal fields for lists)
 */
export interface PostListItem {
  _id: string;
  _createdAt: string;
  title: string;
  slug: SanitySlug;
  excerpt?: string;
  coverImage?: SanityImage;
  author?: string;
  publishedAt?: string;
  status?: "published" | "draft" | "archived";
  category?: {
    _id: string;
    title: string;
    slug: SanitySlug;
  };
}
