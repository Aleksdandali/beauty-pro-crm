import { z } from 'zod';

// ─── Equipment ──────────────────────────────────────────────────────────────

export const EQUIPMENT_TYPES = [
  { value: 'autoclave', label: 'Автоклав' },
  { value: 'dry_heat', label: 'Сухожарова шафа' },
  { value: 'uv', label: 'УФ-камера' },
  { value: 'ultrasonic', label: 'Ультразвукова мийка' },
  { value: 'glass_bead', label: 'Гласперленовий стерилізатор' },
] as const;

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number]['value'];

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Введіть назву'),
  type: z.enum(['autoclave', 'dry_heat', 'uv', 'ultrasonic', 'glass_bead']),
  brand: z.string(),
  model: z.string(),
  serial_number: z.string(),
  certification_expires: z.string(),
  parameters: z.record(z.string(), z.unknown()).optional(),
});

export type EquipmentFormData = z.infer<typeof equipmentSchema>;

// ─── Instrument Sets ────────────────────────────────────────────────────────

export const INSTRUMENT_CATEGORIES = [
  { value: 'manicure', label: 'Манікюр' },
  { value: 'pedicure', label: 'Педикюр' },
  { value: 'cosmetology', label: 'Косметологія' },
  { value: 'other', label: 'Інше' },
] as const;

export const instrumentSetSchema = z.object({
  name: z.string().min(1, 'Введіть назву набору'),
  instruments: z.array(z.string()).min(1, 'Додайте інструменти'),
  category: z.string().min(1),
});

export type InstrumentSetFormData = z.infer<typeof instrumentSetSchema>;

// ─── Cycle Stages ───────────────────────────────────────────────────────────

export const CYCLE_STAGES = [
  { value: 'preparation', label: 'Підготовка', step: 1 },
  { value: 'disinfection', label: 'Дезінфекція', step: 2 },
  { value: 'pso', label: 'ПСО', step: 3 },
  { value: 'drying', label: 'Сушка', step: 4 },
  { value: 'sterilization', label: 'Стерилізація', step: 5 },
  { value: 'packaging', label: 'Пакування', step: 6 },
  { value: 'completed', label: 'Результат', step: 7 },
] as const;

export type CycleStage = (typeof CYCLE_STAGES)[number]['value'];

export const CYCLE_RESULTS = [
  { value: 'success', label: 'Успішно', color: 'emerald' },
  { value: 'failed', label: 'Не пройшов', color: 'rose' },
  { value: 'partial', label: 'Частково', color: 'amber' },
  { value: 'cancelled', label: 'Скасовано', color: 'gray' },
] as const;

export type CycleResult = (typeof CYCLE_RESULTS)[number]['value'];

// ─── Cycle Actions (for API) ────────────────────────────────────────────────

export const CYCLE_ACTIONS = [
  'start_preparation',
  'start_disinfection',
  'complete_disinfection',
  'start_pso',
  'complete_pso',
  'start_drying',
  'complete_drying',
  'start_sterilization',
  'complete_sterilization',
  'complete_cycle',
  'cancel_cycle',
] as const;

export type CycleAction = (typeof CYCLE_ACTIONS)[number];

export const cycleActionSchema = z.object({
  action: z.enum(CYCLE_ACTIONS),
  // Extra data depending on action
  disinfection_solution: z.string().optional(),
  disinfection_concentration: z.string().optional(),
  disinfection_duration_minutes: z.number().optional(),
  pso_method: z.string().optional(),
  azopyramine_result: z.enum(['positive', 'negative']).optional(),
  azopyramine_photo: z.string().optional(),
  sterilization_mode: z.string().optional(),
  sterilization_temperature: z.number().optional(),
  sterilization_pressure: z.number().optional(),
  sterilization_duration_minutes: z.number().optional(),
  chemical_indicator: z.enum(['passed', 'failed']).optional(),
  chemical_indicator_photo: z.string().optional(),
  drying_method: z.string().optional(),
  packaging_type: z.string().optional(),
  packaging_photo: z.string().optional(),
  photos_before: z.array(z.string()).optional(),
  photos_after: z.array(z.string()).optional(),
  preparation_notes: z.string().optional(),
  result: z.enum(['success', 'failed', 'partial']).optional(),
  result_notes: z.string().optional(),
});

export type CycleActionData = z.infer<typeof cycleActionSchema>;

// ─── Sterilization Modes (presets) ──────────────────────────────────────────

export const STERILIZATION_MODES = [
  {
    value: '134_22_5',
    label: '134°C / 2.2 атм / 5 хв (автоклав)',
    temp: 134,
    pressure: 2.2,
    duration: 5,
  },
  {
    value: '132_20_20',
    label: '132°C / 2.0 атм / 20 хв (автоклав)',
    temp: 132,
    pressure: 2.0,
    duration: 20,
  },
  {
    value: '120_11_45',
    label: '120°C / 1.1 атм / 45 хв (автоклав)',
    temp: 120,
    pressure: 1.1,
    duration: 45,
  },
  { value: 'dry_180_60', label: '180°C / 60 хв (сухожар)', temp: 180, pressure: 0, duration: 60 },
  { value: 'dry_200_30', label: '200°C / 30 хв (сухожар)', temp: 200, pressure: 0, duration: 30 },
  { value: 'custom', label: 'Ручний режим', temp: 0, pressure: 0, duration: 0 },
] as const;

export const DISINFECTION_SOLUTIONS = [
  'DEZIK Концентрат',
  'Бацилол АФ',
  'Аламінол',
  'Корзолекс Плюс',
  'Мікробак Форте',
  'Інше',
] as const;

export const PACKAGING_TYPES = [
  { value: 'kraft', label: 'Крафт-пакет' },
  { value: 'pouch', label: 'Плівковий пакет' },
  { value: 'container', label: 'Контейнер' },
  { value: 'wrap', label: 'Крепований папір' },
  { value: 'none', label: 'Без упаковки' },
] as const;

export const PSO_METHODS = [
  { value: 'ultrasonic', label: 'Ультразвукова мийка' },
  { value: 'manual', label: 'Ручна' },
  { value: 'combined', label: 'Комбінована' },
] as const;

export const DRYING_METHODS = [
  { value: 'air', label: 'Повітряна' },
  { value: 'towel', label: 'Серветками' },
  { value: 'sterile_surface', label: 'На стерильній поверхні' },
] as const;

// ─── Storage ────────────────────────────────────────────────────────────────

export const STORAGE_STATUSES = [
  { value: 'sterile', label: 'Стерильний', variant: 'success' as const },
  { value: 'expired', label: 'Прострочений', variant: 'error' as const },
  { value: 'used', label: 'Використаний', variant: 'default' as const },
] as const;

export type StorageStatus = (typeof STORAGE_STATUSES)[number]['value'];

export const storageSchema = z.object({
  cycle_id: z.string().uuid(),
  package_label: z.string().min(1, 'Введіть мітку пакету'),
  storage_location: z.string(),
  expires_at: z.string(),
});

export type StorageFormData = z.infer<typeof storageSchema>;
