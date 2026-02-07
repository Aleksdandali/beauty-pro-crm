import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CalendarAppointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  final_price: number | null;
  notes: string | null;
  formula_snapshot: Record<string, unknown> | null;
  client: {
    id: string;
    first_name: string;
    last_name: string | null;
    phone: string;
    formulas: Record<string, unknown>;
  } | null;
  service: { id: string; name: string; color: string; duration: number } | null;
  staff: { id: string; first_name: string; last_name: string } | null;
}

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface ServiceOption {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  color: string;
}

export interface ClientOption {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
}

// ─── Get Appointments for Date Range ─────────────────────────────────────────

export async function getAppointments(
  dateFrom: string,
  dateTo: string
): Promise<CalendarAppointment[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const { data } = await supabase
    .from('appointments')
    .select(
      'id, start_time, end_time, status, price, final_price, notes, formula_snapshot, clients!client_id(id, first_name, last_name, phone, formulas), services!service_id(id, name, color, duration), staff!staff_id(id, first_name, last_name)'
    )
    .eq('salon_id', salonId)
    .gte('start_time', dateFrom)
    .lt('start_time', dateTo)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true });

  return (data ?? []).map(mapAppointment);
}

// ─── Get Today's Appointments ────────────────────────────────────────────────

export async function getTodayAppointments(staffId?: string): Promise<CalendarAppointment[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  let query = supabase
    .from('appointments')
    .select(
      'id, start_time, end_time, status, price, final_price, notes, formula_snapshot, clients!client_id(id, first_name, last_name, phone, formulas), services!service_id(id, name, color, duration), staff!staff_id(id, first_name, last_name)'
    )
    .eq('salon_id', salonId)
    .gte('start_time', start)
    .lt('start_time', end)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true });

  if (staffId) {
    query = query.eq('staff_id', staffId);
  }

  const { data } = await query;
  return (data ?? []).map(mapAppointment);
}

// ─── Get Staff ───────────────────────────────────────────────────────────────

export async function getStaff(): Promise<StaffMember[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data } = await supabase
    .from('staff')
    .select('id, first_name, last_name, role, is_active')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('first_name');

  return (data ?? []) as StaffMember[];
}

// ─── Get Services (for picker) ───────────────────────────────────────────────

export async function getServiceOptions(): Promise<ServiceOption[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data } = await supabase
    .from('services')
    .select('id, name, category, price, duration, color')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('name');

  return (data ?? []) as ServiceOption[];
}

// ─── Get Clients (for picker) ────────────────────────────────────────────────

export async function getClientOptions(): Promise<ClientOption[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data } = await supabase
    .from('clients')
    .select('id, first_name, last_name, phone')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('first_name')
    .limit(200);

  return (data ?? []) as ClientOption[];
}

// ─── Map Helper ──────────────────────────────────────────────────────────────

function mapAppointment(row: Record<string, unknown>): CalendarAppointment {
  return {
    id: row.id as string,
    start_time: row.start_time as string,
    end_time: row.end_time as string,
    status: (row.status as string) ?? 'scheduled',
    price: row.price as number,
    final_price: row.final_price as number | null,
    notes: row.notes as string | null,
    formula_snapshot: row.formula_snapshot as Record<string, unknown> | null,
    client: row.clients as CalendarAppointment['client'],
    service: row.services as CalendarAppointment['service'],
    staff: row.staff as CalendarAppointment['staff'],
  };
}
