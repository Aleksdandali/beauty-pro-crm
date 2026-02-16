import type { SupplierType, SupplierCapability } from '@/types/supplier';

// ─── External Product ───────────────────────────────────────────────────────

export interface ExternalProduct {
  externalId: string;
  externalSku?: string;
  externalUrl?: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  price: number;
  priceOld?: number;
  currency: string;
  unit: string;
  volume?: number;
  inStock: boolean;
  stockQuantity?: number;
}

// ─── Order Types ────────────────────────────────────────────────────────────

export interface CreateOrderRequest {
  items: Array<{ productId: string; quantity: number }>;
  notes?: string;
  source?: string;
}

export interface OrderStatusResponse {
  externalOrderId: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

// ─── Sync & Price Types ─────────────────────────────────────────────────────

export interface PriceCheckResult {
  price: number;
  priceOld?: number;
  inStock: boolean;
}

export interface SyncResult {
  added: number;
  updated: number;
  removed: number;
}

// ─── Supplier Provider Interface ────────────────────────────────────────────

export interface SupplierProvider {
  readonly type: SupplierType;
  readonly capabilities: SupplierCapability[];

  searchProducts(query: string, options?: {
    category?: string;
    brand?: string;
    limit?: number;
    offset?: number;
  }): Promise<ExternalProduct[]>;

  getProduct(externalId: string): Promise<ExternalProduct | null>;

  syncCatalog(options?: {
    categories?: string[];
    onlyInStock?: boolean;
  }): Promise<SyncResult>;

  checkPrices(externalIds: string[]): Promise<Map<string, PriceCheckResult>>;

  createOrder(request: CreateOrderRequest): Promise<{
    externalOrderId: string;
    status: string;
    estimatedDelivery?: Date;
  }>;

  getOrderStatus(externalOrderId: string): Promise<OrderStatusResponse>;

  validateConfig(config: Record<string, unknown>): Promise<{
    valid: boolean;
    errors?: string[];
  }>;
}
