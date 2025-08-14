import { NextRequest, NextResponse } from "next/server"
import { generateOTP, sendOTPEmail } from "@/lib/auth/otp"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    
    // In a real app, you would store this OTP securely (e.g., in Redis with expiration)
    // For now, we'll just simulate sending it
    
    // Send OTP via email
    await sendOTPEmail(email, otp)

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error sending OTP:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
