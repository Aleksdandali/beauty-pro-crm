'use client';

import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassModal } from '@/components/glass';
import { createClient } from '@/lib/supabase/client';
import { useSalonId } from '@/components/providers/AuthProvider';

interface InventoryTransactionModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentQuantity: number;
  unit: string;
  defaultType?: 'purchase' | 'usage' | 'adjustment';
  onCompleted?: () => void;
}

const TX_TYPES = [
  { value: 'purchase' as const, label: 'Прихід', icon: ArrowDownToLine, color: 'text-emerald-500' },
  { value: 'usage' as const, label: 'Списання', icon: ArrowUpFromLine, color: 'text-rose-500' },
  { value: 'adjustment' as const, label: 'Коригування', icon: RefreshCw, color: 'text-amber-500' },
];

export function InventoryTransactionModal({
  open,
  onClose,
  productId,
  productName,
  currentQuantity,
  unit,
  defaultType = 'purchase',
  onCompleted,
}: InventoryTransactionModalProps) {
  const salonId = useSalonId();
  const [type, setType] = useState<'purchase' | 'usage' | 'adjustment'>(defaultType);
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;

    setSubmitting(true);
    const supabase = createClient();

    const txQuantity = type === 'usage' ? -qty : qty;
    const newQuantity = currentQuantity + txQuantity;

    // Create transaction
    await supabase.from('inventory_transactions').insert({
      salon_id: salonId,
      product_id: productId,
      type,
      quantity: txQuantity,
      cost: cost ? parseFloat(cost) : null,
      supplier: supplier || null,
      notes: notes || null,
    });

    // Update product quantity
    await supabase
      .from('inventory_items')
      .update({ quantity: Math.max(0, newQuantity), updated_at: new Date().toISOString() })
      .eq('id', productId);

    setSubmitting(false);
    setQuantity('');
    setCost('');
    setSupplier('');
    setNotes('');
    onClose();
    onCompleted?.();
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Рух товару" size="md">
      <div className="space-y-4">
        {/* Product name */}
        <div className="rounded-lg bg-[var(--glass-bg)] p-3">
          <p className="text-foreground text-sm font-medium">{productName}</p>
          <p className="text-muted-foreground text-xs">
            Залишок: {currentQuantity} {unit}
          </p>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-2">
          {TX_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
                  t.value === type
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]'
                )}
              >
                <Icon
                  className={cn('h-4 w-4', t.value === type ? t.color : 'text-muted-foreground')}
                />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Quantity */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Кількість ({unit})
          </label>
          <input
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
          />
        </div>

        {/* Cost (for purchase) */}
        {type === 'purchase' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Вартість, ₴
              </label>
              <input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Постачальник
              </label>
              <input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Shine Shop"
                className="text-foreground placeholder:text-muted-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">Коментар</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Замовлення #123..."
            className="text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
          />
        </div>

        {/* Preview */}
        {quantity && (
          <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-xs">
            <span className="text-muted-foreground">Після операції: </span>
            <span className="text-foreground font-mono font-bold">
              {Math.max(
                0,
                currentQuantity +
                  (type === 'usage' ? -parseFloat(quantity || '0') : parseFloat(quantity || '0'))
              )}{' '}
              {unit}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--glass-border)] pt-4">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium"
          >
            Скасувати
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !quantity || parseFloat(quantity) <= 0}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Зберегти
          </button>
        </div>
      </div>
    </GlassModal>
  );
}
