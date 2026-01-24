import { db, sessions } from '@/lib/db';
import { eq, lt } from 'drizzle-orm';
import { generateSessionToken, getSessionExpiration } from './utils';

export class SessionManager {
  /**
   * Create a new session for the given email
   * Returns the session token
   */
  async createSession(email: string): Promise<string> {
    const token = generateSessionToken();
    const expiresAt = getSessionExpiration();

    await db.insert(sessions).values({
      token,
      email,
      expiresAt,
    });

    return token;
  }

  /**
   * Validate a session token
   * Returns true if the session is valid and not expired
   */
  async validateSession(token: string): Promise<boolean> {
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) {
      return false;
    }

    const now = new Date();
    if (session[0].expiresAt < now) {
      // Session expired, delete it
      await this.invalidateSession(token);
      return false;
    }

    return true;
  }

  /**
   * Refresh a session by extending its expiration time
   * This should be called on user activity to keep the session alive
   */
  async refreshSession(token: string): Promise<boolean> {
    try {
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);

      if (session.length === 0) {
        return false;
      }

      const now = new Date();
      if (session[0].expiresAt < now) {
        // Session expired, delete it
        await this.invalidateSession(token);
        return false;
      }

      // Extend the session expiration
      const newExpiresAt = getSessionExpiration();
      await db
        .update(sessions)
        .set({ expiresAt: newExpiresAt })
        .where(eq(sessions.token, token));

      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }

  /**
   * Invalidate a session by deleting it from the database
   */
  async invalidateSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  /**
   * Clean up expired sessions from the database
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    await db.delete(sessions).where(lt(sessions.expiresAt, now));
  }

  /**
   * Get session details by token
   */
  async getSession(token: string) {
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) {
      return null;
    }

    return session[0];
  }
}
