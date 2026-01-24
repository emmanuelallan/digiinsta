import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyService, TaxonomyType } from '@/lib/taxonomies';

/**
 * GET /api/taxonomies/:type
 * Get all taxonomies of a specific type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
    // Validate taxonomy type
    const validTypes: TaxonomyType[] = ['product_type', 'format', 'occasion', 'collection'];
    if (!validTypes.includes(type as TaxonomyType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid taxonomy type. Must be one of: ${validTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const taxonomyService = new TaxonomyService();
    const taxonomies = await taxonomyService.getTaxonomiesByType(type as TaxonomyType);

    return NextResponse.json({
      success: true,
      type,
      taxonomies,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching taxonomies:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch taxonomies',
      },
      { status: 500 }
    );
  }
}
