import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomies';

/**
 * GET /api/taxonomies/collections/[id]
 * Get a single collection by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taxonomyService = new TaxonomyService();
    const collection = await taxonomyService.getTaxonomyById('collection', id);

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      collection,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching collection:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch collection',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/taxonomies/collections/[id]
 * Update an existing collection taxonomy
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

    const collection = await taxonomyService.updateComplexTaxonomy('collection', id, {
      title,
      description,
      image: image && image.size > 0 ? image : null as any,
      keepExistingImage,
    });

    return NextResponse.json({
      success: true,
      collection,
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating collection:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to update collection',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/taxonomies/collections/[id]
 * Delete a collection taxonomy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taxonomyService = new TaxonomyService();
    
    await taxonomyService.deleteTaxonomy('collection', id);

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting collection:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to delete collection',
      },
      { status: 500 }
    );
  }
}
