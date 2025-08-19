"use server"

import { createClient } from "@/lib/supabase/server"
import { newsletterEmailSchema } from "@/schema/newsletter"

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email") as string

  const validation = newsletterEmailSchema.safeParse({ email })
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || "Invalid email format"
    return { error: errorMessage }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("newsletter_signups").insert({ email })

    if (error) {
      if (error.code === "23505") { // Unique violation error code
        return { error: "This email is already subscribed to our newsletter." }
      }
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: "Failed to subscribe. Please try again." }
  }
}