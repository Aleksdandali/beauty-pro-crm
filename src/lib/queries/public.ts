import { createClient } from '@/lib/supabase/server';
import type { WorkingHours } from '@/types/database';
import type { SterilizationPackage } from './sterilization';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PublicSalonFull {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  cover_url: string | null;
  accent_color: string;
  working_hours: WorkingHours | null;
  instagram: string | null;
}

export interface PublicServiceItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  duration: number;
  color: string;
}

export interface PortfolioPhoto {
  id: string;
  url: string;
  description: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface VerifyCycle {
  id: string;
  cycle_number: string;
  salon_name: string;
  operator_name: string;
  equipment_name: string;
  equipment_serial: string | null;
  equipment_type: string;

  disinfection_started_at: string | null;
  disinfection_completed_at: string | null;
  disinfection_solution: string | null;
  disinfection_concentration: string | null;

  pso_started_at: string | null;
  pso_completed_at: string | null;
  pso_method: string | null;
  azopyramine_test: string | null;
  azopyramine_photo_url: string | null;

  drying_started_at: string | null;
  drying_completed_at: string | null;
  drying_method: string | null;

  sterilization_started_at: string | null;
  sterilization_completed_at: string | null;
  sterilization_temperature: number | null;
  sterilization_pressure: number | null;
  sterilization_time_minutes: number | null;
  sterilization_mode: string | null;
  chemical_indicator: string | null;
  chemical_indicator_photo_url: string | null;

  packaging_type: string | null;
  packaging_photo: string | null;
  packages: SterilizationPackage[] | null;

  photos_before: string[] | null;
  photos_after: string[] | null;

  result: string | null;
  completed_at: string | null;
  is_locked: boolean;
  created_at: string;
}

// ─── getPublicSalonBySlug ───────────────────────────────────────────────────

export async function getPublicSalonBySlug(
  slug: string
): Promise<{ salon: PublicSalonFull; services: PublicServiceItem[] } | null> {
  const supabase = await createClient();

  const { data: raw, error } = await supabase
    .from('salons')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) console.error('[PUBLIC] getPublicSalonBySlug error:', error.message);
  if (!raw) return null;

  const salon: PublicSalonFull = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? '',
    description: raw.description ?? null,
    city: raw.city ?? null,
    address: raw.address ?? null,
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    logo_url: raw.logo_url ?? null,
    cover_url: raw.cover_url ?? null,
    accent_color: raw.accent_color ?? 'violet',
    working_hours: (raw.working_hours as WorkingHours) ?? null,
    instagram:
      raw.instagram ?? ((raw.settings as Record<string, unknown>)?.instagram as string) ?? null,
  };

  const { data: rawServices } = await supabase
    .from('services')
    .select('id, name, category, description, price, duration, color')
    .eq('salon_id', salon.id)
    .eq('is_active', true)
    .order('category')
    .order('name');

  // Deduplicate by id (safety net against JOINs / duplicated rows)
  const seen = new Set<string>();
  const services = (rawServices ?? []).filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });

  return {
    salon: salon as unknown as PublicSalonFull,
    services: services as PublicServiceItem[],
  };
}

// ─── getPortfolioPhotos ─────────────────────────────────────────────────────

export async function getPortfolioPhotos(salonId: string): Promise<PortfolioPhoto[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('work_photos')
    .select('id, url, description, tags, created_at')
    .eq('salon_id', salonId)
    .eq('is_portfolio', true)
    .order('created_at', { ascending: false })
    .limit(30);

  return (data ?? []) as PortfolioPhoto[];
}

// ─── getLastSterilizationCycle ──────────────────────────────────────────────

export async function getLastSterilizationCycle(
  salonId: string
): Promise<{ cycle_number: string; completed_at: string; result: string; id: string } | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('sterilization_cycles')
    .select('id, cycle_number, completed_at, result')
    .eq('salon_id', salonId)
    .eq('is_locked', true)
    .eq('result', 'success')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return data as { cycle_number: string; completed_at: string; result: string; id: string };
}

// ─── getVerifyCycle ─────────────────────────────────────────────────────────

export async function getVerifyCycle(cycleId: string): Promise<VerifyCycle | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sterilization_cycles')
    .select(
      `*, 
       sterilization_equipment!equipment_id(name, serial_number, type),
       staff!staff_id(first_name, last_name),
       salons!salon_id(name)`
    )
    .eq('id', cycleId)
    .maybeSingle();

  if (error || !data) {
    // Fallback: try without joins
    const { data: fb } = await supabase
      .from('sterilization_cycles')
      .select('*')
      .eq('id', cycleId)
      .maybeSingle();
    if (!fb) return null;
    return mapVerify(fb as Record<string, unknown>, null, null, null);
  }

  const eq = data.sterilization_equipment as Record<string, unknown> | null;
  const op = data.staff as Record<string, unknown> | null;
  const salon = data.salons as Record<string, unknown> | null;
  return mapVerify(data as Record<string, unknown>, eq, op, salon);
}

function parsePackages(raw: unknown): SterilizationPackage[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as SterilizationPackage[];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as SterilizationPackage[];
    } catch {
      return null;
    }
  }
  return null;
}

function mapVerify(
  row: Record<string, unknown>,
  eq: Record<string, unknown> | null,
  op: Record<string, unknown> | null,
  salon: Record<string, unknown> | null
): VerifyCycle {
  return {
    id: row.id as string,
    cycle_number: (row.cycle_number as string) ?? '',
    salon_name: (salon?.name as string) ?? '',
    operator_name: op ? `${op.first_name as string} ${op.last_name as string}` : '',
    equipment_name: (eq?.name as string) ?? '',
    equipment_serial: (eq?.serial_number as string) ?? null,
    equipment_type: (eq?.type as string) ?? '',

    disinfection_started_at: (row.disinfection_started_at as string) ?? null,
    disinfection_completed_at: (row.disinfection_completed_at as string) ?? null,
    disinfection_solution: (row.disinfection_solution as string) ?? null,
    disinfection_concentration: (row.disinfection_concentration as string) ?? null,

    pso_started_at: (row.pso_started_at as string) ?? null,
    pso_completed_at: (row.pso_completed_at as string) ?? null,
    pso_method: (row.pso_method as string) ?? null,
    azopyramine_test: (row.azopyramine_test as string) ?? null,
    azopyramine_photo_url: (row.azopyramine_photo_url as string) ?? null,

    drying_started_at: (row.drying_started_at as string) ?? null,
    drying_completed_at: (row.drying_completed_at as string) ?? null,
    drying_method: (row.drying_method as string) ?? null,

    sterilization_started_at: (row.sterilization_started_at as string) ?? null,
    sterilization_completed_at: (row.sterilization_completed_at as string) ?? null,
    sterilization_temperature: (row.sterilization_temperature as number) ?? null,
    sterilization_pressure: (row.sterilization_pressure as number) ?? null,
    sterilization_time_minutes: (row.sterilization_time_minutes as number) ?? null,
    sterilization_mode: (row.sterilization_mode as string) ?? null,
    chemical_indicator: (row.chemical_indicator as string) ?? null,
    chemical_indicator_photo_url: (row.chemical_indicator_photo_url as string) ?? null,

    packaging_type: (row.packaging_type as string) ?? null,
    packaging_photo: (row.packaging_photo as string) ?? null,
    packages: parsePackages(row.packages),

    photos_before: (row.photos_before as string[]) ?? null,
    photos_after: (row.photos_after as string[]) ?? null,

    result: (row.result as string) ?? null,
    completed_at: (row.completed_at as string) ?? null,
    is_locked: (row.is_locked as boolean) ?? false,
    created_at: (row.created_at as string) ?? '',
  };
}
