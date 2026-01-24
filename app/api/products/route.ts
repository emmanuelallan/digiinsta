import { NextRequest, NextResponse } from 'next/server';
import { ProductEnhancementService } from '@/lib/products';

/**
 * GET /api/products
 * 
 * Retrieves all products from the database with enhancement status.
 * Enhancement status is calculated based on whether taxonomies are associated.
 * 
 * Returns:
 * - 200: List of products with enhancement status
 * - 500: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const enhancementService = new ProductEnhancementService();
    const products = await enhancementService.getAllProductsWithEnhancementStatus();

    return NextResponse.json({
      success: true,
      products,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching products:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while fetching products',
      },
      { status: 500 }
    );
  }
}
