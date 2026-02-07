import { createClient } from '@/lib/supabase/server';
import type { WorkingHours } from '@/types/database';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PublicSalon {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  accent_color: string;
  working_hours: WorkingHours | null;
  booking_enabled: boolean;
  booking_advance_days: number;
  booking_slot_duration: number;
  booking_confirmation_required: boolean;
}

export interface PublicService {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  duration: number;
  color: string;
}

export interface PublicStaff {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  specialization: string | null;
}

// ─── Get salon by slug ──────────────────────────────────────────────────────

export async function getSalonBySlug(slug: string): Promise<PublicSalon | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('salons')
    .select(
      'id, name, slug, city, address, phone, logo_url, accent_color, working_hours, booking_enabled, booking_advance_days, booking_slot_duration, booking_confirmation_required'
    )
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as PublicSalon;
}

// ─── Get public services ────────────────────────────────────────────────────

export async function getPublicServices(salonId: string): Promise<PublicService[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('services')
    .select('id, name, category, description, price, duration, color')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('category')
    .order('name');

  // Deduplicate by id (safety net against JOINs / duplicated rows)
  const seen = new Set<string>();
  return ((data ?? []) as PublicService[]).filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

// ─── Get public staff (optionally filtered by service) ──────────────────────

export async function getPublicStaff(
  salonId: string,
  serviceIds?: string[]
): Promise<PublicStaff[]> {
  const supabase = await createClient();

  if (serviceIds && serviceIds.length > 0) {
    // Find staff that provide these services via staff_services
    const { data: links } = await supabase
      .from('staff_services')
      .select('staff_id')
      .eq('salon_id', salonId)
      .in('service_id', serviceIds);

    const staffIds = [...new Set((links ?? []).map((l) => l.staff_id))];

    if (staffIds.length > 0) {
      const { data } = await supabase
        .from('staff')
        .select('id, first_name, last_name, avatar_url, specialization')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .in('id', staffIds)
        .order('sort_order');

      if (data && data.length > 0) {
        return data as PublicStaff[];
      }
    }
  }

  // Fallback: return all active staff
  const { data } = await supabase
    .from('staff')
    .select('id, first_name, last_name, avatar_url, specialization')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('sort_order');

  return (data ?? []) as PublicStaff[];
}

// ─── Get available slots ────────────────────────────────────────────────────

export async function getAvailableSlots(
  salonId: string,
  staffId: string | null,
  date: string, // YYYY-MM-DD
  totalDuration: number, // minutes
  workingHours: WorkingHours | null,
  slotStep: number // e.g. 30
): Promise<string[]> {
  const supabase = await createClient();

  const dayOfWeek = new Date(date + 'T12:00:00').getDay(); // 0=Sun
  const dayKeys: (keyof WorkingHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayKey = dayKeys[dayOfWeek];

  // Check salon working hours for this day
  if (!dayKey) return [];
  const dayHours = workingHours?.[dayKey];
  if (!dayHours) return []; // Day off

  const dayStart = timeToMinutes(dayHours.start);
  const dayEnd = timeToMinutes(dayHours.end);

  // Check staff schedule override
  if (staffId) {
    const { data: staffSch } = await supabase
      .from('staff_schedules')
      .select('start_time, end_time, is_day_off')
      .eq('salon_id', salonId)
      .eq('staff_id', staffId)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle();

    if (staffSch) {
      if (staffSch.is_day_off) return [];
      // Could narrow the window with staff hours
    }

    // Check time off
    const { data: timeOff } = await supabase
      .from('staff_time_off')
      .select('id')
      .eq('staff_id', staffId)
      .lte('start_date', date)
      .gte('end_date', date)
      .limit(1);

    if (timeOff && timeOff.length > 0) return [];
  }

  // Get existing appointments for this date + staff
  const dateStart = `${date}T00:00:00`;
  const dateEnd = `${date}T23:59:59`;

  let query = supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('salon_id', salonId)
    .gte('start_time', dateStart)
    .lte('start_time', dateEnd)
    .in('status', ['scheduled', 'confirmed', 'in_progress']);

  if (staffId) {
    query = query.eq('staff_id', staffId);
  }

  const { data: existing } = await query;

  // Build busy intervals
  const busy: { start: number; end: number }[] = (existing ?? []).map((a) => ({
    start: timeToMinutes(new Date(a.start_time).toTimeString().slice(0, 5)),
    end: timeToMinutes(new Date(a.end_time).toTimeString().slice(0, 5)),
  }));

  // Generate slots
  const slots: string[] = [];
  const step = slotStep || 30;

  for (let t = dayStart; t + totalDuration <= dayEnd; t += step) {
    const slotEnd = t + totalDuration;

    // Check overlap with busy intervals
    const overlaps = busy.some((b) => t < b.end && slotEnd > b.start);
    if (!overlaps) {
      slots.push(minutesToTime(t));
    }
  }

  return slots;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
