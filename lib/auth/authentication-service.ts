import { db, otps } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { generateOTP, getOTPExpiration } from './utils';
import { SessionManager } from './session-manager';
import { EmailService } from '@/lib/email';

const ALLOWED_EMAIL = 'digiinstastore@gmail.com';

export class AuthenticationService {
  private sessionManager: SessionManager;
  private emailService: EmailService;

  constructor() {
    this.sessionManager = new SessionManager();
    this.emailService = new EmailService();
  }

  /**
   * Check if an email is allowed to access the admin dashboard
   */
  isEmailAllowed(email: string): boolean {
    return email.toLowerCase() === ALLOWED_EMAIL.toLowerCase();
  }

  /**
   * Send an OTP to the given email address
   * Returns success status and optional error message
   */
  async sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
    // Validate email
    if (!this.isEmailAllowed(email)) {
      return {
        success: false,
        error: 'This email is not authorized to access the admin dashboard',
      };
    }

    try {
      // Generate OTP
      const code = generateOTP();
      const expiresAt = getOTPExpiration();

      // Store OTP in database
      await db.insert(otps).values({
        email,
        code,
        expiresAt,
        used: false,
      });

      // Send email via Resend
      const emailResult = await this.emailService.sendOTP(email, code);
      
      if (!emailResult.success) {
        return {
          success: false,
          error: emailResult.error || 'Failed to send OTP email',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        error: 'Failed to send OTP. Please try again.',
      };
    }
  }

  /**
   * Verify an OTP code for the given email
   * Returns success status, optional session token, and optional error message
   */
  async verifyOTP(
    email: string,
    code: string
  ): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
    try {
      // Find the OTP
      const otpRecords = await db
        .select()
        .from(otps)
        .where(and(eq(otps.email, email), eq(otps.code, code), eq(otps.used, false)))
        .limit(1);

      if (otpRecords.length === 0) {
        return {
          success: false,
          error: 'Invalid OTP code',
        };
      }

      const otpRecord = otpRecords[0];

      // Check if OTP is expired
      const now = new Date();
      if (otpRecord.expiresAt < now) {
        return {
          success: false,
          error: 'OTP has expired. Please request a new one.',
        };
      }

      // Mark OTP as used
      await db
        .update(otps)
        .set({ used: true })
        .where(eq(otps.id, otpRecord.id));

      // Create session
      const sessionToken = await this.sessionManager.createSession(email);

      return {
        success: true,
        sessionToken,
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: 'Failed to verify OTP. Please try again.',
      };
    }
  }

  /**
   * Get the session manager instance
   */
  getSessionManager(): SessionManager {
    return this.sessionManager;
  }
}
