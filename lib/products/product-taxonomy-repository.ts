/**
 * Product Taxonomy Repository
 * 
 * Manages associations between products and taxonomies using Drizzle ORM.
 * Handles many-to-many relationships for formats and foreign key relationships
 * for product types, occasions, and collections.
 */

import { db, products, productFormats, productTypes, formats, occasions, collections } from '@/lib/db';
import { eq, inArray } from 'drizzle-orm';

/**
 * Input for updating product taxonomy associations
 */
export interface ProductTaxonomyAssociations {
  productTypeId?: string | null;
  formatIds?: string[];
  occasionId?: string | null;
  collectionId?: string | null;
}

/**
 * Enhanced product with all taxonomy data
 */
export interface EnhancedProduct {
  id: string;
  lemonSqueezyId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  productType?: {
    id: string;
    title: string;
    createdAt: Date;
  } | null;
  formats: Array<{
    id: string;
    title: string;
    createdAt: Date;
  }>;
  occasion?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: Date;
  } | null;
  collection?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: Date;
  } | null;
  isEnhanced: boolean;
}

/**
 * Repository for managing product-taxonomy associations
 */
export class ProductTaxonomyRepository {
  /**
   * Update product taxonomy associations atomically
   * Uses a transaction to ensure all-or-nothing updates
   */
  async updateProductTaxonomies(
    productId: string,
    associations: ProductTaxonomyAssociations
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // Update foreign key relationships (product type, occasion, collection)
      await tx
        .update(products)
        .set({
          productTypeId: associations.productTypeId ?? null,
          occasionId: associations.occasionId ?? null,
          collectionId: associations.collectionId ?? null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      // Handle many-to-many formats relationship
      // First, delete existing format associations
      await tx
        .delete(productFormats)
        .where(eq(productFormats.productId, productId));

      // Then, insert new format associations if any
      if (associations.formatIds && associations.formatIds.length > 0) {
        await tx.insert(productFormats).values(
          associations.formatIds.map((formatId) => ({
            productId,
            formatId,
          }))
        );
      }
    });
  }

  /**
   * Get a product with all its associated taxonomies
   */
  async getProductWithTaxonomies(productId: string): Promise<EnhancedProduct | null> {
    // Get the product
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return null;
    }

    // Get associated product type
    let productType = null;
    if (product.productTypeId) {
      const [pt] = await db
        .select()
        .from(productTypes)
        .where(eq(productTypes.id, product.productTypeId))
        .limit(1);
      productType = pt || null;
    }

    // Get associated formats (many-to-many)
    const formatAssociations = await db
      .select({
        id: formats.id,
        title: formats.title,
        createdAt: formats.createdAt,
      })
      .from(productFormats)
      .innerJoin(formats, eq(productFormats.formatId, formats.id))
      .where(eq(productFormats.productId, productId));

    // Get associated occasion
    let occasion = null;
    if (product.occasionId) {
      const [occ] = await db
        .select()
        .from(occasions)
        .where(eq(occasions.id, product.occasionId))
        .limit(1);
      occasion = occ || null;
    }

    // Get associated collection
    let collection = null;
    if (product.collectionId) {
      const [coll] = await db
        .select()
        .from(collections)
        .where(eq(collections.id, product.collectionId))
        .limit(1);
      collection = coll || null;
    }

    // Determine if product is enhanced (has any taxonomy associations)
    const isEnhanced = !!(
      productType ||
      formatAssociations.length > 0 ||
      occasion ||
      collection
    );

    return {
      id: product.id,
      lemonSqueezyId: product.lemonSqueezyId,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      productType,
      formats: formatAssociations,
      occasion,
      collection,
      isEnhanced,
    };
  }

  /**
   * Get all products with their enhancement status
   */
  async getAllProductsWithEnhancementStatus(): Promise<Array<{
    id: string;
    lemonSqueezyId: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    isEnhanced: boolean;
  }>> {
    const allProducts = await db.select().from(products);

    // For each product, check if it has any taxonomy associations
    const productsWithStatus = await Promise.all(
      allProducts.map(async (product) => {
        // Check if product has any taxonomy associations
        const hasProductType = !!product.productTypeId;
        const hasOccasion = !!product.occasionId;
        const hasCollection = !!product.collectionId;

        // Check if product has any format associations
        const formatCount = await db
          .select()
          .from(productFormats)
          .where(eq(productFormats.productId, product.id));

        const hasFormats = formatCount.length > 0;

        const isEnhanced = hasProductType || hasOccasion || hasCollection || hasFormats;

        return {
          ...product,
          isEnhanced,
        };
      })
    );

    return productsWithStatus;
  }

  /**
   * Validate that taxonomy IDs exist in the database
   */
  async validateTaxonomyIds(associations: ProductTaxonomyAssociations): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validate product type ID
    if (associations.productTypeId) {
      const [pt] = await db
        .select()
        .from(productTypes)
        .where(eq(productTypes.id, associations.productTypeId))
        .limit(1);
      if (!pt) {
        errors.push(`Product type with ID ${associations.productTypeId} not found`);
      }
    }

    // Validate format IDs
    if (associations.formatIds && associations.formatIds.length > 0) {
      const foundFormats = await db
        .select()
        .from(formats)
        .where(inArray(formats.id, associations.formatIds));
      
      if (foundFormats.length !== associations.formatIds.length) {
        const foundIds = foundFormats.map((f) => f.id);
        const missingIds = associations.formatIds.filter((id) => !foundIds.includes(id));
        errors.push(`Format IDs not found: ${missingIds.join(', ')}`);
      }
    }

    // Validate occasion ID
    if (associations.occasionId) {
      const [occ] = await db
        .select()
        .from(occasions)
        .where(eq(occasions.id, associations.occasionId))
        .limit(1);
      if (!occ) {
        errors.push(`Occasion with ID ${associations.occasionId} not found`);
      }
    }

    // Validate collection ID
    if (associations.collectionId) {
      const [coll] = await db
        .select()
        .from(collections)
        .where(eq(collections.id, associations.collectionId))
        .limit(1);
      if (!coll) {
        errors.push(`Collection with ID ${associations.collectionId} not found`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
