/**
 * Email Subscription Functions for Storefront
 * 
 * Provides database functions for managing email subscriptions
 * for the Digital Love Storefront newsletter.
 */

import { db, emailSubscriptions } from '@/lib/db';
import { eq, and, isNull } from 'drizzle-orm';

/**
 * Subscribe an email to the newsletter
 * @param email - The email address to subscribe
 * @param source - Where the subscription came from ('homepage' | 'checkout')
 * @throws Error if email is already subscribed
 */
export async function subscribeEmail(email: string, source: 'homepage' | 'checkout' = 'homepage'): Promise<void> {
  try {
    // Check if email is already subscribed
    const existing = await isEmailSubscribed(email);
    
    if (existing) {
      throw new Error('Email is already subscribed');
    }

    // Insert new subscription
    await db.insert(emailSubscriptions).values({
      email,
      source,
    });
  } catch (error) {
    // Check if it's a unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes('unique')) {
      throw new Error('Email is already subscribed');
    }
    
    // Re-throw other errors
    console.error('Error subscribing email:', error);
    throw error;
  }
}

/**
 * Check if an email is already subscribed
 * @param email - The email address to check
 * @returns true if email is subscribed and not unsubscribed, false otherwise
 */
export async function isEmailSubscribed(email: string): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(emailSubscriptions)
      .where(
        and(
          eq(emailSubscriptions.email, email),
          isNull(emailSubscriptions.unsubscribedAt)
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error('Error checking email subscription:', error);
    return false;
  }
}
