import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';
import type { SalonOverhead, MaterialCostItem } from '@/schemas/service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ServiceRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  duration: number;
  cost: number;
  margin: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithMaterials extends ServiceRow {
  materials: MaterialCostItem[];
  materialsCost: number;
}

export interface ServiceStats {
  total: number;
  averagePrice: number;
  averageMargin: number;
}

export interface InventoryProduct {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  quantity: number;
  purchase_price: number;
  brand: { name: string } | null;
}

// ─── Get All Services ────────────────────────────────────────────────────────

export async function getServices(): Promise<{
  services: ServiceWithMaterials[];
  stats: ServiceStats;
}> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const [servicesRes, materialsRes] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('service_materials')
      .select(
        'id, service_id, quantity, inventory_items!product_id(id, name, purchase_price, quantity, unit)'
      )
      .eq('salon_id', salonId),
  ]);

  const services = (servicesRes.data ?? []) as ServiceRow[];
  const rawMaterials = (materialsRes.data ?? []) as unknown as Array<{
    id: string;
    service_id: string;
    quantity: number;
    inventory_items: {
      id: string;
      name: string;
      purchase_price: number;
      quantity: number;
      unit: string;
    } | null;
  }>;

  // Group materials by service_id
  const materialsByService = new Map<string, MaterialCostItem[]>();
  for (const m of rawMaterials) {
    const prod = m.inventory_items;
    if (!prod) continue;

    const unitCost = prod.quantity > 0 ? prod.purchase_price / prod.quantity : 0;
    const totalCost = unitCost * m.quantity;

    const item: MaterialCostItem = {
      id: m.id,
      product_name: prod.name,
      purchase_price: prod.purchase_price,
      unit: prod.unit,
      quantity_in_package: prod.quantity,
      quantity_per_service: m.quantity,
      unit_cost: unitCost,
      total_cost: totalCost,
    };

    const existing = materialsByService.get(m.service_id) ?? [];
    existing.push(item);
    materialsByService.set(m.service_id, existing);
  }

  const enriched: ServiceWithMaterials[] = services.map((s) => {
    const mats = materialsByService.get(s.id) ?? [];
    const materialsCost = mats.reduce((sum, m) => sum + m.total_cost, 0);
    return { ...s, materials: mats, materialsCost };
  });

  const total = enriched.length;
  const averagePrice =
    total > 0 ? Math.round(enriched.reduce((s, sv) => s + sv.price, 0) / total) : 0;
  const averageMargin =
    total > 0
      ? Math.round(
          enriched.reduce((s, sv) => {
            const margin = sv.price > 0 ? ((sv.price - sv.materialsCost) / sv.price) * 100 : 0;
            return s + margin;
          }, 0) / total
        )
      : 0;

  return {
    services: enriched,
    stats: { total, averagePrice, averageMargin },
  };
}

// ─── Get Single Service ──────────────────────────────────────────────────────

export async function getService(id: string): Promise<ServiceWithMaterials | null> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const [serviceRes, materialsRes] = await Promise.all([
    supabase.from('services').select('*').eq('id', id).eq('salon_id', salonId).maybeSingle(),
    supabase
      .from('service_materials')
      .select(
        'id, service_id, quantity, inventory_items!product_id(id, name, purchase_price, quantity, unit)'
      )
      .eq('salon_id', salonId)
      .eq('service_id', id),
  ]);

  const service = serviceRes.data as ServiceRow | null;
  if (!service) return null;

  const rawMats = (materialsRes.data ?? []) as unknown as Array<{
    id: string;
    service_id: string;
    quantity: number;
    inventory_items: {
      id: string;
      name: string;
      purchase_price: number;
      quantity: number;
      unit: string;
    } | null;
  }>;

  const materials: MaterialCostItem[] = rawMats
    .filter((m) => m.inventory_items)
    .map((m) => {
      const prod = m.inventory_items!;
      const unitCost = prod.quantity > 0 ? prod.purchase_price / prod.quantity : 0;
      return {
        id: m.id,
        product_name: prod.name,
        purchase_price: prod.purchase_price,
        unit: prod.unit,
        quantity_in_package: prod.quantity,
        quantity_per_service: m.quantity,
        unit_cost: unitCost,
        total_cost: unitCost * m.quantity,
      };
    });

  const materialsCost = materials.reduce((s, m) => s + m.total_cost, 0);

  return { ...service, materials, materialsCost };
}

// ─── Get Salon Overhead ──────────────────────────────────────────────────────

export async function getSalonOverhead(): Promise<SalonOverhead | null> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data } = await supabase.from('salons').select('overhead').eq('id', salonId).maybeSingle();

  if (!data?.overhead) return null;
  const o = data.overhead as Record<string, unknown>;
  if (!o.monthly_expenses || Number(o.monthly_expenses) === 0) return null;

  return {
    monthly_expenses: Number(o.monthly_expenses),
    working_days: Number(o.working_days ?? 30),
    hours_per_day: Number(o.hours_per_day ?? 8),
    masters_per_shift: Number(o.masters_per_shift ?? 5),
    master_commission_percent: Number(o.master_commission_percent ?? 35),
    desired_profit_percent: Number(o.desired_profit_percent ?? 30),
  };
}

// ─── Get Inventory Products (for material picker) ────────────────────────────

export async function getInventoryProducts(): Promise<InventoryProduct[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data } = await supabase
    .from('inventory_items')
    .select('id, name, category, unit, quantity, purchase_price, inventory_brands!brand_id(name)')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('name');

  return (data ?? []).map((p) => {
    const raw = p as Record<string, unknown>;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      unit: p.unit,
      quantity: p.quantity,
      purchase_price: p.purchase_price,
      brand: raw.inventory_brands as InventoryProduct['brand'],
    };
  });
}

// ─── Get Service Appointment Stats ───────────────────────────────────────────

export interface ServiceAppointmentStats {
  monthlyCount: number;
  monthlyRevenue: number;
}

export async function getServiceAppointmentStats(
  serviceId: string
): Promise<ServiceAppointmentStats> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data } = await supabase
    .from('appointments')
    .select('id, price, final_price')
    .eq('salon_id', salonId)
    .eq('service_id', serviceId)
    .eq('status', 'completed')
    .gte('start_time', monthStart);

  const rows = data ?? [];
  return {
    monthlyCount: rows.length,
    monthlyRevenue: rows.reduce(
      (s, r) =>
        s +
        (((r as Record<string, unknown>).final_price as number | null) ??
          ((r as Record<string, unknown>).price as number)),
      0
    ),
  };
}
