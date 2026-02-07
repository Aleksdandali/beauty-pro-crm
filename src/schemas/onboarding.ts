import { z } from 'zod';

// ─── Working Hours ───────────────────────────────────────────────────────────

export const workingHoursDaySchema = z
  .object({
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Формат ГГ:ХХ'),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Формат ГГ:ХХ'),
  })
  .nullable();

export const workingHoursSchema = z.object({
  mon: workingHoursDaySchema,
  tue: workingHoursDaySchema,
  wed: workingHoursDaySchema,
  thu: workingHoursDaySchema,
  fri: workingHoursDaySchema,
  sat: workingHoursDaySchema,
  sun: workingHoursDaySchema,
});

// ─── Step 1: Salon ───────────────────────────────────────────────────────────

export const salonSchema = z.object({
  name: z.string().min(2, 'Мінімум 2 символи'),
  city: z.string().min(2, 'Мінімум 2 символи'),
  address: z.string(),
  phone: z.string().min(10, 'Невірний номер телефону'),
  slug: z
    .string()
    .min(2, 'Мінімум 2 символи')
    .regex(/^[a-z0-9-]+$/, 'Тільки латиниця, цифри та дефіс'),
  working_hours: workingHoursSchema,
});

export type SalonFormData = z.infer<typeof salonSchema>;

// ─── Step 2: Service ─────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z.string().min(2, 'Мінімум 2 символи'),
  category: z.string().min(1, 'Оберіть категорію'),
  price: z.number().min(0, 'Ціна не може бути відʼємною'),
  duration: z.number().min(5, 'Мінімум 5 хвилин'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

// ─── Step 3: Staff ───────────────────────────────────────────────────────────

export const staffSchema = z.object({
  first_name: z.string().min(2, 'Мінімум 2 символи'),
  last_name: z.string().min(2, 'Мінімум 2 символи'),
  specialization: z.string().min(1, 'Оберіть спеціалізацію'),
  phone: z.string(),
});

export type StaffFormData = z.infer<typeof staffSchema>;

// ─── Default Working Hours ───────────────────────────────────────────────────

export const defaultWorkingHours: z.infer<typeof workingHoursSchema> = {
  mon: { start: '09:00', end: '19:00' },
  tue: { start: '09:00', end: '19:00' },
  wed: { start: '09:00', end: '19:00' },
  thu: { start: '09:00', end: '19:00' },
  fri: { start: '09:00', end: '19:00' },
  sat: { start: '10:00', end: '17:00' },
  sun: null,
};

// ─── Service Templates ───────────────────────────────────────────────────────

export interface ServiceTemplate {
  name: string;
  category: string;
  price: number;
  duration: number;
}

export const SERVICE_CATEGORIES = [
  { id: 'manicure', label: 'Манікюр', color: 'rose' },
  { id: 'pedicure', label: 'Педикюр', color: 'orange' },
  { id: 'nail_extension', label: 'Нарощування нігтів', color: 'pink' },
  { id: 'brow', label: 'Брови', color: 'amber' },
  { id: 'lash', label: 'Вії', color: 'violet' },
  { id: 'hair', label: 'Волосся', color: 'sky' },
  { id: 'cosmetology', label: 'Косметологія', color: 'cyan' },
  { id: 'massage', label: 'Масаж', color: 'emerald' },
] as const;

export const SERVICE_TEMPLATES: Record<string, ServiceTemplate[]> = {
  manicure: [
    { name: 'Манікюр класичний', category: 'manicure', price: 350, duration: 60 },
    { name: 'Манікюр з покриттям', category: 'manicure', price: 500, duration: 90 },
    { name: 'Зняття покриття', category: 'manicure', price: 150, duration: 30 },
    { name: 'Зміцнення нігтів', category: 'manicure', price: 600, duration: 90 },
    { name: 'Чоловічий манікюр', category: 'manicure', price: 300, duration: 45 },
  ],
  pedicure: [
    { name: 'Педикюр класичний', category: 'pedicure', price: 450, duration: 75 },
    { name: 'Педикюр з покриттям', category: 'pedicure', price: 650, duration: 105 },
    { name: 'Педикюр апаратний', category: 'pedicure', price: 550, duration: 90 },
  ],
  nail_extension: [
    { name: 'Нарощування гелем', category: 'nail_extension', price: 900, duration: 150 },
    { name: 'Корекція нарощування', category: 'nail_extension', price: 750, duration: 120 },
    { name: 'Зняття нарощування', category: 'nail_extension', price: 250, duration: 45 },
  ],
  brow: [
    { name: 'Корекція брів', category: 'brow', price: 250, duration: 30 },
    { name: 'Фарбування брів', category: 'brow', price: 200, duration: 20 },
    { name: 'Ламінування брів', category: 'brow', price: 500, duration: 45 },
  ],
  lash: [
    { name: 'Нарощування вій 2D', category: 'lash', price: 800, duration: 120 },
    { name: 'Нарощування вій 3D', category: 'lash', price: 1000, duration: 150 },
    { name: 'Зняття вій', category: 'lash', price: 200, duration: 30 },
    { name: 'Ламінування вій', category: 'lash', price: 600, duration: 60 },
  ],
  hair: [
    { name: 'Жіноча стрижка', category: 'hair', price: 500, duration: 60 },
    { name: 'Чоловіча стрижка', category: 'hair', price: 300, duration: 30 },
    { name: 'Фарбування', category: 'hair', price: 1500, duration: 180 },
    { name: 'Укладка', category: 'hair', price: 400, duration: 45 },
  ],
  cosmetology: [
    { name: 'Чистка обличчя', category: 'cosmetology', price: 800, duration: 90 },
    { name: 'Пілінг', category: 'cosmetology', price: 600, duration: 60 },
    { name: 'Мезотерапія', category: 'cosmetology', price: 1200, duration: 45 },
  ],
  massage: [
    { name: 'Масаж спини', category: 'massage', price: 500, duration: 30 },
    { name: 'Масаж загальний', category: 'massage', price: 800, duration: 60 },
    { name: 'Масаж обличчя', category: 'massage', price: 400, duration: 30 },
  ],
};

// ─── Specializations ─────────────────────────────────────────────────────────

export const SPECIALIZATIONS = [
  { id: 'nail', label: 'Нігті' },
  { id: 'hair', label: 'Волосся' },
  { id: 'brow', label: 'Брови' },
  { id: 'lash', label: 'Вії' },
  { id: 'cosmetology', label: 'Косметологія' },
  { id: 'massage', label: 'Масаж' },
] as const;

// ─── Day Labels ──────────────────────────────────────────────────────────────

export const DAY_LABELS: Record<string, string> = {
  mon: 'Понеділок',
  tue: 'Вівторок',
  wed: 'Середа',
  thu: 'Четвер',
  fri: "П'ятниця",
  sat: 'Субота',
  sun: 'Неділя',
};
