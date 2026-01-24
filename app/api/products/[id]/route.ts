import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productFormats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { deleteProductImages } from '@/lib/products/product-image-service';

/**
 * GET /api/products/:id
 * 
 * Get a single product with full details including taxonomies
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch product with all relationships
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch formats
    const formatRelations = await db
      .select()
      .from(productFormats)
      .where(eq(productFormats.productId, id));

    // Return product with enhancement status
    return NextResponse.json({
      success: true,
      product: {
        ...product,
        formats: formatRelations,
        isEnhanced: !!(
          product.productTypeId ||
          formatRelations.length > 0 ||
          product.occasionId ||
          product.collectionId
        ),
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/:id
 * 
 * Delete a product and all its associated data
 * - Removes product from database
 * - Deletes uploaded images from R2 (keeps Lemon Squeezy CDN images)
 * - Removes taxonomy associations
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if product exists
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete uploaded images from R2 (only R2-hosted images, not Lemon Squeezy CDN)
    const r2PublicUrl = process.env.R2_PUBLIC_URL || '';
    const uploadedImages = product.images.filter(url => url.includes(r2PublicUrl));
    
    if (uploadedImages.length > 0) {
      try {
        await deleteProductImages(uploadedImages);
      } catch (error) {
        console.error('Error deleting product images from R2:', error);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete product (cascade will handle productFormats due to onDelete: 'cascade')
    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      },
      { status: 500 }
    );
  }
}
