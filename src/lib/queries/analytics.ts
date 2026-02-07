import { createClient } from '@/lib/supabase/server';
import {
  calculateRFM,
  getSegmentSummaries,
  type RFMResult,
  type SegmentSummary,
} from '@/lib/rfm-engine';
import { getCurrentSalonId } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  retentionRate: number;
  averageCheck: number;
  clientLTV: number;
  conversionRate: number;
  newClientsMonth: number;
  loadRate: number;
}

export interface NewVsReturning {
  month: string;
  newClients: number;
  returning: number;
}

export interface PopularService {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface HourlyLoad {
  day: number; // 0=Mon, 6=Sun
  hour: number; // 9-21
  count: number;
}

export interface MonthlyGrowth {
  month: string;
  clients: number;
  revenue: number;
  appointments: number;
}

export interface TopClient {
  id: string;
  name: string;
  totalSpent: number;
  totalVisits: number;
  lastVisit: string | null;
  segment: string;
}

export interface ServiceDuration {
  name: string;
  duration: number;
  revenue: number;
  count: number;
}

export interface Insight {
  id: string;
  text: string;
  icon: 'trending-up' | 'trending-down' | 'alert' | 'lightbulb' | 'users' | 'calendar';
  priority: 'high' | 'medium' | 'low';
}

export interface RetentionCohort {
  cohortMonth: string;
  total: number;
  month1: number;
  month2: number;
  month3: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function monthLabel(d: Date): string {
  return d.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' });
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── RFM Data ────────────────────────────────────────────────────────────────

export async function getRFMData(): Promise<{
  results: RFMResult[];
  segments: SegmentSummary[];
}> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, phone, last_visit, total_visits, total_spent')
    .eq('salon_id', salonId);

  if (!clients || clients.length === 0) {
    return { results: [], segments: getSegmentSummaries([]) };
  }

  const results = calculateRFM(
    clients.map((c) => ({
      id: c.id,
      full_name: c.full_name ?? 'Без імені',
      phone: c.phone ?? null,
      last_visit: c.last_visit ?? null,
      total_visits: Number(c.total_visits) || 0,
      total_spent: Number(c.total_spent) || 0,
    }))
  );

  const segments = getSegmentSummaries(results);
  return { results, segments };
}

// ─── Analytics Summary ──────────────────────────────────────────────────────

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();

  // Completed appointments this month for average check
  const { data: monthAppts } = await supabase
    .from('appointments')
    .select('price, client_id')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('start_time', monthStart);

  const totalRevenue = (monthAppts ?? []).reduce((s, a) => s + (Number(a.price) || 0), 0);
  const completedCount = monthAppts?.length ?? 0;
  const averageCheck = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;

  // Unique clients this month
  const uniqueClientsMonth = new Set((monthAppts ?? []).map((a) => a.client_id)).size;

  // All appointments (for conversion: confirmed+completed vs total)
  const { data: allMonthAppts } = await supabase
    .from('appointments')
    .select('status')
    .eq('salon_id', salonId)
    .gte('start_time', monthStart);

  const totalBooked = allMonthAppts?.length ?? 0;
  const completed = (allMonthAppts ?? []).filter(
    (a) => a.status === 'completed' || a.status === 'confirmed'
  ).length;
  const conversionRate = totalBooked > 0 ? Math.round((completed / totalBooked) * 100) : 0;

  // Retention: clients from 3+ months ago who returned this month
  const { data: oldClients } = await supabase
    .from('clients')
    .select('id')
    .eq('salon_id', salonId)
    .lt('created_at', threeMonthsAgo);

  const oldClientIds = new Set((oldClients ?? []).map((c) => c.id));
  const returningClients = (monthAppts ?? []).filter((a) => oldClientIds.has(a.client_id));
  const returningUnique = new Set(returningClients.map((a) => a.client_id)).size;
  const retentionRate =
    oldClientIds.size > 0 ? Math.round((returningUnique / oldClientIds.size) * 100) : 0;

  // New clients this month
  const { count: newClientsMonth } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .gte('created_at', monthStart);

  // Client LTV: average total_spent across all clients with visits
  const { data: allClients } = await supabase
    .from('clients')
    .select('total_spent')
    .eq('salon_id', salonId)
    .gt('total_visits', 0);

  const totalSpentAll = (allClients ?? []).reduce((s, c) => s + (Number(c.total_spent) || 0), 0);
  const clientsWithVisits = allClients?.length ?? 1;
  const clientLTV = Math.round(totalSpentAll / clientsWithVisits);

  // Load rate: booked slots / available slots (simplified: assume 8hrs/day, 30min slots = 16 slots per master)
  const { data: staffData } = await supabase
    .from('staff')
    .select('id')
    .eq('salon_id', salonId)
    .eq('is_active', true);

  const mastersCount = staffData?.length ?? 1;
  const workingDays = now.getDate(); // days elapsed this month
  const totalSlots = mastersCount * workingDays * 16; // 16 slots per day per master
  const loadRate = totalSlots > 0 ? Math.round((completedCount / totalSlots) * 100) : 0;

  return {
    retentionRate: Math.min(retentionRate, 100),
    averageCheck,
    clientLTV,
    conversionRate: Math.min(conversionRate, 100),
    newClientsMonth: newClientsMonth ?? 0,
    loadRate: Math.min(loadRate, 100),
  };
}

// ─── New vs Returning ───────────────────────────────────────────────────────

export async function getNewVsReturning(): Promise<NewVsReturning[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('client_id, start_time')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('start_time', sixMonthsAgo.toISOString())
    .order('start_time');

  const { data: clients } = await supabase
    .from('clients')
    .select('id, created_at')
    .eq('salon_id', salonId);

  const clientCreated = new Map<string, string>();
  for (const c of clients ?? []) {
    clientCreated.set(c.id, monthKey(new Date(c.created_at)));
  }

  // Group by month
  const months: Map<string, { new: Set<string>; returning: Set<string> }> = new Map();

  for (let m = 0; m < 6; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + m, 1);
    const key = monthKey(d);
    months.set(key, { new: new Set(), returning: new Set() });
  }

  for (const appt of appointments ?? []) {
    const mk = monthKey(new Date(appt.start_time));
    const bucket = months.get(mk);
    if (!bucket) continue;

    const createdMonth = clientCreated.get(appt.client_id);
    if (createdMonth === mk) {
      bucket.new.add(appt.client_id);
    } else {
      bucket.returning.add(appt.client_id);
    }
  }

  const result: NewVsReturning[] = [];
  for (let m = 0; m < 6; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + m, 1);
    const key = monthKey(d);
    const bucket = months.get(key);
    result.push({
      month: monthLabel(d),
      newClients: bucket?.new.size ?? 0,
      returning: bucket?.returning.size ?? 0,
    });
  }

  return result;
}

// ─── Popular Services ───────────────────────────────────────────────────────

export async function getPopularServices(): Promise<PopularService[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data } = await supabase
    .from('appointments')
    .select('service_id, price, services!service_id(name)')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('start_time', threeMonthsAgo.toISOString());

  if (!data || data.length === 0) return [];

  const map = new Map<string, { name: string; count: number; revenue: number }>();
  for (const row of data) {
    const svc = row.services as unknown as { name: string } | null;
    const name = svc?.name ?? 'Невідома';
    const existing = map.get(name) ?? { name, count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += Number(row.price) || 0;
    map.set(name, existing);
  }

  const total = data.length;
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((s) => ({
      ...s,
      revenue: Math.round(s.revenue),
      percentage: Math.round((s.count / total) * 100),
    }));
}

// ─── Hourly Load (heatmap) ──────────────────────────────────────────────────

export async function getPopularHours(): Promise<HourlyLoad[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data } = await supabase
    .from('appointments')
    .select('start_time')
    .eq('salon_id', salonId)
    .in('status', ['completed', 'confirmed'])
    .gte('start_time', threeMonthsAgo.toISOString());

  // Build heatmap: day (0=Mon..6=Sun) x hour (9..20)
  const grid = new Map<string, number>();
  for (const row of data ?? []) {
    const d = new Date(row.start_time);
    const day = (d.getDay() + 6) % 7; // Mon=0
    const hour = d.getHours();
    if (hour < 9 || hour > 20) continue;
    const key = `${day}-${hour}`;
    grid.set(key, (grid.get(key) ?? 0) + 1);
  }

  const result: HourlyLoad[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 9; hour <= 20; hour++) {
      result.push({ day, hour, count: grid.get(`${day}-${hour}`) ?? 0 });
    }
  }
  return result;
}

// ─── Monthly Growth ─────────────────────────────────────────────────────────

export async function getMonthlyGrowth(): Promise<MonthlyGrowth[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, price, client_id')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('start_time', sixMonthsAgo.toISOString());

  const { data: clients } = await supabase
    .from('clients')
    .select('created_at')
    .eq('salon_id', salonId)
    .gte('created_at', sixMonthsAgo.toISOString());

  const months: Map<string, { clients: number; revenue: number; appointments: number }> = new Map();

  for (let m = 0; m < 6; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + m, 1);
    months.set(monthKey(d), { clients: 0, revenue: 0, appointments: 0 });
  }

  for (const a of appointments ?? []) {
    const mk = monthKey(new Date(a.start_time));
    const bucket = months.get(mk);
    if (bucket) {
      bucket.appointments += 1;
      bucket.revenue += Number(a.price) || 0;
    }
  }

  for (const c of clients ?? []) {
    const mk = monthKey(new Date(c.created_at));
    const bucket = months.get(mk);
    if (bucket) bucket.clients += 1;
  }

  const result: MonthlyGrowth[] = [];
  for (let m = 0; m < 6; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + m, 1);
    const mk = monthKey(d);
    const bucket = months.get(mk) ?? { clients: 0, revenue: 0, appointments: 0 };
    result.push({
      month: monthLabel(d),
      clients: bucket.clients,
      revenue: Math.round(bucket.revenue),
      appointments: bucket.appointments,
    });
  }

  return result;
}

// ─── Top Clients ────────────────────────────────────────────────────────────

export async function getTopClients(rfmResults: RFMResult[]): Promise<TopClient[]> {
  return [...rfmResults]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
    .map((r) => ({
      id: r.clientId,
      name: r.clientName,
      totalSpent: Math.round(r.totalSpent),
      totalVisits: r.totalVisits,
      lastVisit: r.lastVisit,
      segment: r.segment,
    }));
}

// ─── Service Duration vs Revenue ────────────────────────────────────────────

export async function getServiceDurations(): Promise<ServiceDuration[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const { data } = await supabase
    .from('services')
    .select('name, duration, price')
    .eq('salon_id', salonId)
    .eq('is_active', true);

  if (!data) return [];

  // Count completions per service
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data: appts } = await supabase
    .from('appointments')
    .select('service_id, price, services!service_id(name)')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('start_time', threeMonthsAgo.toISOString());

  const countMap = new Map<string, { count: number; revenue: number }>();
  for (const a of appts ?? []) {
    const svc = a.services as unknown as { name: string } | null;
    const name = svc?.name ?? '';
    const existing = countMap.get(name) ?? { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += Number(a.price) || 0;
    countMap.set(name, existing);
  }

  return data
    .filter((s) => countMap.has(s.name))
    .map((s) => ({
      name: s.name,
      duration: s.duration ?? 60,
      revenue: Math.round(countMap.get(s.name)?.revenue ?? 0),
      count: countMap.get(s.name)?.count ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ─── Retention Cohorts ──────────────────────────────────────────────────────

export async function getRetentionCohorts(): Promise<RetentionCohort[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const now = new Date();
  const result: RetentionCohort[] = [];

  // Last 4 cohort months (clients who first visited in that month)
  for (let m = 4; m >= 1; m--) {
    const cohortStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const cohortEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0, 23, 59, 59);

    // Clients created in this cohort month
    const { data: cohortClients } = await supabase
      .from('clients')
      .select('id')
      .eq('salon_id', salonId)
      .gte('created_at', cohortStart.toISOString())
      .lte('created_at', cohortEnd.toISOString());

    const ids = (cohortClients ?? []).map((c) => c.id);
    if (ids.length === 0) {
      result.push({
        cohortMonth: monthLabel(cohortStart),
        total: 0,
        month1: 0,
        month2: 0,
        month3: 0,
      });
      continue;
    }

    // Check if they returned in month+1, month+2, month+3
    const returnRates: number[] = [];
    for (let offset = 1; offset <= 3; offset++) {
      const checkStart = new Date(now.getFullYear(), now.getMonth() - m + offset, 1);
      const checkEnd = new Date(now.getFullYear(), now.getMonth() - m + offset + 1, 0, 23, 59, 59);

      if (checkStart > now) {
        returnRates.push(0);
        continue;
      }

      const { data: returned } = await supabase
        .from('appointments')
        .select('client_id')
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .in('client_id', ids)
        .gte('start_time', checkStart.toISOString())
        .lte('start_time', checkEnd.toISOString());

      const uniqueReturned = new Set((returned ?? []).map((a) => a.client_id)).size;
      returnRates.push(Math.round((uniqueReturned / ids.length) * 100));
    }

    result.push({
      cohortMonth: monthLabel(cohortStart),
      total: ids.length,
      month1: returnRates[0] ?? 0,
      month2: returnRates[1] ?? 0,
      month3: returnRates[2] ?? 0,
    });
  }

  return result;
}

// ─── Auto-generated Insights ────────────────────────────────────────────────

export async function generateInsights(
  summary: AnalyticsSummary,
  rfmResults: RFMResult[],
  popularServices: PopularService[],
  hourlyLoad: HourlyLoad[],
  monthlyGrowth: MonthlyGrowth[]
): Promise<Insight[]> {
  const insights: Insight[] = [];
  let id = 0;

  // 1. Retention insight
  if (summary.retentionRate < 50) {
    insights.push({
      id: String(++id),
      text: `Retention rate ${summary.retentionRate}% — нижче цілі 60%. Зверніть увагу на сплячих клієнтів.`,
      icon: 'alert',
      priority: 'high',
    });
  } else if (summary.retentionRate >= 70) {
    insights.push({
      id: String(++id),
      text: `Відмінний retention ${summary.retentionRate}%! Клієнти повертаються регулярно.`,
      icon: 'trending-up',
      priority: 'low',
    });
  }

  // 2. Lost clients
  const lostClients = rfmResults.filter((r) => r.segment === 'lost');
  if (lostClients.length > 0) {
    const days60 = lostClients.filter((c) => c.daysSinceLastVisit >= 60).length;
    if (days60 > 0) {
      insights.push({
        id: String(++id),
        text: `${days60} клієнтів не були 60+ днів — час нагадати про себе.`,
        icon: 'users',
        priority: 'high',
      });
    }
  }

  // 3. Sleeping clients
  const sleepingClients = rfmResults.filter((r) => r.segment === 'sleeping');
  if (sleepingClients.length > 3) {
    insights.push({
      id: String(++id),
      text: `${sleepingClients.length} сплячих клієнтів — відправте нагадування або знижку.`,
      icon: 'users',
      priority: 'medium',
    });
  }

  // 4. VIP clients
  const vipClients = rfmResults.filter((r) => r.segment === 'vip');
  if (vipClients.length > 0) {
    const vipRevenue = vipClients.reduce((s, c) => s + c.totalSpent, 0);
    const totalRevenue = rfmResults.reduce((s, c) => s + c.totalSpent, 0) || 1;
    const vipPct = Math.round((vipRevenue / totalRevenue) * 100);
    insights.push({
      id: String(++id),
      text: `${vipClients.length} VIP клієнтів генерують ${vipPct}% доходу. Дбайте про них!`,
      icon: 'trending-up',
      priority: 'medium',
    });
  }

  // 5. Average check trend
  if (monthlyGrowth.length >= 2) {
    const last = monthlyGrowth[monthlyGrowth.length - 1];
    const prev = monthlyGrowth[monthlyGrowth.length - 2];
    if (last && prev && prev.appointments > 0 && last.appointments > 0) {
      const lastAvg = last.revenue / last.appointments;
      const prevAvg = prev.revenue / prev.appointments;
      if (prevAvg > 0) {
        const growth = Math.round(((lastAvg - prevAvg) / prevAvg) * 100);
        if (growth > 0) {
          insights.push({
            id: String(++id),
            text: `Середній чек виріс на ${growth}% за місяць.`,
            icon: 'trending-up',
            priority: 'low',
          });
        } else if (growth < -10) {
          insights.push({
            id: String(++id),
            text: `Середній чек впав на ${Math.abs(growth)}% — можливо потрібен upsell.`,
            icon: 'trending-down',
            priority: 'medium',
          });
        }
      }
    }
  }

  // 6. Best and worst days
  const dayTotals = new Map<number, number>();
  for (const h of hourlyLoad) {
    dayTotals.set(h.day, (dayTotals.get(h.day) ?? 0) + h.count);
  }
  const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота', 'Неділя'];
  const sortedDays = Array.from(dayTotals.entries()).sort((a, b) => a[1] - b[1]);
  if (sortedDays.length >= 2) {
    const worst = sortedDays[0];
    const best = sortedDays[sortedDays.length - 1];
    if (worst && best && worst[1] < best[1] * 0.5) {
      insights.push({
        id: String(++id),
        text: `${dayNames[worst[0]]} — найменш завантажений день (${worst[1]} записів). Запропонуйте знижку.`,
        icon: 'calendar',
        priority: 'medium',
      });
    }
  }

  // 7. Top service profitability
  if (popularServices.length >= 2) {
    const top = popularServices[0];
    const second = popularServices[1];
    if (top && second && top.revenue > second.revenue * 1.5) {
      insights.push({
        id: String(++id),
        text: `"${top.name}" приносить ${Math.round(top.revenue / 1000)}K ₴ — це головний драйвер доходу.`,
        icon: 'lightbulb',
        priority: 'low',
      });
    }
  }

  // 8. New clients growth
  if (monthlyGrowth.length >= 2) {
    const last = monthlyGrowth[monthlyGrowth.length - 1];
    const prev = monthlyGrowth[monthlyGrowth.length - 2];
    if (last && prev && prev.clients > 0) {
      const growth = Math.round(((last.clients - prev.clients) / prev.clients) * 100);
      if (growth > 20) {
        insights.push({
          id: String(++id),
          text: `Приток нових клієнтів зріс на ${growth}% — реклама працює!`,
          icon: 'trending-up',
          priority: 'low',
        });
      } else if (growth < -20 && prev.clients > 3) {
        insights.push({
          id: String(++id),
          text: `Приток нових клієнтів впав на ${Math.abs(growth)}% — перевірте рекламу.`,
          icon: 'trending-down',
          priority: 'high',
        });
      }
    }
  }

  // 9. Conversion rate
  if (summary.conversionRate < 70) {
    insights.push({
      id: String(++id),
      text: `Конверсія запис-візит ${summary.conversionRate}% — багато скасувань або no-show.`,
      icon: 'alert',
      priority: 'medium',
    });
  }

  // 10. Load rate
  if (summary.loadRate < 40) {
    insights.push({
      id: String(++id),
      text: `Завантаженість ${summary.loadRate}% — є вільні слоти. Пропонуйте акції.`,
      icon: 'calendar',
      priority: 'medium',
    });
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

  return insights;
}
