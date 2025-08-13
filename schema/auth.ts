import { z } from "zod"

export const emailSchema = z.object({
  email: z.email("Please enter a valid email address"),
})

export const otpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must contain only digits"),
})

export type EmailFormData = z.infer<typeof emailSchema>
export type OtpFormData = z.infer<typeof otpSchema>
