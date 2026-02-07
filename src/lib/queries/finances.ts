import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  prevRevenue: number;
  prevExpenses: number;
  prevProfit: number;
  revenueGrowth: number;
  expensesGrowth: number;
  profitGrowth: number;
}

export interface RevenueByPeriod {
  label: string;
  revenue: number;
  expenses: number;
}

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  is_recurring: boolean;
  recurring_period: string | null;
  created_at: string;
}

export interface ExpenseByCategory {
  category: string;
  total: number;
  count: number;
}

export interface ServiceRevenue {
  service_id: string;
  service_name: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface StaffRevenue {
  staff_id: string;
  staff_name: string;
  count: number;
  revenue: number;
  avg_check: number;
}

export interface PayrollItem {
  id: string;
  staff_id: string;
  staff_name: string;
  period_start: string;
  period_end: string;
  revenue: number;
  commission_percent: number;
  commission_amount: number;
  bonus: number;
  deductions: number;
  total: number;
  status: string;
}

export interface ServiceProfitability {
  service_id: string;
  service_name: string;
  price: number;
  materials_cost: number;
  overhead_per_service: number;
  margin: number;
  margin_percent: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPeriodDates(period: string): {
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
} {
  const now = new Date();
  let from: Date;
  let to: Date;
  let prevFrom: Date;
  let prevTo: Date;

  switch (period) {
    case 'last_month': {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0);
      prevFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      prevTo = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      break;
    }
    case 'quarter': {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      from = new Date(now.getFullYear(), qMonth, 1);
      to = now;
      prevFrom = new Date(now.getFullYear(), qMonth - 3, 1);
      prevTo = new Date(now.getFullYear(), qMonth, 0);
      break;
    }
    case 'year': {
      from = new Date(now.getFullYear(), 0, 1);
      to = now;
      prevFrom = new Date(now.getFullYear() - 1, 0, 1);
      prevTo = new Date(now.getFullYear() - 1, 11, 31);
      break;
    }
    default: {
      // this_month
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = now;
      prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevTo = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    }
  }

  return {
    from: from.toISOString().split('T')[0]!,
    to: to.toISOString().split('T')[0]!,
    prevFrom: prevFrom.toISOString().split('T')[0]!,
    prevTo: prevTo.toISOString().split('T')[0]!,
  };
}

function calcGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

// ─── Get Financial Summary ───────────────────────────────────────────────────

export async function getFinancialSummary(
  period: string = 'this_month'
): Promise<FinancialSummary> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { from, to, prevFrom, prevTo } = getPeriodDates(period);

  // Revenue: completed appointments
  const [currentRev, prevRev, currentExp, prevExp] = await Promise.all([
    supabase
      .from('appointments')
      .select('price')
      .eq('salon_id', salonId)
      .eq('status', 'completed')
      .gte('start_time', `${from}T00:00:00`)
      .lte('start_time', `${to}T23:59:59`),
    supabase
      .from('appointments')
      .select('price')
      .eq('salon_id', salonId)
      .eq('status', 'completed')
      .gte('start_time', `${prevFrom}T00:00:00`)
      .lte('start_time', `${prevTo}T23:59:59`),
    supabase
      .from('expenses')
      .select('amount')
      .eq('salon_id', salonId)
      .gte('date', from)
      .lte('date', to),
    supabase
      .from('expenses')
      .select('amount')
      .eq('salon_id', salonId)
      .gte('date', prevFrom)
      .lte('date', prevTo),
  ]);

  const revenue = (currentRev.data ?? []).reduce((s, a) => s + Number(a.price ?? 0), 0);
  const prevRevenue = (prevRev.data ?? []).reduce((s, a) => s + Number(a.price ?? 0), 0);
  const expenses = (currentExp.data ?? []).reduce((s, a) => s + Number(a.amount ?? 0), 0);
  const prevExpenses = (prevExp.data ?? []).reduce((s, a) => s + Number(a.amount ?? 0), 0);
  const profit = revenue - expenses;
  const prevProfit = prevRevenue - prevExpenses;

  return {
    revenue,
    expenses,
    profit,
    prevRevenue,
    prevExpenses,
    prevProfit,
    revenueGrowth: calcGrowth(revenue, prevRevenue),
    expensesGrowth: calcGrowth(expenses, prevExpenses),
    profitGrowth: calcGrowth(profit, prevProfit),
  };
}

// ─── Revenue by Period (for bar chart) ───────────────────────────────────────

export async function getRevenueByPeriod(
  period: string = 'this_month'
): Promise<RevenueByPeriod[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { from, to } = getPeriodDates(period);

  const [revRes, expRes] = await Promise.all([
    supabase
      .from('appointments')
      .select('start_time, price')
      .eq('salon_id', salonId)
      .eq('status', 'completed')
      .gte('start_time', `${from}T00:00:00`)
      .lte('start_time', `${to}T23:59:59`)
      .order('start_time'),
    supabase
      .from('expenses')
      .select('date, amount')
      .eq('salon_id', salonId)
      .gte('date', from)
      .lte('date', to)
      .order('date'),
  ]);

  // Group by week
  const weekMap = new Map<string, { revenue: number; expenses: number }>();

  for (const a of revRes.data ?? []) {
    const d = new Date(a.start_time);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay() + 1);
    const key = weekStart.toISOString().split('T')[0]!;
    const existing = weekMap.get(key) ?? { revenue: 0, expenses: 0 };
    existing.revenue += Number(a.price ?? 0);
    weekMap.set(key, existing);
  }

  for (const e of expRes.data ?? []) {
    const d = new Date(e.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay() + 1);
    const key = weekStart.toISOString().split('T')[0]!;
    const existing = weekMap.get(key) ?? { revenue: 0, expenses: 0 };
    existing.expenses += Number(e.amount ?? 0);
    weekMap.set(key, existing);
  }

  const sorted = [...weekMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.map(([key, val]) => {
    const d = new Date(key);
    return {
      label: `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      revenue: Math.round(val.revenue),
      expenses: Math.round(val.expenses),
    };
  });
}

// ─── Get Expenses ────────────────────────────────────────────────────────────

export async function getExpenses(period: string = 'this_month'): Promise<{
  items: ExpenseItem[];
  byCategory: ExpenseByCategory[];
  total: number;
}> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { from, to } = getPeriodDates(period);

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('salon_id', salonId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false });

  if (error) {
    console.error('[FINANCES] getExpenses error:', error.message);
    return { items: [], byCategory: [], total: 0 };
  }

  const items: ExpenseItem[] = (data ?? []).map((r) => ({
    id: r.id,
    category: r.category,
    amount: Number(r.amount),
    description: r.description,
    date: r.date,
    is_recurring: r.is_recurring ?? false,
    recurring_period: r.recurring_period,
    created_at: r.created_at,
  }));

  const total = items.reduce((s, e) => s + e.amount, 0);

  // Group by category
  const catMap = new Map<string, { total: number; count: number }>();
  for (const item of items) {
    const existing = catMap.get(item.category) ?? { total: 0, count: 0 };
    existing.total += item.amount;
    existing.count += 1;
    catMap.set(item.category, existing);
  }

  const byCategory: ExpenseByCategory[] = [...catMap.entries()]
    .map(([category, val]) => ({ category, total: val.total, count: val.count }))
    .sort((a, b) => b.total - a.total);

  return { items, byCategory, total };
}

// ─── Revenue by Services ─────────────────────────────────────────────────────

export async function getServiceRevenue(period: string = 'this_month'): Promise<ServiceRevenue[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { from, to } = getPeriodDates(period);

  const { data } = await supabase
    .from('appointments')
    .select('service_id, price, services!service_id(name)')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('start_time', `${from}T00:00:00`)
    .lte('start_time', `${to}T23:59:59`);

  const sMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const a of data ?? []) {
    const svc = a.services as unknown as { name: string } | null;
    const key = a.service_id ?? 'unknown';
    const existing = sMap.get(key) ?? { name: svc?.name ?? 'Невідомо', count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += Number(a.price ?? 0);
    sMap.set(key, existing);
  }

  const totalRevenue = [...sMap.values()].reduce((s, v) => s + v.revenue, 0);

  return [...sMap.entries()]
    .map(([id, val]) => ({
      service_id: id,
      service_name: val.name,
      count: val.count,
      revenue: Math.round(val.revenue),
      percentage: totalRevenue > 0 ? Math.round((val.revenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ─── Revenue by Staff ────────────────────────────────────────────────────────

export async function getStaffRevenue(period: string = 'this_month'): Promise<StaffRevenue[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { from, to } = getPeriodDates(period);

  const { data } = await supabase
    .from('appointments')
    .select('staff_id, price, staff!staff_id(first_name, last_name)')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('start_time', `${from}T00:00:00`)
    .lte('start_time', `${to}T23:59:59`);

  const sMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const a of data ?? []) {
    const stf = a.staff as unknown as { first_name: string; last_name: string } | null;
    const key = a.staff_id ?? 'unknown';
    const existing = sMap.get(key) ?? {
      name: stf ? `${stf.first_name} ${stf.last_name}` : 'Невідомо',
      count: 0,
      revenue: 0,
    };
    existing.count += 1;
    existing.revenue += Number(a.price ?? 0);
    sMap.set(key, existing);
  }

  return [...sMap.entries()]
    .map(([id, val]) => ({
      staff_id: id,
      staff_name: val.name,
      count: val.count,
      revenue: Math.round(val.revenue),
      avg_check: val.count > 0 ? Math.round(val.revenue / val.count) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ─── Payroll ─────────────────────────────────────────────────────────────────

export async function getPayroll(period: string = 'this_month'): Promise<PayrollItem[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { from, to } = getPeriodDates(period);

  // First try existing payroll records
  const { data: existing } = await supabase
    .from('payroll')
    .select('*, staff!staff_id(first_name, last_name)')
    .eq('salon_id', salonId)
    .gte('period_start', from)
    .lte('period_end', to);

  if (existing && existing.length > 0) {
    return existing.map((p) => {
      const stf = p.staff as unknown as { first_name: string; last_name: string } | null;
      return {
        id: p.id,
        staff_id: p.staff_id,
        staff_name: stf ? `${stf.first_name} ${stf.last_name}` : 'Невідомо',
        period_start: p.period_start,
        period_end: p.period_end,
        revenue: Number(p.revenue),
        commission_percent: Number(p.commission_percent),
        commission_amount: Number(p.commission_amount),
        bonus: Number(p.bonus),
        deductions: Number(p.deductions),
        total: Number(p.total),
        status: p.status,
      };
    });
  }

  // Auto-generate from appointments
  const staffRevenue = await getStaffRevenue(period);
  const { data: staffData } = await supabase
    .from('staff')
    .select('id, first_name, last_name, commission_rate')
    .eq('salon_id', salonId)
    .eq('is_active', true);

  const staffMap = new Map<string, { name: string; commission: number }>();
  for (const s of staffData ?? []) {
    staffMap.set(s.id, {
      name: `${s.first_name} ${s.last_name}`,
      commission: Number(s.commission_rate ?? 35),
    });
  }

  return staffRevenue.map((sr) => {
    const staff = staffMap.get(sr.staff_id);
    const commissionPercent = staff?.commission ?? 35;
    const commissionAmount = Math.round(sr.revenue * (commissionPercent / 100));
    return {
      id: sr.staff_id,
      staff_id: sr.staff_id,
      staff_name: staff?.name ?? sr.staff_name,
      period_start: from,
      period_end: to,
      revenue: sr.revenue,
      commission_percent: commissionPercent,
      commission_amount: commissionAmount,
      bonus: 0,
      deductions: 0,
      total: commissionAmount,
      status: 'draft',
    };
  });
}

// ─── Service Profitability ───────────────────────────────────────────────────

export async function getServiceProfitability(): Promise<ServiceProfitability[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  // Get services with materials
  const { data: services } = await supabase
    .from('services')
    .select('id, name, price')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('name');

  if (!services || services.length === 0) return [];

  // Get materials
  const { data: materials } = await supabase
    .from('service_materials')
    .select('service_id, quantity, inventory_items!product_id(purchase_price, quantity)')
    .eq('salon_id', salonId);

  // Get overhead
  const { data: salonData } = await supabase
    .from('salons')
    .select('overhead')
    .eq('id', salonId)
    .maybeSingle();

  const overhead = salonData?.overhead as Record<string, unknown> | null;
  const monthlyExpenses = Number(overhead?.monthly_expenses ?? 0);
  const workingDays = Number(overhead?.working_days ?? 25);
  const hoursPerDay = Number(overhead?.hours_per_day ?? 8);
  const mastersPerShift = Number(overhead?.masters_per_shift ?? 3);
  const totalHoursPerMonth = workingDays * hoursPerDay * mastersPerShift;
  const overheadPerHour = totalHoursPerMonth > 0 ? monthlyExpenses / totalHoursPerMonth : 0;

  // Calc materials cost per service
  const matCostMap = new Map<string, number>();
  for (const m of materials ?? []) {
    const prod = m.inventory_items as unknown as {
      purchase_price: number;
      quantity: number;
    } | null;
    if (!prod) continue;
    const unitCost = prod.quantity > 0 ? prod.purchase_price / prod.quantity : 0;
    const cost = unitCost * Number(m.quantity);
    const existing = matCostMap.get(m.service_id) ?? 0;
    matCostMap.set(m.service_id, existing + cost);
  }

  // Get avg duration for overhead calc
  const { data: svcDurations } = await supabase
    .from('services')
    .select('id, duration')
    .eq('salon_id', salonId)
    .eq('is_active', true);

  const durationMap = new Map<string, number>();
  for (const s of svcDurations ?? []) {
    durationMap.set(s.id, Number(s.duration ?? 60));
  }

  return services
    .map((s) => {
      const price = Number(s.price);
      const materialsCost = Math.round((matCostMap.get(s.id) ?? 0) * 100) / 100;
      const duration = durationMap.get(s.id) ?? 60;
      const overheadPerService = Math.round(overheadPerHour * (duration / 60) * 100) / 100;
      const margin = Math.round((price - materialsCost - overheadPerService) * 100) / 100;
      const marginPercent = price > 0 ? Math.round((margin / price) * 100) : 0;

      return {
        service_id: s.id,
        service_name: s.name,
        price,
        materials_cost: materialsCost,
        overhead_per_service: overheadPerService,
        margin,
        margin_percent: marginPercent,
      };
    })
    .sort((a, b) => b.margin_percent - a.margin_percent);
}
