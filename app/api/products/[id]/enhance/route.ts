import { NextRequest, NextResponse } from 'next/server';
import { ProductEnhancementService } from '@/lib/products';

/**
 * PUT /api/products/:id/enhance
 * 
 * Updates a product's taxonomy associations.
 * Accepts product type, formats, occasion, and collection IDs.
 * 
 * Request body:
 * {
 *   productTypeId?: string | null,
 *   formatIds?: string[],
 *   occasionId?: string | null,
 *   collectionId?: string | null
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
    const { productTypeId, formatIds, occasionId, collectionId } = body;

    // Validate request body structure
    if (
      productTypeId !== undefined && 
      productTypeId !== null && 
      typeof productTypeId !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'productTypeId must be a string or null',
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
      occasionId !== undefined && 
      occasionId !== null && 
      typeof occasionId !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'occasionId must be a string or null',
        },
        { status: 400 }
      );
    }

    if (
      collectionId !== undefined && 
      collectionId !== null && 
      typeof collectionId !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'collectionId must be a string or null',
        },
        { status: 400 }
      );
    }

    // Create service instance
    const enhancementService = new ProductEnhancementService();

    // Enhance the product
    const result = await enhancementService.enhanceProduct(id, {
      productTypeId: productTypeId ?? undefined,
      formatIds: formatIds ?? undefined,
      occasionId: occasionId ?? undefined,
      collectionId: collectionId ?? undefined,
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
