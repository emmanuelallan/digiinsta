import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomies';

/**
 * GET /api/taxonomies/occasions/[id]
 * Get a single occasion by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taxonomyService = new TaxonomyService();
    const occasion = await taxonomyService.getTaxonomyById('occasion', id);

    if (!occasion) {
      return NextResponse.json(
        { success: false, error: 'Occasion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      occasion,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching occasion:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch occasion',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/taxonomies/occasions/[id]
 * Update an existing occasion taxonomy
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as File | null;

    // Validate required fields
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    const taxonomyService = new TaxonomyService();

    // If no new image provided, keep existing one
    const keepExistingImage = !image || image.size === 0;

    const occasion = await taxonomyService.updateComplexTaxonomy('occasion', id, {
      title,
      description,
      image: image && image.size > 0 ? image : null as any,
      keepExistingImage,
    });

    return NextResponse.json({
      success: true,
      occasion,
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating occasion:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to update occasion',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/taxonomies/occasions/[id]
 * Delete an occasion taxonomy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taxonomyService = new TaxonomyService();
    
    await taxonomyService.deleteTaxonomy('occasion', id);

    return NextResponse.json({
      success: true,
      message: 'Occasion deleted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting occasion:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to delete occasion',
      },
      { status: 500 }
    );
  }
}
