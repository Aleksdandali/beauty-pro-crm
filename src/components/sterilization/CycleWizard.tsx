'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
  ChevronRight,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Droplets,
  Microscope,
  Thermometer,
  Package,
  FileCheck,
  Wind,
  Clock,
  Plus,
  Trash2,
  QrCode,
  Download,
  Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassBadge } from '@/components/glass';
import { CycleTimer } from './CycleTimer';
import { PhotoCapture } from './PhotoCapture';
import {
  DISINFECTION_SOLUTIONS,
  PSO_METHODS,
  STERILIZATION_MODES,
  PACKAGING_TYPES,
  DRYING_METHODS,
  CYCLE_STAGES,
  type CycleAction,
} from '@/schemas/sterilization';
import type {
  SterilizationEquipment,
  InstrumentSet,
  SterilizationCycle,
  SterilizationPackage,
} from '@/lib/queries/sterilization';
import { useSalonId } from '@/components/providers/AuthProvider';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CycleWizardProps {
  equipment: SterilizationEquipment[];
  instrumentSets: InstrumentSet[];
  staff: { id: string; first_name: string; last_name: string }[];
  /** Active cycle to resume (if any) — null means start fresh */
  activeCycle?: SterilizationCycle | null;
}

interface WizardPackage {
  mode: 'set' | 'custom';
  setId: string;
  customInstruments: string[];
  packaging: string;
}

interface CycleState {
  id: string | null;
  step: number;
  equipmentId: string;
  packages: WizardPackage[];
  operatorId: string;
  photosBefore: string[];
  photosAfter: string[];
  preparationNotes: string;
  // Disinfection
  solution: string;
  concentration: string;
  disinfectionDuration: number;
  disinfectionRunning: boolean;
  disinfectionDone: boolean;
  // PSO
  psoMethod: string;
  psoRunning: boolean;
  psoDone: boolean;
  azopyramineResult: 'positive' | 'negative' | '';
  azopyraminePhoto: string[];
  // Drying
  dryingMethod: string;
  dryingDone: boolean;
  // Sterilization
  sterilizationMode: string;
  sterilizationTemp: number;
  sterilizationPressure: number;
  sterilizationDuration: number;
  sterilizationRunning: boolean;
  sterilizationDone: boolean;
  chemicalIndicator: 'passed' | 'failed' | '';
  chemicalIndicatorPhoto: string[];
  // Packaging
  packagingType: string;
  packagingPhoto: string[];
  // Result
  result: 'success' | 'failed' | 'partial' | '';
  resultNotes: string;
  isLocked: boolean;
  // Server timestamps (for display)
  timestamps: CycleTimestamps;
}

interface CycleTimestamps {
  started_at: string | null;
  disinfection_started_at: string | null;
  disinfection_completed_at: string | null;
  pso_started_at: string | null;
  pso_completed_at: string | null;
  drying_started_at: string | null;
  drying_completed_at: string | null;
  sterilization_started_at: string | null;
  sterilization_completed_at: string | null;
  completed_at: string | null;
}

const emptyTimestamps: CycleTimestamps = {
  started_at: null,
  disinfection_started_at: null,
  disinfection_completed_at: null,
  pso_started_at: null,
  pso_completed_at: null,
  drying_started_at: null,
  drying_completed_at: null,
  sterilization_started_at: null,
  sterilization_completed_at: null,
  completed_at: null,
};

const initialState: CycleState = {
  id: null,
  step: 0,
  equipmentId: '',
  packages: [{ mode: 'set', setId: '', customInstruments: [], packaging: 'kraft' }],
  operatorId: '',
  photosBefore: [],
  photosAfter: [],
  preparationNotes: '',
  solution: '',
  concentration: '',
  disinfectionDuration: 30,
  disinfectionRunning: false,
  disinfectionDone: false,
  psoMethod: '',
  psoRunning: false,
  psoDone: false,
  azopyramineResult: '',
  azopyraminePhoto: [],
  dryingMethod: '',
  dryingDone: false,
  sterilizationMode: '',
  sterilizationTemp: 0,
  sterilizationPressure: 0,
  sterilizationDuration: 0,
  sterilizationRunning: false,
  sterilizationDone: false,
  chemicalIndicator: '',
  chemicalIndicatorPhoto: [],
  packagingType: '',
  packagingPhoto: [],
  result: '',
  resultNotes: '',
  isLocked: false,
  timestamps: emptyTimestamps,
};

// ─── Stage → step index mapping ──────────────────────────────────────────────

const STAGE_TO_STEP: Record<string, number> = {
  preparation: 0,
  disinfection: 1,
  pso: 2,
  drying: 3,
  sterilization: 4,
  packaging: 5,
  completed: 6,
};

// ─── Step validation ─────────────────────────────────────────────────────────

function isStepComplete(step: number, state: CycleState): boolean {
  switch (step) {
    case 0:
      return (
        !!state.equipmentId &&
        state.packages.length > 0 &&
        state.packages.every(
          (p) => p.packaging && (p.mode === 'set' ? !!p.setId : p.customInstruments.length > 0)
        )
      );
    case 1:
      return state.disinfectionDone;
    case 2:
      return state.psoDone && !!state.azopyramineResult;
    case 3:
      return state.dryingDone;
    case 4:
      return state.sterilizationDone && !!state.chemicalIndicator;
    case 5:
      return !!state.packagingType;
    case 6:
      return !!state.result;
    default:
      return false;
  }
}

// ─── Step icons ──────────────────────────────────────────────────────────────

const STEP_ICONS = [
  CheckCircle2, // Preparation
  Droplets, // Disinfection
  Microscope, // PSO
  Wind, // Drying
  Thermometer, // Sterilization
  Package, // Packaging
  FileCheck, // Result
];

// ─── Restore packages from active cycle ─────────────────────────────────────

function restorePackages(cycle: SterilizationCycle): WizardPackage[] {
  if (cycle.packages && cycle.packages.length > 0) {
    return cycle.packages.map((p) => {
      if (p.set_id) {
        return {
          mode: 'set' as const,
          setId: p.set_id,
          customInstruments: [],
          packaging: p.packaging,
        };
      }
      return {
        mode: 'custom' as const,
        setId: '',
        customInstruments: p.instruments ?? [],
        packaging: p.packaging,
      };
    });
  }
  // Fallback: old-style single instrument_set_id
  if (cycle.instrument_set?.id) {
    return [
      {
        mode: 'set' as const,
        setId: cycle.instrument_set.id,
        customInstruments: [],
        packaging: cycle.packaging_type ?? 'kraft',
      },
    ];
  }
  return [{ mode: 'set' as const, setId: '', customInstruments: [], packaging: 'kraft' }];
}

// ─── All unique instruments from sets (for custom picker) ───────────────────

function getAllInstruments(sets: InstrumentSet[]): string[] {
  const all = new Set<string>();
  for (const s of sets) {
    for (const i of s.instruments) all.add(i);
  }
  return Array.from(all).sort();
}

// ─── Time formatting helpers ─────────────────────────────────────────────────

function fmtTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

function fmtDuration(start: string | null, end: string | null): string {
  if (!start || !end) return '';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(ms / 60000);
  return `${mins} хв`;
}

function StepTimeInfo({ start, end }: { start: string | null; end: string | null }) {
  if (!start) return null;
  if (end) {
    return (
      <span className="text-muted-foreground ml-1 inline-flex items-center gap-1 text-[10px] font-normal">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        {fmtTime(start)}&ndash;{fmtTime(end)} ({fmtDuration(start, end)})
      </span>
    );
  }
  return (
    <span className="text-muted-foreground ml-1 inline-flex items-center gap-1 text-[10px] font-normal">
      <Clock className="h-3 w-3 text-violet-400" />
      {fmtTime(start)}
    </span>
  );
}

// ─── Get timestamp pair for a step ───────────────────────────────────────────

function getStepTimestamps(
  step: number,
  ts: CycleTimestamps
): { start: string | null; end: string | null } {
  switch (step) {
    case 0:
      return { start: ts.started_at, end: ts.started_at };
    case 1:
      return { start: ts.disinfection_started_at, end: ts.disinfection_completed_at };
    case 2:
      return { start: ts.pso_started_at, end: ts.pso_completed_at };
    case 3:
      return { start: ts.drying_started_at, end: ts.drying_completed_at };
    case 4:
      return { start: ts.sterilization_started_at, end: ts.sterilization_completed_at };
    case 5:
      return { start: ts.completed_at, end: ts.completed_at };
    case 6:
      return { start: ts.completed_at, end: null };
    default:
      return { start: null, end: null };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CycleWizard({ equipment, instrumentSets, staff, activeCycle }: CycleWizardProps) {
  const salonId = useSalonId();
  const router = useRouter();
  const [state, setState] = useState<CycleState>(initialState);
  const [saving, setSaving] = useState(false);

  const update = (partial: Partial<CycleState>) => setState((s) => ({ ...s, ...partial }));

  // ─── Recovery: restore from active cycle ───────────────────────────
  useEffect(() => {
    if (activeCycle && !state.id) {
      const resumeStep = STAGE_TO_STEP[activeCycle.stage] ?? 0;
      // Derive sterilization duration from mode or DB value
      let sterDuration = activeCycle.sterilization_time_minutes ?? 0;
      if (!sterDuration && activeCycle.sterilization_mode) {
        const mode = STERILIZATION_MODES.find((m) => m.value === activeCycle.sterilization_mode);
        if (mode) sterDuration = mode.duration;
      }
      update({
        id: activeCycle.id,
        step: resumeStep,
        equipmentId: activeCycle.equipment?.id ?? '',
        packages: restorePackages(activeCycle),
        operatorId: activeCycle.operator?.id ?? '',
        photosBefore: activeCycle.photos_before ?? [],
        preparationNotes: activeCycle.preparation_notes ?? '',
        disinfectionDone: !!activeCycle.disinfection_completed_at,
        solution: activeCycle.disinfection_solution ?? '',
        concentration: activeCycle.disinfection_concentration ?? '',
        psoDone: !!activeCycle.pso_completed_at,
        psoMethod: activeCycle.pso_method ?? '',
        azopyramineResult: (activeCycle.azopyramine_test as 'positive' | 'negative' | '') ?? '',
        dryingDone: !!activeCycle.drying_completed_at,
        dryingMethod: activeCycle.drying_method ?? '',
        sterilizationDone: !!activeCycle.sterilization_completed_at,
        sterilizationMode: activeCycle.sterilization_mode ?? '',
        sterilizationTemp: activeCycle.sterilization_temperature ?? 0,
        sterilizationPressure: activeCycle.sterilization_pressure ?? 0,
        sterilizationDuration: sterDuration,
        chemicalIndicator: (activeCycle.chemical_indicator as 'passed' | 'failed' | '') ?? '',
        packagingType: activeCycle.packaging_type ?? '',
        photosAfter: activeCycle.photos_after ?? [],
        timestamps: {
          started_at: activeCycle.started_at,
          disinfection_started_at: activeCycle.disinfection_started_at,
          disinfection_completed_at: activeCycle.disinfection_completed_at,
          pso_started_at: activeCycle.pso_started_at,
          pso_completed_at: activeCycle.pso_completed_at,
          drying_started_at: activeCycle.drying_started_at,
          drying_completed_at: activeCycle.drying_completed_at,
          sterilization_started_at: activeCycle.sterilization_started_at,
          sterilization_completed_at: activeCycle.sterilization_completed_at,
          completed_at: activeCycle.completed_at,
        },
      });
    }
  }, [activeCycle]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh timestamps from server after action
  const refreshTimestamps = useCallback(async () => {
    if (!state.id) return;
    try {
      const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
      const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('sterilization_cycles')
        .select(
          'started_at,disinfection_started_at,disinfection_completed_at,pso_started_at,pso_completed_at,drying_started_at,drying_completed_at,sterilization_started_at,sterilization_completed_at,completed_at'
        )
        .eq('id', state.id)
        .single();
      if (data) {
        update({
          timestamps: {
            started_at: data.started_at,
            disinfection_started_at: data.disinfection_started_at,
            disinfection_completed_at: data.disinfection_completed_at,
            pso_started_at: data.pso_started_at,
            pso_completed_at: data.pso_completed_at,
            drying_started_at: data.drying_started_at,
            drying_completed_at: data.drying_completed_at,
            sterilization_started_at: data.sterilization_started_at,
            sterilization_completed_at: data.sterilization_completed_at,
            completed_at: data.completed_at,
          },
        });
      }
    } catch {
      // ignore
    }
  }, [state.id]);

  // API call helper
  const callAction = useCallback(
    async (action: CycleAction, extra?: Record<string, unknown>) => {
      if (!state.id) return;
      setSaving(true);
      try {
        await fetch(`/api/sterilization/${state.id}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...extra }),
        });
        // Refresh timestamps after each action
        await refreshTimestamps();
      } catch (e) {
        console.error('Action error:', e);
      }
      setSaving(false);
    },
    [state.id, refreshTimestamps]
  );

  // Create cycle on step 0 → step 1
  const createCycle = useCallback(async () => {
    setSaving(true);
    try {
      const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
      const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Build packages JSON for DB
      const dbPackages: SterilizationPackage[] = state.packages.map((p) => {
        if (p.mode === 'set') {
          const set = instrumentSets.find((s) => s.id === p.setId);
          return { set_id: p.setId, set_name: set?.name ?? '', packaging: p.packaging };
        }
        return { instruments: p.customInstruments, packaging: p.packaging };
      });

      // Use first set_id for backward-compat instrument_set_id column
      const firstSetId = state.packages.find((p) => p.mode === 'set')?.setId || null;

      const { data, error } = await supabase
        .from('sterilization_cycles')
        .insert({
          salon_id: salonId,
          equipment_id: state.equipmentId || null,
          instrument_set_id: firstSetId,
          staff_id: state.operatorId || null,
          stage: 'preparation',
          packages: JSON.stringify(dbPackages),
          photos_before: state.photosBefore.length > 0 ? state.photosBefore : null,
          preparation_notes: state.preparationNotes || null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Create cycle error:', error);
        setSaving(false);
        return;
      }

      if (data) {
        update({ id: data.id, step: 1 });
        await fetch(`/api/sterilization/${data.id}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start_preparation',
            preparation_notes: state.preparationNotes,
            photos_before: state.photosBefore,
          }),
        });
        // Get the server timestamp
        const { data: ts } = await supabase
          .from('sterilization_cycles')
          .select('started_at')
          .eq('id', data.id)
          .single();
        if (ts) {
          update({
            timestamps: { ...emptyTimestamps, started_at: ts.started_at },
          });
        }
      }
    } catch (e) {
      console.error('Create error:', e);
    }
    setSaving(false);
  }, [
    state.equipmentId,
    state.packages,
    state.operatorId,
    state.photosBefore,
    state.preparationNotes,
    instrumentSets,
  ]);

  const steps = CYCLE_STAGES;
  const canGoNext = isStepComplete(state.step, state);

  return (
    <div className="space-y-6">
      {/* ─── Strict Stepper ──────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {steps.map((s, i) => {
          const StepIcon = STEP_ICONS[i] ?? CheckCircle2;
          const isCompleted = i < state.step;
          const isCurrent = i === state.step;
          const isLocked = i > state.step;
          const { start, end } = getStepTimestamps(i, state.timestamps);

          return (
            <div key={s.value} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-9 sm:w-9',
                    isCompleted && 'bg-emerald-500 text-white',
                    isCurrent &&
                      'animate-pulse bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/30',
                    isLocked &&
                      'text-muted-foreground border border-[var(--glass-border)] opacity-40'
                  )}
                  title={s.label}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                {/* Time below stepper for completed steps */}
                {isCompleted && start && (
                  <span className="text-muted-foreground mt-0.5 font-mono text-[8px] leading-none">
                    {fmtTime(start)}
                    {end && end !== start ? `\u2013${fmtTime(end)}` : ''}
                  </span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-0.5 h-0.5 w-3 sm:mx-1 sm:w-6',
                    isCompleted ? 'bg-emerald-500' : 'bg-[var(--glass-border)]'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <p className="text-foreground text-lg font-bold">
          {state.step + 1}. {steps[state.step]?.label ?? 'Новий цикл'}
        </p>
        {state.id && (
          <GlassBadge variant="info" size="sm">
            Крок {state.step + 1} з {steps.length}
          </GlassBadge>
        )}
      </div>

      {/* ─── Step content ────────────────────────────────────────────── */}
      <GlassCard className="space-y-4">
        {/* ── STEP 0: Preparation ─────────────────────────────────────── */}
        {state.step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Обладнання *
              </label>
              <select
                value={state.equipmentId}
                onChange={(e) => update({ equipmentId: e.target.value })}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              >
                <option value="">Оберіть обладнання</option>
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.type})
                  </option>
                ))}
              </select>
            </div>

            {/* ── Packages ──────────────────────────────────────────── */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-muted-foreground text-xs font-medium">
                  Пакети стерилізації *
                </label>
                <GlassBadge variant="info" size="sm">
                  {state.packages.length}{' '}
                  {state.packages.length === 1
                    ? 'пакет'
                    : state.packages.length < 5
                      ? 'пакети'
                      : 'пакетів'}
                </GlassBadge>
              </div>

              <div className="space-y-3">
                {state.packages.map((pkg, idx) => {
                  const pkgNum = idx + 1;
                  return (
                    <div
                      key={idx}
                      className="relative rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-foreground text-xs font-semibold">
                          Пакет {pkgNum}
                        </span>
                        {state.packages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = state.packages.filter((_, i) => i !== idx);
                              update({ packages: next });
                            }}
                            className="text-muted-foreground transition-colors hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Mode toggle */}
                      <div className="mb-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...state.packages];
                            next[idx] = { ...pkg, mode: 'set', customInstruments: [] };
                            update({ packages: next });
                          }}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                            pkg.mode === 'set'
                              ? 'border border-violet-500/40 bg-violet-500/20 text-violet-400'
                              : 'text-muted-foreground hover:text-foreground border border-[var(--glass-border)]'
                          )}
                        >
                          Набір
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...state.packages];
                            next[idx] = { ...pkg, mode: 'custom', setId: '' };
                            update({ packages: next });
                          }}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                            pkg.mode === 'custom'
                              ? 'border border-violet-500/40 bg-violet-500/20 text-violet-400'
                              : 'text-muted-foreground hover:text-foreground border border-[var(--glass-border)]'
                          )}
                        >
                          Окремі інструменти
                        </button>
                      </div>

                      {/* Content: set selector or custom instruments */}
                      {pkg.mode === 'set' ? (
                        <select
                          value={pkg.setId}
                          onChange={(e) => {
                            const next = [...state.packages];
                            next[idx] = { ...pkg, setId: e.target.value };
                            update({ packages: next });
                          }}
                          className="text-foreground mb-2 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
                          style={{ fontSize: '16px' }}
                        >
                          <option value="">Оберіть набір</option>
                          {instrumentSets.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} — {s.instruments.join(', ')}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-1.5">
                            {getAllInstruments(instrumentSets).map((instr) => {
                              const selected = pkg.customInstruments.includes(instr);
                              return (
                                <button
                                  key={instr}
                                  type="button"
                                  onClick={() => {
                                    const next = [...state.packages];
                                    const ci = selected
                                      ? pkg.customInstruments.filter((x) => x !== instr)
                                      : [...pkg.customInstruments, instr];
                                    next[idx] = { ...pkg, customInstruments: ci };
                                    update({ packages: next });
                                  }}
                                  className={cn(
                                    'rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                                    selected
                                      ? 'border border-violet-500/40 bg-violet-500/20 text-violet-400'
                                      : 'text-muted-foreground hover:text-foreground border border-[var(--glass-border)]'
                                  )}
                                >
                                  {instr}
                                </button>
                              );
                            })}
                          </div>
                          {pkg.customInstruments.length === 0 && (
                            <p className="text-muted-foreground mt-1 text-[11px]">
                              Оберіть інструменти
                            </p>
                          )}
                        </div>
                      )}

                      {/* Packaging type */}
                      <select
                        value={pkg.packaging}
                        onChange={(e) => {
                          const next = [...state.packages];
                          next[idx] = { ...pkg, packaging: e.target.value };
                          update({ packages: next });
                        }}
                        className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
                        style={{ fontSize: '16px' }}
                      >
                        {PACKAGING_TYPES.map((pt) => (
                          <option key={pt.value} value={pt.value}>
                            {pt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  update({
                    packages: [
                      ...state.packages,
                      { mode: 'set', setId: '', customInstruments: [], packaging: 'kraft' },
                    ],
                  });
                }}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--glass-border)] py-2.5 text-sm font-medium text-violet-400 transition-colors hover:border-violet-500/50 hover:bg-violet-500/5"
              >
                <Plus className="h-4 w-4" />
                Додати пакет
              </button>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Оператор
              </label>
              <select
                value={state.operatorId}
                onChange={(e) => update({ operatorId: e.target.value })}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              >
                <option value="">Оберіть оператора</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </div>
            <PhotoCapture
              photos={state.photosBefore}
              onChange={(p) => update({ photosBefore: p })}
              label="Фото ДО стерилізації"
              cycleId={state.id ?? undefined}
              step="before"
            />
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Нотатки
              </label>
              <textarea
                value={state.preparationNotes}
                onChange={(e) => update({ preparationNotes: e.target.value })}
                rows={2}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
                placeholder="Додаткові нотатки..."
              />
            </div>
          </div>
        )}

        {/* ── STEP 1: Disinfection ────────────────────────────────────── */}
        {state.step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <p className="text-foreground font-semibold">Дезінфекція</p>
              <StepTimeInfo
                start={state.timestamps.disinfection_started_at}
                end={state.timestamps.disinfection_completed_at}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Розчин
                </label>
                <select
                  value={state.solution}
                  onChange={(e) => update({ solution: e.target.value })}
                  className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
                >
                  <option value="">Оберіть розчин</option>
                  {DISINFECTION_SOLUTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Концентрація
                </label>
                <input
                  value={state.concentration}
                  onChange={(e) => update({ concentration: e.target.value })}
                  placeholder="напр. 1%"
                  className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Тривалість (хв)
              </label>
              <input
                type="number"
                value={state.disinfectionDuration}
                onChange={(e) => update({ disinfectionDuration: Number(e.target.value) || 30 })}
                className="text-foreground w-24 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              />
            </div>
            {!state.disinfectionDone ? (
              <CycleTimer
                durationMinutes={state.disinfectionDuration}
                isRunning={state.disinfectionRunning}
                onStart={() => {
                  update({ disinfectionRunning: true });
                  callAction('start_disinfection', {
                    disinfection_solution: state.solution,
                    disinfection_concentration: state.concentration,
                    disinfection_duration_minutes: state.disinfectionDuration,
                  });
                }}
                onComplete={() => {
                  update({ disinfectionRunning: false, disinfectionDone: true });
                  callAction('complete_disinfection');
                }}
                label="Таймер дезінфекції"
                size="md"
                completionMessage="Дезінфекція завершена!"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-5 w-5" /> Дезінфекція завершена
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: PSO ────────────────────────────────────────────── */}
        {state.step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-purple-500" />
              <p className="text-foreground font-semibold">Передстерилізаційна очистка (ПСО)</p>
              <StepTimeInfo
                start={state.timestamps.pso_started_at}
                end={state.timestamps.pso_completed_at}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">Метод</label>
              <select
                value={state.psoMethod}
                onChange={(e) => update({ psoMethod: e.target.value })}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              >
                <option value="">Оберіть метод</option>
                {PSO_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {!state.psoDone ? (
              <CycleTimer
                durationMinutes={15}
                isRunning={state.psoRunning}
                onStart={() => {
                  update({ psoRunning: true });
                  callAction('start_pso', { pso_method: state.psoMethod });
                }}
                onComplete={() => {
                  update({ psoRunning: false, psoDone: true });
                  callAction('complete_pso', {
                    azopyramine_result: state.azopyramineResult || undefined,
                    azopyramine_photo: state.azopyraminePhoto[0] || undefined,
                  });
                }}
                label="Таймер ПСО"
                size="sm"
                completionMessage="ПСО завершена!"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-5 w-5" /> ПСО завершена
              </div>
            )}
            {state.psoDone && (
              <div className="space-y-3 border-t border-[var(--glass-border)] pt-4">
                <p className="text-foreground text-sm font-semibold">Азопірамова проба *</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => update({ azopyramineResult: 'negative' })}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
                      state.azopyramineResult === 'negative'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                        : 'text-muted-foreground border-[var(--glass-border)]'
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Негативна (чисто)
                  </button>
                  <button
                    onClick={() => update({ azopyramineResult: 'positive' })}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
                      state.azopyramineResult === 'positive'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                        : 'text-muted-foreground border-[var(--glass-border)]'
                    )}
                  >
                    <XCircle className="h-4 w-4" /> Позитивна (повтор)
                  </button>
                </div>
                <PhotoCapture
                  photos={state.azopyraminePhoto}
                  onChange={(p) => update({ azopyraminePhoto: p })}
                  label="Фото проби"
                  maxPhotos={1}
                  cycleId={state.id ?? undefined}
                  step="azopyramine"
                />
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Drying ──────────────────────────────────────────── */}
        {state.step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-sky-500" />
              <p className="text-foreground font-semibold">Сушка інструментів</p>
              <StepTimeInfo
                start={state.timestamps.drying_started_at}
                end={state.timestamps.drying_completed_at}
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Інструменти мають бути <strong>абсолютно сухими</strong> перед стерилізацією. Вологі
                інструменти іржавіють та пошкоджуються під час стерилізації.
              </p>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Метод сушки
              </label>
              <select
                value={state.dryingMethod}
                onChange={(e) => update({ dryingMethod: e.target.value })}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              >
                <option value="">Оберіть метод</option>
                {DRYING_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {!state.dryingDone ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <button
                  onClick={async () => {
                    await callAction('start_drying', { drying_method: state.dryingMethod });
                  }}
                  disabled={saving || !state.dryingMethod}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  <Wind className="h-4 w-4" /> Почати сушку
                </button>
                <button
                  onClick={async () => {
                    await callAction('complete_drying');
                    update({ dryingDone: true });
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Інструменти сухі
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-5 w-5" /> Сушка завершена
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Sterilization ───────────────────────────────────── */}
        {state.step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <p className="text-foreground font-semibold">Стерилізація</p>
              <StepTimeInfo
                start={state.timestamps.sterilization_started_at}
                end={state.timestamps.sterilization_completed_at}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">Режим</label>
              <select
                value={state.sterilizationMode}
                onChange={(e) => {
                  const mode = STERILIZATION_MODES.find((m) => m.value === e.target.value);
                  if (mode && mode.value !== 'custom') {
                    update({
                      sterilizationMode: mode.value,
                      sterilizationTemp: mode.temp,
                      sterilizationPressure: mode.pressure,
                      sterilizationDuration: mode.duration,
                    });
                  } else {
                    update({
                      sterilizationMode: e.target.value,
                      sterilizationTemp: 0,
                      sterilizationPressure: 0,
                      sterilizationDuration: 0,
                    });
                  }
                }}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
              >
                <option value="">Оберіть режим</option>
                {STERILIZATION_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Info panel for preset modes */}
            {state.sterilizationMode && state.sterilizationMode !== 'custom' && (
              <GlassCard className="flex flex-wrap gap-4 border border-[var(--glass-border)]">
                <div className="text-xs">
                  <span className="text-muted-foreground">Температура:</span>{' '}
                  <span className="text-foreground font-semibold">{state.sterilizationTemp}°C</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Час:</span>{' '}
                  <span className="text-foreground font-semibold">
                    {state.sterilizationDuration} хв
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Тиск:</span>{' '}
                  <span className="text-foreground font-semibold">
                    {state.sterilizationPressure > 0
                      ? `${state.sterilizationPressure} атм`
                      : '\u2014'}
                  </span>
                </div>
              </GlassCard>
            )}
            {state.sterilizationMode === 'custom' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="min-w-0">
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Температура °C
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={state.sterilizationTemp || ''}
                    onChange={(e) => update({ sterilizationTemp: Number(e.target.value) || 0 })}
                    placeholder="180"
                    className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-2.5 text-base sm:px-3 sm:text-sm"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="min-w-0">
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Тиск (атм)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={state.sterilizationPressure || ''}
                    onChange={(e) => update({ sterilizationPressure: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-2.5 text-base sm:px-3 sm:text-sm"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="min-w-0">
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Час (хв)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={state.sterilizationDuration || ''}
                    onChange={(e) => update({ sterilizationDuration: Number(e.target.value) || 0 })}
                    placeholder="60"
                    className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-2.5 text-base sm:px-3 sm:text-sm"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            )}
            {!state.sterilizationDone ? (
              <CycleTimer
                durationMinutes={state.sterilizationDuration}
                isRunning={state.sterilizationRunning}
                onStart={() => {
                  update({ sterilizationRunning: true });
                  callAction('start_sterilization', {
                    sterilization_mode: state.sterilizationMode,
                    sterilization_temperature: state.sterilizationTemp,
                    sterilization_pressure: state.sterilizationPressure,
                    sterilization_duration_minutes: state.sterilizationDuration,
                  });
                }}
                onComplete={() => {
                  update({ sterilizationRunning: false, sterilizationDone: true });
                  callAction('complete_sterilization', {
                    chemical_indicator: state.chemicalIndicator || undefined,
                    chemical_indicator_photo: state.chemicalIndicatorPhoto[0] || undefined,
                  });
                }}
                label="Таймер стерилізації"
                size="lg"
                completionMessage="Стерилізація завершена!"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-5 w-5" /> Стерилізація завершена
              </div>
            )}
            {state.sterilizationDone && (
              <div className="space-y-3 border-t border-[var(--glass-border)] pt-4">
                <p className="text-foreground text-sm font-semibold">Хімічний індикатор *</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => update({ chemicalIndicator: 'passed' })}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
                      state.chemicalIndicator === 'passed'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                        : 'text-muted-foreground border-[var(--glass-border)]'
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Пройшов
                  </button>
                  <button
                    onClick={() => update({ chemicalIndicator: 'failed' })}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
                      state.chemicalIndicator === 'failed'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                        : 'text-muted-foreground border-[var(--glass-border)]'
                    )}
                  >
                    <XCircle className="h-4 w-4" /> Не пройшов
                  </button>
                </div>
                <PhotoCapture
                  photos={state.chemicalIndicatorPhoto}
                  onChange={(p) => update({ chemicalIndicatorPhoto: p })}
                  label="Фото індикатора"
                  maxPhotos={1}
                  cycleId={state.id ?? undefined}
                  step="chemical_indicator"
                />
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: Packaging ──────────────────────────────────────── */}
        {state.step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-teal-500" />
              <p className="text-foreground font-semibold">Пакування</p>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Тип упаковки *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PACKAGING_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => update({ packagingType: pt.value })}
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                      state.packagingType === pt.value
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'text-muted-foreground border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]'
                    )}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>
            <PhotoCapture
              photos={state.photosAfter}
              onChange={(p) => update({ photosAfter: p })}
              label="Фото ПІСЛЯ (запакованих інструментів)"
              cycleId={state.id ?? undefined}
              step="after"
            />
          </div>
        )}

        {/* ── STEP 6: Result ──────────────────────────────────────────── */}
        {state.step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-500" />
              <p className="text-foreground font-semibold">Результат циклу</p>
            </div>

            {/* Summary timeline */}
            <div className="space-y-2 rounded-lg border border-[var(--glass-border)] p-4">
              <SummaryItem
                done
                label="Підготовка"
                icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                time={state.timestamps.started_at}
              />
              <SummaryItem
                done={state.disinfectionDone}
                label={`Дезінфекція — ${state.solution || 'розчин не обрано'}`}
                icon={<Droplets className="h-3.5 w-3.5 text-blue-500" />}
                time={state.timestamps.disinfection_started_at}
                endTime={state.timestamps.disinfection_completed_at}
              />
              <SummaryItem
                done={state.psoDone}
                label={`ПСО — Азопірам: ${state.azopyramineResult === 'negative' ? 'Негативна' : state.azopyramineResult === 'positive' ? 'Позитивна' : 'Не перевірено'}`}
                icon={<Microscope className="h-3.5 w-3.5 text-purple-500" />}
                time={state.timestamps.pso_started_at}
                endTime={state.timestamps.pso_completed_at}
              />
              <SummaryItem
                done={state.dryingDone}
                label={`Сушка — ${DRYING_METHODS.find((m) => m.value === state.dryingMethod)?.label || '\u2014'}`}
                icon={<Wind className="h-3.5 w-3.5 text-sky-500" />}
                time={state.timestamps.drying_started_at}
                endTime={state.timestamps.drying_completed_at}
              />
              <SummaryItem
                done={state.sterilizationDone}
                label={`Стерилізація — ${state.sterilizationTemp}°C / Хім.індикатор: ${state.chemicalIndicator === 'passed' ? 'Пройшов' : state.chemicalIndicator === 'failed' ? 'Не пройшов' : '\u2014'}`}
                icon={<Thermometer className="h-3.5 w-3.5 text-orange-500" />}
                time={state.timestamps.sterilization_started_at}
                endTime={state.timestamps.sterilization_completed_at}
              />
              <SummaryItem
                done={!!state.packagingType}
                label={`Пакування — ${PACKAGING_TYPES.find((p) => p.value === state.packagingType)?.label || '\u2014'}`}
                icon={<Package className="h-3.5 w-3.5 text-teal-500" />}
              />
            </div>

            {/* Packages summary */}
            {state.packages.length > 0 && (
              <div className="rounded-lg border border-[var(--glass-border)] p-4">
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
                  Пакети ({state.packages.length})
                </p>
                <div className="space-y-1.5">
                  {state.packages.map((pkg, i) => {
                    const setName =
                      pkg.mode === 'set'
                        ? (instrumentSets.find((s) => s.id === pkg.setId)?.name ?? '—')
                        : pkg.customInstruments.join(', ');
                    const pkgLabel =
                      PACKAGING_TYPES.find((pt) => pt.value === pkg.packaging)?.label ??
                      pkg.packaging;
                    return (
                      <div key={i} className="text-foreground flex items-center gap-2 text-sm">
                        <Package className="h-3.5 w-3.5 flex-shrink-0 text-teal-500" />
                        <span className="font-medium">Пакет {i + 1}:</span>
                        <span className="text-muted-foreground truncate">{setName}</span>
                        <GlassBadge variant="default" size="sm">
                          {pkgLabel}
                        </GlassBadge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Result selection */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-semibold uppercase">Результат *</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => update({ result: 'success' })}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-medium transition-all',
                    state.result === 'success'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                      : 'text-muted-foreground border-[var(--glass-border)]'
                  )}
                >
                  <CheckCircle2 className="h-5 w-5" /> Успішно
                </button>
                <button
                  onClick={() => update({ result: 'failed' })}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-medium transition-all',
                    state.result === 'failed'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                      : 'text-muted-foreground border-[var(--glass-border)]'
                  )}
                >
                  <XCircle className="h-5 w-5" /> Не пройшов
                </button>
                <button
                  onClick={() => update({ result: 'partial' })}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-medium transition-all',
                    state.result === 'partial'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                      : 'text-muted-foreground border-[var(--glass-border)]'
                  )}
                >
                  <AlertTriangle className="h-5 w-5" /> Частково
                </button>
              </div>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Нотатки
              </label>
              <textarea
                value={state.resultNotes}
                onChange={(e) => update({ resultNotes: e.target.value })}
                rows={2}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={async () => {
                await callAction('complete_cycle', {
                  result: state.result || 'success',
                  result_notes: state.resultNotes,
                  photos_after: state.photosAfter,
                  packaging_type: state.packagingType,
                  packaging_photo: state.packagingPhoto[0] || undefined,
                });
                update({ isLocked: true });
                router.refresh();
              }}
              disabled={saving || !state.result}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              Завершити і заблокувати
            </button>

            {state.isLocked && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 py-3 text-sm font-medium text-emerald-600">
                <Lock className="h-4 w-4" /> Цикл заблоковано
              </div>
            )}

            {/* ── QR Certificate ── */}
            {state.isLocked && state.id && (
              <QrCertificateBlock
                cycleId={state.id}
                cycleNumber={state.id ? `Цикл ${state.id.slice(0, 8)}` : ''}
              />
            )}
          </div>
        )}
      </GlassCard>

      {/* ─── Navigation button (strict: only forward, only when step complete) */}
      {!state.isLocked && state.step < 6 && (
        <div className="flex items-center justify-end">
          <button
            onClick={() => {
              if (state.step === 0 && !state.id) {
                createCycle();
              } else {
                update({ step: state.step + 1 });
              }
            }}
            disabled={saving || !canGoNext}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-lg disabled:opacity-40',
              canGoNext
                ? 'animate-none bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-violet-500/20'
                : 'bg-gray-400 shadow-none'
            )}
          >
            {saving ? 'Збереження...' : 'Далі'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Summary Item with icon and timestamps ────────────────────────────────────

function SummaryItem({
  done,
  label,
  icon,
  time,
  endTime,
}: {
  done: boolean;
  label: string;
  icon?: React.ReactNode;
  time?: string | null;
  endTime?: string | null;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon ?? (
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            done ? 'bg-emerald-500' : 'bg-[var(--glass-border)]'
          )}
        />
      )}
      <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
      {time && (
        <span className="text-muted-foreground ml-auto font-mono text-[10px]">
          {fmtTime(time)}
          {endTime && endTime !== time && `\u2013${fmtTime(endTime)}`}
          {endTime && endTime !== time && (
            <span className="text-muted-foreground ml-1">({fmtDuration(time, endTime)})</span>
          )}
        </span>
      )}
    </div>
  );
}

// ─── QR Certificate Block ───────────────────────────────────────────────────

function QrCertificateBlock({ cycleId, cycleNumber }: { cycleId: string; cycleNumber: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const verifyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify/${cycleId}`
      : `/verify/${cycleId}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(
      canvasRef.current,
      verifyUrl,
      { width: 200, margin: 2, color: { dark: '#1e1e2e', light: '#ffffff' } },
      (err) => {
        if (!err) setReady(true);
      }
    );
  }, [verifyUrl]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `sterilization-${cycleId.slice(0, 8)}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR ${cycleNumber}</title>
      <style>
        body { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; font-family:system-ui; }
        img { width:160px; height:160px; }
        p { margin:8px 0 0; font-size:12px; font-weight:bold; }
        small { font-size:10px; color:#666; }
      </style></head><body>
        <img src="${dataUrl}" />
        <p>${cycleNumber}</p>
        <small>Shine Beauty CRM</small>
        <script>setTimeout(()=>{ window.print(); window.close(); }, 300);</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <GlassCard className="mt-4 flex flex-col items-center p-5">
      <div className="mb-3 flex items-center gap-2">
        <QrCode className="h-4 w-4 text-violet-400" />
        <p className="text-foreground text-sm font-semibold">QR-сертифікат</p>
      </div>

      <canvas ref={canvasRef} className="rounded-lg" />

      {ready && (
        <>
          <p className="text-muted-foreground mt-2 text-center text-xs">Скануйте для верифікації</p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDownload}
              className="text-foreground flex items-center gap-1.5 rounded-lg border border-[var(--glass-border)] px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-bg)]"
            >
              <Download className="h-3.5 w-3.5" />
              Завантажити
            </button>
            <button
              onClick={handlePrint}
              className="text-foreground flex items-center gap-1.5 rounded-lg border border-[var(--glass-border)] px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-bg)]"
            >
              <Printer className="h-3.5 w-3.5" />
              Друкувати
            </button>
          </div>
        </>
      )}
    </GlassCard>
  );
}
