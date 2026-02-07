import { createClient } from '@/lib/supabase/server';
import { getStockStatus, type StockStatus } from '@/schemas/inventory';
import { getCurrentSalonId } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  category: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  purchase_price: number;
  retail_price: number;
  supplier: string | null;
  supplier_url: string | null;
  supplier_sku: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  brand: {
    id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
    is_partner: boolean;
  } | null;
  stockStatus: StockStatus;
}

export interface InventoryBrand {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  is_partner: boolean;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  type: string;
  quantity: number;
  cost: number | null;
  notes: string | null;
  supplier: string | null;
  appointment_id: string | null;
  created_at: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  usedThisMonth: number;
}

export interface ServiceUsage {
  serviceId: string;
  serviceName: string;
  quantityPerService: number;
}

// ─── Safe row mapper ────────────────────────────────────────────────────────
// Maps whatever fields exist from Supabase row to our InventoryItem type

function mapRow(row: Record<string, unknown>): InventoryItem {
  const qty = Number(row.quantity ?? 0);
  const minQty = Number(row.min_quantity ?? 0);

  // Brand might be a joined object or null
  let brand: InventoryItem['brand'] = null;
  const rawBrand = row.inventory_brands ?? row.brand ?? null;
  if (rawBrand && typeof rawBrand === 'object' && !Array.isArray(rawBrand)) {
    const b = rawBrand as Record<string, unknown>;
    brand = {
      id: (b.id as string) ?? '',
      name: (b.name as string) ?? '',
      logo_url: (b.logo_url as string) ?? null,
      website: (b.website as string) ?? null,
      is_partner: (b.is_partner as boolean) ?? false,
    };
  }

  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    sku: (row.sku as string) ?? null,
    barcode: (row.barcode as string) ?? null,
    category: (row.category as string) ?? 'other',
    unit: (row.unit as string) ?? 'шт',
    quantity: qty,
    min_quantity: minQty,
    purchase_price: Number(row.purchase_price ?? row.cost_price ?? 0),
    retail_price: Number(row.retail_price ?? row.sell_price ?? 0),
    supplier: (row.supplier as string) ?? null,
    supplier_url: (row.supplier_url as string) ?? null,
    supplier_sku: (row.supplier_sku as string) ?? null,
    image_url: (row.image_url as string) ?? null,
    created_at: (row.created_at as string) ?? '',
    updated_at: (row.updated_at as string) ?? '',
    brand,
    stockStatus: getStockStatus(qty, minQty),
  };
}

// ─── Get All Items ───────────────────────────────────────────────────────────

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  // Step 1: Try query with brand join
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, inventory_brands!brand_id(id, name, logo_url, website, is_partner)')
    .eq('salon_id', salonId)
    .order('name');

  if (error) {
    console.error('[INVENTORY] getInventoryItems join error:', error.message);

    // Step 2: Fallback — simple select without join
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('salon_id', salonId)
      .order('name');

    if (fallbackError) {
      console.error('[INVENTORY] getInventoryItems fallback error:', fallbackError.message);
      return [];
    }

    console.log('[INVENTORY] Fallback success, items:', fallbackData?.length ?? 0);
    return (fallbackData ?? []).map((row) => mapRow(row as Record<string, unknown>));
  }

  console.log('[INVENTORY] Items loaded:', data?.length ?? 0);
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

// ─── Get Single Item ─────────────────────────────────────────────────────────

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const { data: row, error } = await supabase
    .from('inventory_items')
    .select('*, inventory_brands!brand_id(id, name, logo_url, website, is_partner)')
    .eq('id', id)
    .eq('salon_id', salonId)
    .maybeSingle();

  if (error) {
    console.error('[INVENTORY] getInventoryItem join error:', error.message);

    // Fallback without join
    const { data: fallbackRow, error: fallbackError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .eq('salon_id', salonId)
      .maybeSingle();

    if (fallbackError || !fallbackRow) {
      console.error('[INVENTORY] getInventoryItem fallback error:', fallbackError?.message);
      return null;
    }

    return mapRow(fallbackRow as Record<string, unknown>);
  }

  if (!row) return null;
  return mapRow(row as Record<string, unknown>);
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getInventoryStats(): Promise<InventoryStats> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const { data: items, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('salon_id', salonId);

  if (error) {
    console.error('[INVENTORY] getInventoryStats error:', error.message);
    return { totalItems: 0, totalValue: 0, lowStockCount: 0, usedThisMonth: 0 };
  }

  console.log('[INVENTORY] Stats items:', items?.length ?? 0);

  const totalItems = items?.length ?? 0;
  const totalValue = (items ?? []).reduce((sum, i) => {
    const qty = Number(i.quantity ?? 0);
    const price = Number(i.purchase_price ?? i.cost_price ?? 0);
    return sum + qty * price;
  }, 0);
  const lowStockCount = (items ?? []).filter(
    (i) => Number(i.quantity ?? 0) <= Number(i.min_quantity ?? 0) * 2
  ).length;

  // Usage this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: usageTx, error: txError } = await supabase
    .from('inventory_transactions')
    .select('quantity')
    .eq('salon_id', salonId)
    .in('type', ['usage', 'auto_deduction'])
    .gte('created_at', monthStart.toISOString());

  if (txError) {
    console.error('[INVENTORY] getInventoryStats tx error:', txError.message);
  }

  const usedThisMonth = (usageTx ?? []).reduce(
    (sum, t) => sum + Math.abs(Number(t.quantity ?? 0)),
    0
  );

  return { totalItems, totalValue, lowStockCount, usedThisMonth };
}

// ─── Brands ──────────────────────────────────────────────────────────────────

export async function getBrands(): Promise<InventoryBrand[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data, error } = await supabase
    .from('inventory_brands')
    .select('id, name, logo_url, website, is_partner')
    .eq('salon_id', salonId)
    .order('name');

  if (error) {
    console.error('[INVENTORY] getBrands error:', error.message);

    // Fallback: try select *
    const { data: fallback } = await supabase
      .from('inventory_brands')
      .select('*')
      .eq('salon_id', salonId)
      .order('name');

    return (fallback ?? []).map((b) => ({
      id: (b as Record<string, unknown>).id as string,
      name: ((b as Record<string, unknown>).name as string) ?? '',
      logo_url: ((b as Record<string, unknown>).logo_url as string) ?? null,
      website: ((b as Record<string, unknown>).website as string) ?? null,
      is_partner: ((b as Record<string, unknown>).is_partner as boolean) ?? false,
    }));
  }

  return (data ?? []) as InventoryBrand[];
}

// ─── Low Stock Items ─────────────────────────────────────────────────────────

export async function getLowStockItems(): Promise<InventoryItem[]> {
  const all = await getInventoryItems();
  return all.filter((i) => i.stockStatus !== 'in_stock');
}

// ─── Transactions for a product ──────────────────────────────────────────────

export async function getItemTransactions(productId: string): Promise<InventoryTransaction[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data, error } = await supabase
    .from('inventory_transactions')
    .select('id, product_id, type, quantity, cost, notes, supplier, appointment_id, created_at')
    .eq('product_id', productId)
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[INVENTORY] getItemTransactions error:', error.message);
    return [];
  }

  return (data ?? []) as InventoryTransaction[];
}

// ─── Service usage for a product ─────────────────────────────────────────────

export async function getProductServiceUsage(productId: string): Promise<ServiceUsage[]> {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();
  const { data, error } = await supabase
    .from('service_materials')
    .select('quantity, services!service_id(id, name)')
    .eq('product_id', productId)
    .eq('salon_id', salonId);

  if (error) {
    console.error('[INVENTORY] getProductServiceUsage error:', error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const svc = row.services as { id: string; name: string } | null;
    return {
      serviceId: svc?.id ?? '',
      serviceName: svc?.name ?? 'Послуга',
      quantityPerService: Number(row.quantity ?? 0),
    };
  });
}
