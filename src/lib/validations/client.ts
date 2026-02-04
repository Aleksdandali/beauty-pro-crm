import { z } from "zod";

export const clientSchema = z.object({
  first_name: z.string().min(1, "Ім'я обов'язкове").max(50, "Максимум 50 символів"),
  last_name: z.string().max(50, "Максимум 50 символів").optional(),
  phone: z
    .string()
    .min(1, "Телефон обов'язковий")
    .regex(/^\+?[0-9\s\-()]+$/, "Невірний формат телефону"),
  instagram: z.string().optional(),
  telegram: z.string().optional(),
  birth_date: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
