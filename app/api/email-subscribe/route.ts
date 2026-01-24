import { NextRequest, NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/db/email';
import { isValidEmail } from '@/lib/utils/validation';

/**
 * POST /api/email-subscribe
 * Subscribe an email to the newsletter
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, source = 'homepage' } = body;

    // Validate email is provided
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate source if provided
    if (source && !['homepage', 'checkout'].includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be "homepage" or "checkout"' },
        { status: 400 }
      );
    }

    // Subscribe email to database
    await subscribeEmail(email, source);

    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Successfully subscribed to newsletter' 
      },
      { status: 201 }
    );

  } catch (error) {
    // Handle duplicate email error
    if (error instanceof Error && error.message.includes('already subscribed')) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    // Handle other errors
    console.error('Email subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe email. Please try again later.' },
      { status: 500 }
    );
  }
}
