import { z } from 'zod';

// ─── Categories ──────────────────────────────────────────────────────────────

export const INVENTORY_CATEGORIES = [
  { value: 'bases', label: 'Бази' },
  { value: 'gels', label: 'Гелі' },
  { value: 'tops', label: 'Топи' },
  { value: 'colors', label: 'Фарби' },
  { value: 'tools', label: 'Інструменти' },
  { value: 'consumables', label: 'Витратники' },
  { value: 'sterilization', label: 'Стерилізація' },
  { value: 'hair', label: 'Волосся' },
  { value: 'other', label: 'Інше' },
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number]['value'];

// ─── Status ──────────────────────────────────────────────────────────────────

export type StockStatus = 'in_stock' | 'low' | 'out';

export function getStockStatus(quantity: number, minQuantity: number): StockStatus {
  if (quantity <= 0) return 'out';
  if (quantity <= minQuantity * 2) return 'low';
  return 'in_stock';
}

export const STOCK_STATUS_CONFIG: Record<
  StockStatus,
  { label: string; variant: 'success' | 'warning' | 'error'; emoji: string }
> = {
  in_stock: { label: 'В наявності', variant: 'success', emoji: '✅' },
  low: { label: 'Мало', variant: 'warning', emoji: '⚠️' },
  out: { label: 'Закінчився', variant: 'error', emoji: '🔴' },
};

// ─── Suppliers ───────────────────────────────────────────────────────────────

export const SUPPLIERS = [
  { value: 'Shine Shop', label: 'Shine Shop', isPartner: true },
  { value: 'DEZIK', label: 'DEZIK', isPartner: true },
] as const;

export function getSupplierOrderUrl(
  supplier: string | null,
  supplierUrl: string | null,
  productName: string,
  salonSlug = 'default'
): string | null {
  if (supplier === 'Shine Shop') {
    return `https://shine-shop.com.ua/search?q=${encodeURIComponent(productName)}&utm_source=shine_crm&utm_medium=reorder&utm_campaign=${salonSlug}`;
  }
  if (supplierUrl) return supplierUrl;
  return null;
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const inventoryItemSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  brand_id: z.string().optional(),
  category: z.string().min(1, "Категорія обов'язкова"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  purchase_price: z.number().min(0, 'Ціна >= 0'),
  retail_price: z.number().min(0).optional(),
  quantity: z.number().min(0, 'Кількість >= 0'),
  min_quantity: z.number().min(0).optional(),
  unit: z.enum(['шт', 'мл', 'г', 'упак']),
  supplier: z.string().optional(),
  supplier_url: z.string().url().optional().or(z.literal('')),
  supplier_sku: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

export const inventoryTransactionSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(['purchase', 'usage', 'adjustment', 'return']),
  quantity: z.number().refine((v) => v !== 0, 'Кількість не може бути 0'),
  cost: z.number().optional(),
  notes: z.string().optional(),
  supplier: z.string().optional(),
});

export type InventoryTransactionFormData = z.infer<typeof inventoryTransactionSchema>;

export const inventoryBrandSchema = z.object({
  name: z.string().min(1),
  logo_url: z.string().optional(),
  website: z.string().optional(),
  is_partner: z.boolean().default(false),
});

export type InventoryBrandFormData = z.infer<typeof inventoryBrandSchema>;
