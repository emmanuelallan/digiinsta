// Product validation schema - placeholder
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  // TODO: Add more fields from blueprint
});

export type ProductInput = z.infer<typeof productSchema>;
