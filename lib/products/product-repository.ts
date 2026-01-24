/**
 * Product Repository
 * 
 * Handles all database operations for products using Drizzle ORM.
 * Provides methods for creating, finding, and updating products.
 */

import { db, products } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * Product entity as stored in the database
 */
export interface Product {
  id: string;
  lemonSqueezyId: string;
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
    const result = await db
      .insert(products)
      .values({
        lemonSqueezyId: input.lemonSqueezyId,
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
    const result = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
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
}
