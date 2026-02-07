'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Plus,
  Users,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassBadge } from '@/components/glass';
import { FadeIn } from '@/components/animations';
import { NewExpenseModal } from '@/components/shared/NewExpenseModal';
import { EXPENSE_CATEGORIES, PERIOD_OPTIONS, PAYROLL_STATUSES } from '@/schemas/finance';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import type {
  FinancialSummary,
  RevenueByPeriod,
  ExpenseItem,
  ExpenseByCategory,
  ServiceRevenue,
  StaffRevenue,
  PayrollItem,
  ServiceProfitability,
} from '@/lib/queries/finances';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  summary: FinancialSummary;
  chartData: RevenueByPeriod[];
  expenses: { items: ExpenseItem[]; byCategory: ExpenseByCategory[]; total: number };
  serviceRevenue: ServiceRevenue[];
  staffRevenue: StaffRevenue[];
  payroll: PayrollItem[];
  profitability: ServiceProfitability[];
}

type Tab = 'revenue' | 'expenses' | 'payroll';

const TABS: { key: Tab; label: string; icon: typeof TrendingUp }[] = [
  { key: 'revenue', label: 'Доходи', icon: TrendingUp },
  { key: 'expenses', label: 'Витрати', icon: TrendingDown },
  { key: 'payroll', label: 'Зарплати', icon: Users },
];

const PIE_COLORS = [
  '#8b5cf6',
  '#ec4899',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#6366f1',
  '#14b8a6',
  '#64748b',
  '#0ea5e9',
  '#9ca3af',
];

function fmt(n: number): string {
  return n.toLocaleString('uk-UA');
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FinancesContent({
  summary,
  chartData,
  expenses,
  serviceRevenue,
  staffRevenue,
  payroll,
  profitability,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('revenue');
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [period] = useState('this_month');

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? 'Цей місяць';

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-bold sm:text-2xl">Фінанси</h1>
              <p className="text-muted-foreground text-xs">
                {periodLabel} — дохід, витрати, маржинальність
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <GlassBadge variant="primary" size="md">
              {periodLabel}
            </GlassBadge>
          </div>
        </div>
      </FadeIn>

      {/* ─── 3 Big Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <BigStatCard
          label="Дохід"
          value={summary.revenue}
          growth={summary.revenueGrowth}
          icon={<ArrowUpRight className="h-5 w-5" />}
          accent="emerald"
        />
        <BigStatCard
          label="Витрати"
          value={summary.expenses}
          growth={summary.expensesGrowth}
          icon={<ArrowDownRight className="h-5 w-5" />}
          accent="rose"
          invertGrowth
        />
        <BigStatCard
          label="Прибуток"
          value={summary.profit}
          growth={summary.profitGrowth}
          icon={<BarChart3 className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* ─── Bar Chart: Revenue vs Expenses ───────────────────────── */}
      {chartData.length > 0 && (
        <GlassCard className="overflow-hidden">
          <p className="text-foreground mb-4 text-sm font-semibold">Дохід vs Витрати по тижнях</p>
          <div className="h-56 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis dataKey="label" fontSize={11} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis
                  fontSize={11}
                  tick={{ fill: 'var(--text-secondary)' }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={
                    ((value: any, name: any) => [
                      `${fmt(Number(value ?? 0))} ₴`,
                      name === 'revenue' ? 'Дохід' : 'Витрати',
                    ]) as never
                  }
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="revenue" />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* ─── Tabs ─────────────────────────────────────────────────── */}
      <div className="hide-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all sm:text-sm',
                isActive
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg-hover)]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ──────────────────────────────────────────── */}
      <FadeIn key={activeTab}>
        {activeTab === 'revenue' && (
          <RevenueTab
            serviceRevenue={serviceRevenue}
            staffRevenue={staffRevenue}
            chartData={chartData}
          />
        )}
        {activeTab === 'expenses' && (
          <ExpensesTab
            items={expenses.items}
            byCategory={expenses.byCategory}
            total={expenses.total}
            onAdd={() => setExpenseOpen(true)}
          />
        )}
        {activeTab === 'payroll' && <PayrollTab payroll={payroll} />}
      </FadeIn>

      {/* ─── Profitability Table ──────────────────────────────────── */}
      {profitability.length > 0 && (
        <GlassCard>
          <p className="text-foreground mb-4 text-sm font-bold">Маржинальність по послугах</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-[var(--glass-border)] text-left text-xs">
                  <th className="pr-4 pb-2">Послуга</th>
                  <th className="pr-4 pb-2 text-right">Ціна</th>
                  <th className="pr-4 pb-2 text-right">Матеріали</th>
                  <th className="hidden pr-4 pb-2 text-right sm:table-cell">Накладні</th>
                  <th className="pr-4 pb-2 text-right">Маржа</th>
                  <th className="pb-2 text-right">Маржа %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {profitability.map((p) => (
                  <tr key={p.service_id} className="text-foreground">
                    <td className="py-2 pr-4 text-xs font-medium">{p.service_name}</td>
                    <td className="py-2 pr-4 text-right text-xs">{fmt(p.price)} ₴</td>
                    <td className="py-2 pr-4 text-right text-xs text-rose-500">
                      {fmt(p.materials_cost)} ₴
                    </td>
                    <td className="hidden py-2 pr-4 text-right text-xs text-amber-500 sm:table-cell">
                      {fmt(p.overhead_per_service)} ₴
                    </td>
                    <td className="py-2 pr-4 text-right text-xs font-semibold">
                      {fmt(p.margin)} ₴
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-bold',
                          p.margin_percent >= 60
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : p.margin_percent >= 30
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-rose-500/10 text-rose-600'
                        )}
                      >
                        {p.margin_percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      <NewExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} />
    </div>
  );
}

// ─── Big Stat Card ────────────────────────────────────────────────────────────

function BigStatCard({
  label,
  value,
  growth,
  icon,
  accent,
  invertGrowth,
}: {
  label: string;
  value: number;
  growth: number;
  icon: React.ReactNode;
  accent: 'emerald' | 'rose' | 'violet';
  invertGrowth?: boolean;
}) {
  const isPositive = invertGrowth ? growth <= 0 : growth >= 0;
  const borderColor =
    accent === 'emerald'
      ? 'from-emerald-500 to-emerald-300'
      : accent === 'rose'
        ? 'from-rose-500 to-rose-300'
        : 'from-violet-500 to-fuchsia-500';
  const iconBg =
    accent === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-500'
      : accent === 'rose'
        ? 'bg-rose-500/10 text-rose-500'
        : 'bg-violet-500/10 text-violet-500';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] p-5'
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', borderColor)} />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
          <p className="text-foreground text-2xl font-bold sm:text-3xl">
            {fmt(value)} <span className="text-muted-foreground text-sm font-normal">₴</span>
          </p>
          <div
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {growth > 0 ? '+' : ''}
            {growth}% vs мін.міс
          </div>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Revenue Tab ──────────────────────────────────────────────────────────────

function RevenueTab({
  serviceRevenue,
  staffRevenue,
  chartData,
}: {
  serviceRevenue: ServiceRevenue[];
  staffRevenue: StaffRevenue[];
  chartData: RevenueByPeriod[];
}) {
  const totalRevenue = serviceRevenue.reduce((s, r) => s + r.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Revenue by Services */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <p className="text-foreground mb-3 text-sm font-semibold">Дохід по послугах</p>
          {serviceRevenue.length > 0 ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceRevenue}
                      dataKey="revenue"
                      nameKey="service_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {serviceRevenue.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={
                        ((value: unknown) => [`${fmt(Number(value ?? 0))} ₴`, 'Дохід']) as never
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-1.5">
                {serviceRevenue.slice(0, 6).map((s, i) => (
                  <div key={s.service_id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-foreground">{s.service_name}</span>
                    </div>
                    <span className="text-muted-foreground font-mono">{fmt(s.revenue)} ₴</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">Немає даних</p>
          )}
        </GlassCard>

        {/* Revenue by Staff */}
        <GlassCard>
          <p className="text-foreground mb-3 text-sm font-semibold">Дохід по майстрах</p>
          {staffRevenue.length > 0 ? (
            <div className="space-y-2">
              {staffRevenue.map((s) => {
                const pct = totalRevenue > 0 ? (s.revenue / totalRevenue) * 100 : 0;
                return (
                  <div key={s.staff_id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{s.staff_name}</span>
                      <span className="text-muted-foreground">
                        {fmt(s.revenue)} ₴ ({s.count} зап.)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--glass-border)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">Немає даних</p>
          )}
        </GlassCard>
      </div>

      {/* Area chart */}
      {chartData.length > 1 && (
        <GlassCard>
          <p className="text-foreground mb-4 text-sm font-semibold">Динаміка доходу</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis dataKey="label" fontSize={11} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis
                  fontSize={11}
                  tick={{ fill: 'var(--text-secondary)' }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={
                    ((value: unknown) => [`${fmt(Number(value ?? 0))} ₴`, 'Дохід']) as never
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fill="url(#gradRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Services table */}
      {serviceRevenue.length > 0 && (
        <GlassCard>
          <p className="text-foreground mb-3 text-sm font-semibold">Деталі по послугах</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-[var(--glass-border)]">
                  <th className="pb-2 text-left">Послуга</th>
                  <th className="pb-2 text-right">К-сть</th>
                  <th className="pb-2 text-right">Дохід</th>
                  <th className="pb-2 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {serviceRevenue.map((s) => (
                  <tr key={s.service_id} className="text-foreground">
                    <td className="py-2 font-medium">{s.service_name}</td>
                    <td className="py-2 text-right">{s.count}</td>
                    <td className="py-2 text-right font-mono">{fmt(s.revenue)} ₴</td>
                    <td className="py-2 text-right">
                      <GlassBadge variant="primary" size="sm">
                        {s.percentage}%
                      </GlassBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────────

function ExpensesTab({
  items,
  byCategory,
  total,
  onAdd,
}: {
  items: ExpenseItem[];
  byCategory: ExpenseByCategory[];
  total: number;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Donut chart */}
        <GlassCard>
          <p className="text-foreground mb-3 text-sm font-semibold">Витрати по категоріях</p>
          {byCategory.length > 0 ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {byCategory.map((c) => {
                        const cat = EXPENSE_CATEGORIES.find((ec) => ec.value === c.category);
                        return <Cell key={c.category} fill={cat?.color ?? '#9ca3af'} />;
                      })}
                    </Pie>
                    <Tooltip
                      formatter={
                        ((value: unknown) => [`${fmt(Number(value ?? 0))} ₴`, 'Сума']) as never
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-1.5">
                {byCategory.map((c) => {
                  const cat = EXPENSE_CATEGORIES.find((ec) => ec.value === c.category);
                  const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
                  return (
                    <div key={c.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: cat?.color ?? '#9ca3af' }}
                        />
                        <span className="text-foreground">{cat?.label ?? c.category}</span>
                      </div>
                      <span className="text-muted-foreground font-mono">
                        {fmt(c.total)} ₴ <span className="text-[10px]">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">Немає витрат</p>
          )}
        </GlassCard>

        {/* Add + Total */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <p className="text-foreground text-sm font-semibold">Загалом витрат</p>
            <p className="text-foreground mt-2 text-3xl font-bold">
              {fmt(total)} <span className="text-muted-foreground text-sm font-normal">₴</span>
            </p>
            <p className="text-muted-foreground mt-1 text-xs">{items.length} записів за період</p>
          </div>
          <button
            onClick={onAdd}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20"
          >
            <Plus className="h-4 w-4" /> Додати витрату
          </button>
        </GlassCard>
      </div>

      {/* Expense List */}
      {items.length > 0 && (
        <GlassCard>
          <p className="text-foreground mb-3 text-sm font-semibold">Останні витрати</p>
          <div className="space-y-2">
            {items.slice(0, 20).map((e) => {
              const cat = EXPENSE_CATEGORIES.find((c) => c.value === e.category);
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-lg border border-[var(--glass-border)] p-3"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm"
                    style={{
                      background: `${cat?.color ?? '#9ca3af'}15`,
                      color: cat?.color ?? '#9ca3af',
                    }}
                  >
                    {cat?.icon ?? '📌'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-foreground truncate text-sm font-medium">
                        {cat?.label ?? e.category}
                      </p>
                      {e.is_recurring && <RefreshCw className="h-3 w-3 shrink-0 text-violet-400" />}
                    </div>
                    {e.description && (
                      <p className="text-muted-foreground truncate text-xs">{e.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-sm font-semibold">{fmt(e.amount)} ₴</p>
                    <p className="text-muted-foreground text-[10px]">
                      {new Date(e.date).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ─── Payroll Tab ──────────────────────────────────────────────────────────────

function PayrollTab({ payroll }: { payroll: PayrollItem[] }) {
  const totalPayout = payroll.reduce((s, p) => s + p.total, 0);
  const totalRevenue = payroll.reduce((s, p) => s + p.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <GlassCard className="text-center">
          <p className="text-muted-foreground text-xs">Загальна виручка</p>
          <p className="text-foreground mt-1 text-xl font-bold">{fmt(totalRevenue)} ₴</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-muted-foreground text-xs">До виплати</p>
          <p className="text-foreground mt-1 text-xl font-bold">{fmt(totalPayout)} ₴</p>
        </GlassCard>
        <GlassCard className="col-span-2 text-center sm:col-span-1">
          <p className="text-muted-foreground text-xs">Майстрів</p>
          <p className="text-foreground mt-1 text-xl font-bold">{payroll.length}</p>
        </GlassCard>
      </div>

      {payroll.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Users className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-foreground font-semibold">Немає даних</p>
          <p className="text-muted-foreground mt-1 text-sm">Немає завершених записів за період</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <GlassCard padding="none" className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-[var(--glass-border)] text-left text-xs font-medium">
                    <th className="px-4 py-3">Майстер</th>
                    <th className="px-4 py-3 text-right">Виручка</th>
                    <th className="px-4 py-3 text-right">Комісія %</th>
                    <th className="px-4 py-3 text-right">Комісія ₴</th>
                    <th className="px-4 py-3 text-right">Бонус</th>
                    <th className="px-4 py-3 text-right">Утримання</th>
                    <th className="px-4 py-3 text-right">До виплати</th>
                    <th className="px-4 py-3">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {payroll.map((p) => {
                    const statusCfg = PAYROLL_STATUSES.find((s) => s.value === p.status);
                    return (
                      <tr key={p.id} className="text-foreground">
                        <td className="px-4 py-3 text-sm font-medium">{p.staff_name}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{fmt(p.revenue)}</td>
                        <td className="px-4 py-3 text-right text-xs">{p.commission_percent}%</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {fmt(p.commission_amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-emerald-500">
                          {p.bonus > 0 ? `+${fmt(p.bonus)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-rose-500">
                          {p.deductions > 0 ? `-${fmt(p.deductions)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold">{fmt(p.total)} ₴</td>
                        <td className="px-4 py-3">
                          <GlassBadge variant={statusCfg?.variant ?? 'default'} size="sm">
                            {statusCfg?.label ?? p.status}
                          </GlassBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </GlassCard>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {payroll.map((p) => {
              const statusCfg = PAYROLL_STATUSES.find((s) => s.value === p.status);
              return (
                <GlassCard key={p.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-foreground text-sm font-semibold">{p.staff_name}</p>
                    <GlassBadge variant={statusCfg?.variant ?? 'default'} size="sm">
                      {statusCfg?.label ?? p.status}
                    </GlassBadge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Виручка:</span>{' '}
                      <span className="text-foreground font-mono">{fmt(p.revenue)} ₴</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Комісія:</span>{' '}
                      <span className="text-foreground">
                        {p.commission_percent}% = {fmt(p.commission_amount)} ₴
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-2">
                    <span className="text-muted-foreground text-xs">До виплати</span>
                    <span className="text-foreground text-lg font-bold">{fmt(p.total)} ₴</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
