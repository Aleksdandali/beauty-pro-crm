import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DashboardData {
  revenue: {
    current: number;
    previous: number;
    trend: number;
  };
  clients: {
    total: number;
    newThisMonth: number;
  };
  todayAppointments: TodayAppointment[];
  occupancy: number;
  rfmSegments: Record<string, number>;
  sterilization: {
    todayCycles: number;
    completedToday: number;
    lastCycle: {
      cycle_number: string;
      started_at: string;
      result: string | null;
    } | null;
    expiredPackages: number;
  };
  recentActivity: RecentActivity[];
  lowStockCount: number;
}

export interface TodayAppointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  final_price: number | null;
  client: { first_name: string; last_name: string | null } | null;
  service: { name: string } | null;
  staff: { first_name: string; last_name: string } | null;
}

export interface RecentActivity {
  id: string;
  type: 'appointment';
  start_time: string;
  status: string;
  price: number;
  client_name: string;
  service_name: string;
  staff_name: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfDay(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

function endOfDay(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).toISOString();
}

function startOfMonth(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function startOfPrevMonth(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString();
}

function endOfPrevMonth(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999).toISOString();
}

// ─── Main Query ──────────────────────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfPrevMonth(now);
  const prevMonthEnd = endOfPrevMonth(now);

  const [
    todayApptRes,
    monthRevenueRes,
    prevRevenueRes,
    clientsRes,
    newClientsRes,
    rfmRes,
    recentRes,
    lowStockRes,
    todaySterilRes,
    lastCycleRes,
    expiredRes,
  ] = await Promise.all([
    // Today's appointments with relations (use FK column names for joins)
    supabase
      .from('appointments')
      .select(
        'id, start_time, end_time, status, price, final_price, clients!client_id(first_name, last_name), services!service_id(name), staff!staff_id(first_name, last_name)'
      )
      .eq('salon_id', salonId)
      .gte('start_time', todayStart)
      .lte('start_time', todayEnd)
      .order('start_time', { ascending: true }),

    // Current month revenue (completed appointments)
    supabase
      .from('appointments')
      .select('final_price, price')
      .eq('salon_id', salonId)
      .eq('status', 'completed')
      .gte('start_time', monthStart),

    // Previous month revenue
    supabase
      .from('appointments')
      .select('final_price, price')
      .eq('salon_id', salonId)
      .eq('status', 'completed')
      .gte('start_time', prevMonthStart)
      .lte('start_time', prevMonthEnd),

    // Total active clients
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_active', true),

    // New clients this month
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .gte('created_at', monthStart),

    // RFM segments
    supabase.from('clients').select('rfm_segment').eq('salon_id', salonId).eq('is_active', true),

    // Recent completed/cancelled appointments (use FK column names for joins)
    supabase
      .from('appointments')
      .select(
        'id, start_time, status, price, clients!client_id(first_name, last_name), services!service_id(name), staff!staff_id(first_name, last_name)'
      )
      .eq('salon_id', salonId)
      .in('status', ['completed', 'cancelled', 'no_show'])
      .order('start_time', { ascending: false })
      .limit(5),

    // Low stock products
    supabase
      .from('inventory_items')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .filter('quantity', 'lte', 'min_quantity' as never),

    // Today's sterilization cycles
    supabase
      .from('sterilization_cycles')
      .select('id, status')
      .eq('salon_id', salonId)
      .gte('started_at', todayStart)
      .lte('started_at', todayEnd),

    // Last sterilization cycle
    supabase
      .from('sterilization_cycles')
      .select('cycle_number, started_at, result')
      .eq('salon_id', salonId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Expired sterile packages
    supabase
      .from('sterilization_storage')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('status', 'sterile')
      .lt('expires_at', now.toISOString()),
  ]);

  // ── Compute revenue ────────────────────────────────────────────────
  const currentRevenue = (monthRevenueRes.data ?? []).reduce(
    (sum, a) => sum + (a.final_price ?? a.price ?? 0),
    0
  );
  const previousRevenue = (prevRevenueRes.data ?? []).reduce(
    (sum, a) => sum + (a.final_price ?? a.price ?? 0),
    0
  );
  const revenueTrend =
    previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

  // ── RFM counts ─────────────────────────────────────────────────────
  const rfmSegments: Record<string, number> = {
    vip: 0,
    loyal: 0,
    regular: 0,
    new: 0,
    sleeping: 0,
    lost: 0,
  };
  for (const c of rfmRes.data ?? []) {
    const seg = c.rfm_segment ?? 'new';
    rfmSegments[seg] = (rfmSegments[seg] ?? 0) + 1;
  }

  // ── Occupancy (% of working hours filled) ──────────────────────────
  const totalWorkingMinutes = 10 * 60; // 09:00 - 19:00 = 600 min
  const bookedMinutes = (todayApptRes.data ?? [])
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => {
      const start = new Date(a.start_time).getTime();
      const end = new Date(a.end_time).getTime();
      return sum + (end - start) / 60000;
    }, 0);
  const occupancy = Math.min(Math.round((bookedMinutes / totalWorkingMinutes) * 100), 100);

  // ── Today appointments typed ───────────────────────────────────────
  const todayAppointments: TodayAppointment[] = (todayApptRes.data ?? []).map((a) => {
    // With !fk_column hint Supabase returns a single object (or null) per relation
    const raw = a as Record<string, unknown>;
    const client = raw.clients as { first_name: string; last_name: string | null } | null;
    const service = raw.services as { name: string } | null;
    const staffObj = raw.staff as { first_name: string; last_name: string } | null;

    return {
      id: a.id,
      start_time: a.start_time,
      end_time: a.end_time,
      status: a.status ?? 'scheduled',
      price: a.price,
      final_price: a.final_price,
      client,
      service,
      staff: staffObj,
    };
  });

  // ── Sterilization ──────────────────────────────────────────────────
  const todayCycles = todaySterilRes.data ?? [];
  const completedToday = todayCycles.filter((c) => c.status === 'completed').length;

  // ── Recent activity ────────────────────────────────────────────────
  const recentActivity: RecentActivity[] = (recentRes.data ?? []).map((a) => {
    // With !fk_column hint Supabase returns a single object (or null) per relation
    const raw = a as Record<string, unknown>;
    const client = raw.clients as { first_name: string; last_name: string | null } | null;
    const service = raw.services as { name: string } | null;
    const staffObj = raw.staff as { first_name: string; last_name: string } | null;
    return {
      id: a.id,
      type: 'appointment' as const,
      start_time: a.start_time,
      status: a.status ?? 'completed',
      price: a.price,
      client_name: client ? `${client.first_name} ${client.last_name ?? ''}`.trim() : 'Невідомий',
      service_name: service?.name ?? 'Послуга',
      staff_name: staffObj ? `${staffObj.first_name} ${staffObj.last_name}`.trim() : '',
    };
  });

  return {
    revenue: {
      current: currentRevenue,
      previous: previousRevenue,
      trend: revenueTrend,
    },
    clients: {
      total: clientsRes.count ?? 0,
      newThisMonth: newClientsRes.count ?? 0,
    },
    todayAppointments,
    occupancy,
    rfmSegments,
    sterilization: {
      todayCycles: todayCycles.length,
      completedToday,
      lastCycle: lastCycleRes.data
        ? {
            cycle_number: lastCycleRes.data.cycle_number,
            started_at: lastCycleRes.data.started_at,
            result: lastCycleRes.data.result,
          }
        : null,
      expiredPackages: expiredRes.count ?? 0,
    },
    recentActivity,
    lowStockCount: lowStockRes.count ?? 0,
  };
}
