import { groq } from "next-sanity";

// Product fields for discovery queries (same as products.ts)
const productFields = groq`
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  shortDescription,
  polarProductId,
  customPrice,
  compareAtPrice,
  images,
  productFileKey,
  productFileName,
  productFileSize,
  status,
  tags,
  metaTitle,
  metaDescription,
  "subcategory": subcategory->{
    _id,
    title,
    "slug": slug.current,
    defaultPrice,
    compareAtPrice,
    "category": category->{
      _id,
      title,
      "slug": slug.current
    }
  },
  "creator": creator->{
    _id,
    name,
    "slug": slug.current,
    bio,
    status
  },
  "targetGroups": targetGroups[]->{
    _id,
    title,
    "slug": slug.current
  }
`;

// Get new arrivals (products created within the last 30 days)
// Uses dateTime function to compare _createdAt with current date minus 30 days
export const getNewArrivalsQuery = groq`
  *[_type == "product" && status == "active" && dateTime(_createdAt) > dateTime(now()) - 60*60*24*30] | order(_createdAt desc) [0...$limit] {
    ${productFields}
  }
`;

// Get new arrivals count
export const getNewArrivalsCountQuery = groq`
  count(*[_type == "product" && status == "active" && dateTime(_createdAt) > dateTime(now()) - 60*60*24*30])
`;

// Get related products by same subcategory (excluding current product)
export const getRelatedBySubcategoryQuery = groq`
  *[_type == "product" && status == "active" && subcategory._ref == $subcategoryId && _id != $currentProductId] | order(_createdAt desc) [0...$limit] {
    ${productFields}
  }
`;

// Get related products by tags (excluding current product)
export const getRelatedByTagsQuery = groq`
  *[_type == "product" && status == "active" && _id != $currentProductId && count((tags)[@ in $tags]) > 0] | order(_createdAt desc) [0...$limit] {
    ${productFields}
  }
`;

// Get related products by subcategory OR tags (combined, excluding current product)
export const getRelatedProductsQuery = groq`
  *[_type == "product" && status == "active" && _id != $currentProductId && (
    subcategory._ref == $subcategoryId ||
    count((tags)[@ in $tags]) > 0
  )] | order(_createdAt desc) [0...$limit] {
    ${productFields}
  }
`;

// Get products on sale (compareAtPrice > effective price)
export const getOnSaleProductsQuery = groq`
  *[_type == "product" && status == "active" && (
    (defined(customPrice) && defined(compareAtPrice) && compareAtPrice > customPrice) ||
    (!defined(customPrice) && defined(subcategory->compareAtPrice) && subcategory->compareAtPrice > subcategory->defaultPrice)
  )] | order(_createdAt desc) [0...$limit] {
    ${productFields}
  }
`;

// Get on sale products count
export const getOnSaleProductsCountQuery = groq`
  count(*[_type == "product" && status == "active" && (
    (defined(customPrice) && defined(compareAtPrice) && compareAtPrice > customPrice) ||
    (!defined(customPrice) && defined(subcategory->compareAtPrice) && subcategory->compareAtPrice > subcategory->defaultPrice)
  )])
`;

// Get featured products (can be extended with a "featured" field if needed)
// For now, returns most recent active products
export const getFeaturedProductsQuery = groq`
  *[_type == "product" && status == "active"] | order(_createdAt desc) [0...$limit] {
    ${productFields}
  }
`;

// Target group fields for persona pages
const targetGroupFields = groq`
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  tagline,
  icon,
  image,
  gradient,
  "relatedCategories": relatedCategories[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    gradient
  }
`;

// Get all target groups
export const getAllTargetGroupsQuery = groq`
  *[_type == "targetGroup"] | order(title asc) {
    ${targetGroupFields}
  }
`;

// Get a single target group by slug
export const getTargetGroupBySlugQuery = groq`
  *[_type == "targetGroup" && slug.current == $slug][0] {
    ${targetGroupFields}
  }
`;

// Helper functions for date filtering (used in property tests)
// These are pure functions that don't require Sanity client
// Re-exported from discovery-utils.ts for convenience
export { isNewArrival, isRelatedProduct, filterRelatedProducts } from "./discovery-utils";
export type { RelatedProductInput } from "./discovery-utils";
