import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SterilizationEquipment {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  parameters: Record<string, unknown> | null;
  certification_expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface InstrumentSet {
  id: string;
  name: string;
  instruments: string[];
  category: string;
  quantity: number;
  is_active: boolean;
  created_at: string;
}

export interface SterilizationPackage {
  set_id?: string;
  set_name?: string;
  instruments?: string[];
  packaging: string; // kraft, pouch, container, wrap, none
}

export interface SterilizationCycle {
  id: string;
  cycle_number: string;
  stage: string;
  equipment: { id: string; name: string; type: string } | null;
  instrument_set: { id: string; name: string } | null;
  operator: { id: string; first_name: string; last_name: string } | null;

  // Timestamps
  started_at: string | null;
  disinfection_started_at: string | null;
  disinfection_completed_at: string | null;
  disinfection_solution: string | null;
  disinfection_concentration: string | null;
  disinfection_exposure_minutes: number | null;
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
  packages: SterilizationPackage[] | null;
  packaging_type: string | null;
  packaging_photo: string | null;
  photos_before: string[] | null;
  photos_after: string[] | null;
  preparation_notes: string | null;
  result: string | null;
  result_notes: string | null;
  completed_at: string | null;
  is_locked: boolean;
  locked_at: string | null;
  created_at: string;
}

export interface StoragePackage {
  id: string;
  cycle_id: string;
  cycle_number: string | null;
  package_label: string;
  storage_location: string | null;
  stored_at: string;
  expires_at: string;
  status: string;
  used_at: string | null;
}

export interface SterilizationStats {
  cyclesThisMonth: number;
  successRate: number;
  sterilePackages: number;
  nextMaintenanceDate: string | null;
}

export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  type: string;
  date: string;
  next_date: string | null;
  cost: number | null;
  notes: string | null;
  performed_by: string | null;
}

// ─── Safe row mapper ────────────────────────────────────────────────────────

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

function mapCycle(row: Record<string, unknown>): SterilizationCycle {
  const eq = row.sterilization_equipment as Record<string, unknown> | null;
  const iset = row.sterilization_instrument_sets as Record<string, unknown> | null;
  const op = row.staff as Record<string, unknown> | null;

  return {
    id: (row.id as string) ?? '',
    cycle_number: (row.cycle_number as string) ?? '',
    stage: (row.stage as string) ?? 'preparation',
    equipment: eq
      ? { id: eq.id as string, name: eq.name as string, type: eq.type as string }
      : null,
    instrument_set: iset ? { id: iset.id as string, name: iset.name as string } : null,
    operator: op
      ? {
          id: op.id as string,
          first_name: op.first_name as string,
          last_name: op.last_name as string,
        }
      : null,
    started_at: (row.started_at as string) ?? null,
    disinfection_started_at: (row.disinfection_started_at as string) ?? null,
    disinfection_completed_at: (row.disinfection_completed_at as string) ?? null,
    disinfection_solution: (row.disinfection_solution as string) ?? null,
    disinfection_concentration: (row.disinfection_concentration as string) ?? null,
    disinfection_exposure_minutes: (row.disinfection_exposure_minutes as number) ?? null,
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
    packages: parsePackages(row.packages),
    packaging_type: (row.packaging_type as string) ?? null,
    packaging_photo: (row.packaging_photo as string) ?? null,
    photos_before: (row.photos_before as string[]) ?? null,
    photos_after: (row.photos_after as string[]) ?? null,
    preparation_notes: (row.preparation_notes as string) ?? null,
    result: (row.result as string) ?? null,
    result_notes: (row.result_notes as string) ?? null,
    completed_at: (row.completed_at as string) ?? null,
    is_locked: (row.is_locked as boolean) ?? false,
    locked_at: (row.locked_at as string) ?? null,
    created_at: (row.created_at as string) ?? '',
  };
}

// ─── Get Cycles ──────────────────────────────────────────────────────────────

export async function getCycles(filters?: {
  dateFrom?: string;
  dateTo?: string;
  equipmentId?: string;
  result?: string;
}): Promise<SterilizationCycle[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  let query = supabase
    .from('sterilization_cycles')
    .select(
      '*, sterilization_equipment!equipment_id(id, name, type), sterilization_instrument_sets!instrument_set_id(id, name), staff!staff_id(id, first_name, last_name)'
    )
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false });

  if (filters?.dateFrom) query = query.gte('created_at', `${filters.dateFrom}T00:00:00`);
  if (filters?.dateTo) query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
  if (filters?.equipmentId) query = query.eq('equipment_id', filters.equipmentId);
  if (filters?.result) query = query.eq('result', filters.result);

  const { data, error } = await query;

  if (error) {
    console.error('[STERILIZATION] getCycles error:', error.message);
    // Fallback without joins
    const { data: fb } = await supabase
      .from('sterilization_cycles')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false });
    return (fb ?? []).map((r) => mapCycle(r as Record<string, unknown>));
  }

  return (data ?? []).map((r) => mapCycle(r as Record<string, unknown>));
}

// ─── Get Single Cycle ────────────────────────────────────────────────────────

export async function getCycle(id: string): Promise<SterilizationCycle | null> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const { data, error } = await supabase
    .from('sterilization_cycles')
    .select(
      '*, sterilization_equipment!equipment_id(id, name, type), sterilization_instrument_sets!instrument_set_id(id, name), staff!staff_id(id, first_name, last_name)'
    )
    .eq('id', id)
    .eq('salon_id', salonId)
    .maybeSingle();

  if (error) {
    console.error('[STERILIZATION] getCycle error:', error.message);
    const { data: fb } = await supabase
      .from('sterilization_cycles')
      .select('*')
      .eq('id', id)
      .eq('salon_id', salonId)
      .maybeSingle();
    if (!fb) return null;
    return mapCycle(fb as Record<string, unknown>);
  }

  if (!data) return null;
  return mapCycle(data as Record<string, unknown>);
}

// ─── Equipment ───────────────────────────────────────────────────────────────

export async function getEquipment(): Promise<SterilizationEquipment[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data, error } = await supabase
    .from('sterilization_equipment')
    .select('*')
    .eq('salon_id', salonId)
    .order('name');

  if (error) {
    console.error('[STERILIZATION] getEquipment error:', error.message);
    return [];
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    brand: r.brand ?? null,
    model: r.model ?? null,
    serial_number: r.serial_number ?? null,
    parameters: (r.parameters as Record<string, unknown>) ?? null,
    certification_expires_at: r.certification_expires_at ?? null,
    is_active: r.is_active !== false,
    created_at: r.created_at,
  }));
}

// ─── Instrument Sets ─────────────────────────────────────────────────────────

export async function getInstrumentSets(): Promise<InstrumentSet[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data, error } = await supabase
    .from('sterilization_instrument_sets')
    .select('*')
    .eq('salon_id', salonId)
    .order('name');

  if (error) {
    console.error('[STERILIZATION] getInstrumentSets error:', error.message);
    return [];
  }

  return (data ?? []).map((r) => {
    let instruments: string[] = [];
    if (Array.isArray(r.instruments)) {
      instruments = r.instruments as string[];
    } else if (typeof r.instruments === 'string') {
      try {
        instruments = JSON.parse(r.instruments);
      } catch {
        instruments = [];
      }
    }

    return {
      id: r.id,
      name: r.name,
      instruments,
      category: r.category ?? 'other',
      quantity: r.quantity ?? 1,
      is_active: r.is_active !== false,
      created_at: r.created_at,
    };
  });
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export async function getStorage(): Promise<StoragePackage[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data, error } = await supabase
    .from('sterilization_storage')
    .select('*, sterilization_cycles!cycle_id(cycle_number)')
    .eq('salon_id', salonId)
    .order('stored_at', { ascending: false });

  if (error) {
    console.error('[STERILIZATION] getStorage error:', error.message);
    const { data: fb } = await supabase
      .from('sterilization_storage')
      .select('*')
      .eq('salon_id', salonId)
      .order('stored_at', { ascending: false });
    return (fb ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      cycle_id: r.cycle_id as string,
      cycle_number: null,
      package_label: (r.package_label as string) ?? '',
      storage_location: (r.storage_location as string) ?? null,
      stored_at: (r.stored_at ?? r.sterilized_at ?? r.created_at) as string,
      expires_at: r.expires_at as string,
      status: (r.status as string) ?? 'sterile',
      used_at: (r.used_at as string) ?? null,
    }));
  }

  return (data ?? []).map((r: Record<string, unknown>) => {
    const cycle = r.sterilization_cycles as { cycle_number: string } | null;
    return {
      id: r.id as string,
      cycle_id: r.cycle_id as string,
      cycle_number: cycle?.cycle_number ?? null,
      package_label: (r.package_label as string) ?? '',
      storage_location: (r.storage_location as string) ?? null,
      stored_at: (r.stored_at ?? r.sterilized_at ?? r.created_at) as string,
      expires_at: r.expires_at as string,
      status: (r.status as string) ?? 'sterile',
      used_at: (r.used_at as string) ?? null,
    };
  });
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getStats(): Promise<SterilizationStats> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Cycles this month
  const { data: monthlyCycles } = await supabase
    .from('sterilization_cycles')
    .select('result')
    .eq('salon_id', salonId)
    .gte('created_at', monthStart.toISOString());

  const cyclesThisMonth = monthlyCycles?.length ?? 0;
  const successCount = (monthlyCycles ?? []).filter(
    (c) => c.result === 'success' || c.result === 'sterile'
  ).length;
  const successRate = cyclesThisMonth > 0 ? Math.round((successCount / cyclesThisMonth) * 100) : 0;

  // Sterile packages
  const { count: sterilePackages } = await supabase
    .from('sterilization_storage')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .eq('status', 'sterile');

  // Next maintenance
  const { data: maintenance } = await supabase
    .from('equipment_maintenance')
    .select('next_date')
    .eq('salon_id', salonId)
    .not('next_date', 'is', null)
    .gte('next_date', new Date().toISOString().split('T')[0])
    .order('next_date')
    .limit(1);

  return {
    cyclesThisMonth,
    successRate,
    sterilePackages: sterilePackages ?? 0,
    nextMaintenanceDate: maintenance?.[0]?.next_date ?? null,
  };
}

// ─── Get Active Cycle (for recovery) ─────────────────────────────────────────

export async function getActiveCycle(): Promise<SterilizationCycle | null> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const { data, error } = await supabase
    .from('sterilization_cycles')
    .select(
      '*, sterilization_equipment!equipment_id(id, name, type), sterilization_instrument_sets!instrument_set_id(id, name), staff!staff_id(id, first_name, last_name)'
    )
    .eq('salon_id', salonId)
    .eq('is_locked', false)
    .neq('stage', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[STERILIZATION] getActiveCycle error:', error.message);
    const { data: fb } = await supabase
      .from('sterilization_cycles')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_locked', false)
      .neq('stage', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!fb) return null;
    return mapCycle(fb as Record<string, unknown>);
  }

  if (!data) return null;
  return mapCycle(data as Record<string, unknown>);
}

// ─── Get Staff (for operator selection) ──────────────────────────────────────

export async function getStaff(): Promise<{ id: string; first_name: string; last_name: string }[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data } = await supabase
    .from('staff')
    .select('id, first_name, last_name')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('first_name');
  return (data ?? []) as { id: string; first_name: string; last_name: string }[];
}
