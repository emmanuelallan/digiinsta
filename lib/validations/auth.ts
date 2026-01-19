// Auth validation schema - placeholder
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
});

export const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
