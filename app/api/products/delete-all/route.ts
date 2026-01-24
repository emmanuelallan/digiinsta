import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { isNull, isNotNull, or } from 'drizzle-orm';
import { deleteProductImages } from '@/lib/products/product-image-service';

/**
 * DELETE /api/products/delete-all
 * 
 * Delete all products from the database
 * - Removes all products
 * - Deletes all uploaded images from R2
 * - Removes all taxonomy associations (cascade)
 * 
 * Query parameters:
 * - type: 'all' | 'unsynced' | 'synced' (optional, defaults to 'all')
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let productsToDelete;

    // Fetch products based on type
    if (type === 'unsynced') {
      // Delete only unenhanced products (no taxonomy associations)
      productsToDelete = await db
        .select()
        .from(products)
        .where(
          isNull(products.productTypeId) &&
          isNull(products.occasionId) &&
          isNull(products.collectionId)
        );
    } else if (type === 'synced') {
      // Delete only enhanced products (at least one taxonomy association)
      productsToDelete = await db
        .select()
        .from(products)
        .where(
          or(
            isNotNull(products.productTypeId),
            isNotNull(products.occasionId),
            isNotNull(products.collectionId)
          )
        );
    } else {
      // Delete all products
      productsToDelete = await db.select().from(products);
    }

    if (productsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'No products to delete',
      });
    }

    // Collect all uploaded images (R2-hosted only)
    const r2PublicUrl = process.env.R2_PUBLIC_URL || '';
    const allUploadedImages: string[] = [];

    for (const product of productsToDelete) {
      const uploadedImages = product.images.filter(url => url.includes(r2PublicUrl));
      allUploadedImages.push(...uploadedImages);
    }

    // Delete images from R2
    if (allUploadedImages.length > 0) {
      try {
        await deleteProductImages(allUploadedImages);
      } catch (error) {
        console.error('Error deleting images from R2:', error);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete products from database (cascade will handle related records)
    await db.delete(products);

    return NextResponse.json({
      success: true,
      deletedCount: productsToDelete.length,
      message: `Successfully deleted ${productsToDelete.length} product(s)`,
    });
  } catch (error) {
    console.error('Error deleting all products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete products',
      },
      { status: 500 }
    );
  }
}
