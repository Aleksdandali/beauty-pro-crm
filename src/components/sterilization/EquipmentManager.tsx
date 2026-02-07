'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassModal, GlassBadge } from '@/components/glass';
import { EQUIPMENT_TYPES } from '@/schemas/sterilization';
import type { SterilizationEquipment } from '@/lib/queries/sterilization';
import { useSalonId } from '@/components/providers/AuthProvider';

interface EquipmentManagerProps {
  equipment: SterilizationEquipment[];
}

export function EquipmentManager({ equipment }: EquipmentManagerProps) {
  const salonId = useSalonId();
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'autoclave' as string,
    brand: '',
    model: '',
    serial_number: '',
    certification_expires: '',
  });

  const handleSave = async () => {
    if (!form.name || !form.type) return;
    setSaving(true);
    try {
      const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
      const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from('sterilization_equipment').insert({
        salon_id: salonId,
        name: form.name,
        type: form.type,
        brand: form.brand || null,
        model: form.model || null,
        serial_number: form.serial_number || null,
        certification_expires_at: form.certification_expires || null,
      });

      setAddOpen(false);
      setForm({
        name: '',
        type: 'autoclave',
        brand: '',
        model: '',
        serial_number: '',
        certification_expires: '',
      });
      router.refresh();
    } catch (e) {
      console.error('Save equipment error:', e);
    }
    setSaving(false);
  };

  const now = new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-foreground text-sm font-semibold">{equipment.length} одиниць</p>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/20"
        >
          <Plus className="h-3.5 w-3.5" /> Додати
        </button>
      </div>

      {equipment.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
            <Settings className="h-7 w-7 text-violet-400" />
          </div>
          <p className="text-foreground font-semibold">Немає обладнання</p>
          <p className="text-muted-foreground mt-1 text-sm">Додайте автоклав або стерилізатор</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {equipment.map((eq) => {
            const certExpires = eq.certification_expires_at
              ? new Date(eq.certification_expires_at)
              : null;
            const certSoon = certExpires && certExpires.getTime() - now.getTime() < 30 * 86400000;
            const certExpired = certExpires && certExpires < now;
            const typeLabel = EQUIPMENT_TYPES.find((t) => t.value === eq.type)?.label ?? eq.type;

            return (
              <GlassCard key={eq.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-foreground font-semibold">{eq.name}</p>
                    <p className="text-muted-foreground text-xs">{typeLabel}</p>
                  </div>
                  <GlassBadge variant={eq.is_active ? 'success' : 'default'} size="sm">
                    {eq.is_active ? 'Активне' : 'Вимкнене'}
                  </GlassBadge>
                </div>

                <div className="text-muted-foreground space-y-1 text-xs">
                  {eq.brand && (
                    <p>
                      Бренд:{' '}
                      <span className="text-foreground">
                        {eq.brand} {eq.model}
                      </span>
                    </p>
                  )}
                  {eq.serial_number && (
                    <p>
                      Серійний №:{' '}
                      <span className="text-foreground font-mono">{eq.serial_number}</span>
                    </p>
                  )}
                  {certExpires && (
                    <p className="flex items-center gap-1">
                      Сертифікат до:
                      <span
                        className={cn(
                          'font-medium',
                          certExpired
                            ? 'text-rose-500'
                            : certSoon
                              ? 'text-amber-500'
                              : 'text-foreground'
                        )}
                      >
                        {certExpires.toLocaleDateString('uk-UA')}
                      </span>
                      {certExpired && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                      {certSoon && !certExpired && (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      )}
                    </p>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add Equipment Modal */}
      <GlassModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Нове обладнання"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Назва *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              placeholder="Autoclave Pro 22L"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Тип *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            >
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">Бренд</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">Модель</label>
              <input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Серійний номер
            </label>
            <input
              value={form.serial_number}
              onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Сертифікат діє до
            </label>
            <input
              type="date"
              value={form.certification_expires}
              onChange={(e) => setForm({ ...form, certification_expires: e.target.value })}
              className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.name}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50"
          >
            {saving ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </GlassModal>
    </div>
  );
}
