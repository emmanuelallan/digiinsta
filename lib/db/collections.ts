/**
 * Collection Query Functions for Storefront
 * 
 * Provides database query functions for fetching collections
 * for the Digital Love Storefront.
 */

import { db, collections } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { Collection } from '@/lib/types';

/**
 * Get all collections from the database
 */
export async function getAllCollections(): Promise<Collection[]> {
  try {
    const result = await db
      .select()
      .from(collections)
      .orderBy(collections.title);

    return result.map(mapToStorefrontCollection);
  } catch (error) {
    console.error('Error fetching all collections:', error);
    return [];
  }
}

/**
 * Get a collection by its slug
 */
export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      console.error('Invalid slug parameter:', slug);
      return null;
    }

    // Query collection by slug field
    const result = await db
      .select()
      .from(collections)
      .where(eq(collections.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return mapToStorefrontCollection(result[0]);
  } catch (error) {
    console.error('Error fetching collection by slug:', error);
    return null;
  }
}

/**
 * Helper function to map database collection to storefront collection type
 */
function mapToStorefrontCollection(
  collection: typeof collections.$inferSelect
): Collection {
  // Use the slug from database
  const slug = collection.slug;

  return {
    slug,
    name: collection.title,
    description: collection.description,
    emotionalCopy: collection.description,
    icon: collection.imageUrl,
    taxonomyFilter: {
      type: 'relationship',
      value: collection.title,
    },
  };
}
