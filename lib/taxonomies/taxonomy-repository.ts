import { db, productTypes, formats, occasions, collections } from '@/lib/db';
import { eq } from 'drizzle-orm';

export type TaxonomyType = 'product_type' | 'format' | 'occasion' | 'collection';

export interface SimpleTaxonomy {
  id: string;
  title: string;
  createdAt: Date;
}

export interface ComplexTaxonomy {
  id: string;
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
    
    const [result] = await db
      .insert(table)
      .values(data)
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
}
