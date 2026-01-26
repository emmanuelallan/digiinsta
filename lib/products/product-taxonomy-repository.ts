/**
 * Product Taxonomy Repository
 * 
 * Manages associations between products and taxonomies using Drizzle ORM.
 * Handles many-to-many relationships for all taxonomies (formats, product types,
 * occasions, and collections).
 */

import { 
  db, 
  products, 
  productFormats, 
  productProductTypes,
  productOccasions,
  productCollections,
  productTypes, 
  formats, 
  occasions, 
  collections 
} from '@/lib/db';
import { eq, inArray } from 'drizzle-orm';

/**
 * Input for updating product taxonomy associations
 * All taxonomies now support multiple selections (many-to-many)
 */
export interface ProductTaxonomyAssociations {
  productTypeIds?: string[];
  formatIds?: string[];
  occasionIds?: string[];
  collectionIds?: string[];
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
  productTypes: Array<{
    id: string;
    title: string;
    createdAt: Date;
  }>;
  formats: Array<{
    id: string;
    title: string;
    createdAt: Date;
  }>;
  occasions: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: Date;
  }>;
  collections: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: Date;
  }>;
  isEnhanced: boolean;
}

/**
 * Repository for managing product-taxonomy associations
 */
export class ProductTaxonomyRepository {
  /**
   * Update product taxonomy associations atomically
   * Uses a transaction to ensure all-or-nothing updates
   * All taxonomies now use many-to-many relationships
   */
  async updateProductTaxonomies(
    productId: string,
    associations: ProductTaxonomyAssociations
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // Update the product's updatedAt timestamp
      await tx
        .update(products)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      // Handle many-to-many product types relationship
      await tx.delete(productProductTypes).where(eq(productProductTypes.productId, productId));
      if (associations.productTypeIds && associations.productTypeIds.length > 0) {
        await tx.insert(productProductTypes).values(
          associations.productTypeIds.map((productTypeId) => ({
            productId,
            productTypeId,
          }))
        );
      }

      // Handle many-to-many formats relationship
      await tx.delete(productFormats).where(eq(productFormats.productId, productId));
      if (associations.formatIds && associations.formatIds.length > 0) {
        await tx.insert(productFormats).values(
          associations.formatIds.map((formatId) => ({
            productId,
            formatId,
          }))
        );
      }

      // Handle many-to-many occasions relationship
      await tx.delete(productOccasions).where(eq(productOccasions.productId, productId));
      if (associations.occasionIds && associations.occasionIds.length > 0) {
        await tx.insert(productOccasions).values(
          associations.occasionIds.map((occasionId) => ({
            productId,
            occasionId,
          }))
        );
      }

      // Handle many-to-many collections relationship
      await tx.delete(productCollections).where(eq(productCollections.productId, productId));
      if (associations.collectionIds && associations.collectionIds.length > 0) {
        await tx.insert(productCollections).values(
          associations.collectionIds.map((collectionId) => ({
            productId,
            collectionId,
          }))
        );
      }
    });
  }

  /**
   * Get a product with all its associated taxonomies
   * All taxonomies now use many-to-many relationships
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

    // Get associated product types (many-to-many)
    const productTypeAssociations = await db
      .select({
        id: productTypes.id,
        title: productTypes.title,
        createdAt: productTypes.createdAt,
      })
      .from(productProductTypes)
      .innerJoin(productTypes, eq(productProductTypes.productTypeId, productTypes.id))
      .where(eq(productProductTypes.productId, productId));

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

    // Get associated occasions (many-to-many)
    const occasionAssociations = await db
      .select({
        id: occasions.id,
        title: occasions.title,
        description: occasions.description,
        imageUrl: occasions.imageUrl,
        createdAt: occasions.createdAt,
      })
      .from(productOccasions)
      .innerJoin(occasions, eq(productOccasions.occasionId, occasions.id))
      .where(eq(productOccasions.productId, productId));

    // Get associated collections (many-to-many)
    const collectionAssociations = await db
      .select({
        id: collections.id,
        title: collections.title,
        description: collections.description,
        imageUrl: collections.imageUrl,
        createdAt: collections.createdAt,
      })
      .from(productCollections)
      .innerJoin(collections, eq(productCollections.collectionId, collections.id))
      .where(eq(productCollections.productId, productId));

    // Determine if product is enhanced (has any taxonomy associations)
    const isEnhanced = !!(
      productTypeAssociations.length > 0 ||
      formatAssociations.length > 0 ||
      occasionAssociations.length > 0 ||
      collectionAssociations.length > 0
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
      productTypes: productTypeAssociations,
      formats: formatAssociations,
      occasions: occasionAssociations,
      collections: collectionAssociations,
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
        // Check if product has any taxonomy associations in junction tables
        const [productTypeCount, formatCount, occasionCount, collectionCount] = await Promise.all([
          db.select().from(productProductTypes).where(eq(productProductTypes.productId, product.id)),
          db.select().from(productFormats).where(eq(productFormats.productId, product.id)),
          db.select().from(productOccasions).where(eq(productOccasions.productId, product.id)),
          db.select().from(productCollections).where(eq(productCollections.productId, product.id)),
        ]);

        const isEnhanced = 
          productTypeCount.length > 0 || 
          formatCount.length > 0 || 
          occasionCount.length > 0 || 
          collectionCount.length > 0;

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

    // Validate product type IDs
    if (associations.productTypeIds && associations.productTypeIds.length > 0) {
      const foundProductTypes = await db
        .select()
        .from(productTypes)
        .where(inArray(productTypes.id, associations.productTypeIds));
      
      if (foundProductTypes.length !== associations.productTypeIds.length) {
        const foundIds = foundProductTypes.map((pt) => pt.id);
        const missingIds = associations.productTypeIds.filter((id) => !foundIds.includes(id));
        errors.push(`Product type IDs not found: ${missingIds.join(', ')}`);
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

    // Validate occasion IDs
    if (associations.occasionIds && associations.occasionIds.length > 0) {
      const foundOccasions = await db
        .select()
        .from(occasions)
        .where(inArray(occasions.id, associations.occasionIds));
      
      if (foundOccasions.length !== associations.occasionIds.length) {
        const foundIds = foundOccasions.map((o) => o.id);
        const missingIds = associations.occasionIds.filter((id) => !foundIds.includes(id));
        errors.push(`Occasion IDs not found: ${missingIds.join(', ')}`);
      }
    }

    // Validate collection IDs
    if (associations.collectionIds && associations.collectionIds.length > 0) {
      const foundCollections = await db
        .select()
        .from(collections)
        .where(inArray(collections.id, associations.collectionIds));
      
      if (foundCollections.length !== associations.collectionIds.length) {
        const foundIds = foundCollections.map((c) => c.id);
        const missingIds = associations.collectionIds.filter((id) => !foundIds.includes(id));
        errors.push(`Collection IDs not found: ${missingIds.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
