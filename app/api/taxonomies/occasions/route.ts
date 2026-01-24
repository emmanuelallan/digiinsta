import { NextRequest, NextResponse } from 'next/server';
import { TaxonomyService } from '@/lib/taxonomies';

/**
 * POST /api/taxonomies/occasions
 * Create a new occasion taxonomy with image upload
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
    const occasion = await taxonomyService.createComplexTaxonomy('occasion', {
      title,
      description,
      image,
    });

    return NextResponse.json({
      success: true,
      occasion,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating occasion:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to create occasion',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/taxonomies/occasions
 * Get all occasions
 */
export async function GET(request: NextRequest) {
  try {
    const taxonomyService = new TaxonomyService();
    const occasions = await taxonomyService.getTaxonomiesByType('occasion');

    return NextResponse.json({
      success: true,
      occasions,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching occasions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch occasions',
      },
      { status: 500 }
    );
  }
}
