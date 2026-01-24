import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomies';

/**
 * POST /api/taxonomies/product-types
 * Create a new product type taxonomy
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const taxonomyService = new TaxonomyService();
    const productType = await taxonomyService.createSimpleTaxonomy('product_type', title);

    return NextResponse.json({
      success: true,
      productType,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product type:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to create product type',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/taxonomies/product-types
 * Get all product types
 */
export async function GET(request: NextRequest) {
  try {
    const taxonomyService = new TaxonomyService();
    const productTypes = await taxonomyService.getTaxonomiesByType('product_type');

    return NextResponse.json({
      success: true,
      productTypes,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching product types:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch product types',
      },
      { status: 500 }
    );
  }
}
