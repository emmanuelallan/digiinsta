// Category validation schema - placeholder
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  // TODO: Add more fields from blueprint
});

export type CategoryInput = z.infer<typeof categorySchema>;
