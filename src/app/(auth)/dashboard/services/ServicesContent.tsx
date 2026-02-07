'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Sparkles, DollarSign, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import { GlassCard, GlassBadge, StatCard } from '@/components/glass';
import { FadeIn, StaggerList } from '@/components/animations';
import { MarginBadge } from '@/components/shared/MarginCalculator';
import { NewServiceModal } from '@/components/shared/NewServiceModal';
import {
  SERVICE_CATEGORIES,
  CATEGORY_LABELS,
  simpleMargin,
  calculateCostBreakdown,
  type SalonOverhead,
} from '@/schemas/service';
import type { ServiceWithMaterials, ServiceStats } from '@/lib/queries/services';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServicesContentProps {
  initialServices: ServiceWithMaterials[];
  stats: ServiceStats;
  overhead: SalonOverhead | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('uk-UA', { maximumFractionDigits: 0 });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ServicesContent({ initialServices, stats, overhead }: ServicesContentProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'margin'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    let list = initialServices;

    if (catFilter !== 'all') {
      list = list.filter((s) => s.category === catFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }

    // Sort
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name, 'uk');
      else if (sortBy === 'price') cmp = a.price - b.price;
      else {
        const mA = computeMargin(a, overhead);
        const mB = computeMargin(b, overhead);
        cmp = mA - mB;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [initialServices, catFilter, search, sortBy, sortDir, overhead]);

  const handleSort = (col: 'name' | 'price' | 'margin') => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ───────────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-2xl font-bold">Послуги</h1>
            <GlassBadge variant="primary" size="md">
              {stats.total}
            </GlassBadge>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40"
          >
            <Plus className="h-4 w-4" />
            Нова послуга
          </button>
        </div>
      </FadeIn>

      {/* ── Stat Cards ───────────────────────────── */}
      <StaggerList delay={0.06} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Всього послуг"
          value={stats.total}
          icon={<Sparkles className="h-4 w-4" />}
          accentColor="primary"
          size="sm"
        />
        <StatCard
          title="Середня ціна"
          value={stats.averagePrice}
          suffix=" ₴"
          icon={<DollarSign className="h-4 w-4" />}
          accentColor="info"
          size="sm"
        />
        <StatCard
          title="Середня маржа"
          value={stats.averageMargin}
          suffix="%"
          icon={<TrendingUp className="h-4 w-4" />}
          accentColor="success"
          size="sm"
        />
      </StaggerList>

      {/* ── Search + Filters ─────────────────────── */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Пошук за назвою..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] pr-4 pl-10 text-sm shadow-[var(--shadow-sm)]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map((cat) => {
            const active = catFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCatFilter(cat.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground border border-[var(--glass-border)] bg-[var(--glass-bg)]'
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Service List ─────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          onAdd={() => setModalOpen(true)}
          hasFilters={search !== '' || catFilter !== 'all'}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <GlassCard padding="none" hover={false}>
              <table className="w-full">
                <thead>
                  <tr className="text-muted-foreground border-b border-[var(--glass-border)] text-left text-xs font-medium">
                    <SortHeader
                      label="Послуга"
                      col="name"
                      current={sortBy}
                      dir={sortDir}
                      onClick={handleSort}
                      className="px-5 py-3"
                    />
                    <th className="px-5 py-3 text-right">Тривалість</th>
                    <SortHeader
                      label="Ціна"
                      col="price"
                      current={sortBy}
                      dir={sortDir}
                      onClick={handleSort}
                      className="px-5 py-3 text-right"
                    />
                    <th className="px-5 py-3 text-right">Собівартість</th>
                    <th className="px-5 py-3 text-right">Прибуток</th>
                    <SortHeader
                      label="Маржа"
                      col="margin"
                      current={sortBy}
                      dir={sortDir}
                      onClick={handleSort}
                      className="px-5 py-3 text-right"
                    />
                    <th className="w-20 px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {filtered.map((service) => {
                    const bd = computeBreakdown(service, overhead);
                    const margin = computeMargin(service, overhead);
                    const profit = bd.realProfit;
                    return (
                      <tr
                        key={service.id}
                        className="cursor-pointer transition-colors hover:bg-[var(--glass-bg-hover)]"
                        onClick={() => router.push(`/dashboard/services/${service.id}`)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-8 w-1.5 rounded-full"
                              style={{ backgroundColor: service.color }}
                            />
                            <div>
                              <span className="text-foreground text-sm font-medium">
                                {service.name}
                              </span>
                              <div className="mt-0.5">
                                <GlassBadge variant="default" size="sm">
                                  {CATEGORY_LABELS[service.category] ?? service.category}
                                </GlassBadge>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-muted-foreground px-5 py-3.5 text-right text-sm">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration} хв
                          </span>
                        </td>
                        <td className="text-foreground px-5 py-3.5 text-right font-mono text-sm font-medium">
                          {fmt(service.price)} ₴
                        </td>
                        <td className="text-muted-foreground px-5 py-3.5 text-right font-mono text-sm">
                          {fmt(bd.totalCost)} ₴
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-sm font-medium">
                          <span className={profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                            {fmt(profit)} ₴
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <MarginBadge percent={margin} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/dashboard/services/${service.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:text-primary/80 text-xs font-medium transition-colors"
                          >
                            Детально
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </GlassCard>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((service) => {
              const margin = computeMargin(service, overhead);
              const bd = computeBreakdown(service, overhead);
              return (
                <Link key={service.id} href={`/dashboard/services/${service.id}`} className="block">
                  <GlassCard padding="sm" className="flex items-center gap-3">
                    <div
                      className="h-10 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground truncate text-sm font-medium">
                          {service.name}
                        </span>
                        <MarginBadge percent={margin} />
                      </div>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                        <span>{CATEGORY_LABELS[service.category] ?? service.category}</span>
                        <span>{service.duration} хв</span>
                        <span className="font-mono font-medium">{fmt(service.price)} ₴</span>
                      </div>
                      <div className="mt-0.5 text-xs">
                        <span className={bd.realProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                          Прибуток: {fmt(bd.realProfit)} ₴
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <NewServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeMargin(service: ServiceWithMaterials, overhead: SalonOverhead | null): number {
  const bd = calculateCostBreakdown(
    service.price,
    service.materialsCost,
    service.duration,
    overhead
  );
  return bd.realMarginPercent;
}

function computeBreakdown(service: ServiceWithMaterials, overhead: SalonOverhead | null) {
  return calculateCostBreakdown(service.price, service.materialsCost, service.duration, overhead);
}

// ─── Sort Header ─────────────────────────────────────────────────────────────

function SortHeader({
  label,
  col,
  current,
  dir,
  onClick,
  className,
}: {
  label: string;
  col: 'name' | 'price' | 'margin';
  current: string;
  dir: 'asc' | 'desc';
  onClick: (col: 'name' | 'price' | 'margin') => void;
  className?: string;
}) {
  const isActive = current === col;
  return (
    <th className={className}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick(col);
        }}
        className={cn(
          'hover:text-foreground inline-flex items-center gap-1 transition-colors',
          isActive && 'text-foreground'
        )}
      >
        {label}
        {isActive && <span className="text-[10px]">{dir === 'asc' ? '▲' : '▼'}</span>}
      </button>
    </th>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd, hasFilters }: { onAdd: () => void; hasFilters: boolean }) {
  return (
    <FadeIn>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/12">
          <Sparkles className="h-7 w-7 text-violet-400" />
        </div>
        <h3 className="text-foreground text-lg font-semibold">
          {hasFilters ? 'Нічого не знайдено' : 'Послуг поки немає'}
        </h3>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          {hasFilters
            ? 'Спробуйте змінити фільтри або пошуковий запит'
            : 'Додайте першу послугу, щоб розпочати роботу'}
        </p>
        {!hasFilters && (
          <button
            onClick={onAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20"
          >
            <Plus className="h-4 w-4" />
            Додати першу послугу
          </button>
        )}
      </div>
    </FadeIn>
  );
}
