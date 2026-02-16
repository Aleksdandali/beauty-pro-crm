import type { SupplierProvider } from './types';
import type { SupplierType } from '@/types/supplier';
import { ShineShopProvider } from './adapters/shine-shop';
import { PromUaProvider } from './adapters/prom-ua';
import { ManualProvider } from './adapters/manual';

// ─── Provider Registry ──────────────────────────────────────────────────────

const providerRegistry: Record<
  SupplierType,
  new (config: Record<string, unknown>) => SupplierProvider
> = {
  shine_shop: ShineShopProvider as unknown as new (config: Record<string, unknown>) => SupplierProvider,
  prom_ua: PromUaProvider as unknown as new (config: Record<string, unknown>) => SupplierProvider,
  rozetka: ManualProvider as unknown as new (config: Record<string, unknown>) => SupplierProvider,
  api: ManualProvider as unknown as new (config: Record<string, unknown>) => SupplierProvider,
  manual: ManualProvider as unknown as new (config: Record<string, unknown>) => SupplierProvider,
};

// ─── Factory ────────────────────────────────────────────────────────────────

export function createSupplierProvider(
  type: SupplierType,
  config: Record<string, unknown>
): SupplierProvider {
  const Provider = providerRegistry[type];
  if (!Provider) {
    throw new Error(`Невідомий тип постачальника: ${type}`);
  }
  return new Provider(config);
}

// ─── Helper ─────────────────────────────────────────────────────────────────

/**
 * Fetches supplier record from DB and creates the appropriate provider instance.
 * Uses `any` for supabase client because @supabase/supabase-js types vary
 * between server/client and we accept both here.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSupplierProvider(
  supabase: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  supplierId: string
): Promise<SupplierProvider> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('type, api_config')
    .eq('id', supplierId)
    .single();

  if (error || !data) {
    throw new Error('Постачальника не знайдено');
  }

  return createSupplierProvider(data.type, data.api_config ?? {});
}
