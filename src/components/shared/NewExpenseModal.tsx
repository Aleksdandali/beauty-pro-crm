'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassModal } from '@/components/glass';
import { EXPENSE_CATEGORIES } from '@/schemas/finance';
import { useSalonId } from '@/components/providers/AuthProvider';

interface NewExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewExpenseModal({ open, onClose }: NewExpenseModalProps) {
  const salonId = useSalonId();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]!,
    is_recurring: false,
    recurring_period: 'monthly',
  });

  const handleSave = async () => {
    if (!form.category || !form.amount) return;
    setSaving(true);
    try {
      const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
      const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, key);

      const { error } = await supabase.from('expenses').insert({
        salon_id: salonId,
        category: form.category,
        amount: Number(form.amount),
        description: form.description || null,
        date: form.date,
        is_recurring: form.is_recurring,
        recurring_period: form.is_recurring ? form.recurring_period : null,
      });

      if (error) {
        console.error('[EXPENSE] Insert error:', error.message);
      } else {
        setForm({
          category: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0]!,
          is_recurring: false,
          recurring_period: 'monthly',
        });
        onClose();
        router.refresh();
      }
    } catch (e) {
      console.error('[EXPENSE] Error:', e);
    }
    setSaving(false);
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Нова витрата" size="md">
      <div className="space-y-4">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Категорія *
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            style={{ fontSize: '16px' }}
          >
            <option value="">Оберіть категорію</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">Сума (₴) *</label>
          <input
            type="number"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            style={{ fontSize: '16px' }}
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">Опис</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Деталі витрати..."
            className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">Дата *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
              className="peer sr-only"
            />
            <div className="peer h-5 w-9 rounded-full bg-[var(--glass-border)] peer-checked:bg-violet-500 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
          </label>
          <span className="text-foreground text-sm">Повторювана витрата</span>
        </div>

        {form.is_recurring && (
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Період</label>
            <select
              value={form.recurring_period}
              onChange={(e) => setForm({ ...form, recurring_period: e.target.value })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            >
              <option value="weekly">Щотижня</option>
              <option value="monthly">Щомісяця</option>
            </select>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !form.category || !form.amount}
          className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50"
        >
          {saving ? 'Збереження...' : 'Додати витрату'}
        </button>
      </div>
    </GlassModal>
  );
}
