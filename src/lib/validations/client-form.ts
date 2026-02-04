import { z } from "zod";

export const clientFormSchema = z.object({
  first_name: z
    .string()
    .min(2, "Ім'я має містити мінімум 2 символи")
    .max(50, "Ім'я занадто довге"),
  last_name: z
    .string()
    .max(50, "Прізвище занадто довге")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(1, "Телефон обов'язковий")
    .regex(/^(\+380|0)\d{9}$/, "Формат: +380XXXXXXXXX або 0XXXXXXXXX"),
  instagram: z
    .string()
    .max(30, "Instagram username занадто довгий")
    .optional()
    .or(z.literal("")),
  telegram: z
    .string()
    .max(30, "Telegram username занадто довгий")
    .optional()
    .or(z.literal("")),
  birth_date: z
    .string()
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "Нотатки занадто довгі (максимум 500 символів)")
    .optional()
    .or(z.literal("")),
  source: z
    .enum(["instagram", "telegram", "referral", "walk-in", "website", "other", ""])
    .optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
