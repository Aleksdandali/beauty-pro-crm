import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClientRow {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  birthday: string | null;
  notes: string | null;
  source: string;
  formulas: Record<string, unknown>;
  rfm_segment: string;
  total_visits: number;
  total_spent: number;
  last_visit_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientStats {
  total: number;
  newThisMonth: number;
  vipCount: number;
  averageCheck: number;
}

export interface ClientAppointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  final_price: number | null;
  notes: string | null;
  payment_method: string | null;
  formula_snapshot: Record<string, unknown> | null;
  service: { name: string; color: string | null } | null;
  staff: { first_name: string; last_name: string } | null;
}

// ─── Get All Clients ─────────────────────────────────────────────────────────

export async function getClients(): Promise<{ clients: ClientRow[]; stats: ClientStats }> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [clientsRes, newCountRes] = await Promise.all([
    supabase
      .from('clients')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('last_visit_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .gte('created_at', monthStart),
  ]);

  const clients = (clientsRes.data ?? []) as ClientRow[];
  const vipCount = clients.filter((c) => c.rfm_segment === 'vip').length;
  const totalSpent = clients.reduce((s, c) => s + c.total_spent, 0);
  const totalVisits = clients.reduce((s, c) => s + c.total_visits, 0);

  return {
    clients,
    stats: {
      total: clients.length,
      newThisMonth: newCountRes.count ?? 0,
      vipCount,
      averageCheck: totalVisits > 0 ? Math.round(totalSpent / totalVisits) : 0,
    },
  };
}

// ─── Get Single Client ───────────────────────────────────────────────────────

export async function getClient(id: string): Promise<ClientRow | null> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('salon_id', salonId)
    .maybeSingle();
  return data as ClientRow | null;
}

// ─── Get Client Appointments ─────────────────────────────────────────────────

export async function getClientAppointments(
  clientId: string,
  limit = 20
): Promise<ClientAppointment[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data } = await supabase
    .from('appointments')
    .select(
      'id, start_time, end_time, status, price, final_price, notes, payment_method, formula_snapshot, services!service_id(name, color), staff!staff_id(first_name, last_name)'
    )
    .eq('salon_id', salonId)
    .eq('client_id', clientId)
    .order('start_time', { ascending: false })
    .limit(limit);

  return (data ?? []).map((a) => {
    const raw = a as Record<string, unknown>;
    return {
      id: a.id,
      start_time: a.start_time,
      end_time: a.end_time,
      status: a.status ?? 'scheduled',
      price: a.price,
      final_price: a.final_price,
      notes: a.notes,
      payment_method: a.payment_method,
      formula_snapshot: a.formula_snapshot as Record<string, unknown> | null,
      service: raw.services as ClientAppointment['service'],
      staff: raw.staff as ClientAppointment['staff'],
    };
  });
}

// ─── Get Client Photos ───────────────────────────────────────────────────────

export interface ClientPhoto {
  id: string;
  photo_url: string;
  thumbnail_url: string | null;
  description: string | null;
  created_at: string;
  service: { name: string } | null;
  staff: { first_name: string } | null;
}

export async function getClientPhotos(clientId: string): Promise<ClientPhoto[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data } = await supabase
    .from('work_photos')
    .select(
      'id, photo_url, thumbnail_url, description, created_at, services!service_id(name), staff!staff_id(first_name)'
    )
    .eq('salon_id', salonId)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  return (data ?? []).map((p) => {
    const raw = p as Record<string, unknown>;
    return {
      id: p.id,
      photo_url: p.photo_url,
      thumbnail_url: p.thumbnail_url,
      description: p.description,
      created_at: p.created_at,
      service: raw.services as ClientPhoto['service'],
      staff: raw.staff as ClientPhoto['staff'],
    };
  });
}
