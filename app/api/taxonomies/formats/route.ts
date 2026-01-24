import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomies';

/**
 * POST /api/taxonomies/formats
 * Create a new format taxonomy
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
    const format = await taxonomyService.createSimpleTaxonomy('format', title);

    return NextResponse.json({
      success: true,
      format,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating format:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to create format',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/taxonomies/formats
 * Get all formats
 */
export async function GET(request: NextRequest) {
  try {
    const taxonomyService = new TaxonomyService();
    const formats = await taxonomyService.getTaxonomiesByType('format');

    return NextResponse.json({
      success: true,
      formats,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching formats:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch formats',
      },
      { status: 500 }
    );
  }
}
