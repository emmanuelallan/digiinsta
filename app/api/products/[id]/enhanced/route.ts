import { NextRequest, NextResponse } from 'next/server';
import { ProductEnhancementService } from '@/lib/products';

/**
 * GET /api/products/:id/enhanced
 * 
 * Retrieves a product with all its associated taxonomy data.
 * This endpoint provides the same data as GET /api/products/:id but uses
 * the ProductEnhancementService for consistency with the enhancement workflow.
 * 
 * Returns:
 * - 200: Product with all taxonomy associations
 * - 404: Product not found
 * - 500: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Create service instance
    const enhancementService = new ProductEnhancementService();

    // Get product with taxonomies
    const product = await enhancementService.getProductWithTaxonomies(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Return product with all associated taxonomies
    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching enhanced product:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while fetching enhanced product',
      },
      { status: 500 }
    );
  }
}
