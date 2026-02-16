// ─── Literal Unions ──────────────────────────────────────────────────────────

export type SupplierType = 'shine_shop' | 'prom_ua' | 'rozetka' | 'api' | 'manual';
export type SupplierCapability = 'catalog_sync' | 'price_sync' | 'stock_check' | 'auto_order' | 'order_tracking';
export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
export type SyncType = 'catalog' | 'prices' | 'stock' | 'order_status';
export type SyncStatus = 'never' | 'syncing' | 'success' | 'error';

// ─── Database Row Types ──────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  salon_id: string;
  name: string;
  slug: string;
  type: SupplierType;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  api_config: Record<string, unknown>;
  capabilities: SupplierCapability[];
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: SyncStatus;
  sync_error: string | null;
  min_order_amount: number | null;
  delivery_days: number | null;
  payment_terms: string | null;
  discount_percent: number | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  salon_id: string;
  supplier_id: string;
  inventory_item_id: string | null;
  external_id: string;
  external_sku: string | null;
  external_url: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  price: number;
  price_old: number | null;
  currency: string;
  unit: string;
  volume: number | null;
  in_stock: boolean;
  stock_quantity: number | null;
  last_synced_at: string;
  price_changed_at: string | null;
  is_discontinued: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierOrder {
  id: string;
  salon_id: string;
  supplier_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  delivery_cost: number;
  total: number;
  notes: string | null;
  external_order_id: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  ordered_at: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  expected_delivery_at: string | null;
  is_auto_generated: boolean;
  auto_order_trigger: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierOrderItem {
  id: string;
  order_id: string;
  supplier_product_id: string;
  inventory_item_id: string | null;
  quantity: number;
  price_per_unit: number;
  total: number;
  quantity_received: number;
  received_at: string | null;
  inventory_transaction_id: string | null;
  created_at: string;
}

export interface AutoOrderRule {
  id: string;
  salon_id: string;
  supplier_product_id: string;
  inventory_item_id: string;
  is_enabled: boolean;
  min_stock_threshold: number;
  reorder_quantity: number;
  max_price: number | null;
  last_triggered_at: string | null;
  last_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierSyncLog {
  id: string;
  salon_id: string;
  supplier_id: string;
  sync_type: SyncType;
  status: 'started' | 'completed' | 'failed';
  items_synced: number;
  items_updated: number;
  items_added: number;
  error_message: string | null;
  duration_ms: number | null;
  started_at: string;
  completed_at: string | null;
}

// ─── Extended Types ──────────────────────────────────────────────────────────

export interface SupplierWithStats extends Supplier {
  products_count: number;
  orders_count: number;
}

export interface SupplierOrderWithItems extends SupplierOrder {
  items: (SupplierOrderItem & {
    supplier_product?: SupplierProduct;
    inventory_item?: { id: string; name: string; quantity: number } | null;
  })[];
  supplier?: Supplier;
}

export interface SupplierProductWithMapping extends SupplierProduct {
  inventory_item?: { id: string; name: string; quantity: number; min_quantity: number } | null;
}

export interface AutoOrderRuleWithDetails extends AutoOrderRule {
  supplier_product?: SupplierProduct;
  inventory_item?: { id: string; name: string; quantity: number; min_quantity: number };
}
