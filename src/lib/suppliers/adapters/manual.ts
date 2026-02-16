import type { SupplierType, SupplierCapability } from '@/types/supplier';
import type {
  SupplierProvider,
  ExternalProduct,
  OrderStatusResponse,
  PriceCheckResult,
  SyncResult,
} from '../types';

// ─── Provider ───────────────────────────────────────────────────────────────

export class ManualProvider implements SupplierProvider {
  readonly type: SupplierType = 'manual';
  readonly capabilities: SupplierCapability[] = [];

  constructor(_config: Record<string, unknown>) {
    // No configuration needed for manual supplier
  }

  // ─── Interface Methods ──────────────────────────────────────────────────

  async searchProducts(): Promise<ExternalProduct[]> {
    throw new Error('Ручний постачальник не підтримує пошук товарів');
  }

  async getProduct(): Promise<ExternalProduct | null> {
    throw new Error('Ручний постачальник не підтримує отримання товарів через API');
  }

  async syncCatalog(): Promise<SyncResult> {
    throw new Error('Ручний постачальник не підтримує синхронізацію каталогу');
  }

  async checkPrices(): Promise<Map<string, PriceCheckResult>> {
    throw new Error('Ручний постачальник не підтримує перевірку цін через API');
  }

  async createOrder(): Promise<never> {
    throw new Error('Ручний постачальник не підтримує автоматичне замовлення');
  }

  async getOrderStatus(): Promise<OrderStatusResponse> {
    throw new Error('Ручний постачальник не підтримує відстеження замовлень');
  }

  async validateConfig(): Promise<{ valid: boolean; errors?: string[] }> {
    return { valid: true };
  }
}
