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

interface ShineShopConfig {
  base_url: string;
  api_key: string;
}

// ─── API Response Types ─────────────────────────────────────────────────────

interface ShineShopProduct {
  id: string;
  sku?: string;
  slug?: string;
  name_uk: string;
  description_uk?: string;
  main_image_url?: string;
  brand?: { name: string };
  category?: { name_uk: string };
  price: number;
  price_old?: number;
  currency: string;
  unit: string;
  volume?: number;
  in_stock: boolean;
  stock_quantity?: number;
}

interface ShineShopPaginatedResponse {
  results: ShineShopProduct[];
  count: number;
  next: string | null;
}

interface ShineShopPriceEntry {
  id: string;
  price: number;
  price_old?: number;
  in_stock: boolean;
}

interface ShineShopOrderResponse {
  id: string;
  status: string;
  estimated_delivery?: string;
}

interface ShineShopOrderStatusResponse {
  id: string;
  status: string;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export class ShineShopProvider implements SupplierProvider {
  readonly type: SupplierType = 'shine_shop';
  readonly capabilities: SupplierCapability[] = [
    'catalog_sync',
    'price_sync',
    'stock_check',
    'auto_order',
  ];

  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: Record<string, unknown>) {
    const typed = config as unknown as ShineShopConfig;
    if (!typed.base_url || !typed.api_key) {
      throw new Error('ShineShop: base_url та api_key обов\'язкові');
    }
    this.baseUrl = typed.base_url.replace(/\/+$/, '');
    this.apiKey = typed.api_key;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-CRM-API-Key': this.apiKey,
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `ShineShop API ${response.status}: ${text || response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  private mapProduct(raw: ShineShopProduct): ExternalProduct {
    return {
      externalId: raw.id,
      externalSku: raw.sku,
      externalUrl: raw.slug ? `${this.baseUrl}/products/${raw.slug}` : undefined,
      name: raw.name_uk,
      brand: raw.brand?.name,
      category: raw.category?.name_uk,
      description: raw.description_uk,
      imageUrl: raw.main_image_url,
      price: raw.price,
      priceOld: raw.price_old ?? undefined,
      currency: raw.currency,
      unit: raw.unit,
      volume: raw.volume ?? undefined,
      inStock: raw.in_stock,
      stockQuantity: raw.stock_quantity ?? undefined,
    };
  }

  // ─── Interface Methods ──────────────────────────────────────────────────

  async searchProducts(
    query: string,
    options?: { category?: string; brand?: string; limit?: number; offset?: number }
  ): Promise<ExternalProduct[]> {
    const params = new URLSearchParams({ q: query });
    if (options?.category) params.set('category', options.category);
    if (options?.brand) params.set('brand', options.brand);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));

    const data = await this.fetch<ShineShopPaginatedResponse>(
      `/api/crm/products?${params.toString()}`
    );

    return data.results.map((p) => this.mapProduct(p));
  }

  async getProduct(externalId: string): Promise<ExternalProduct | null> {
    try {
      const raw = await this.fetch<ShineShopProduct>(
        `/api/crm/products/${externalId}`
      );
      return this.mapProduct(raw);
    } catch {
      return null;
    }
  }

  async syncCatalog(
    options?: { categories?: string[]; onlyInStock?: boolean }
  ): Promise<SyncResult> {
    const result: SyncResult = { added: 0, updated: 0, removed: 0 };
    const pageSize = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset),
      });
      if (options?.onlyInStock) params.set('in_stock', 'true');
      if (options?.categories?.length) {
        params.set('categories', options.categories.join(','));
      }

      const data = await this.fetch<ShineShopPaginatedResponse>(
        `/api/crm/products?${params.toString()}`
      );

      result.added += data.results.length;
      offset += pageSize;
      hasMore = data.next !== null && data.results.length === pageSize;
    }

    return result;
  }

  async checkPrices(
    externalIds: string[]
  ): Promise<Map<string, PriceCheckResult>> {
    const data = await this.fetch<ShineShopPriceEntry[]>(
      '/api/crm/products/prices',
      {
        method: 'POST',
        body: JSON.stringify({ ids: externalIds }),
      }
    );

    const map = new Map<string, PriceCheckResult>();
    for (const entry of data) {
      map.set(entry.id, {
        price: entry.price,
        priceOld: entry.price_old,
        inStock: entry.in_stock,
      });
    }
    return map;
  }

  async createOrder(
    request: CreateOrderRequest
  ): Promise<{ externalOrderId: string; status: string; estimatedDelivery?: Date }> {
    const body = {
      items: request.items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
      })),
      source: request.source ?? 'shine_beauty_crm',
      notes: request.notes,
    };

    const data = await this.fetch<ShineShopOrderResponse>(
      '/api/crm/orders',
      { method: 'POST', body: JSON.stringify(body) }
    );

    return {
      externalOrderId: data.id,
      status: data.status,
      estimatedDelivery: data.estimated_delivery
        ? new Date(data.estimated_delivery)
        : undefined,
    };
  }

  async getOrderStatus(externalOrderId: string): Promise<OrderStatusResponse> {
    const data = await this.fetch<ShineShopOrderStatusResponse>(
      `/api/crm/orders/${externalOrderId}/status`
    );

    return {
      externalOrderId: data.id,
      status: data.status,
      trackingNumber: data.tracking_number,
      trackingUrl: data.tracking_url,
      estimatedDelivery: data.estimated_delivery,
    };
  }

  async validateConfig(): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      await this.fetch<{ ok: boolean }>('/api/crm/ping');
      return { valid: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Невідома помилка з\'єднання';
      return { valid: false, errors: [message] };
    }
  }
}
