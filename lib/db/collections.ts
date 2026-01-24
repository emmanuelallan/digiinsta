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

    // Convert slug to title format (replace hyphens with spaces)
    const titleFromSlug = slug.split('-').join(' ');

    // Get all collections and find matching one (case-insensitive)
    const allCollections = await db
      .select()
      .from(collections);

    const matchingCollection = allCollections.find(
      c => c.title.toLowerCase() === titleFromSlug.toLowerCase()
    );

    if (!matchingCollection) {
      console.log(`No collection found for slug: ${slug} (looking for title: ${titleFromSlug})`);
      return null;
    }

    return mapToStorefrontCollection(matchingCollection);
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
  // Generate slug from title
  const slug = collection.title.toLowerCase().replace(/\s+/g, '-');

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
