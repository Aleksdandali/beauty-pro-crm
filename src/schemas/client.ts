import { z } from 'zod';

// ─── Client Schema ───────────────────────────────────────────────────────────

export const clientSchema = z.object({
  first_name: z.string().min(2, 'Мінімум 2 символи'),
  last_name: z.string(),
  phone: z.string().min(10, 'Невірний номер телефону'),
  email: z.union([z.string().email('Невірний email'), z.literal('')]),
  birthday: z.string(),
  notes: z.string(),
  source: z.enum(['manual', 'online_booking', 'instagram', 'referral']),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// ─── Formula Schema ──────────────────────────────────────────────────────────

export const nailFormulaSchema = z.object({
  base: z.string().optional().default(''),
  color: z.string().optional().default(''),
  top: z.string().optional().default(''),
  design: z.string().optional().default(''),
  nail_plate: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const hairFormulaSchema = z.object({
  color_formula: z.string().optional().default(''),
  developer: z.string().optional().default(''),
  brand: z.string().optional().default(''),
  time_minutes: z.coerce.number().optional(),
  notes: z.string().optional().default(''),
});

export const formulaSchema = z.object({
  nail: nailFormulaSchema.optional(),
  hair: hairFormulaSchema.optional(),
  allergies: z.array(z.string()).default([]),
  preferences: z.string().optional().default(''),
});

export type FormulaFormData = z.infer<typeof formulaSchema>;

// ─── RFM Segment Config ──────────────────────────────────────────────────────

export const RFM_SEGMENTS = [
  { key: 'all', label: 'Всі' },
  { key: 'vip', label: 'VIP' },
  { key: 'loyal', label: 'Лояльні' },
  { key: 'regular', label: 'Звичайні' },
  { key: 'new', label: 'Нові' },
  { key: 'sleeping', label: 'Сплячі' },
  { key: 'lost', label: 'Втрачені' },
] as const;

export type RfmSegment = 'vip' | 'loyal' | 'regular' | 'new' | 'sleeping' | 'lost';

// ─── Source Labels ───────────────────────────────────────────────────────────

export const SOURCE_LABELS: Record<string, string> = {
  manual: 'Вручну',
  online_booking: 'Онлайн-запис',
  instagram: 'Instagram',
  referral: 'За рекомендацією',
};

// ─── Nail Plate Options ──────────────────────────────────────────────────────

export const NAIL_PLATE_OPTIONS = [
  { value: '', label: 'Не вказано' },
  { value: 'normal', label: 'Нормальна' },
  { value: 'thin', label: 'Тонка' },
  { value: 'dry', label: 'Суха' },
  { value: 'brittle', label: 'Ламка' },
  { value: 'oily', label: 'Жирна' },
] as const;

// ─── Developer Options ───────────────────────────────────────────────────────

export const DEVELOPER_OPTIONS = [
  { value: '', label: 'Не вказано' },
  { value: '1.5%', label: '1.5%' },
  { value: '3%', label: '3%' },
  { value: '6%', label: '6%' },
  { value: '9%', label: '9%' },
  { value: '12%', label: '12%' },
] as const;
