'use client';

import {
  Calculator,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GlassCard, GlassBadge } from '@/components/glass';
import { CountUp } from '@/components/animations';
import type { SalonOverhead, MaterialCostItem, CostBreakdown } from '@/schemas/service';
import { calculateCostBreakdown } from '@/schemas/service';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MarginCalculatorProps {
  price: number;
  materials: MaterialCostItem[];
  durationMinutes: number;
  overhead?: SalonOverhead | null;
  compact?: boolean;
}

// ─── Formatters ──────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('uk-UA', { maximumFractionDigits: 0 });
}

function fmtDec(n: number): string {
  return n.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MarginCalculator({
  price,
  materials,
  durationMinutes,
  overhead,
  compact = false,
}: MarginCalculatorProps) {
  const materialsCost = materials.reduce((s, m) => s + m.total_cost, 0);
  const bd = calculateCostBreakdown(price, materialsCost, durationMinutes, overhead);
  const hasOverhead = overhead != null && overhead.monthly_expenses > 0;

  if (compact) {
    return <CompactView bd={bd} hasOverhead={hasOverhead} />;
  }

  return (
    <div className="space-y-6">
      {/* Overhead section */}
      <OverheadSection overhead={overhead} durationMinutes={durationMinutes} bd={bd} />

      {/* Summary */}
      <SummarySection bd={bd} hasOverhead={hasOverhead} durationMinutes={durationMinutes} />
    </div>
  );
}

// ─── Compact View (for service list) ─────────────────────────────────────────

function CompactView({ bd, hasOverhead }: { bd: CostBreakdown; hasOverhead: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground font-mono">
        {fmt(hasOverhead ? bd.totalCost : bd.materialsCost)} ₴
      </span>
      <span
        className={cn(
          'font-mono font-medium',
          bd.isProfitable ? 'text-emerald-500' : 'text-rose-500'
        )}
      >
        {fmt(bd.realProfit)} ₴
      </span>
      <MarginBadge percent={bd.realMarginPercent} />
    </div>
  );
}

// ─── Overhead Section ────────────────────────────────────────────────────────

function OverheadSection({
  overhead,
  durationMinutes,
  bd,
}: {
  overhead?: SalonOverhead | null;
  durationMinutes: number;
  bd: CostBreakdown;
}) {
  if (!overhead || overhead.monthly_expenses === 0) {
    return (
      <GlassCard padding="md" className="border-warning/30 border-dashed">
        <div className="flex items-start gap-3">
          <div className="bg-warning-light flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Settings className="text-warning h-4 w-4" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-semibold">Накладні не налаштовані</h4>
            <p className="text-muted-foreground mt-1 text-xs">
              Калькулятор працює в спрощеному режимі (тільки матеріали). Для повного розрахунку
              налаштуйте витрати салону.
            </p>
            <Link
              href="/dashboard/settings"
              className="text-primary hover:text-primary/80 mt-2 inline-flex items-center gap-1 text-xs font-medium transition-colors"
            >
              Налаштувати витрати
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="md">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="bg-info-light flex h-8 w-8 items-center justify-center rounded-lg">
          <Settings className="text-info h-4 w-4" />
        </div>
        <h3 className="text-foreground text-sm font-semibold">Накладні витрати салону</h3>
        <Link
          href="/dashboard/settings"
          className="text-muted-foreground hover:text-primary ml-auto text-xs transition-colors"
        >
          Змінити
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <Row label="Загальні витрати/міс" value={`${fmt(overhead.monthly_expenses)} ₴`} />
        <Row label="Робочі дні" value={String(overhead.working_days)} />
        <Row label="Годин на день" value={String(overhead.hours_per_day)} />
        <Row label="Майстрів на зміні" value={String(overhead.masters_per_shift)} />
      </div>

      <div className="mt-3 space-y-1 border-t border-[var(--glass-border)] pt-3">
        <Row label="Вартість 1 год майстра" value={`${fmt(bd.costPerMinute * 60)} ₴`} highlight />
        <Row label="Вартість 1 хв" value={`${fmtDec(bd.costPerMinute)} ₴`} highlight />
        <Row label={`Час процедури`} value={`${durationMinutes} хв`} />
        <Row label="Накладні на процедуру" value={`${fmt(bd.overheadCost)} ₴`} highlight bold />
      </div>
    </GlassCard>
  );
}

// ─── Summary Section ─────────────────────────────────────────────────────────

function SummarySection({
  bd,
  hasOverhead,
  durationMinutes,
}: {
  bd: CostBreakdown;
  hasOverhead: boolean;
  durationMinutes: number;
}) {
  const profitColor = bd.isProfitable ? 'text-emerald-500' : 'text-rose-500';
  const ProfitIcon = bd.isProfitable ? TrendingUp : TrendingDown;
  const monthlyProcedures = 60;
  const tenProcedures = 10;

  return (
    <GlassCard padding="md" className="border-primary/20 relative overflow-hidden">
      {/* Subtle gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="bg-primary-light flex h-8 w-8 items-center justify-center rounded-lg">
            <Calculator className="text-primary h-4 w-4" />
          </div>
          <h3 className="text-foreground text-sm font-semibold">Повна собівартість процедури</h3>
        </div>

        <div className="space-y-1.5 text-sm">
          <Row label="Матеріали" value={`${fmt(bd.materialsCost)} ₴`} />
          {hasOverhead && (
            <Row label={`Накладні (${durationMinutes} хв)`} value={`${fmt(bd.overheadCost)} ₴`} />
          )}

          <div className="my-2 border-t border-[var(--glass-border)]" />
          <Row label="Собівартість" value={`${fmt(bd.totalCost)} ₴`} bold />

          {hasOverhead && (
            <>
              <div className="h-1" />
              <Row
                label={`Комісія майстра (${bd.masterCommission > 0 ? Math.round((bd.masterCommission / bd.currentPrice) * 100) : 0}%)`}
                value={`${fmt(bd.masterCommission)} ₴`}
              />
              <Row
                label={`Бажаний прибуток (${bd.desiredProfit > 0 ? Math.round((bd.desiredProfit / bd.currentPrice) * 100) : 0}%)`}
                value={`${fmt(bd.desiredProfit)} ₴`}
              />

              <div className="my-2 border-t border-[var(--glass-border)]" />
              <Row
                label="Мінімальна ціна"
                value={`${fmt(bd.minPrice)} ₴`}
                bold
                className={bd.isProfitable ? '' : 'text-rose-500'}
              />
            </>
          )}

          <Row label="Ваша ціна" value={`${fmt(bd.currentPrice)} ₴`} bold />

          <div className="my-2 border-t border-[var(--glass-border)]" />

          {/* Profit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ProfitIcon className={cn('h-4 w-4', profitColor)} />
              <span className={cn('font-medium', profitColor)}>Реальний прибуток:</span>
            </div>
            <span className={cn('font-mono font-bold', profitColor)}>
              <CountUp end={bd.realProfit} suffix=" ₴" /> ({fmtDec(bd.realMarginPercent)}%)
            </span>
          </div>

          {!bd.isProfitable && hasOverhead && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-rose-500/10 p-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <p className="text-xs text-rose-500">
                Ціна нижче мінімальної! Рекомендована ціна: {fmt(bd.minPrice)} ₴
              </p>
            </div>
          )}
        </div>

        {/* Projections */}
        {hasOverhead && bd.realProfit > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[var(--glass-bg)] p-3">
              <p className="text-muted-foreground text-xs">На {tenProcedures} процедур</p>
              <p className="text-foreground mt-0.5 font-mono text-sm font-bold">
                {fmt(bd.realProfit * tenProcedures)} ₴
              </p>
            </div>
            <div className="rounded-lg bg-[var(--glass-bg)] p-3">
              <p className="text-muted-foreground text-xs">На місяць ({monthlyProcedures} проц.)</p>
              <p className="text-foreground mt-0.5 font-mono text-sm font-bold">
                {fmt(bd.realProfit * monthlyProcedures)} ₴
              </p>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ─── Margin Badge ────────────────────────────────────────────────────────────

export function MarginBadge({ percent }: { percent: number }) {
  const variant = percent > 70 ? 'success' : percent >= 50 ? 'warning' : 'error';
  return (
    <GlassBadge variant={variant} size="sm">
      {percent.toFixed(0)}%
    </GlassBadge>
  );
}

// ─── Row Helper ──────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  bold,
  highlight,
  className,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className={cn('text-muted-foreground', bold && 'text-foreground font-medium')}>
        {label}
      </span>
      <span
        className={cn(
          'font-mono',
          bold ? 'text-foreground font-bold' : 'text-foreground',
          highlight && 'text-primary'
        )}
      >
        {value}
      </span>
    </div>
  );
}
