import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomies';

/**
 * GET /api/taxonomies/product-types/[id]
 * Get a single product type by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taxonomyService = new TaxonomyService();
    const productType = await taxonomyService.getTaxonomyById('product_type', id);

    if (!productType) {
      return NextResponse.json(
        { success: false, error: 'Product type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      productType,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching product type:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch product type',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/taxonomies/product-types/[id]
 * Update an existing product type taxonomy
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    // Validate required fields
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const taxonomyService = new TaxonomyService();
    const productType = await taxonomyService.updateSimpleTaxonomy('product_type', id, title);

    return NextResponse.json({
      success: true,
      productType,
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating product type:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to update product type',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/taxonomies/product-types/[id]
 * Delete a product type taxonomy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taxonomyService = new TaxonomyService();
    
    await taxonomyService.deleteTaxonomy('product_type', id);

    return NextResponse.json({
      success: true,
      message: 'Product type deleted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting product type:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to delete product type',
      },
      { status: 500 }
    );
  }
}
