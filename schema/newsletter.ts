import { z } from "zod"

export const newsletterEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type NewsletterEmailFormData = z.infer<typeof newsletterEmailSchema>
