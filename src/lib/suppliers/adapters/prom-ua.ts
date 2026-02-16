import type { SupplierType, SupplierCapability } from '@/types/supplier';
import type {
  SupplierProvider,
  ExternalProduct,
  CreateOrderRequest,
  OrderStatusResponse,
  PriceCheckResult,
  SyncResult,
} from '../types';

// ─── Config ─────────────────────────────────────────────────────────────────

interface PromUaConfig {
  api_key: string;
  company_id: string;
}

// ─── API Response Types ─────────────────────────────────────────────────────

interface PromProduct {
  id: number;
  external_id?: string;
  sku?: string;
  name: string;
  description?: string;
  group?: { id: number; name: string };
  images?: Array<{ url: string }>;
  price: number;
  minimum_order_quantity?: number;
  currency: string;
  presence: string;
  quantity_in_stock?: number;
}

interface PromProductListResponse {
  products: PromProduct[];
}

// ─── Provider ───────────────────────────────────────────────────────────────

const PROM_BASE_URL = 'https://my.prom.ua/api/v1';

export class PromUaProvider implements SupplierProvider {
  readonly type: SupplierType = 'prom_ua';
  readonly capabilities: SupplierCapability[] = [
    'catalog_sync',
    'price_sync',
    'stock_check',
  ];

  private readonly apiKey: string;
  private readonly companyId: string;

  constructor(config: Record<string, unknown>) {
    const typed = config as unknown as PromUaConfig;
    if (!typed.api_key) {
      throw new Error('Prom.ua: api_key обов\'язковий');
    }
    this.apiKey = typed.api_key;
    this.companyId = typed.company_id ?? '';
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${PROM_BASE_URL}${path}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `Prom.ua API ${response.status}: ${text || response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  private mapProduct(raw: PromProduct): ExternalProduct {
    const isInStock =
      raw.presence === 'available' || raw.presence === 'in_stock';

    return {
      externalId: String(raw.id),
      externalSku: raw.sku ?? raw.external_id,
      externalUrl: this.companyId
        ? `https://prom.ua/p${raw.id}`
        : undefined,
      name: raw.name,
      category: raw.group?.name,
      description: raw.description,
      imageUrl: raw.images?.[0]?.url,
      price: raw.price,
      currency: raw.currency || 'UAH',
      unit: 'шт',
      inStock: isInStock,
      stockQuantity: raw.quantity_in_stock ?? undefined,
    };
  }

  // ─── Interface Methods ──────────────────────────────────────────────────

  async searchProducts(
    query: string,
    options?: { category?: string; brand?: string; limit?: number; offset?: number }
  ): Promise<ExternalProduct[]> {
    const params = new URLSearchParams({
      search_term: query,
      limit: String(options?.limit ?? 20),
    });
    if (options?.offset) params.set('offset', String(options.offset));

    const data = await this.fetch<PromProductListResponse>(
      `/products/list?${params.toString()}`
    );

    return data.products.map((p) => this.mapProduct(p));
  }

  async getProduct(externalId: string): Promise<ExternalProduct | null> {
    try {
      const data = await this.fetch<PromProductListResponse>(
        `/products/list?id=${externalId}&limit=1`
      );
      const raw = data.products[0];
      return raw ? this.mapProduct(raw) : null;
    } catch {
      return null;
    }
  }

  async syncCatalog(
    options?: { categories?: string[]; onlyInStock?: boolean }
  ): Promise<SyncResult> {
    const result: SyncResult = { added: 0, updated: 0, removed: 0 };
    const pageSize = 100;
    let lastId = 0;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        limit: String(pageSize),
        last_id: String(lastId),
      });

      const data = await this.fetch<PromProductListResponse>(
        `/products/list?${params.toString()}`
      );

      let products = data.products;

      if (options?.onlyInStock) {
        products = products.filter(
          (p) => p.presence === 'available' || p.presence === 'in_stock'
        );
      }

      if (options?.categories?.length) {
        const cats = new Set(options.categories.map((c) => c.toLowerCase()));
        products = products.filter(
          (p) => p.group?.name && cats.has(p.group.name.toLowerCase())
        );
      }

      result.added += products.length;

      if (data.products.length < pageSize) {
        hasMore = false;
      } else {
        lastId = data.products[data.products.length - 1].id;
      }
    }

    return result;
  }

  async checkPrices(
    externalIds: string[]
  ): Promise<Map<string, PriceCheckResult>> {
    const map = new Map<string, PriceCheckResult>();

    for (const id of externalIds) {
      try {
        const data = await this.fetch<PromProductListResponse>(
          `/products/list?id=${id}&limit=1`
        );
        const raw = data.products[0];
        if (raw) {
          map.set(id, {
            price: raw.price,
            inStock:
              raw.presence === 'available' || raw.presence === 'in_stock',
          });
        }
      } catch {
        // Skip products that fail to fetch
      }
    }

    return map;
  }

  async createOrder(): Promise<never> {
    throw new Error('Prom.ua: автоматичне замовлення не підтримується');
  }

  async getOrderStatus(): Promise<never> {
    throw new Error('Prom.ua: відстеження замовлень недоступне');
  }

  async validateConfig(): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      await this.fetch<PromProductListResponse>('/products/list?limit=1');
      return { valid: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Невідома помилка з\'єднання';
      return { valid: false, errors: [message] };
    }
  }
}
