import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomies';

/**
 * GET /api/taxonomies/formats/[id]
 * Get a single format by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taxonomyService = new TaxonomyService();
    const format = await taxonomyService.getTaxonomyById('format', id);

    if (!format) {
      return NextResponse.json(
        { success: false, error: 'Format not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      format,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching format:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch format',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/taxonomies/formats/[id]
 * Update an existing format taxonomy
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
    const format = await taxonomyService.updateSimpleTaxonomy('format', id, title);

    return NextResponse.json({
      success: true,
      format,
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating format:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to update format',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/taxonomies/formats/[id]
 * Delete a format taxonomy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taxonomyService = new TaxonomyService();
    
    await taxonomyService.deleteTaxonomy('format', id);

    return NextResponse.json({
      success: true,
      message: 'Format deleted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting format:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to delete format',
      },
      { status: 500 }
    );
  }
}
