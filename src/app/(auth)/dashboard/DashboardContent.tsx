'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Users,
  Calendar,
  Activity,
  CalendarOff,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  UserPlus,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { BentoGrid, BentoItem, StatCard, GlassCard, GlassBadge } from '@/components/glass';
import { FadeIn, CountUp, StaggerList } from '@/components/animations';
import type { DashboardData, TodayAppointment, RecentActivity } from '@/lib/queries/dashboard';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardContentProps {
  data: DashboardData;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(isoString: string): string {
  return format(new Date(isoString), 'HH:mm');
}

function relativeTime(isoString: string): string {
  return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: uk });
}

function todayFormatted(): string {
  return format(new Date(), 'd MMMM, EEEE', { locale: uk });
}

const statusBadgeMap: Record<
  string,
  { variant: 'warning' | 'success' | 'primary' | 'info' | 'error' | 'default'; label: string }
> = {
  scheduled: { variant: 'warning', label: 'Заплановано' },
  confirmed: { variant: 'info', label: 'Підтверджено' },
  in_progress: { variant: 'primary', label: 'В процесі' },
  completed: { variant: 'success', label: 'Завершено' },
  cancelled: { variant: 'error', label: 'Скасовано' },
  no_show: { variant: 'error', label: 'Не прийшов' },
};

const rfmConfig: {
  key: string;
  label: string;
  variant: 'vip' | 'loyal' | 'regular' | 'new' | 'sleeping' | 'lost';
  colorClass: string;
}[] = [
  { key: 'vip', label: 'VIP', variant: 'vip', colorClass: 'from-amber-400 to-orange-500' },
  { key: 'loyal', label: 'Лояльні', variant: 'loyal', colorClass: 'from-violet-400 to-purple-500' },
  {
    key: 'regular',
    label: 'Звичайні',
    variant: 'regular',
    colorClass: 'from-emerald-400 to-green-500',
  },
  { key: 'new', label: 'Нові', variant: 'new', colorClass: 'from-blue-400 to-cyan-500' },
  {
    key: 'sleeping',
    label: 'Сплячі',
    variant: 'sleeping',
    colorClass: 'from-orange-400 to-amber-500',
  },
  { key: 'lost', label: 'Втрачені', variant: 'lost', colorClass: 'from-gray-400 to-gray-500' },
];

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyDashboard() {
  return (
    <FadeIn>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/12">
          <Database className="h-8 w-8 text-violet-400" />
        </div>
        <h2 className="text-text-primary text-xl font-bold">Немає даних</h2>
        <p className="text-text-secondary mt-2 max-w-sm text-sm">
          Запустіть онбординг або додайте перший запис, щоб побачити дашборд
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
          >
            Онбординг
          </Link>
          <Link
            href="/dashboard/calendar"
            className="text-text-primary inline-flex items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 text-sm font-medium transition-all hover:border-[var(--glass-border-hover)]"
          >
            Додати запис
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DashboardContent({ data }: DashboardContentProps) {
  const isEmpty =
    data.clients.total === 0 && data.todayAppointments.length === 0 && data.revenue.current === 0;

  if (isEmpty) return <EmptyDashboard />;

  const confirmedToday = data.todayAppointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'in_progress'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">Дашборд</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">{todayFormatted()} — Огляд салону</p>
        </div>
      </FadeIn>

      {/* Stat Cards */}
      <StaggerList
        delay={0.08}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6"
      >
        <StatCard
          title="Виручка за місяць"
          value={data.revenue.current}
          suffix="₴"
          icon={<DollarSign className="h-5 w-5" />}
          trend={
            data.revenue.previous > 0
              ? { value: data.revenue.trend, label: 'порівняно з мин. міс.' }
              : undefined
          }
          accentColor="success"
        />
        <StatCard
          title="Клієнти"
          value={data.clients.total}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 0, label: `+${data.clients.newThisMonth} нових` }}
          accentColor="primary"
        />
        <StatCard
          title="Записи сьогодні"
          value={data.todayAppointments.length}
          icon={<Calendar className="h-5 w-5" />}
          trend={{ value: 0, label: `${confirmedToday} підтверджено` }}
          accentColor="info"
        />
        <StatCard
          title="Завантаженість"
          value={data.occupancy}
          suffix="%"
          icon={<Activity className="h-5 w-5" />}
          accentColor="warning"
        />
      </StaggerList>

      {/* Schedule + Sterilization */}
      <BentoGrid columns={3} gap="md">
        {/* Today's Schedule */}
        <BentoItem colSpan={2}>
          <FadeIn delay={0.2}>
            <TodaySchedule appointments={data.todayAppointments} />
          </FadeIn>
        </BentoItem>

        {/* Sterilization */}
        <BentoItem>
          <FadeIn delay={0.3}>
            <SterilizationCard sterilization={data.sterilization} />
          </FadeIn>
        </BentoItem>
      </BentoGrid>

      {/* RFM + Activity — visually separated section */}
      <div className="border-border/30 border-t pt-8">
        <BentoGrid columns={3} gap="md">
          {/* RFM Segments */}
          <BentoItem colSpan={2}>
            <FadeIn delay={0.35}>
              <RfmSegmentsCard segments={data.rfmSegments} totalClients={data.clients.total} />
            </FadeIn>
          </BentoItem>

          {/* Recent Activity */}
          <BentoItem>
            <FadeIn delay={0.4}>
              <RecentActivityCard activities={data.recentActivity} />
            </FadeIn>
          </BentoItem>
        </BentoGrid>
      </div>

      {/* Mobile FAB */}
      <MobileFab />
    </div>
  );
}

// ─── Today's Schedule ────────────────────────────────────────────────────────

function TodaySchedule({ appointments }: { appointments: TodayAppointment[] }) {
  return (
    <GlassCard padding="md" className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-info-light flex h-8 w-8 items-center justify-center rounded-lg">
            <Calendar className="text-info h-4 w-4" />
          </div>
          <h2 className="text-foreground text-base font-semibold">
            Сьогодні, {format(new Date(), 'd MMMM', { locale: uk })}
          </h2>
        </div>
        <span className="text-text-muted text-xs">{appointments.length} записів</span>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CalendarOff className="text-text-muted mb-3 h-10 w-10" />
          <p className="text-text-secondary text-sm">Немає записів на сьогодні</p>
        </div>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {appointments.map((appt) => {
            const badge = statusBadgeMap[appt.status] ?? {
              variant: 'warning' as const,
              label: 'Заплановано',
            };
            return (
              <div
                key={appt.id}
                className="flex items-center gap-3 rounded-lg bg-[var(--surface)]/50 p-3 transition-colors hover:bg-[var(--glass-bg-hover)]"
              >
                {/* Time */}
                <span className="text-foreground w-12 shrink-0 text-right font-mono text-sm font-medium">
                  {formatTime(appt.start_time)}
                </span>

                {/* Divider dot */}
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/60" />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">
                    {appt.client
                      ? `${appt.client.first_name} ${appt.client.last_name ?? ''}`.trim()
                      : 'Клієнт'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-text-secondary truncate text-xs">
                      {appt.service?.name ?? 'Послуга'}
                    </p>
                    {appt.staff && (
                      <span className="text-text-muted text-xs">— {appt.staff.first_name}</span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <GlassBadge variant={badge.variant} size="sm" dot>
                  {badge.label}
                </GlassBadge>
              </div>
            );
          })}
        </div>
      )}

      {/* New appointment button */}
      <div className="mt-4 flex justify-center">
        <Link
          href="/dashboard/calendar"
          className="text-primary hover:bg-primary/5 border-primary/30 inline-flex items-center gap-1.5 rounded-lg border border-dashed px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Новий запис
        </Link>
      </div>
    </GlassCard>
  );
}

// ─── Sterilization Card ──────────────────────────────────────────────────────

function SterilizationCard({ sterilization }: { sterilization: DashboardData['sterilization'] }) {
  const hasIssues = sterilization.expiredPackages > 0;
  const hasActivity = sterilization.todayCycles > 0 || sterilization.lastCycle;

  return (
    <GlassCard padding="md" className="h-full">
      <div className="mb-4 flex items-center gap-2.5">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            hasIssues ? 'bg-warning-light' : 'bg-success-light'
          )}
        >
          <Shield className={cn('h-4 w-4', hasIssues ? 'text-warning' : 'text-success')} />
        </div>
        <h2 className="text-foreground text-base font-semibold">Стерилізація</h2>
      </div>

      <div className="space-y-3">
        {/* Today's cycles */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Цикли сьогодні</span>
          <span className="text-foreground font-mono text-sm font-medium">
            {sterilization.completedToday}/{sterilization.todayCycles}
            <span className="text-text-muted ml-1 text-xs">завершено</span>
          </span>
        </div>

        {/* Last cycle */}
        {sterilization.lastCycle && (
          <div className="rounded-lg bg-[var(--surface)]/50 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-text-muted font-mono text-xs">
                {sterilization.lastCycle.cycle_number}
              </span>
              <GlassBadge
                variant={
                  sterilization.lastCycle.result === 'sterile'
                    ? 'success'
                    : sterilization.lastCycle.result === 'failed'
                      ? 'error'
                      : 'default'
                }
                size="sm"
                dot
              >
                {sterilization.lastCycle.result === 'sterile'
                  ? 'Стерильно'
                  : sterilization.lastCycle.result === 'failed'
                    ? 'Невдача'
                    : 'В процесі'}
              </GlassBadge>
            </div>
            <p className="text-text-muted mt-1 text-xs">
              {format(new Date(sterilization.lastCycle.started_at), 'd MMM, HH:mm', { locale: uk })}
            </p>
          </div>
        )}

        {/* Expired packages alert */}
        {hasIssues && (
          <div className="bg-warning-light flex items-center gap-2 rounded-lg p-2.5">
            <AlertTriangle className="text-warning h-4 w-4 shrink-0" />
            <span className="text-warning text-xs font-medium">
              {sterilization.expiredPackages} протерміновано
            </span>
          </div>
        )}

        {/* All good */}
        {!hasIssues && !hasActivity && (
          <div className="flex items-center gap-2 py-2">
            <CheckCircle className="text-success h-4 w-4" />
            <span className="text-text-secondary text-sm">Все в порядку</span>
          </div>
        )}
      </div>

      {/* New cycle link */}
      <Link
        href="/dashboard/sterilization"
        className="text-text-secondary mt-4 flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-violet-400"
      >
        Новий цикл
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </GlassCard>
  );
}

// ─── RFM Segments ────────────────────────────────────────────────────────────

function RfmSegmentsCard({
  segments,
  totalClients,
}: {
  segments: Record<string, number>;
  totalClients: number;
}) {
  const maxCount = Math.max(...Object.values(segments), 1);

  return (
    <GlassCard padding="md" className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary-light flex h-8 w-8 items-center justify-center rounded-lg">
            <Users className="text-primary h-4 w-4" />
          </div>
          <h2 className="text-foreground text-base font-semibold">Клієнти за сегментами</h2>
        </div>
        <span className="text-text-muted text-xs">{totalClients} всього</span>
      </div>

      <div className="space-y-3">
        {rfmConfig.map((rfm) => {
          const count = segments[rfm.key] ?? 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={rfm.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GlassBadge variant={rfm.variant} size="sm">
                    {rfm.label}
                  </GlassBadge>
                </div>
                <span className="text-foreground font-mono text-sm font-medium">
                  <CountUp end={count} duration={800} />
                </span>
              </div>

              {/* Bar */}
              <div className="h-2 overflow-hidden rounded-full bg-[var(--glass-bg)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className={cn('h-full rounded-full bg-gradient-to-r', rfm.colorClass)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ─── Recent Activity ─────────────────────────────────────────────────────────

function RecentActivityCard({ activities }: { activities: RecentActivity[] }) {
  return (
    <GlassCard padding="md" className="h-full">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="bg-primary-light flex h-8 w-8 items-center justify-center rounded-lg">
          <Activity className="text-primary h-4 w-4" />
        </div>
        <h2 className="text-foreground text-base font-semibold">Останні дії</h2>
      </div>

      {activities.length === 0 ? (
        <p className="text-text-muted py-6 text-center text-sm">Немає активності</p>
      ) : (
        <>
          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg bg-[var(--surface)]/50 p-2.5"
              >
                <div className="bg-info-light mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                  <Calendar className="text-info h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="text-foreground font-medium">{activity.client_name}</span>
                    <span className="text-muted-foreground"> — </span>
                    <span className="text-foreground">{activity.service_name}</span>
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {activity.staff_name && (
                      <span className="text-muted-foreground text-xs">{activity.staff_name}</span>
                    )}
                    <span className="text-muted-foreground font-mono text-xs">
                      {activity.price > 0 ? `${activity.price.toLocaleString('uk-UA')} ₴` : ''}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {relativeTime(activity.start_time)}
                    </span>
                  </div>
                </div>

                {activity.status === 'completed' && (
                  <GlassBadge variant="success" size="sm">
                    OK
                  </GlassBadge>
                )}
                {activity.status === 'cancelled' && (
                  <GlassBadge variant="error" size="sm">
                    X
                  </GlassBadge>
                )}
              </div>
            ))}
          </div>

          {/* View all link */}
          <Link
            href="/dashboard/calendar"
            className="text-muted-foreground hover:text-primary mt-4 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
          >
            Дивитися всі
            <ArrowRight className="h-3 w-3" />
          </Link>
        </>
      )}
    </GlassCard>
  );
}

// ─── Mobile FAB ──────────────────────────────────────────────────────────────

function MobileFab() {
  const [open, setOpen] = useState(false);

  const fabActions = [
    { href: '/dashboard/calendar', label: 'Новий запис', icon: Calendar },
    { href: '/dashboard/clients', label: 'Новий клієнт', icon: UserPlus },
    { href: '/dashboard/sterilization', label: 'Стерилізація', icon: Shield },
  ];

  return (
    <div className="fixed right-4 bottom-20 z-30 lg:hidden">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-3 flex flex-col gap-2"
          >
            {fabActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={action.href}
                    onClick={() => setOpen(false)}
                    className="bg-background flex items-center gap-2.5 rounded-full border border-[var(--glass-border)] px-4 py-2.5 shadow-lg"
                  >
                    <Icon className="h-4 w-4 text-violet-400" />
                    <span className="text-text-primary text-sm font-medium">{action.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all',
          'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white',
          'shadow-violet-500/30 hover:shadow-violet-500/50',
          open && 'rotate-45'
        )}
      >
        <Plus className="h-6 w-6 transition-transform duration-200" />
      </button>
    </div>
  );
}
