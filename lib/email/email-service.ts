import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_EMAIL_FROM || 'DigiInsta <noreply@notifications.digiinsta.store>';

export class EmailService {
  /**
   * Send an OTP code to the specified email address
   */
  async sendOTP(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Your DigiInsta Admin Login Code',
        html: this.getOTPEmailTemplate(code),
      });

      if (error) {
        console.error('Resend API error:', error);
        return {
          success: false,
          error: 'Failed to send email. Please try again.',
        };
      }

      console.log('OTP email sent successfully:', data?.id);
      return { success: true };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return {
        success: false,
        error: 'Failed to send email. Please try again.',
      };
    }
  }

  /**
   * Generate the HTML template for OTP email
   */
  private getOTPEmailTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                DigiInsta Admin Login
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                You requested to log in to the DigiInsta Admin Dashboard. Use the code below to complete your login:
              </p>
            </td>
          </tr>
          
          <!-- OTP Code -->
          <tr>
            <td style="padding: 0 40px 20px 40px; text-align: center;">
              <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 24px; display: inline-block;">
                <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Your Login Code
                </p>
                <p style="margin: 0; color: #1a1a1a; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Expiration Notice -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.5; text-align: center;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
            </td>
          </tr>
          
          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e9ecef;">
              <p style="margin: 20px 0 0 0; color: #6c757d; font-size: 13px; line-height: 1.5;">
                <strong>Security Notice:</strong> If you didn't request this code, please ignore this email. This code is only valid for one use.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                © ${new Date().getFullYear()} DigiInsta Store. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
