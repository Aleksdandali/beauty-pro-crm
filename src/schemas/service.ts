import { z } from 'zod';

// ─── Service Schema ──────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z.string().min(2, 'Мінімум 2 символи'),
  category: z.string().min(1, 'Оберіть категорію'),
  price: z.number().positive('Ціна має бути більше 0'),
  duration: z.number().int().min(5, 'Мінімум 5 хвилин'),
  description: z.string(),
  color: z.string(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

// ─── Service Material Schema ─────────────────────────────────────────────────

export const serviceMaterialSchema = z.object({
  service_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity_per_service: z.coerce.number().positive('Має бути більше 0'),
});

export type ServiceMaterialFormData = z.infer<typeof serviceMaterialSchema>;

// ─── Salon Overhead Schema ───────────────────────────────────────────────────

export const salonOverheadSchema = z.object({
  monthly_expenses: z.coerce.number().min(0, 'Не може бути від\u02BCємним'),
  working_days: z.coerce.number().int().min(1).max(31),
  hours_per_day: z.coerce.number().min(1).max(24),
  masters_per_shift: z.coerce.number().int().min(1),
  master_commission_percent: z.coerce.number().min(0).max(100),
  desired_profit_percent: z.coerce.number().min(0).max(100),
});

export type SalonOverhead = z.infer<typeof salonOverheadSchema>;

// ─── Categories Config ───────────────────────────────────────────────────────

export const SERVICE_CATEGORIES = [
  { key: 'all', label: 'Всі' },
  { key: 'manicure', label: 'Манікюр' },
  { key: 'pedicure', label: 'Педикюр' },
  { key: 'nail_extension', label: 'Нарощування' },
  { key: 'hair', label: 'Волосся' },
  { key: 'brow', label: 'Брови' },
  { key: 'lash', label: 'Вії' },
  { key: 'cosmetology', label: 'Косметологія' },
  { key: 'massage', label: 'Масаж' },
  { key: 'other', label: 'Інше' },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  manicure: 'Манікюр',
  pedicure: 'Педикюр',
  nail_extension: 'Нарощування',
  hair: 'Волосся',
  brow: 'Брови',
  lash: 'Вії',
  cosmetology: 'Косметологія',
  massage: 'Масаж',
  other: 'Інше',
};

// ─── Margin Helpers ──────────────────────────────────────────────────────────

export interface MaterialCostItem {
  id: string;
  product_name: string;
  purchase_price: number;
  unit: string;
  quantity_in_package: number;
  quantity_per_service: number;
  unit_cost: number;
  total_cost: number;
}

export interface CostBreakdown {
  materialsCost: number;
  overheadCost: number;
  totalCost: number;
  masterCommission: number;
  desiredProfit: number;
  minPrice: number;
  currentPrice: number;
  realProfit: number;
  realMarginPercent: number;
  isProfitable: boolean;
  costPerMinute: number;
}

export function calculateCostBreakdown(
  price: number,
  materialsCost: number,
  durationMinutes: number,
  overhead?: SalonOverhead | null
): CostBreakdown {
  let overheadCost = 0;
  let costPerMinute = 0;
  let masterCommissionRate = 0;
  let desiredProfitRate = 0;

  if (overhead && overhead.monthly_expenses > 0) {
    const totalMinutesPerMonth =
      overhead.working_days * overhead.hours_per_day * 60 * overhead.masters_per_shift;
    costPerMinute = totalMinutesPerMonth > 0 ? overhead.monthly_expenses / totalMinutesPerMonth : 0;
    overheadCost = durationMinutes * costPerMinute;
    masterCommissionRate = overhead.master_commission_percent / 100;
    desiredProfitRate = overhead.desired_profit_percent / 100;
  }

  const totalCost = materialsCost + overheadCost;
  const divisor = 1 - masterCommissionRate - desiredProfitRate;
  const minPrice = divisor > 0 ? totalCost / divisor : totalCost;
  const masterCommission = price * masterCommissionRate;
  const desiredProfit = price * desiredProfitRate;
  const realProfit = price - totalCost - masterCommission;
  const realMarginPercent = price > 0 ? (realProfit / price) * 100 : 0;

  return {
    materialsCost,
    overheadCost,
    totalCost,
    masterCommission,
    desiredProfit,
    minPrice,
    currentPrice: price,
    realProfit,
    realMarginPercent,
    isProfitable: price >= minPrice,
    costPerMinute,
  };
}

/** Simple margin: (price - materialsCost) / price * 100 */
export function simpleMargin(price: number, materialsCost: number): number {
  if (price <= 0) return 0;
  return ((price - materialsCost) / price) * 100;
}
