/**
 * Product Query Functions for Storefront
 * 
 * Provides database query functions for fetching products with various filters
 * and relationships for the Digital Love Storefront.
 */

import { db, products, collections, occasions, productTypes, formats, productFormats } from '@/lib/db';
import { eq, and, desc, sql, isNotNull } from 'drizzle-orm';
import type { Product } from '@/lib/types';

/**
 * Helper function to check if a product has been enhanced with taxonomy data
 * Products must have at least a collection assigned to be displayed on storefront
 */
function isProductEnhanced(product: typeof products.$inferSelect): boolean {
  return !!product.collectionId;
}

/**
 * Helper function to normalize a slug for comparison
 */
function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[–—]/g, '-') // Replace em/en dashes with hyphens
    .replace(/[^\w\s-]/g, '') // Remove other special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get a product by its slug
 * Note: Currently using name as slug since slug field doesn't exist in schema
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      console.error('Invalid slug parameter:', slug);
      return null;
    }

    // Normalize the input slug
    const normalizedSlug = normalizeSlug(slug);

    // Get all products and find matching one by comparing normalized slugs
    const allProducts = await db
      .select({
        product: products,
        collection: collections,
        occasion: occasions,
        productType: productTypes,
      })
      .from(products)
      .leftJoin(collections, eq(products.collectionId, collections.id))
      .leftJoin(occasions, eq(products.occasionId, occasions.id))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id));

    const matchingProduct = allProducts.find(
      row => normalizeSlug(row.product.name) === normalizedSlug && isProductEnhanced(row.product)
    );

    if (!matchingProduct) {
      console.log(`No enhanced product found for slug: ${slug} (normalized: ${normalizedSlug})`);
      return null;
    }
    
    // Get formats for this product
    const productFormatRows = await db
      .select({ format: formats })
      .from(productFormats)
      .innerJoin(formats, eq(productFormats.formatId, formats.id))
      .where(eq(productFormats.productId, matchingProduct.product.id));

    return mapToStorefrontProduct(
      matchingProduct.product,
      matchingProduct.collection,
      matchingProduct.occasion,
      matchingProduct.productType,
      productFormatRows.map(r => r.format)
    );
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}

/**
 * Get products by collection slug
 */
export async function getProductsByCollection(collectionSlug: string): Promise<Product[]> {
  try {
    // Convert slug to title format (replace hyphens with spaces)
    const titleFromSlug = collectionSlug.split('-').join(' ');

    // Get all products with their collections
    const result = await db
      .select({
        product: products,
        collection: collections,
        occasion: occasions,
        productType: productTypes,
      })
      .from(products)
      .innerJoin(collections, eq(products.collectionId, collections.id))
      .leftJoin(occasions, eq(products.occasionId, occasions.id))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .orderBy(desc(products.createdAt));

    // Filter by collection title (case-insensitive) and only enhanced products
    const matchingProducts = result.filter(
      row => row.collection && 
             row.collection.title.toLowerCase() === titleFromSlug.toLowerCase() &&
             isProductEnhanced(row.product)
    );

    return Promise.all(matchingProducts.map(async (row) => {
      const productFormatRows = await db
        .select({ format: formats })
        .from(productFormats)
        .innerJoin(formats, eq(productFormats.formatId, formats.id))
        .where(eq(productFormats.productId, row.product.id));

      return mapToStorefrontProduct(row.product, row.collection, row.occasion, row.productType, productFormatRows.map(r => r.format));
    }));
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    return [];
  }
}

/**
 * Get best seller products
 * Note: Using most recent products as proxy for best sellers since we don't have sales data
 */
export async function getBestSellerProducts(limit: number = 4): Promise<Product[]> {
  try {
    const result = await db
      .select({
        product: products,
        collection: collections,
        occasion: occasions,
        productType: productTypes,
      })
      .from(products)
      .leftJoin(collections, eq(products.collectionId, collections.id))
      .leftJoin(occasions, eq(products.occasionId, occasions.id))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .where(isNotNull(products.collectionId)) // Only enhanced products with collection
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return Promise.all(result.map(async (row) => {
      const productFormatRows = await db
        .select({ format: formats })
        .from(productFormats)
        .innerJoin(formats, eq(productFormats.formatId, formats.id))
        .where(eq(productFormats.productId, row.product.id));

      return mapToStorefrontProduct(row.product, row.collection, row.occasion, row.productType, productFormatRows.map(r => r.format));
    }));
  } catch (error) {
    console.error('Error fetching best seller products:', error);
    return [];
  }
}

/**
 * Get new products (most recently created)
 */
export async function getNewProducts(limit: number = 4): Promise<Product[]> {
  try {
    const result = await db
      .select({
        product: products,
        collection: collections,
        occasion: occasions,
        productType: productTypes,
      })
      .from(products)
      .leftJoin(collections, eq(products.collectionId, collections.id))
      .leftJoin(occasions, eq(products.occasionId, occasions.id))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .where(isNotNull(products.collectionId)) // Only enhanced products with collection
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return Promise.all(result.map(async (row) => {
      const productFormatRows = await db
        .select({ format: formats })
        .from(productFormats)
        .innerJoin(formats, eq(productFormats.formatId, formats.id))
        .where(eq(productFormats.productId, row.product.id));

      return mapToStorefrontProduct(row.product, row.collection, row.occasion, row.productType, productFormatRows.map(r => r.format));
    }));
  } catch (error) {
    console.error('Error fetching new products:', error);
    return [];
  }
}

/**
 * Get related products based on shared taxonomies
 */
export async function getRelatedProducts(productId: string, limit: number = 3): Promise<Product[]> {
  try {
    // First get the current product's taxonomies
    const currentProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (currentProduct.length === 0) {
      return [];
    }

    const current = currentProduct[0];

    // Find products with matching collection, occasion, or product type
    const result = await db
      .select({
        product: products,
        collection: collections,
        occasion: occasions,
        productType: productTypes,
      })
      .from(products)
      .leftJoin(collections, eq(products.collectionId, collections.id))
      .leftJoin(occasions, eq(products.occasionId, occasions.id))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .where(
        and(
          sql`${products.id} != ${productId}`,
          isNotNull(products.collectionId), // Only enhanced products
          sql`(${products.collectionId} = ${current.collectionId} OR ${products.occasionId} = ${current.occasionId} OR ${products.productTypeId} = ${current.productTypeId})`
        )
      )
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return Promise.all(result.map(async (row) => {
      const productFormatRows = await db
        .select({ format: formats })
        .from(productFormats)
        .innerJoin(formats, eq(productFormats.formatId, formats.id))
        .where(eq(productFormats.productId, row.product.id));

      return mapToStorefrontProduct(row.product, row.collection, row.occasion, row.productType, productFormatRows.map(r => r.format));
    }));
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

/**
 * Get featured products by occasion
 */
export async function getFeaturedProducts(occasion: string, limit: number = 4): Promise<Product[]> {
  try {
    const result = await db
      .select({
        product: products,
        collection: collections,
        occasion: occasions,
        productType: productTypes,
      })
      .from(products)
      .innerJoin(occasions, eq(products.occasionId, occasions.id))
      .leftJoin(collections, eq(products.collectionId, collections.id))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .where(and(
        eq(occasions.title, occasion),
        isNotNull(products.collectionId) // Only enhanced products
      ))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return Promise.all(result.map(async (row) => {
      const productFormatRows = await db
        .select({ format: formats })
        .from(productFormats)
        .innerJoin(formats, eq(productFormats.formatId, formats.id))
        .where(eq(productFormats.productId, row.product.id));

      return mapToStorefrontProduct(row.product, row.collection, row.occasion, row.productType, productFormatRows.map(r => r.format));
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

/**
 * Helper function to map database product to storefront product type
 */
function mapToStorefrontProduct(
  product: typeof products.$inferSelect,
  collection: typeof collections.$inferSelect | null,
  occasion: typeof occasions.$inferSelect | null,
  productType: typeof productTypes.$inferSelect | null,
  productFormats: (typeof formats.$inferSelect)[]
): Product {
  // Generate slug from name - remove special characters, convert to lowercase, replace spaces with hyphens
  const slug = product.name
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[–—]/g, '-') // Replace em/en dashes with hyphens
    .replace(/[^\w\s-]/g, '') // Remove other special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Map images to ProductImage format
  const images = product.images.map((url, index) => ({
    url,
    alt: `${product.name} - Image ${index + 1}`,
    type: 'overview' as const,
    order: index,
  }));

  // Build taxonomies array
  const taxonomies = [];
  if (collection) {
    taxonomies.push({
      type: 'relationship' as const,
      value: collection.title,
    });
  }
  if (occasion) {
    taxonomies.push({
      type: 'occasion' as const,
      value: occasion.title,
    });
  }
  productFormats.forEach(format => {
    taxonomies.push({
      type: 'format' as const,
      value: format.title,
    });
  });

  // Generate placeholder data for fields not in current schema
  return {
    id: product.id,
    slug,
    name: product.name,
    description: product.description || '',
    emotionalPromise: product.description || '',
    price: product.price,
    salePrice: undefined,
    images,
    badges: [],
    taxonomies,
    whatsIncluded: [],
    whyItWorks: [],
    howToUse: [],
    faqs: [],
    lemonSqueezyProductId: product.lemonSqueezyId,
    lemonSqueezyCheckoutUrl: product.buyNowUrl || `https://digiinstastore.lemonsqueezy.com/checkout/buy/${product.lemonSqueezyId}`,
    variantId: undefined,
  };
}
