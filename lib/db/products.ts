/**
 * Product Query Functions for Storefront
 * 
 * Provides database query functions for fetching products with various filters
 * and relationships for the Digital Love Storefront.
 */

import { 
  db, 
  products, 
  collections, 
  occasions, 
  productTypes, 
  formats, 
  productFormats,
  productCollections,
  productOccasions,
  productProductTypes
} from '@/lib/db';
import { eq, and, desc, sql, isNotNull, inArray } from 'drizzle-orm';
import type { Product } from '@/lib/types';

/**
 * Helper function to fetch all taxonomies for a product
 */
async function getProductTaxonomies(productId: string) {
  const [productCollectionRows, productOccasionRows, productTypeRows, productFormatRows] = await Promise.all([
    db.select({ collection: collections })
      .from(productCollections)
      .innerJoin(collections, eq(productCollections.collectionId, collections.id))
      .where(eq(productCollections.productId, productId)),
    
    db.select({ occasion: occasions })
      .from(productOccasions)
      .innerJoin(occasions, eq(productOccasions.occasionId, occasions.id))
      .where(eq(productOccasions.productId, productId)),
    
    db.select({ productType: productTypes })
      .from(productProductTypes)
      .innerJoin(productTypes, eq(productProductTypes.productTypeId, productTypes.id))
      .where(eq(productProductTypes.productId, productId)),
    
    db.select({ format: formats })
      .from(productFormats)
      .innerJoin(formats, eq(productFormats.formatId, formats.id))
      .where(eq(productFormats.productId, productId))
  ]);

  return {
    collections: productCollectionRows.map(r => r.collection),
    occasions: productOccasionRows.map(r => r.occasion),
    productTypes: productTypeRows.map(r => r.productType),
    formats: productFormatRows.map(r => r.format),
  };
}

/**
 * Helper function to check if a product has been enhanced with taxonomy data
 * Products must have at least a collection assigned to be displayed on storefront
 */
function isProductEnhanced(product: typeof products.$inferSelect): boolean {
  return !!product.collectionId;
}

/**
 * Get a product by its slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      console.error('Invalid slug parameter:', slug);
      return null;
    }

    // Query product by slug field - check if it has at least one collection
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) {
      console.log(`No product found for slug: ${slug}`);
      return null;
    }

    // Check if product has at least one collection (enhanced)
    const collectionCount = await db
      .select()
      .from(productCollections)
      .where(eq(productCollections.productId, product.id))
      .limit(1);

    if (collectionCount.length === 0) {
      console.log(`Product ${slug} is not enhanced (no collections)`);
      return null;
    }
    
    // Get all collections for this product
    const productCollectionRows = await db
      .select({ collection: collections })
      .from(productCollections)
      .innerJoin(collections, eq(productCollections.collectionId, collections.id))
      .where(eq(productCollections.productId, product.id));

    // Get all occasions for this product
    const productOccasionRows = await db
      .select({ occasion: occasions })
      .from(productOccasions)
      .innerJoin(occasions, eq(productOccasions.occasionId, occasions.id))
      .where(eq(productOccasions.productId, product.id));

    // Get all product types for this product
    const productTypeRows = await db
      .select({ productType: productTypes })
      .from(productProductTypes)
      .innerJoin(productTypes, eq(productProductTypes.productTypeId, productTypes.id))
      .where(eq(productProductTypes.productId, product.id));
    
    // Get formats for this product
    const productFormatRows = await db
      .select({ format: formats })
      .from(productFormats)
      .innerJoin(formats, eq(productFormats.formatId, formats.id))
      .where(eq(productFormats.productId, product.id));

    return mapToStorefrontProduct(
      product,
      productCollectionRows.map(r => r.collection),
      productOccasionRows.map(r => r.occasion),
      productTypeRows.map(r => r.productType),
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
    // Get the collection by slug first
    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.slug, collectionSlug))
      .limit(1);

    if (!collection) {
      return [];
    }

    // Get all products associated with this collection via junction table
    const productIds = await db
      .select({ productId: productCollections.productId })
      .from(productCollections)
      .where(eq(productCollections.collectionId, collection.id));

    if (productIds.length === 0) {
      return [];
    }

    // Get full product details for these products
    const result = await db
      .select({
        product: products,
      })
      .from(products)
      .where(inArray(products.id, productIds.map(p => p.productId)))
      .orderBy(desc(products.createdAt));

    return Promise.all(result.map(async (row) => {
      // Get all collections for this product
      const productCollectionRows = await db
        .select({ collection: collections })
        .from(productCollections)
        .innerJoin(collections, eq(productCollections.collectionId, collections.id))
        .where(eq(productCollections.productId, row.product.id));

      // Get all occasions for this product
      const productOccasionRows = await db
        .select({ occasion: occasions })
        .from(productOccasions)
        .innerJoin(occasions, eq(productOccasions.occasionId, occasions.id))
        .where(eq(productOccasions.productId, row.product.id));

      // Get all product types for this product
      const productTypeRows = await db
        .select({ productType: productTypes })
        .from(productProductTypes)
        .innerJoin(productTypes, eq(productProductTypes.productTypeId, productTypes.id))
        .where(eq(productProductTypes.productId, row.product.id));

      // Get formats
      const productFormatRows = await db
        .select({ format: formats })
        .from(productFormats)
        .innerJoin(formats, eq(productFormats.formatId, formats.id))
        .where(eq(productFormats.productId, row.product.id));

      return mapToStorefrontProduct(
        row.product, 
        productCollectionRows.map(r => r.collection),
        productOccasionRows.map(r => r.occasion),
        productTypeRows.map(r => r.productType),
        productFormatRows.map(r => r.format)
      );
    }));
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    return [];
  }
}

/**
 * Get best seller products
 * Note: Using most recently updated products as proxy for best sellers
 * Updated products are likely being enhanced/improved due to popularity
 */
export async function getBestSellerProducts(limit: number = 4): Promise<Product[]> {
  try {
    const result = await db
      .select()
      .from(products)
      .orderBy(desc(products.updatedAt))
      .limit(limit);

    return Promise.all(result.map(async (product) => {
      const taxonomies = await getProductTaxonomies(product.id);
      return mapToStorefrontProduct(
        product,
        taxonomies.collections,
        taxonomies.occasions,
        taxonomies.productTypes,
        taxonomies.formats
      );
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
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return Promise.all(result.map(async (product) => {
      const taxonomies = await getProductTaxonomies(product.id);
      return mapToStorefrontProduct(
        product,
        taxonomies.collections,
        taxonomies.occasions,
        taxonomies.productTypes,
        taxonomies.formats
      );
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
    // Get the current product's taxonomies
    const currentTaxonomies = await getProductTaxonomies(productId);
    
    if (currentTaxonomies.collections.length === 0) {
      return [];
    }

    // Get collection IDs to find related products
    const collectionIds = currentTaxonomies.collections.map(c => c.id);
    
    // Find products that share collections (excluding current product)
    const relatedProductIds = await db
      .select({ productId: productCollections.productId })
      .from(productCollections)
      .where(
        and(
          inArray(productCollections.collectionId, collectionIds),
          sql`${productCollections.productId} != ${productId}`
        )
      )
      .limit(limit);

    if (relatedProductIds.length === 0) {
      return [];
    }

    // Get full product details
    const result = await db
      .select()
      .from(products)
      .where(inArray(products.id, relatedProductIds.map(r => r.productId)))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return Promise.all(result.map(async (product) => {
      const taxonomies = await getProductTaxonomies(product.id);
      return mapToStorefrontProduct(
        product,
        taxonomies.collections,
        taxonomies.occasions,
        taxonomies.productTypes,
        taxonomies.formats
      );
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
    // Get the occasion by title
    const [occasionRecord] = await db
      .select()
      .from(occasions)
      .where(eq(occasions.title, occasion))
      .limit(1);

    if (!occasionRecord) {
      return [];
    }

    // Get products associated with this occasion
    const productIds = await db
      .select({ productId: productOccasions.productId })
      .from(productOccasions)
      .where(eq(productOccasions.occasionId, occasionRecord.id));

    if (productIds.length === 0) {
      return [];
    }

    // Get full product details
    const result = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds.map(p => p.productId)))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return Promise.all(result.map(async (product) => {
      const taxonomies = await getProductTaxonomies(product.id);
      return mapToStorefrontProduct(
        product,
        taxonomies.collections,
        taxonomies.occasions,
        taxonomies.productTypes,
        taxonomies.formats
      );
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
  productCollections: (typeof collections.$inferSelect)[],
  productOccasions: (typeof occasions.$inferSelect)[],
  productProductTypes: (typeof productTypes.$inferSelect)[],
  productFormats: (typeof formats.$inferSelect)[]
): Product {
  // Use the slug from database
  const slug = product.slug;

  // Map images to ProductImage format
  const images = product.images.map((url, index) => ({
    url,
    alt: `${product.name} - Image ${index + 1}`,
    type: 'overview' as const,
    order: index,
  }));

  // Build taxonomies array from all many-to-many relationships
  const taxonomies: Array<{
    type: 'relationship' | 'occasion' | 'format';
    value: string;
  }> = [];
  
  // Add all collections
  productCollections.forEach(collection => {
    taxonomies.push({
      type: 'relationship' as const,
      value: collection.title,
    });
  });
  
  // Add all occasions
  productOccasions.forEach(occasion => {
    taxonomies.push({
      type: 'occasion' as const,
      value: occasion.title,
    });
  });
  
  // Add all formats
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
