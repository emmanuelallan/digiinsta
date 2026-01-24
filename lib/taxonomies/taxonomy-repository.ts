import { db, productTypes, formats, occasions, collections } from '@/lib/db';
import { eq, ne } from 'drizzle-orm';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';

export type TaxonomyType = 'product_type' | 'format' | 'occasion' | 'collection';

export interface SimpleTaxonomy {
  id: string;
  title: string;
  createdAt: Date;
}

export interface ComplexTaxonomy {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
}

export type Taxonomy = SimpleTaxonomy | ComplexTaxonomy;

export class TaxonomyRepository {
  /**
   * Create a simple taxonomy (Product Type or Format)
   */
  async createSimpleTaxonomy(
    type: 'product_type' | 'format',
    title: string
  ): Promise<SimpleTaxonomy> {
    const table = type === 'product_type' ? productTypes : formats;
    
    const [result] = await db
      .insert(table)
      .values({ title })
      .returning();

    return result;
  }

  /**
   * Create a complex taxonomy (Occasion or Collection)
   */
  async createComplexTaxonomy(
    type: 'occasion' | 'collection',
    data: { title: string; description: string; imageUrl: string }
  ): Promise<ComplexTaxonomy> {
    const table = type === 'occasion' ? occasions : collections;
    
    // Generate slug from title
    const baseSlug = generateSlug(data.title);
    
    // Get existing slugs to ensure uniqueness
    const existingRecords = await db.select({ slug: table.slug }).from(table);
    const existingSlugs = existingRecords.map(r => r.slug);
    
    // Generate unique slug
    const slug = generateUniqueSlug(baseSlug, existingSlugs);
    
    const [result] = await db
      .insert(table)
      .values({ ...data, slug })
      .returning();

    return result;
  }

  /**
   * Get all taxonomies of a specific type
   */
  async getTaxonomiesByType(type: TaxonomyType): Promise<Taxonomy[]> {
    let table;
    
    switch (type) {
      case 'product_type':
        table = productTypes;
        break;
      case 'format':
        table = formats;
        break;
      case 'occasion':
        table = occasions;
        break;
      case 'collection':
        table = collections;
        break;
    }

    const results = await db.select().from(table);
    return results;
  }

  /**
   * Get a taxonomy by ID
   */
  async getTaxonomyById(
    type: TaxonomyType,
    id: string
  ): Promise<Taxonomy | null> {
    let table;
    
    switch (type) {
      case 'product_type':
        table = productTypes;
        break;
      case 'format':
        table = formats;
        break;
      case 'occasion':
        table = occasions;
        break;
      case 'collection':
        table = collections;
        break;
    }

    const results = await db
      .select()
      .from(table)
      .where(eq(table.id, id))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get a complex taxonomy by slug
   */
  async getTaxonomyBySlug(
    type: 'occasion' | 'collection',
    slug: string
  ): Promise<ComplexTaxonomy | null> {
    const table = type === 'occasion' ? occasions : collections;

    const results = await db
      .select()
      .from(table)
      .where(eq(table.slug, slug))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Update a simple taxonomy (Product Type or Format)
   */
  async updateSimpleTaxonomy(
    type: 'product_type' | 'format',
    id: string,
    title: string
  ): Promise<SimpleTaxonomy> {
    const table = type === 'product_type' ? productTypes : formats;
    
    const [result] = await db
      .update(table)
      .set({ title })
      .where(eq(table.id, id))
      .returning();

    return result;
  }

  /**
   * Update a complex taxonomy (Occasion or Collection)
   */
  async updateComplexTaxonomy(
    type: 'occasion' | 'collection',
    id: string,
    data: { title: string; description: string; imageUrl?: string }
  ): Promise<ComplexTaxonomy> {
    const table = type === 'occasion' ? occasions : collections;
    
    // Generate new slug from title
    const baseSlug = generateSlug(data.title);
    
    // Get existing slugs (excluding current record)
    const existingRecords = await db
      .select({ slug: table.slug })
      .from(table)
      .where(ne(table.id, id));
    const existingSlugs = existingRecords.map(r => r.slug);
    
    // Generate unique slug
    const slug = generateUniqueSlug(baseSlug, existingSlugs);
    
    const updateData: any = {
      title: data.title,
      description: data.description,
      slug,
    };

    // Only update imageUrl if provided
    if (data.imageUrl) {
      updateData.imageUrl = data.imageUrl;
    }
    
    const [result] = await db
      .update(table)
      .set(updateData)
      .where(eq(table.id, id))
      .returning();

    return result;
  }

  /**
   * Delete a taxonomy by ID
   */
  async deleteTaxonomy(
    type: TaxonomyType,
    id: string
  ): Promise<void> {
    let table;
    
    switch (type) {
      case 'product_type':
        table = productTypes;
        break;
      case 'format':
        table = formats;
        break;
      case 'occasion':
        table = occasions;
        break;
      case 'collection':
        table = collections;
        break;
    }

    await db.delete(table).where(eq(table.id, id));
  }
}
