import { NextRequest, NextResponse } from 'next/server';
import { ProductEnhancementService } from '@/lib/products';

/**
 * PUT /api/products/:id/enhance
 * 
 * Updates a product's taxonomy associations.
 * Accepts product types, formats, occasions, and collections IDs (all as arrays for many-to-many).
 * 
 * Request body:
 * {
 *   productTypeIds?: string[],
 *   formatIds?: string[],
 *   occasionIds?: string[],
 *   collectionIds?: string[]
 * }
 * 
 * Returns:
 * - 200: Product successfully enhanced with updated data
 * - 400: Invalid request body or taxonomy IDs
 * - 404: Product not found
 * - 500: Internal server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { productTypeIds, formatIds, occasionIds, collectionIds } = body;

    // Validate request body structure - all should be arrays now
    if (
      productTypeIds !== undefined && 
      (!Array.isArray(productTypeIds) || !productTypeIds.every((id) => typeof id === 'string'))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'productTypeIds must be an array of strings',
        },
        { status: 400 }
      );
    }

    if (
      formatIds !== undefined && 
      (!Array.isArray(formatIds) || !formatIds.every((id) => typeof id === 'string'))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'formatIds must be an array of strings',
        },
        { status: 400 }
      );
    }

    if (
      occasionIds !== undefined && 
      (!Array.isArray(occasionIds) || !occasionIds.every((id) => typeof id === 'string'))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'occasionIds must be an array of strings',
        },
        { status: 400 }
      );
    }

    if (
      collectionIds !== undefined && 
      (!Array.isArray(collectionIds) || !collectionIds.every((id) => typeof id === 'string'))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'collectionIds must be an array of strings',
        },
        { status: 400 }
      );
    }

    // Create service instance
    const enhancementService = new ProductEnhancementService();

    // Enhance the product
    const result = await enhancementService.enhanceProduct(id, {
      productTypeIds: productTypeIds ?? undefined,
      formatIds: formatIds ?? undefined,
      occasionIds: occasionIds ?? undefined,
      collectionIds: collectionIds ?? undefined,
    });

    if (!result.success) {
      // Check if it's a not found error
      if (result.error?.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 404 }
        );
      }

      // Check if it's a validation error
      if (result.error?.includes('Invalid taxonomy IDs')) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 400 }
        );
      }

      // Generic error
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    // Return success with enhanced product
    return NextResponse.json(
      {
        success: true,
        product: result.product,
        message: 'Product successfully enhanced',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error enhancing product:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while enhancing product',
      },
      { status: 500 }
    );
  }
}
