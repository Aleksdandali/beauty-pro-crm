import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const SupplierTypeEnum = z.enum(['shine_shop', 'prom_ua', 'rozetka', 'api', 'manual']);
export const SupplierCapabilityEnum = z.enum(['catalog_sync', 'price_sync', 'stock_check', 'auto_order', 'order_tracking']);
export const OrderStatusEnum = z.enum(['draft', 'pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled']);
export const SyncTypeEnum = z.enum(['catalog', 'prices', 'stock', 'order_status']);
export const SyncStatusEnum = z.enum(['never', 'syncing', 'success', 'error']);

// ─── SupplierSchema — for create/edit ────────────────────────────────────────

export const SupplierSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Тільки малі літери, цифри та дефіси'),
  type: SupplierTypeEnum,
  logo_url: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  manager_name: z.string().optional(),
  api_config: z.record(z.string(), z.unknown()).optional().default({}),
  capabilities: z.array(SupplierCapabilityEnum).optional().default([]),
  is_active: z.boolean().optional().default(true),
  min_order_amount: z.number().min(0).optional(),
  delivery_days: z.number().int().min(0).optional(),
  payment_terms: z.string().optional(),
  discount_percent: z.number().min(0).max(100).optional(),
});

export type SupplierFormData = z.infer<typeof SupplierSchema>;

// ─── SupplierProductSchema ───────────────────────────────────────────────────

export const SupplierProductSchema = z.object({
  supplier_id: z.string().uuid(),
  inventory_item_id: z.string().uuid().optional().nullable(),
  external_id: z.string().min(1),
  external_sku: z.string().optional(),
  external_url: z.string().url().optional().or(z.literal('')),
  name: z.string().min(1),
  brand: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  price: z.number().min(0),
  price_old: z.number().min(0).optional().nullable(),
  currency: z.string().default('UAH'),
  unit: z.string().default('шт'),
  volume: z.number().optional().nullable(),
  in_stock: z.boolean().default(true),
  stock_quantity: z.number().int().optional().nullable(),
});

// ─── SupplierOrderCreateSchema ───────────────────────────────────────────────

export const SupplierOrderCreateSchema = z.object({
  supplier_id: z.string().uuid(),
  status: OrderStatusEnum.optional().default('draft'),
  notes: z.string().optional(),
  items: z.array(z.object({
    supplier_product_id: z.string().uuid(),
    inventory_item_id: z.string().uuid().optional().nullable(),
    quantity: z.number().int().min(1, 'Мінімум 1'),
    price_per_unit: z.number().min(0),
  })).min(1, 'Додайте хоча б один товар'),
});

export type SupplierOrderCreateData = z.infer<typeof SupplierOrderCreateSchema>;

// ─── AutoOrderRuleSchema ─────────────────────────────────────────────────────

export const AutoOrderRuleSchema = z.object({
  supplier_product_id: z.string().uuid(),
  inventory_item_id: z.string().uuid(),
  is_enabled: z.boolean().default(true),
  min_stock_threshold: z.number().int().min(1, 'Мінімум 1'),
  reorder_quantity: z.number().int().min(1, 'Мінімум 1'),
  max_price: z.number().min(0).optional().nullable(),
});

export type AutoOrderRuleFormData = z.infer<typeof AutoOrderRuleSchema>;

// ─── ReceiveOrderItemsSchema ─────────────────────────────────────────────────

export const ReceiveOrderItemsSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity_received: z.number().int().min(0),
  })).min(1),
});
