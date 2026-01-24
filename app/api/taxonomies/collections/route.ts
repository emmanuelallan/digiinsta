import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomies';

/**
 * POST /api/taxonomies/collections
 * Create a new collection taxonomy with image upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as File;

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

    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    const taxonomyService = new TaxonomyService();
    const collection = await taxonomyService.createComplexTaxonomy('collection', {
      title,
      description,
      image,
    });

    return NextResponse.json({
      success: true,
      collection,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating collection:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to create collection',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/taxonomies/collections
 * Get all collections
 */
export async function GET(request: NextRequest) {
  try {
    const taxonomyService = new TaxonomyService();
    const collections = await taxonomyService.getTaxonomiesByType('collection');

    return NextResponse.json({
      success: true,
      collections,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching collections:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch collections',
      },
      { status: 500 }
    );
  }
}
