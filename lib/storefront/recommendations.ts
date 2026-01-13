/**
 * Product Recommendations Service
 * Server-side functions for fetching product recommendations using Sanity CMS
 *
 * Requirements: 11.1-11.2 - Product recommendations
 */

import {
  getAllProducts as sanityGetAllProducts,
  getProductsByCategorySlug,
  type SanityProduct,
} from "@/lib/sanity/queries/products";
import {
  getAllCategories,
  getCategoryBySlug,
  getSubcategoriesByCategorySlug,
  type SanityCategory,
  type SanitySubcategory,
} from "@/lib/sanity/queries/categories";
import { resolveProductPrice } from "@/lib/pricing/resolver";
import type {
  StorefrontProduct,
  StorefrontSubcategory,
  StorefrontCategory,
} from "@/types/storefront";

// ISR revalidation time in seconds (5 minutes)
export const RECOMMENDATIONS_REVALIDATE = 300;

/**
 * Get frequently bought together products
 * Returns products from the same subcategory that complement the source product
 *
 * @param productId - The source product Sanity ID to find recommendations for
 * @param limit - Maximum number of products to return (default: 4)
 * @returns Array of recommended products, excluding the source product
 */
export async function getFrequentlyBoughtTogether(
  productId: string,
  limit = 4
): Promise<StorefrontProduct[]> {
  // Get all products to find the source product
  const allProducts = await sanityGetAllProducts();
  const sourceProduct = allProducts.find((p) => p._id === productId);

  if (!sourceProduct) {
    return [];
  }

  const subcategoryId = sourceProduct.subcategory._id;

  // Get products from the same subcategory, excluding the source product
  const subcategoryProducts = allProducts.filter(
    (p) => p.subcategory._id === subcategoryId && p._id !== productId
  );

  // Sort by newest and limit
  const sortedProducts = subcategoryProducts
    .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
    .slice(0, limit);

  return sortedProducts.map(transformProduct);
}

/**
 * Get customers also viewed products
 * Returns products from the same category (via sibling subcategories) or related categories
 *
 * @param productId - The source product Sanity ID to find recommendations for
 * @param categorySlug - The category slug to find related products from
 * @param limit - Maximum number of products to return (default: 4)
 * @returns Array of recommended products, excluding the source product
 */
export async function getCustomersAlsoViewed(
  productId: string,
  categorySlug: string,
  limit = 4
): Promise<StorefrontProduct[]> {
  // Get products from the same category
  const categoryProducts = await getProductsByCategorySlug(categorySlug);

  // Filter out the source product and limit
  const filteredProducts = categoryProducts
    .filter((p) => p._id !== productId)
    .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
    .slice(0, limit);

  return filteredProducts.map(transformProduct);
}

/**
 * Get related categories (sibling categories and current category info)
 *
 * @param categorySlug - The current category slug
 * @param limit - Maximum number of sibling categories to return (default: 4)
 * @returns Object containing current category and sibling categories
 */
export async function getRelatedCategories(
  categorySlug: string,
  limit = 4
): Promise<{
  siblings: StorefrontCategory[];
  current: StorefrontCategory | null;
}> {
  // Get the current category
  const currentCategory = await getCategoryBySlug(categorySlug);

  if (!currentCategory) {
    return { siblings: [], current: null };
  }

  // Get all categories to find siblings
  const allCategories = await getAllCategories();

  // Filter out current category and limit
  const siblings = allCategories.filter((c) => c._id !== currentCategory._id).slice(0, limit);

  return {
    current: transformCategory(currentCategory),
    siblings: siblings.map(transformCategory),
  };
}

/**
 * Get subcategories for a category (for internal linking)
 *
 * @param categorySlug - The category slug to get subcategories for
 * @returns Array of subcategories with product counts
 */
export async function getSubcategoriesWithCounts(
  categorySlug: string
): Promise<Array<StorefrontSubcategory & { productCount: number }>> {
  // Get subcategories for this category
  const subcategories = await getSubcategoriesByCategorySlug(categorySlug);

  // Get all products to count per subcategory
  const allProducts = await sanityGetAllProducts();

  // Calculate product counts for each subcategory
  const subcategoriesWithCounts = subcategories.map((subcategory: SanitySubcategory) => {
    const productCount = allProducts.filter((p) => p.subcategory._id === subcategory._id).length;

    return {
      ...transformSubcategory(subcategory),
      productCount,
    };
  });

  return subcategoriesWithCounts;
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform Sanity category to storefront category
 */
function transformCategory(category: SanityCategory): StorefrontCategory {
  return {
    _id: category._id,
    _type: "category",
    _createdAt: category._createdAt,
    _updatedAt: category._updatedAt,
    _rev: "",
    title: category.title,
    slug: { _type: "slug", current: category.slug },
    description: category.description,
    icon: category.icon as StorefrontCategory["icon"],
    displayOrder: category.displayOrder,
  };
}

/**
 * Transform Sanity subcategory to storefront subcategory
 */
function transformSubcategory(subcategory: SanitySubcategory): StorefrontSubcategory {
  return {
    _id: subcategory._id,
    _type: "subcategory",
    _createdAt: subcategory._createdAt,
    _updatedAt: subcategory._updatedAt,
    _rev: "",
    title: subcategory.title,
    slug: { _type: "slug", current: subcategory.slug },
    description: subcategory.description,
    defaultPrice: subcategory.defaultPrice,
    compareAtPrice: subcategory.compareAtPrice,
    category: {
      _id: subcategory.category._id,
      _type: "category",
      _createdAt: "",
      _updatedAt: "",
      _rev: "",
      title: subcategory.category.title,
      slug: { _type: "slug", current: subcategory.category.slug },
    },
  };
}

/**
 * Transform Sanity product to storefront product with resolved price
 */
function transformProduct(product: SanityProduct): StorefrontProduct {
  const resolvedPrice = resolveProductPrice(
    {
      customPrice: product.customPrice,
      compareAtPrice: product.compareAtPrice,
    },
    {
      defaultPrice: product.subcategory.defaultPrice,
      compareAtPrice: product.subcategory.compareAtPrice,
    }
  );

  return {
    _id: product._id,
    _createdAt: product._createdAt,
    title: product.title,
    shortDescription: product.shortDescription,
    images: product.images,
    tags: product.tags,
    customPrice: product.customPrice,
    compareAtPrice: product.compareAtPrice,
    polarProductId: product.polarProductId,
    subcategory: {
      _id: product.subcategory._id,
      title: product.subcategory.title,
      slug: { _type: "slug", current: product.subcategory.slug },
      defaultPrice: product.subcategory.defaultPrice,
      compareAtPrice: product.subcategory.compareAtPrice,
      category: {
        _id: product.subcategory.category._id,
        title: product.subcategory.category.title,
        slug: { _type: "slug", current: product.subcategory.category.slug },
      },
    },
    creator: product.creator
      ? {
          _id: product.creator._id,
          name: product.creator.name,
          slug: { _type: "slug", current: product.creator.slug },
        }
      : undefined,
    resolvedPrice,
    // Computed properties for component compatibility
    id: product._id,
    slug: product.slug,
    price: resolvedPrice.price,
    createdAt: product._createdAt,
  };
}
