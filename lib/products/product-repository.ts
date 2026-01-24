/**
 * Product Repository
 * 
 * Handles all database operations for products using Drizzle ORM.
 * Provides methods for creating, finding, and updating products.
 */

import { db, products } from '@/lib/db';
import { eq, ne } from 'drizzle-orm';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';

/**
 * Product entity as stored in the database
 */
export interface Product {
  id: string;
  lemonSqueezyId: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  productTypeId: string | null;
  occasionId: string | null;
  collectionId: string | null;
}

/**
 * Input data for creating a new product
 */
export interface CreateProductInput {
  lemonSqueezyId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  images: string[];
  buyNowUrl?: string;
}

/**
 * Repository for product database operations
 */
export class ProductRepository {
  /**
   * Find a product by its Lemon Squeezy ID
   * Used for duplicate detection during sync
   */
  async findByLemonSqueezyId(lsId: string): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.lemonSqueezyId, lsId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Create a new product in the database
   */
  async createProduct(input: CreateProductInput): Promise<Product> {
    // Generate slug from product name
    const baseSlug = generateSlug(input.name);
    
    // Get existing slugs to ensure uniqueness
    const existingProducts = await db.select({ slug: products.slug }).from(products);
    const existingSlugs = existingProducts.map(p => p.slug);
    
    // Generate unique slug
    const slug = generateUniqueSlug(baseSlug, existingSlugs);
    
    const result = await db
      .insert(products)
      .values({
        lemonSqueezyId: input.lemonSqueezyId,
        slug,
        name: input.name,
        description: input.description,
        price: input.price,
        currency: input.currency,
        images: input.images,
        buyNowUrl: input.buyNowUrl,
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  }

  /**
   * Get all products from the database
   */
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  /**
   * Update a product by ID
   */
  async updateProduct(id: string, data: Partial<CreateProductInput>): Promise<Product> {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };
    
    // If name is being updated, regenerate slug
    if (data.name) {
      const baseSlug = generateSlug(data.name);
      
      // Get existing slugs (excluding current product)
      const existingProducts = await db
        .select({ slug: products.slug })
        .from(products)
        .where(ne(products.id, id));
      const existingSlugs = existingProducts.map(p => p.slug);
      
      // Generate unique slug
      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }
    
    const result = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Product with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Find a product by its database ID
   */
  async findById(id: string): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Find a product by its slug
   */
  async findBySlug(slug: string): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }
}
