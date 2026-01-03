/**
 * Storefront Data Fetching Utilities
 * Re-exports all storefront data fetching functions
 */

// Product utilities
export {
  getProducts,
  getProductBySlug,
  getNewArrivals,
  getEditorsPicks,
  getBestSellers,
  getSaleProducts,
  getRelatedProducts,
  searchProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  getProductsByPersona,
  getProductsGroupedBySubcategory,
} from "./products";

// Category utilities
export {
  getCategories,
  getCategoryBySlug,
  getSubcategories,
  getSubcategoryBySlug,
  getSubcategoriesByCategory,
  getCategoriesForMegaMenu,
  getCategoryProductCount,
  getSubcategoryProductCount,
  getCategoriesWithCounts,
  searchCategories,
  searchSubcategories,
} from "./categories";

// Bundle utilities
export { getBundles, getBundleBySlug, getFeaturedBundle, searchBundles } from "./bundles";

// Hero utilities
export { getHeroSlides } from "./hero";
export type { HeroSlide } from "./hero";

// Search utilities
export { search } from "./search";

// Blog utilities
export {
  getBlogPosts,
  getBlogPostBySlug,
  getRecentPosts,
  getRelatedPosts,
  getFeaturedPost,
  getBlogCategories,
} from "./blog";
export type { BlogPost } from "./blog";
