import { z } from "zod";

/**
 * Schema для создания салона
 */
export const createSalonSchema = z.object({
  name: z
    .string()
    .min(2, "Мінімум 2 символи / Minimum 2 characters")
    .max(100, "Максимум 100 символів / Maximum 100 characters"),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

export type CreateSalonInput = z.infer<typeof createSalonSchema>;
