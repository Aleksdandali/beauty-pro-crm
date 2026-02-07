'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Loader2 } from 'lucide-react';
import { GlassModal } from '@/components/glass';
import { createClient } from '@/lib/supabase/client';
import { inventoryItemSchema, INVENTORY_CATEGORIES } from '@/schemas/inventory';
import type { InventoryBrand } from '@/lib/queries/inventory';
import { useSalonId } from '@/components/providers/AuthProvider';

interface NewInventoryItemModalProps {
  open: boolean;
  onClose: () => void;
  brands: InventoryBrand[];
  onCreated?: () => void;
}

export function NewInventoryItemModal({
  open,
  onClose,
  brands,
  onCreated,
}: NewInventoryItemModalProps) {
  const salonId = useSalonId();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: '',
      category: 'other',
      purchase_price: 0,
      retail_price: 0,
      quantity: 0,
      min_quantity: 0,
      unit: 'шт' as const,
      supplier: '',
      supplier_url: '',
      supplier_sku: '',
      image_url: '',
      sku: '',
      barcode: '',
      brand_id: '',
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    const supabase = createClient();

    const insert: Record<string, unknown> = {
      salon_id: salonId,
      name: data.name,
      category: data.category,
      purchase_price: data.purchase_price,
      retail_price: (data.retail_price as number) || 0,
      quantity: data.quantity,
      min_quantity: (data.min_quantity as number) || 0,
      unit: data.unit,
      sku: (data.sku as string) || null,
      barcode: (data.barcode as string) || null,
      brand_id: (data.brand_id as string) || null,
      supplier: (data.supplier as string) || null,
      supplier_url: (data.supplier_url as string) || null,
      supplier_sku: (data.supplier_sku as string) || null,
      image_url: (data.image_url as string) || null,
    };

    const { error } = await supabase.from('inventory_items').insert(insert);
    setSubmitting(false);

    if (!error) {
      reset();
      onClose();
      onCreated?.();
    }
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Новий товар" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">Назва *</label>
          <input
            {...register('name')}
            placeholder="KODI Base Extra"
            className="text-foreground placeholder:text-muted-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
        </div>

        {/* Category + Brand */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Категорія *
            </label>
            <select
              {...register('category')}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            >
              {INVENTORY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Бренд</label>
            <select
              {...register('brand_id')}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            >
              <option value="">— Без бренду —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Ціна закупки, ₴ *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('purchase_price', { valueAsNumber: true })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Ціна продажу, ₴
            </label>
            <input
              type="number"
              step="0.01"
              {...register('retail_price', { valueAsNumber: true })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Quantity + Min + Unit */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Кількість *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('quantity', { valueAsNumber: true })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Мін. залишок
            </label>
            <input
              type="number"
              step="0.01"
              {...register('min_quantity', { valueAsNumber: true })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Одиниці</label>
            <select
              {...register('unit')}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            >
              <option value="шт">шт</option>
              <option value="мл">мл</option>
              <option value="г">г</option>
              <option value="упак">упак</option>
            </select>
          </div>
        </div>

        {/* Supplier */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Постачальник
            </label>
            <input
              {...register('supplier')}
              placeholder="Shine Shop"
              className="text-foreground placeholder:text-muted-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">SKU</label>
            <input
              {...register('sku')}
              placeholder="KODI-BASE-12ML"
              className="text-foreground placeholder:text-muted-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--glass-border)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Package className="h-4 w-4" />
            )}
            Додати товар
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
