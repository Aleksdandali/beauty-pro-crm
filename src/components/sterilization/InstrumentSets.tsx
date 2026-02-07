'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Layers, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassModal, GlassBadge } from '@/components/glass';
import { INSTRUMENT_CATEGORIES } from '@/schemas/sterilization';
import type { InstrumentSet } from '@/lib/queries/sterilization';
import { useSalonId } from '@/components/providers/AuthProvider';

interface InstrumentSetsProps {
  sets: InstrumentSet[];
}

export function InstrumentSets({ sets }: InstrumentSetsProps) {
  const salonId = useSalonId();
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'manicure',
    instruments: [] as string[],
    newInstrument: '',
  });

  const addInstrument = () => {
    const val = form.newInstrument.trim();
    if (!val) return;
    setForm({ ...form, instruments: [...form.instruments, val], newInstrument: '' });
  };

  const removeInstrument = (idx: number) => {
    setForm({ ...form, instruments: form.instruments.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!form.name || form.instruments.length === 0) return;
    setSaving(true);
    try {
      const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
      const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from('sterilization_instrument_sets').insert({
        salon_id: salonId,
        name: form.name,
        category: form.category,
        instruments: JSON.stringify(form.instruments),
      });

      setAddOpen(false);
      setForm({ name: '', category: 'manicure', instruments: [], newInstrument: '' });
      router.refresh();
    } catch (e) {
      console.error('Save set error:', e);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-foreground text-sm font-semibold">{sets.length} наборів</p>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/20"
        >
          <Plus className="h-3.5 w-3.5" /> Новий набір
        </button>
      </div>

      {sets.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
            <Layers className="h-7 w-7 text-violet-400" />
          </div>
          <p className="text-foreground font-semibold">Немає наборів</p>
          <p className="text-muted-foreground mt-1 text-sm">Створіть набір інструментів</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sets.map((s) => {
            const catLabel =
              INSTRUMENT_CATEGORIES.find((c) => c.value === s.category)?.label ?? s.category;
            return (
              <GlassCard key={s.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <p className="text-foreground font-semibold">{s.name}</p>
                  <GlassBadge variant="primary" size="sm">
                    {catLabel}
                  </GlassBadge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.instruments.map((instr, i) => (
                    <span
                      key={i}
                      className="text-muted-foreground rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-0.5 text-xs"
                    >
                      {instr}
                    </span>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add Set Modal */}
      <GlassModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Новий набір інструментів"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Назва набору *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              placeholder="Манікюрний базовий"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Категорія
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            >
              {INSTRUMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Інструменти *
            </label>
            <div className="flex gap-2">
              <input
                value={form.newInstrument}
                onChange={(e) => setForm({ ...form, newInstrument: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInstrument())}
                className="text-foreground flex-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
                placeholder="Назва інструменту"
              />
              <button
                onClick={addInstrument}
                className="text-foreground rounded-lg border border-[var(--glass-border)] px-3 py-2 text-sm hover:bg-[var(--glass-bg-hover)]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {form.instruments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.instruments.map((instr, i) => (
                  <span
                    key={i}
                    className="text-muted-foreground inline-flex items-center gap-1 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-0.5 text-xs"
                  >
                    {instr}
                    <button onClick={() => removeInstrument(i)} className="hover:text-rose-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.name || form.instruments.length === 0}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50"
          >
            {saving ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </GlassModal>
    </div>
  );
}
