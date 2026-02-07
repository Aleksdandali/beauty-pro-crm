import { z } from 'zod';

// ─── Expense Categories ──────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Оренда', icon: '🏠', color: '#8b5cf6' },
  { value: 'utilities', label: 'Комуналка', icon: '💡', color: '#3b82f6' },
  { value: 'salaries', label: 'Зарплати', icon: '👥', color: '#10b981' },
  { value: 'materials', label: 'Матеріали', icon: '📦', color: '#f59e0b' },
  { value: 'advertising', label: 'Реклама', icon: '📣', color: '#ec4899' },
  { value: 'taxes', label: 'Податки', icon: '📋', color: '#ef4444' },
  { value: 'equipment', label: 'Обладнання', icon: '⚙️', color: '#6366f1' },
  { value: 'cleaning', label: 'Клінінг', icon: '🧹', color: '#14b8a6' },
  { value: 'security', label: 'Охорона', icon: '🔒', color: '#64748b' },
  { value: 'internet', label: "Інтернет / Зв'язок", icon: '📶', color: '#0ea5e9' },
  { value: 'other', label: 'Інше', icon: '📌', color: '#9ca3af' },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]['value'];

// ─── Expense Schema ──────────────────────────────────────────────────────────

export const expenseSchema = z.object({
  category: z.string().min(1, 'Оберіть категорію'),
  amount: z.number().min(0.01, 'Введіть суму'),
  description: z.string().optional(),
  date: z.string().min(1, 'Оберіть дату'),
  is_recurring: z.boolean().default(false),
  recurring_period: z.enum(['weekly', 'monthly']).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// ─── Payroll Statuses ────────────────────────────────────────────────────────

export const PAYROLL_STATUSES = [
  { value: 'draft', label: 'Чернетка', variant: 'default' as const },
  { value: 'approved', label: 'Затверджено', variant: 'warning' as const },
  { value: 'paid', label: 'Оплачено', variant: 'success' as const },
] as const;

export type PayrollStatus = (typeof PAYROLL_STATUSES)[number]['value'];

// ─── Period Options ──────────────────────────────────────────────────────────

export const PERIOD_OPTIONS = [
  { value: 'this_month', label: 'Цей місяць' },
  { value: 'last_month', label: 'Мин. місяць' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Рік' },
  { value: 'custom', label: 'Довільний' },
] as const;

export type PeriodOption = (typeof PERIOD_OPTIONS)[number]['value'];
