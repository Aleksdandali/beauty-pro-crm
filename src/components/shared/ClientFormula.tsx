'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FlaskConical, AlertTriangle, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass';
import { createClient } from '@/lib/supabase/client';
import { NAIL_PLATE_OPTIONS, DEVELOPER_OPTIONS } from '@/schemas/client';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NailFormula {
  base?: string;
  color?: string;
  top?: string;
  design?: string;
  nail_plate?: string;
  notes?: string;
}

interface HairFormula {
  color_formula?: string;
  developer?: string;
  brand?: string;
  time_minutes?: number;
  notes?: string;
}

interface Formulas {
  nail?: NailFormula;
  hair?: HairFormula;
  allergies?: string[];
  preferences?: string;
  [key: string]: unknown;
}

interface ClientFormulaProps {
  clientId: string;
  formulas: Formulas;
  readOnly?: boolean;
  compact?: boolean;
  onSave?: (formulas: Formulas) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ClientFormula({
  clientId,
  formulas: initialFormulas,
  readOnly = false,
  compact = false,
  onSave,
}: ClientFormulaProps) {
  const [formulas, setFormulas] = useState<Formulas>(initialFormulas);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [allergyInput, setAllergyInput] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-save with debounce
  const save = useCallback(
    async (data: Formulas) => {
      if (readOnly) return;
      setSaving(true);
      setSaved(false);

      const supabase = createClient();
      const { error } = await supabase
        .from('clients')
        .update({ formulas: data })
        .eq('id', clientId);

      setSaving(false);
      if (!error) {
        setSaved(true);
        onSave?.(data);
        setTimeout(() => setSaved(false), 2000);
      }
    },
    [clientId, readOnly, onSave]
  );

  const updateFormulas = useCallback(
    (updater: (prev: Formulas) => Formulas) => {
      setFormulas((prev) => {
        const next = updater(prev);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => save(next), 1000);
        return next;
      });
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Field updater helpers ────────────────────────────────
  const updateNail = (field: keyof NailFormula, value: string) => {
    updateFormulas((prev) => ({
      ...prev,
      nail: { ...prev.nail, [field]: value },
    }));
  };

  const updateHair = (field: keyof HairFormula, value: string | number) => {
    updateFormulas((prev) => ({
      ...prev,
      hair: { ...prev.hair, [field]: value },
    }));
  };

  const addAllergy = () => {
    const trimmed = allergyInput.trim();
    if (!trimmed) return;
    updateFormulas((prev) => ({
      ...prev,
      allergies: [...(prev.allergies ?? []), trimmed],
    }));
    setAllergyInput('');
  };

  const removeAllergy = (idx: number) => {
    updateFormulas((prev) => ({
      ...prev,
      allergies: (prev.allergies ?? []).filter((_, i) => i !== idx),
    }));
  };

  const allergies = formulas.allergies ?? [];

  return (
    <div className={cn('space-y-6', compact && 'space-y-4')}>
      {/* Save indicator */}
      {!readOnly && (
        <div className="flex items-center gap-2 text-xs">
          {saving && (
            <>
              <Loader2 className="text-primary h-3 w-3 animate-spin" />
              <span className="text-muted-foreground">Збереження...</span>
            </>
          )}
          {saved && (
            <>
              <Check className="text-success h-3 w-3" />
              <span className="text-success">Збережено</span>
            </>
          )}
        </div>
      )}

      {/* ── Nail Section ──────────────────────────────────── */}
      <GlassCard padding={compact ? 'sm' : 'md'}>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="bg-primary-light flex h-8 w-8 items-center justify-center rounded-lg">
            <FlaskConical className="text-primary h-4 w-4" />
          </div>
          <h3 className="text-foreground text-sm font-semibold">Нігті</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormulaField
            label="База"
            placeholder="KODI Base Extra"
            value={formulas.nail?.base ?? ''}
            onChange={(v) => updateNail('base', v)}
            readOnly={readOnly}
          />
          <FormulaField
            label="Колір"
            placeholder="Komilfo 045"
            value={formulas.nail?.color ?? ''}
            onChange={(v) => updateNail('color', v)}
            readOnly={readOnly}
          />
          <FormulaField
            label="Топ"
            placeholder="Матовий топ OXXI"
            value={formulas.nail?.top ?? ''}
            onChange={(v) => updateNail('top', v)}
            readOnly={readOnly}
          />
          <FormulaField
            label="Дизайн"
            placeholder="Френч класичний"
            value={formulas.nail?.design ?? ''}
            onChange={(v) => updateNail('design', v)}
            readOnly={readOnly}
          />
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Нігтьова пластина
            </label>
            {readOnly ? (
              <p className="text-foreground text-sm">
                {NAIL_PLATE_OPTIONS.find((o) => o.value === formulas.nail?.nail_plate)?.label ??
                  'Не вказано'}
              </p>
            ) : (
              <select
                value={formulas.nail?.nail_plate ?? ''}
                onChange={(e) => updateNail('nail_plate', e.target.value)}
                className="text-foreground h-9 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
              >
                {NAIL_PLATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <FormulaField
            label="Особливості"
            placeholder="Алергія на..., швидко сохне..."
            value={formulas.nail?.notes ?? ''}
            onChange={(v) => updateNail('notes', v)}
            readOnly={readOnly}
            multiline
          />
        </div>
      </GlassCard>

      {/* ── Hair Section ──────────────────────────────────── */}
      <GlassCard padding={compact ? 'sm' : 'md'}>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="bg-info-light flex h-8 w-8 items-center justify-center rounded-lg">
            <FlaskConical className="text-info h-4 w-4" />
          </div>
          <h3 className="text-foreground text-sm font-semibold">Волосся</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormulaField
            label="Формула фарбування"
            placeholder="6/1 + 7/44"
            value={formulas.hair?.color_formula ?? ''}
            onChange={(v) => updateHair('color_formula', v)}
            readOnly={readOnly}
          />
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">Оксид</label>
            {readOnly ? (
              <p className="text-foreground text-sm">{formulas.hair?.developer || 'Не вказано'}</p>
            ) : (
              <select
                value={formulas.hair?.developer ?? ''}
                onChange={(e) => updateHair('developer', e.target.value)}
                className="text-foreground h-9 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
              >
                {DEVELOPER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <FormulaField
            label="Бренд"
            placeholder="Wella Koleston"
            value={formulas.hair?.brand ?? ''}
            onChange={(v) => updateHair('brand', v)}
            readOnly={readOnly}
          />
          <FormulaField
            label="Час витримки (хв)"
            placeholder="30"
            value={String(formulas.hair?.time_minutes ?? '')}
            onChange={(v) => updateHair('time_minutes', v ? Number(v) : 0)}
            readOnly={readOnly}
            type="number"
          />
          <FormulaField
            label="Особливості"
            placeholder="Сухе волосся, потребує додаткового зволоження..."
            value={formulas.hair?.notes ?? ''}
            onChange={(v) => updateHair('notes', v)}
            readOnly={readOnly}
            multiline
            className="sm:col-span-2"
          />
        </div>
      </GlassCard>

      {/* ── Allergies ─────────────────────────────────────── */}
      <GlassCard padding={compact ? 'sm' : 'md'}>
        <div className="mb-4 flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              allergies.length > 0 ? 'bg-error-light' : 'bg-warning-light'
            )}
          >
            <AlertTriangle
              className={cn('h-4 w-4', allergies.length > 0 ? 'text-error' : 'text-warning')}
            />
          </div>
          <h3 className="text-foreground text-sm font-semibold">Алергії та протипоказання</h3>
        </div>

        {/* Allergy tags */}
        {allergies.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {allergies.map((allergy, idx) => (
              <span
                key={idx}
                className="bg-error-light text-error inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              >
                {allergy}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeAllergy(idx)}
                    className="hover:bg-error/20 -mr-1 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Add allergy input */}
        {!readOnly && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Додати алергію..."
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAllergy();
                }
              }}
              className="text-foreground placeholder:text-muted-foreground h-9 flex-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
            />
            <button
              type="button"
              onClick={addAllergy}
              disabled={!allergyInput.trim()}
              className="text-primary hover:bg-primary/5 border-primary/30 rounded-lg border px-3 text-sm font-medium transition-colors disabled:opacity-40"
            >
              Додати
            </button>
          </div>
        )}

        {allergies.length === 0 && readOnly && (
          <p className="text-muted-foreground text-sm">Алергій не зазначено</p>
        )}
      </GlassCard>

      {/* ── Preferences ───────────────────────────────────── */}
      <GlassCard padding={compact ? 'sm' : 'md'}>
        <h3 className="text-foreground mb-3 text-sm font-semibold">Уподобання</h3>
        {readOnly ? (
          <p className="text-muted-foreground text-sm">{formulas.preferences || 'Не зазначено'}</p>
        ) : (
          <textarea
            placeholder="Любить мінімалізм, не любить стрази, завжди просить..."
            value={formulas.preferences ?? ''}
            onChange={(e) =>
              updateFormulas((prev) => ({
                ...prev,
                preferences: e.target.value,
              }))
            }
            rows={3}
            className="text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
          />
        )}
      </GlassCard>
    </div>
  );
}

// ─── Formula Field ───────────────────────────────────────────────────────────

function FormulaField({
  label,
  placeholder,
  value,
  onChange,
  readOnly,
  multiline,
  type = 'text',
  className,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  multiline?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-muted-foreground mb-1.5 block text-xs font-medium">{label}</label>
      {readOnly ? (
        <p className="text-foreground text-sm">{value || 'Не вказано'}</p>
      ) : multiline ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-foreground placeholder:text-muted-foreground h-9 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
        />
      )}
    </div>
  );
}
