import { NextRequest, NextResponse } from 'next/server';
import { uploadProductImages, deleteProductImage } from '@/lib/products/product-image-service';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/products/:id/images
 * 
 * Upload images for a product (max 5 images)
 * 
 * Request: multipart/form-data with 'images' field containing files
 * 
 * Returns:
 * - 200: Images uploaded successfully
 * - 400: Invalid request or too many images
 * - 404: Product not found
 * - 500: Internal server error
 */
export async function POST(
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

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }

    // Check total images (existing + new)
    const existingImages = product.images || [];
    const totalImages = existingImages.length + files.length;

    if (totalImages > 5) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot upload ${files.length} images. Product already has ${existingImages.length} image(s). Maximum 5 images allowed.`,
        },
        { status: 400 }
      );
    }

    // Upload images
    const { urls, errors } = await uploadProductImages(id, files);

    if (urls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload any images',
          details: errors,
        },
        { status: 500 }
      );
    }

    // Update product with new image URLs
    const updatedImages = [...existingImages, ...urls];
    await db
      .update(products)
      .set({ images: updatedImages, updatedAt: new Date() })
      .where(eq(products.id, id));

    return NextResponse.json(
      {
        success: true,
        images: updatedImages,
        uploadedCount: urls.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading product images:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload images',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/:id/images
 * 
 * Delete a specific image from a product
 * 
 * Request body:
 * {
 *   imageUrl: string
 * }
 * 
 * Returns:
 * - 200: Image deleted successfully
 * - 400: Invalid request
 * - 404: Product or image not found
 * - 500: Internal server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'imageUrl is required' },
        { status: 400 }
      );
    }

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

    // Check if image exists in product
    const existingImages = product.images || [];
    if (!existingImages.includes(imageUrl)) {
      return NextResponse.json(
        { success: false, error: 'Image not found in product' },
        { status: 404 }
      );
    }

    // Delete image from R2 (only if it's an uploaded image, not Lemon Squeezy CDN)
    if (imageUrl.includes(process.env.R2_PUBLIC_URL || '')) {
      try {
        await deleteProductImage(imageUrl);
      } catch (error) {
        console.error('Error deleting image from R2:', error);
        // Continue even if R2 deletion fails
      }
    }

    // Remove image URL from product
    const updatedImages = existingImages.filter(url => url !== imageUrl);
    await db
      .update(products)
      .set({ images: updatedImages, updatedAt: new Date() })
      .where(eq(products.id, id));

    return NextResponse.json(
      {
        success: true,
        images: updatedImages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product image:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete image',
      },
      { status: 500 }
    );
  }
}
