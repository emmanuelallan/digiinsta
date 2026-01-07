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
  searchProductsWithFilters,
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
export {
  search,
  searchWithFilters,
  applyFiltersToProducts,
  applySortToProducts,
  productMatchesQuery,
  getFilterOptions,
} from "./search";
export type { SearchFilters, EnhancedSearchResult } from "./search";

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

// Recommendations utilities
export {
  getFrequentlyBoughtTogether,
  getCustomersAlsoViewed,
  getRelatedCategories,
  getSubcategoriesWithCounts,
} from "./recommendations";

// Search suggestions utilities
export {
  getSearchSuggestions,
  getPopularSuggestions,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  suggestionMatchesQuery,
} from "./search-suggestions";
export type { SearchSuggestion } from "./search-suggestions";
