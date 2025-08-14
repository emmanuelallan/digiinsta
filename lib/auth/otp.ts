import { sendEmail } from "@/lib/email/client"

export function generateOTP(): string {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const subject = "Your Login OTP"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">DigitalCraft - Login OTP</h2>
      <p>Hello,</p>
      <p>Your login OTP is:</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #0891b2; font-size: 32px; margin: 0; font-family: monospace;">${otp}</h1>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this OTP, please ignore this email.</p>
      <p>Best regards,<br>The DigitalCraft Team</p>
    </div>
  `

  try {
    await sendEmail({
      to: email,
      subject,
      html,
    })
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    throw new Error("Failed to send OTP email")
  }
}
