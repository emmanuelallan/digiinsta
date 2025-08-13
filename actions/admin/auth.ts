"use server"

import { createClient } from "@/lib/supabase/server"
import { emailSchema, otpSchema } from "@/schema/auth"
import { redirect } from "next/navigation"

export async function sendOtp(formData: FormData) {
  const email = formData.get("email") as string

  const validation = emailSchema.safeParse({ email })
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || "Invalid email format"
    return { error: errorMessage }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/admin/dashboard`,
      },
    })

    if (error) {
      if (error.message.includes("User not found") || error.message.includes("Signups not allowed")) {
        return { error: "Unauthorized user. This email is not registered for admin access." }
      }
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: "Failed to send OTP. Please try again." }
  }
}

export async function verifyOtp(formData: FormData) {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string

  const validation = otpSchema.safeParse({ email, otp })
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || "Invalid OTP format"
    return { error: errorMessage }
  }

  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    })

    if (error) {
      if (error.message.includes("expired")) {
        return { error: "OTP has expired. Please request a new one." }
      }
      if (error.message.includes("invalid")) {
        return { error: "Invalid OTP. Please check and try again." }
      }
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: "Failed to verify OTP. Please try again." }
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/admin/dashboard`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data.url) {
      redirect(data.url)
    }
  } catch (error) {
    return { error: "Failed to sign in with Google. Please try again." }
  }
}

export async function signOut() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return { success: true }
  } catch (error) {
    return { error: "Failed to sign out. Please try again." }
  }
}

export async function signOutAction() {
  "use server"
  const result = await signOut()
  if (result.success) {
    redirect("/admin/auth/login")
  }
  return result
}
