import { NextRequest, NextResponse } from 'next/server';
import { ProductSyncService } from '@/lib/products';
import { SessionManager } from '@/lib/auth';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'digiinsta_session';

/**
 * POST /api/products/sync
 * 
 * Synchronizes products from Lemon Squeezy API to the database.
 * Requires authentication.
 * 
 * Returns:
 * - 200: Sync completed successfully (with results)
 * - 401: Unauthorized (no valid session)
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required. Please log in.' 
        },
        { status: 401 }
      );
    }

    // Validate session
    const sessionManager = new SessionManager();
    const isValid = await sessionManager.validateSession(sessionToken);

    if (!isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Session is invalid or expired. Please log in again.' 
        },
        { status: 401 }
      );
    }

    // Perform product sync
    const syncService = new ProductSyncService();
    const result = await syncService.syncProducts();

    // Return sync results
    // Even if there were errors, we return 200 if the sync process completed
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error in product sync route:', error);
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        newProductsCount: 0,
        skippedProductsCount: 0,
        errors: [
          error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred during product sync'
        ],
      },
      { status: 500 }
    );
  }
}
