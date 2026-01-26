/**
 * One-time script to migrate existing taxonomy data from old foreign keys
 * to new many-to-many junction tables
 */

import { db, products, productCollections, productOccasions, productProductTypes } from '@/lib/db';
import { isNotNull } from 'drizzle-orm';

async function migrateTaxonomyData() {
  console.log('🔄 Starting taxonomy data migration...');

  try {
    // Get all products with old foreign key associations
    const allProducts = await db
      .select({
        id: products.id,
        collectionId: products.collectionId,
        occasionId: products.occasionId,
        productTypeId: products.productTypeId,
      })
      .from(products);

    console.log(`Found ${allProducts.length} products to check`);

    let migratedCollections = 0;
    let migratedOccasions = 0;
    let migratedProductTypes = 0;

    // Migrate each product's associations
    for (const product of allProducts) {
      // Migrate collection
      if (product.collectionId) {
        try {
          await db.insert(productCollections).values({
            productId: product.id,
            collectionId: product.collectionId,
          }).onConflictDoNothing();
          migratedCollections++;
        } catch (error) {
          console.error(`Error migrating collection for product ${product.id}:`, error);
        }
      }

      // Migrate occasion
      if (product.occasionId) {
        try {
          await db.insert(productOccasions).values({
            productId: product.id,
            occasionId: product.occasionId,
          }).onConflictDoNothing();
          migratedOccasions++;
        } catch (error) {
          console.error(`Error migrating occasion for product ${product.id}:`, error);
        }
      }

      // Migrate product type
      if (product.productTypeId) {
        try {
          await db.insert(productProductTypes).values({
            productId: product.id,
            productTypeId: product.productTypeId,
          }).onConflictDoNothing();
          migratedProductTypes++;
        } catch (error) {
          console.error(`Error migrating product type for product ${product.id}:`, error);
        }
      }
    }

    console.log('✅ Migration completed!');
    console.log(`   Collections migrated: ${migratedCollections}`);
    console.log(`   Occasions migrated: ${migratedOccasions}`);
    console.log(`   Product types migrated: ${migratedProductTypes}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateTaxonomyData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
