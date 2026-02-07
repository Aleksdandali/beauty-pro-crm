'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Plus,
  Package,
  Settings,
  Layers,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wrench,
  Activity,
  Camera,
  X as XIcon,
  Clock,
  Droplets,
  Microscope,
  Wind,
  Thermometer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassBadge, StatCard } from '@/components/glass';
import { GlassModal } from '@/components/glass';
import { FadeIn } from '@/components/animations';
import { CycleWizard } from '@/components/sterilization/CycleWizard';
import { StorageTracker } from '@/components/sterilization/StorageTracker';
import { EquipmentManager } from '@/components/sterilization/EquipmentManager';
import { InstrumentSets } from '@/components/sterilization/InstrumentSets';
import { formatCycleDuration } from '@/lib/sterilization-utils';
import { PACKAGING_TYPES } from '@/schemas/sterilization';
import type {
  SterilizationCycle,
  SterilizationEquipment,
  InstrumentSet,
  StoragePackage,
  SterilizationStats,
} from '@/lib/queries/sterilization';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  cycles: SterilizationCycle[];
  equipment: SterilizationEquipment[];
  instrumentSets: InstrumentSet[];
  storage: StoragePackage[];
  stats: SterilizationStats;
  staff: { id: string; first_name: string; last_name: string }[];
  activeCycle: SterilizationCycle | null;
}

type Tab = 'journal' | 'new' | 'storage' | 'equipment' | 'sets';

const TABS: { key: Tab; label: string; icon: typeof ClipboardList }[] = [
  { key: 'journal', label: 'Журнал', icon: ClipboardList },
  { key: 'new', label: 'Новий цикл', icon: Plus },
  { key: 'storage', label: 'Зберігання', icon: Package },
  { key: 'equipment', label: 'Обладнання', icon: Settings },
  { key: 'sets', label: 'Набори', icon: Layers },
];

// ─── Result badge helper ─────────────────────────────────────────────────────

function ResultBadge({ result }: { result: string | null }) {
  if (!result)
    return (
      <GlassBadge variant="default" size="sm">
        —
      </GlassBadge>
    );
  if (result === 'success' || result === 'sterile')
    return (
      <GlassBadge variant="success" size="sm" dot>
        Успішно
      </GlassBadge>
    );
  if (result === 'failed')
    return (
      <GlassBadge variant="error" size="sm" dot>
        Не пройшов
      </GlassBadge>
    );
  if (result === 'cancelled')
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
        <XCircle className="h-3.5 w-3.5" /> Скасовано
      </span>
    );
  return (
    <GlassBadge variant="warning" size="sm" dot>
      Частково
    </GlassBadge>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const map: Record<
    string,
    { variant: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'; label: string }
  > = {
    preparation: { variant: 'default', label: 'Підготовка' },
    disinfection: { variant: 'info', label: 'Дезінфекція' },
    pso: { variant: 'warning', label: 'ПСО' },
    drying: { variant: 'info', label: 'Сушка' },
    sterilization: { variant: 'primary', label: 'Стерилізація' },
    packaging: { variant: 'info', label: 'Пакування' },
    completed: { variant: 'success', label: 'Завершено' },
  };
  const cfg = map[stage] ?? { variant: 'default' as const, label: stage };
  return (
    <GlassBadge variant={cfg.variant} size="sm">
      {cfg.label}
    </GlassBadge>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SterilizationContent({
  cycles,
  equipment,
  instrumentSets,
  storage,
  stats,
  staff,
  activeCycle,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('journal');
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);

  // Cancel/continue dialog state
  const [showCycleDialog, setShowCycleDialog] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // null = start fresh, activeCycle = resume
  const [cycleToResume, setCycleToResume] = useState<SterilizationCycle | null>(null);

  // Filters for journal
  const [filterResult, setFilterResult] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');

  const filteredCycles = useMemo(() => {
    let list = cycles;
    if (filterResult) list = list.filter((c) => c.result === filterResult);
    if (filterEquipment) list = list.filter((c) => c.equipment?.id === filterEquipment);
    return list;
  }, [cycles, filterResult, filterEquipment]);

  // Handle "+ Новий цикл" click
  const handleNewCycle = useCallback(() => {
    if (activeCycle) {
      // Show continue/cancel dialog
      setShowCycleDialog(true);
    } else {
      // No active cycle — start fresh
      setCycleToResume(null);
      setActiveTab('new');
    }
  }, [activeCycle]);

  // Continue active cycle
  const handleContinueCycle = useCallback(() => {
    setCycleToResume(activeCycle);
    setShowCycleDialog(false);
    setActiveTab('new');
  }, [activeCycle]);

  // Cancel active cycle and start new
  const handleCancelAndNew = useCallback(async () => {
    if (!activeCycle) return;
    setCancelling(true);
    try {
      await fetch(`/api/sterilization/${activeCycle.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_cycle', result_notes: 'Скасовано оператором' }),
      });
      setCycleToResume(null);
      setShowCancelConfirm(false);
      setShowCycleDialog(false);
      setActiveTab('new');
      router.refresh();
    } catch (e) {
      console.error('Cancel cycle error:', e);
    }
    setCancelling(false);
  }, [activeCycle, router]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* ─── Active Cycle Recovery Banner ─────────────────────────────── */}
      {activeCycle && activeTab !== 'new' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                Незавершений цикл {activeCycle.cycle_number || ''}
              </p>
              <p className="text-muted-foreground text-xs">
                Етап: <StageBadge stage={activeCycle.stage} />
              </p>
            </div>
          </div>
          <button
            onClick={handleNewCycle}
            className="shrink-0 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/20"
          >
            Продовжити
          </button>
        </div>
      )}

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-bold sm:text-2xl">Журнал стерилізації</h1>
              <p className="text-muted-foreground text-xs">Цифровий журнал згідно вимог МОЗ</p>
            </div>
          </div>
          <button
            onClick={handleNewCycle}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" /> Новий цикл
          </button>
        </div>
      </FadeIn>

      {/* ─── Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          title="Циклів за місяць"
          value={stats.cyclesThisMonth}
          icon={<Activity className="h-5 w-5" />}
          accentColor="primary"
          size="sm"
        />
        <StatCard
          title="Успішних"
          value={stats.successRate}
          suffix="%"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accentColor="success"
          size="sm"
        />
        <StatCard
          title="Стерильних пакетів"
          value={stats.sterilePackages}
          icon={<Package className="h-5 w-5" />}
          accentColor="info"
          size="sm"
        />
        <StatCard
          title="Наступне ТО"
          value={
            stats.nextMaintenanceDate
              ? new Date(stats.nextMaintenanceDate).toLocaleDateString('uk-UA', {
                  day: 'numeric',
                  month: 'short',
                })
              : '—'
          }
          icon={<Wrench className="h-5 w-5" />}
          accentColor="warning"
          size="sm"
        />
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────── */}
      <div className="hide-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'new') {
                  handleNewCycle();
                } else {
                  setActiveTab(tab.key);
                }
              }}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all sm:text-sm',
                isActive
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg-hover)]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────────── */}
      <FadeIn key={activeTab}>
        {activeTab === 'journal' && (
          <JournalTab
            cycles={filteredCycles}
            equipment={equipment}
            expandedCycle={expandedCycle}
            setExpandedCycle={setExpandedCycle}
            filterResult={filterResult}
            setFilterResult={setFilterResult}
            filterEquipment={filterEquipment}
            setFilterEquipment={setFilterEquipment}
          />
        )}
        {activeTab === 'new' && (
          <CycleWizard
            equipment={equipment}
            instrumentSets={instrumentSets}
            staff={staff}
            activeCycle={cycleToResume}
          />
        )}
        {activeTab === 'storage' && <StorageTracker packages={storage} />}
        {activeTab === 'equipment' && <EquipmentManager equipment={equipment} />}
        {activeTab === 'sets' && <InstrumentSets sets={instrumentSets} />}
      </FadeIn>

      {/* ─── Continue / Cancel Dialog ─────────────────────────────────── */}
      <GlassModal
        open={showCycleDialog}
        onClose={() => setShowCycleDialog(false)}
        title="Незавершений цикл"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <div className="text-sm">
              <p className="text-foreground font-semibold">{activeCycle?.cycle_number || 'Цикл'}</p>
              <p className="text-muted-foreground text-xs">
                Етап: {activeCycle?.stage ? <StageBadge stage={activeCycle.stage} /> : '—'}
              </p>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">Що зробити з незавершеним циклом?</p>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleContinueCycle}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20"
            >
              <CheckCircle2 className="h-4 w-4" /> Продовжити поточний
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-muted-foreground flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--glass-border)] py-3 text-sm font-medium transition-colors hover:border-rose-500/30 hover:text-rose-500"
            >
              <XCircle className="h-4 w-4" /> Скасувати і почати новий
            </button>
          </div>
        </div>
      </GlassModal>

      {/* ─── Cancel Confirmation Dialog ───────────────────────────────── */}
      <GlassModal
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Підтвердження скасування"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <p className="text-sm text-rose-700 dark:text-rose-400">
              Ви впевнені? Цикл <strong>{activeCycle?.cycle_number}</strong> буде позначений як
              скасований. Цю дію неможливо відмінити.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="text-foreground flex-1 rounded-xl border border-[var(--glass-border)] py-3 text-sm font-medium"
            >
              Ні, повернутись
            </button>
            <button
              onClick={handleCancelAndNew}
              disabled={cancelling}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 disabled:opacity-50"
            >
              {cancelling ? 'Скасування...' : 'Так, скасувати'}
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

// ─── Journal Tab ──────────────────────────────────────────────────────────────

function JournalTab({
  cycles,
  equipment,
  expandedCycle,
  setExpandedCycle,
  filterResult,
  setFilterResult,
  filterEquipment,
  setFilterEquipment,
}: {
  cycles: SterilizationCycle[];
  equipment: SterilizationEquipment[];
  expandedCycle: string | null;
  setExpandedCycle: (id: string | null) => void;
  filterResult: string;
  setFilterResult: (v: string) => void;
  filterEquipment: string;
  setFilterEquipment: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="text-foreground rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-xs sm:text-sm"
        >
          <option value="">Всі результати</option>
          <option value="success">Успішно</option>
          <option value="failed">Не пройшов</option>
          <option value="partial">Частково</option>
          <option value="cancelled">Скасовано</option>
        </select>
        <select
          value={filterEquipment}
          onChange={(e) => setFilterEquipment(e.target.value)}
          className="text-foreground rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-xs sm:text-sm"
        >
          <option value="">Все обладнання</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name}
            </option>
          ))}
        </select>
      </div>

      {cycles.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
            <ClipboardList className="h-8 w-8 text-violet-400" />
          </div>
          <p className="text-foreground font-semibold">Журнал порожній</p>
          <p className="text-muted-foreground mt-1 text-sm">Створіть перший цикл стерилізації</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <GlassCard padding="none" className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-[var(--glass-border)] text-left text-xs font-medium">
                    <th className="px-4 py-3">№</th>
                    <th className="px-4 py-3">Дата</th>
                    <th className="px-4 py-3">Обладнання</th>
                    <th className="px-4 py-3">Пакети</th>
                    <th className="px-4 py-3">Оператор</th>
                    <th className="px-4 py-3">Етап</th>
                    <th className="px-4 py-3">Азопірам</th>
                    <th className="px-4 py-3">Хім.інд.</th>
                    <th className="px-4 py-3">Результат</th>
                    <th className="w-8 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {cycles.map((c) => {
                    const isExpanded = expandedCycle === c.id;
                    return (
                      <CycleRow
                        key={c.id}
                        cycle={c}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedCycle(isExpanded ? null : c.id)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </GlassCard>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {cycles.map((c) => {
              const isExpanded = expandedCycle === c.id;
              return (
                <GlassCard
                  key={c.id}
                  className="cursor-pointer space-y-2"
                  onClick={() => setExpandedCycle(isExpanded ? null : c.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-mono text-xs font-bold">
                        {c.cycle_number || '—'}
                      </span>
                      {c.is_locked && <Lock className="text-muted-foreground h-3.5 w-3.5" />}
                    </div>
                    {!c.is_locked && c.stage !== 'completed' ? (
                      <GlassBadge variant="warning" size="sm" dot>
                        В процесі
                      </GlassBadge>
                    ) : (
                      <ResultBadge result={c.result} />
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>{c.equipment?.name ?? '—'}</span>
                    <span>
                      {c.packages && c.packages.length > 0 ? `${c.packages.length} пак. · ` : ''}
                      {new Date(c.created_at).toLocaleDateString('uk-UA')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <StageBadge stage={c.stage} />
                    <span className="text-muted-foreground">
                      {c.operator ? `${c.operator.first_name} ${c.operator.last_name}` : '—'}
                    </span>
                  </div>

                  {isExpanded && <CycleDetails cycle={c} />}
                </GlassCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Cycle Row (desktop) ──────────────────────────────────────────────────────

function CycleRow({
  cycle: c,
  isExpanded,
  onToggle,
}: {
  cycle: SterilizationCycle;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="text-foreground cursor-pointer transition-colors hover:bg-[var(--glass-bg-hover)]"
        onClick={onToggle}
      >
        <td className="px-4 py-3 font-mono text-xs font-bold">
          <div className="flex items-center gap-1.5">
            {c.is_locked && <Lock className="text-muted-foreground h-3 w-3" />}
            {c.cycle_number || '—'}
          </div>
        </td>
        <td className="px-4 py-3 text-xs">{new Date(c.created_at).toLocaleDateString('uk-UA')}</td>
        <td className="px-4 py-3 text-xs">{c.equipment?.name ?? '—'}</td>
        <td className="px-4 py-3 text-xs">
          {c.packages && c.packages.length > 0
            ? `${c.packages.length} пак.`
            : (c.instrument_set?.name ?? '—')}
        </td>
        <td className="px-4 py-3 text-xs">
          {c.operator ? `${c.operator.first_name} ${c.operator.last_name}` : '—'}
        </td>
        <td className="px-4 py-3">
          <StageBadge stage={c.stage} />
        </td>
        <td className="px-4 py-3">
          <AzopyramBadge value={c.azopyramine_test} />
        </td>
        <td className="px-4 py-3">
          <ChemicalBadge value={c.chemical_indicator} />
        </td>
        <td className="px-4 py-3">
          {!c.is_locked && c.stage !== 'completed' ? (
            <GlassBadge variant="warning" size="sm" dot>
              В процесі
            </GlassBadge>
          ) : (
            <ResultBadge result={c.result} />
          )}
        </td>
        <td className="px-4 py-3">
          {isExpanded ? (
            <ChevronUp className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={10} className="bg-[var(--glass-bg)] px-4 py-4">
            <CycleDetails cycle={c} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

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

// ─── Cycle Details ────────────────────────────────────────────────────────────

function CycleDetails({ cycle: c }: { cycle: SterilizationCycle }) {
  const steps: {
    label: string;
    icon: React.ReactNode;
    time: string | null;
    end?: string | null;
  }[] = [
    {
      label: 'Підготовка',
      icon: <Droplets className="h-3.5 w-3.5 text-violet-500" />,
      time: c.started_at,
    },
    {
      label: 'Дезінфекція',
      icon: <Droplets className="h-3.5 w-3.5 text-blue-500" />,
      time: c.disinfection_started_at,
      end: c.disinfection_completed_at,
    },
    {
      label: 'ПСО',
      icon: <Microscope className="h-3.5 w-3.5 text-purple-500" />,
      time: c.pso_started_at,
      end: c.pso_completed_at,
    },
    {
      label: 'Сушка',
      icon: <Wind className="h-3.5 w-3.5 text-sky-500" />,
      time: c.drying_started_at,
      end: c.drying_completed_at,
    },
    {
      label: 'Стерилізація',
      icon: <Thermometer className="h-3.5 w-3.5 text-orange-500" />,
      time: c.sterilization_started_at,
      end: c.sterilization_completed_at,
    },
    {
      label: 'Пакування',
      icon: <Package className="h-3.5 w-3.5 text-teal-500" />,
      time: c.completed_at ? c.completed_at : null,
    },
    {
      label: 'Завершено',
      icon: <Lock className="h-3.5 w-3.5 text-emerald-500" />,
      time: c.completed_at,
    },
  ];

  return (
    <div className="space-y-3 border-t border-[var(--glass-border)] pt-3 text-xs">
      {/* Timeline with Lucide icons */}
      <div className="space-y-1.5">
        <p className="text-foreground font-semibold">Хронологія</p>
        <div className="space-y-1">
          {steps.map((s, i) => (
            <div key={i} className="text-muted-foreground flex items-center gap-2">
              {s.time ? s.icon : <Clock className="h-3.5 w-3.5 text-gray-400" />}
              <span className="w-24 shrink-0">{s.label}:</span>
              <span className="text-foreground font-mono">{s.time ? fmtTime(s.time) : '—'}</span>
              {s.end && (
                <>
                  <span>&ndash;</span>
                  <span className="text-foreground font-mono">{fmtTime(s.end)}</span>
                  <span className="text-muted-foreground">({fmtDuration(s.time, s.end)})</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Extra details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {c.disinfection_solution && (
          <div>
            <span className="text-muted-foreground">Розчин:</span>{' '}
            <span className="text-foreground">{c.disinfection_solution}</span>
          </div>
        )}
        {c.disinfection_concentration && (
          <div>
            <span className="text-muted-foreground">Концентрація:</span>{' '}
            <span className="text-foreground">{c.disinfection_concentration}</span>
          </div>
        )}
        {c.pso_method && (
          <div>
            <span className="text-muted-foreground">ПСО метод:</span>{' '}
            <span className="text-foreground">{c.pso_method}</span>
          </div>
        )}
        {c.sterilization_mode && (
          <div>
            <span className="text-muted-foreground">Режим:</span>{' '}
            <span className="text-foreground">{c.sterilization_mode}</span>
          </div>
        )}
        {c.sterilization_temperature && (
          <div>
            <span className="text-muted-foreground">Температура:</span>{' '}
            <span className="text-foreground">{c.sterilization_temperature}°C</span>
          </div>
        )}
        {c.packaging_type && (
          <div>
            <span className="text-muted-foreground">Упаковка:</span>{' '}
            <span className="text-foreground">{c.packaging_type}</span>
          </div>
        )}
        {c.started_at && c.completed_at && (
          <div>
            <span className="text-muted-foreground">Тривалість:</span>{' '}
            <span className="text-foreground">
              {formatCycleDuration(c.started_at, c.completed_at)}
            </span>
          </div>
        )}
      </div>

      {/* Packages */}
      {c.packages && c.packages.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-foreground font-semibold">Пакети ({c.packages.length})</p>
          <div className="space-y-1">
            {c.packages.map((pkg, i) => {
              const content = pkg.set_name ? pkg.set_name : (pkg.instruments ?? []).join(', ');
              const pkgLabel =
                PACKAGING_TYPES.find((pt) => pt.value === pkg.packaging)?.label ?? pkg.packaging;
              return (
                <div key={i} className="text-muted-foreground flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-teal-500" />
                  <span className="text-foreground font-medium">Пакет {i + 1}:</span>
                  <span>{content}</span>
                  <span className="rounded bg-[var(--glass-bg)] px-1.5 py-0.5 text-[10px] font-medium">
                    {pkgLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {(c.preparation_notes || c.result_notes) && (
        <div className="space-y-1">
          {c.preparation_notes && (
            <p>
              <span className="text-muted-foreground">Нотатки:</span>{' '}
              <span className="text-foreground">{c.preparation_notes}</span>
            </p>
          )}
          {c.result_notes && (
            <p>
              <span className="text-muted-foreground">Результат:</span>{' '}
              <span className="text-foreground">{c.result_notes}</span>
            </p>
          )}
        </div>
      )}

      {/* Photos */}
      <CyclePhotos cycle={c} />
    </div>
  );
}

// ─── Photo gallery for cycle details ──────────────────────────────────────────

function CyclePhotos({ cycle: c }: { cycle: SterilizationCycle }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const allPhotos: { url: string; label: string }[] = [];

  if (c.photos_before?.length) {
    c.photos_before.forEach((url, i) => allPhotos.push({ url, label: `ДО #${i + 1}` }));
  }
  if (c.azopyramine_photo_url) {
    allPhotos.push({ url: c.azopyramine_photo_url, label: 'Азопірамова проба' });
  }
  if (c.chemical_indicator_photo_url) {
    allPhotos.push({ url: c.chemical_indicator_photo_url, label: 'Хім. індикатор' });
  }
  if (c.packaging_photo) {
    allPhotos.push({ url: c.packaging_photo, label: 'Пакування' });
  }
  if (c.photos_after?.length) {
    c.photos_after.forEach((url, i) => allPhotos.push({ url, label: `ПІСЛЯ #${i + 1}` }));
  }

  if (allPhotos.length === 0) return null;

  return (
    <>
      <div className="space-y-1.5">
        <p className="text-foreground flex items-center gap-1.5 font-semibold">
          <Camera className="h-3.5 w-3.5" /> Фото ({allPhotos.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {allPhotos.map((photo, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxUrl(photo.url);
              }}
              className="group relative h-16 w-16 overflow-hidden rounded-lg border border-[var(--glass-border)] transition-transform hover:scale-105 sm:h-20 sm:w-20"
            >
              <img src={photo.url} alt={photo.label} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5">
                <span className="text-[8px] font-medium text-white">{photo.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <XIcon className="h-5 w-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Фото"
            className="max-h-[85vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ─── Small badge helpers ──────────────────────────────────────────────────────

function AzopyramBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  if (value === 'negative')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
        <CheckCircle2 className="h-3.5 w-3.5" /> Негативна
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-rose-500">
      <XCircle className="h-3.5 w-3.5" /> Позитивна
    </span>
  );
}

function ChemicalBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  if (value === 'passed')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
        <CheckCircle2 className="h-3.5 w-3.5" /> Пройшов
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-rose-500">
      <XCircle className="h-3.5 w-3.5" /> Не пройшов
    </span>
  );
}
