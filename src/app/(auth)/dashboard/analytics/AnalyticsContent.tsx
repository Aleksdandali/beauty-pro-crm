'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Scissors,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Crown,
  Heart,
  User,
  UserPlus,
  Moon,
  UserX,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  Zap,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassBadge, StatCard } from '@/components/glass';
import { FadeIn } from '@/components/animations';
import { RFMBadge } from '@/components/shared/RFMBadge';
import {
  RFM_SEGMENTS,
  type RFMSegment,
  type RFMResult,
  type SegmentSummary,
} from '@/lib/rfm-engine';
import type {
  AnalyticsSummary,
  NewVsReturning,
  PopularService,
  HourlyLoad,
  MonthlyGrowth,
  TopClient,
  ServiceDuration,
  RetentionCohort,
  Insight,
} from '@/lib/queries/analytics';
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
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  summary: AnalyticsSummary;
  rfmResults: RFMResult[];
  rfmSegments: SegmentSummary[];
  newVsReturning: NewVsReturning[];
  popularServices: PopularService[];
  hourlyLoad: HourlyLoad[];
  monthlyGrowth: MonthlyGrowth[];
  topClients: TopClient[];
  serviceDurations: ServiceDuration[];
  cohorts: RetentionCohort[];
  insights: Insight[];
}

type Tab = 'rfm' | 'clients' | 'services' | 'insights';

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'rfm', label: 'RFM Аналіз', icon: Users },
  { key: 'clients', label: 'Клієнти', icon: UserCheck },
  { key: 'services', label: 'Послуги', icon: Scissors },
  { key: 'insights', label: 'Інсайти', icon: Lightbulb },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('uk-UA');
}

const SEGMENT_COLORS: Record<RFMSegment, string> = {
  vip: '#8B5CF6',
  loyal: '#10B981',
  regular: '#3B82F6',
  new: '#06B6D4',
  sleeping: '#F59E0B',
  lost: '#F43F5E',
};

const SEGMENT_ICONS: Record<RFMSegment, React.ReactNode> = {
  vip: <Crown className="h-4 w-4" />,
  loyal: <Heart className="h-4 w-4" />,
  regular: <User className="h-4 w-4" />,
  new: <UserPlus className="h-4 w-4" />,
  sleeping: <Moon className="h-4 w-4" />,
  lost: <UserX className="h-4 w-4" />,
};

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  'trending-up': <TrendingUp className="h-4 w-4" />,
  'trending-down': <TrendingDown className="h-4 w-4" />,
  alert: <AlertTriangle className="h-4 w-4" />,
  lightbulb: <Lightbulb className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
};

const PRIORITY_FALLBACK = {
  bg: 'bg-gray-500/10',
  text: 'text-gray-400',
  border: 'border-gray-500/20',
};
const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  low: PRIORITY_FALLBACK,
};

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

// ─── Component ───────────────────────────────────────────────────────────────

export function AnalyticsContent({
  summary,
  rfmResults,
  rfmSegments,
  newVsReturning,
  popularServices,
  hourlyLoad,
  monthlyGrowth,
  topClients,
  serviceDurations,
  cohorts,
  insights,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('rfm');

  return (
    <FadeIn className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Аналітика
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {rfmResults.length} клієнтів проаналізовано
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          title="Retention Rate"
          value={summary.retentionRate}
          suffix="%"
          icon={<Target className="h-5 w-5" />}
          accentColor={summary.retentionRate >= 60 ? 'success' : 'warning'}
          size="sm"
        />
        <StatCard
          title="Середній чек"
          value={fmt(summary.averageCheck)}
          suffix="₴"
          icon={<BarChart3 className="h-5 w-5" />}
          accentColor="primary"
          size="sm"
        />
        <StatCard
          title="LTV клієнта"
          value={fmt(summary.clientLTV)}
          suffix="₴"
          icon={<Zap className="h-5 w-5" />}
          accentColor="info"
          size="sm"
        />
        <StatCard
          title="Конверсія"
          value={summary.conversionRate}
          suffix="%"
          icon={<UserCheck className="h-5 w-5" />}
          accentColor={summary.conversionRate >= 70 ? 'success' : 'warning'}
          size="sm"
        />
        <StatCard
          title="Нових за місяць"
          value={summary.newClientsMonth}
          icon={<UserPlus className="h-5 w-5" />}
          accentColor="success"
          size="sm"
        />
        <StatCard
          title="Завантаженість"
          value={summary.loadRate}
          suffix="%"
          icon={<Clock className="h-5 w-5" />}
          accentColor={
            summary.loadRate >= 60 ? 'success' : summary.loadRate >= 40 ? 'warning' : 'error'
          }
          size="sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-all sm:text-sm',
                isActive
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'rfm' && <RFMTab segments={rfmSegments} results={rfmResults} />}
      {activeTab === 'clients' && (
        <ClientsTab
          newVsReturning={newVsReturning}
          cohorts={cohorts}
          topClients={topClients}
          monthlyGrowth={monthlyGrowth}
        />
      )}
      {activeTab === 'services' && (
        <ServicesTab
          popularServices={popularServices}
          hourlyLoad={hourlyLoad}
          serviceDurations={serviceDurations}
        />
      )}
      {activeTab === 'insights' && <InsightsTab insights={insights} />}
    </FadeIn>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: RFM Analysis
// ═══════════════════════════════════════════════════════════════════════════════

function RFMTab({ segments, results }: { segments: SegmentSummary[]; results: RFMResult[] }) {
  const [expandedSegment, setExpandedSegment] = useState<RFMSegment | null>(null);

  const donutData = segments
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: s.info.label,
      value: s.count,
      color: SEGMENT_COLORS[s.segment],
    }));

  return (
    <div className="space-y-4">
      {/* Donut + Segment cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Donut Chart */}
        <GlassCard>
          <p className="text-foreground mb-3 font-semibold">Розподіл сегментів</p>
          <div className="mx-auto h-64 w-full max-w-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="transparent"
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={((value: unknown) => [`${value} клієнтів`, '']) as never}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">
                  {d.name}: {d.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Segment Cards */}
        <div className="space-y-2">
          {segments.map((seg) => {
            const isExpanded = expandedSegment === seg.segment;
            const info = seg.info;

            return (
              <GlassCard
                key={seg.segment}
                className="cursor-pointer transition-all"
                onClick={() => setExpandedSegment(isExpanded ? null : seg.segment)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: SEGMENT_COLORS[seg.segment] }}
                  >
                    {SEGMENT_ICONS[seg.segment]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm font-semibold">{info.label}</span>
                      <GlassBadge variant="default" size="sm">
                        {seg.count}
                      </GlassBadge>
                      <span className="text-muted-foreground text-xs">{seg.percentage}%</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{info.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-sm font-bold">{fmt(seg.avgSpent)} ₴</p>
                    <p className="text-muted-foreground text-[10px]">сер. витрати</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="text-muted-foreground h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3 border-t border-[var(--glass-border)] pt-3">
                    {/* Recommendations */}
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                        Рекомендації
                      </p>
                      <ul className="space-y-1">
                        {info.recommendations.map((rec, i) => (
                          <li key={i} className="text-foreground flex items-start gap-2 text-xs">
                            <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Client list */}
                    {seg.clients.length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                          Клієнти ({seg.clients.length})
                        </p>
                        <div className="max-h-48 space-y-1 overflow-y-auto">
                          {seg.clients.slice(0, 20).map((c) => (
                            <div
                              key={c.clientId}
                              className="flex items-center justify-between rounded-md bg-[var(--surface)] px-2.5 py-1.5 text-xs"
                            >
                              <span className="text-foreground font-medium">{c.clientName}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">
                                  R:{c.scores.recency} F:{c.scores.frequency} M:{c.scores.monetary}
                                </span>
                                <span className="text-foreground font-mono font-bold">
                                  {fmt(Math.round(c.totalSpent))} ₴
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Full RFM Table */}
      <GlassCard>
        <p className="text-foreground mb-3 font-semibold">RFM таблиця клієнтів</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--glass-border)]">
                <th className="text-muted-foreground px-3 py-2 text-left font-semibold">Клієнт</th>
                <th className="text-muted-foreground px-2 py-2 text-center font-semibold">R</th>
                <th className="text-muted-foreground px-2 py-2 text-center font-semibold">F</th>
                <th className="text-muted-foreground px-2 py-2 text-center font-semibold">M</th>
                <th className="text-muted-foreground px-3 py-2 text-left font-semibold">Сегмент</th>
                <th className="text-muted-foreground px-3 py-2 text-right font-semibold">
                  Витрати
                </th>
                <th className="text-muted-foreground hidden px-3 py-2 text-right font-semibold sm:table-cell">
                  Візити
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {results.slice(0, 30).map((r) => (
                <tr key={r.clientId} className="hover:bg-[var(--glass-bg-hover)]">
                  <td className="text-foreground px-3 py-2 font-medium">{r.clientName}</td>
                  <td className="px-2 py-2 text-center">
                    <ScoreBadge score={r.scores.recency} />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <ScoreBadge score={r.scores.frequency} />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <ScoreBadge score={r.scores.monetary} />
                  </td>
                  <td className="px-3 py-2">
                    <RFMBadge segment={r.segment} />
                  </td>
                  <td className="text-foreground px-3 py-2 text-right font-mono">
                    {fmt(Math.round(r.totalSpent))} ₴
                  </td>
                  <td className="text-muted-foreground hidden px-3 py-2 text-right sm:table-cell">
                    {r.totalVisits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 4
      ? 'bg-emerald-500/20 text-emerald-500'
      : score >= 3
        ? 'bg-blue-500/20 text-blue-500'
        : score >= 2
          ? 'bg-amber-500/20 text-amber-500'
          : 'bg-rose-500/20 text-rose-500';

  return (
    <span className={cn('inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold', color)}>
      {score}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: Clients
// ═══════════════════════════════════════════════════════════════════════════════

function ClientsTab({
  newVsReturning,
  cohorts,
  topClients,
  monthlyGrowth,
}: {
  newVsReturning: NewVsReturning[];
  cohorts: RetentionCohort[];
  topClients: TopClient[];
  monthlyGrowth: MonthlyGrowth[];
}) {
  return (
    <div className="space-y-4">
      {/* New vs Returning */}
      <GlassCard>
        <p className="text-foreground mb-3 font-semibold">Нові vs Повторні клієнти</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={newVsReturning} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={
                  ((value: unknown, name: unknown) => [
                    value,
                    name === 'newClients' ? 'Нові' : 'Повторні',
                  ]) as never
                }
              />
              <Bar
                dataKey="returning"
                stackId="a"
                fill="#8B5CF6"
                radius={[0, 0, 0, 0]}
                name="returning"
              />
              <Bar
                dataKey="newClients"
                stackId="a"
                fill="#06B6D4"
                radius={[4, 4, 0, 0]}
                name="newClients"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[#06B6D4]" />
            <span className="text-muted-foreground">Нові</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
            <span className="text-muted-foreground">Повторні</span>
          </div>
        </div>
      </GlassCard>

      {/* Retention Cohort */}
      <GlassCard>
        <p className="text-foreground mb-3 font-semibold">Retention по когортах</p>
        <p className="text-muted-foreground mb-3 text-xs">
          % клієнтів, що повернулись через 1/2/3 місяці після першого візиту
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--glass-border)]">
                <th className="text-muted-foreground px-3 py-2 text-left font-semibold">Когорта</th>
                <th className="text-muted-foreground px-3 py-2 text-center font-semibold">
                  Клієнтів
                </th>
                <th className="text-muted-foreground px-3 py-2 text-center font-semibold">
                  +1 міс
                </th>
                <th className="text-muted-foreground px-3 py-2 text-center font-semibold">
                  +2 міс
                </th>
                <th className="text-muted-foreground px-3 py-2 text-center font-semibold">
                  +3 міс
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {cohorts.map((c) => (
                <tr key={c.cohortMonth} className="hover:bg-[var(--glass-bg-hover)]">
                  <td className="text-foreground px-3 py-2 font-medium">{c.cohortMonth}</td>
                  <td className="text-muted-foreground px-3 py-2 text-center">{c.total}</td>
                  <td className="px-3 py-2 text-center">
                    <CohortCell value={c.month1} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <CohortCell value={c.month2} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <CohortCell value={c.month3} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Growth Chart */}
      <GlassCard>
        <p className="text-foreground mb-3 font-semibold">Динаміка за 6 місяців</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={
                  ((value: unknown, name: unknown) => [
                    value,
                    name === 'appointments'
                      ? 'Записи'
                      : name === 'clients'
                        ? 'Клієнти'
                        : String(name),
                  ]) as never
                }
              />
              <Area
                type="monotone"
                dataKey="appointments"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.1}
                strokeWidth={2}
                name="appointments"
              />
              <Area
                type="monotone"
                dataKey="clients"
                stroke="#06B6D4"
                fill="#06B6D4"
                fillOpacity={0.1}
                strokeWidth={2}
                name="clients"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Top Clients */}
      <GlassCard>
        <p className="text-foreground mb-3 font-semibold">Топ-10 клієнтів по витратах</p>
        <div className="space-y-2">
          {topClients.map((c, i) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-lg bg-[var(--surface)] px-3 py-2.5"
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                  i < 3
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
                    : 'text-muted-foreground border border-[var(--glass-border)] bg-[var(--glass-bg)]'
                )}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">{c.name}</p>
                <p className="text-muted-foreground text-xs">{c.totalVisits} візитів</p>
              </div>
              <RFMBadge segment={c.segment as RFMSegment} size="sm" />
              <span className="text-foreground font-mono text-sm font-bold">
                {fmt(c.totalSpent)} ₴
              </span>
            </div>
          ))}
          {topClients.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">Немає даних</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function CohortCell({ value }: { value: number }) {
  const bg =
    value >= 50
      ? 'bg-emerald-500/20 text-emerald-500'
      : value >= 30
        ? 'bg-amber-500/20 text-amber-500'
        : value > 0
          ? 'bg-rose-500/20 text-rose-500'
          : 'text-muted-foreground';

  return <span className={cn('rounded-md px-2 py-0.5 text-xs font-bold', bg)}>{value}%</span>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: Services
// ═══════════════════════════════════════════════════════════════════════════════

function ServicesTab({
  popularServices,
  hourlyLoad,
  serviceDurations,
}: {
  popularServices: PopularService[];
  hourlyLoad: HourlyLoad[];
  serviceDurations: ServiceDuration[];
}) {
  const maxCount = Math.max(...popularServices.map((s) => s.count), 1);

  // Heatmap: find max for color intensity
  const maxHeat = Math.max(...hourlyLoad.map((h) => h.count), 1);

  return (
    <div className="space-y-4">
      {/* Popular Services — horizontal bars */}
      <GlassCard>
        <p className="text-foreground mb-3 font-semibold">Топ послуги</p>
        <div className="space-y-2">
          {popularServices.map((s) => (
            <div key={s.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium">{s.name}</span>
                <span className="text-muted-foreground">
                  {s.count} записів / {fmt(s.revenue)} ₴
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                  style={{ width: `${(s.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {popularServices.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">Немає даних</p>
          )}
        </div>
      </GlassCard>

      {/* Heatmap: Days x Hours */}
      <GlassCard>
        <p className="text-foreground mb-3 font-semibold">Завантаженість по годинах</p>
        <p className="text-muted-foreground mb-3 text-xs">
          Кількість записів за останні 3 місяці (дні тижня / години)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr>
                <th className="text-muted-foreground px-1 py-1 text-left font-medium" />
                {Array.from({ length: 12 }, (_, i) => i + 9).map((h) => (
                  <th key={h} className="text-muted-foreground px-1 py-1 text-center font-medium">
                    {h}:00
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAY_NAMES.map((dayName, dayIdx) => (
                <tr key={dayIdx}>
                  <td className="text-muted-foreground px-1 py-1 font-medium">{dayName}</td>
                  {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => {
                    const cell = hourlyLoad.find((h) => h.day === dayIdx && h.hour === hour);
                    const count = cell?.count ?? 0;
                    const intensity = maxHeat > 0 ? count / maxHeat : 0;

                    return (
                      <td key={hour} className="px-0.5 py-0.5">
                        <div
                          className="flex h-6 w-full items-center justify-center rounded-sm text-[9px] font-bold transition-colors"
                          style={{
                            backgroundColor:
                              count === 0
                                ? 'var(--surface)'
                                : `rgba(139, 92, 246, ${0.15 + intensity * 0.7})`,
                            color: intensity > 0.5 ? 'white' : 'var(--text-secondary)',
                          }}
                          title={`${dayName} ${hour}:00 — ${count} записів`}
                        >
                          {count > 0 ? count : ''}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Service Duration vs Revenue scatter */}
      <GlassCard>
        <p className="text-foreground mb-3 font-semibold">Тривалість vs Дохід</p>
        {serviceDurations.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis
                  type="number"
                  dataKey="duration"
                  name="Тривалість"
                  unit=" хв"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                />
                <YAxis
                  type="number"
                  dataKey="revenue"
                  name="Дохід"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                />
                <ZAxis type="number" dataKey="count" range={[40, 400]} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={
                    ((value: unknown, name: unknown) => {
                      if (name === 'Тривалість') return [`${value} хв`, name];
                      if (name === 'Дохід') return [`${fmt(Number(value ?? 0))} ₴`, name];
                      return [value, name];
                    }) as never
                  }
                />
                <Scatter data={serviceDurations} fill="#8B5CF6" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-muted-foreground py-6 text-center text-sm">Немає даних</p>
        )}

        {/* Service table */}
        {serviceDurations.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="text-muted-foreground px-3 py-2 text-left font-semibold">
                    Послуга
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-center font-semibold">Хв</th>
                  <th className="text-muted-foreground px-3 py-2 text-center font-semibold">
                    К-сть
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-right font-semibold">
                    Дохід
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-right font-semibold">₴/хв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {serviceDurations.map((s) => (
                  <tr key={s.name} className="hover:bg-[var(--glass-bg-hover)]">
                    <td className="text-foreground px-3 py-2 font-medium">{s.name}</td>
                    <td className="text-muted-foreground px-3 py-2 text-center">{s.duration}</td>
                    <td className="text-muted-foreground px-3 py-2 text-center">{s.count}</td>
                    <td className="text-foreground px-3 py-2 text-right font-mono">
                      {fmt(s.revenue)} ₴
                    </td>
                    <td className="text-foreground px-3 py-2 text-right font-mono">
                      {s.duration > 0 ? Math.round(s.revenue / s.count / s.duration) : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: Insights
// ═══════════════════════════════════════════════════════════════════════════════

function InsightsTab({ insights }: { insights: Insight[] }) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <Lightbulb className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="text-foreground font-semibold">Автоматичні інсайти</p>
            <p className="text-muted-foreground text-xs">Згенеровано на основі ваших даних</p>
          </div>
        </div>

        {insights.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Недостатньо даних для генерації інсайтів. Додайте більше записів.
          </p>
        )}

        <div className="space-y-3">
          {insights.map((insight) => {
            const style = PRIORITY_STYLES[insight.priority] ?? PRIORITY_FALLBACK;
            return (
              <div
                key={insight.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 transition-all',
                  style.border,
                  style.bg
                )}
              >
                <div className={cn('mt-0.5 shrink-0', style.text)}>
                  {INSIGHT_ICONS[insight.icon] ?? <Lightbulb className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm leading-snug font-medium">{insight.text}</p>
                </div>
                <GlassBadge
                  variant={
                    insight.priority === 'high'
                      ? 'primary'
                      : insight.priority === 'medium'
                        ? 'warning'
                        : 'default'
                  }
                  size="sm"
                >
                  {insight.priority === 'high'
                    ? 'Важливо'
                    : insight.priority === 'medium'
                      ? 'Увага'
                      : 'Інфо'}
                </GlassBadge>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
