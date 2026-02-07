'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  UserCircle,
  FlaskConical,
  Camera,
  History,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Copy,
  Check,
  ImageOff,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { GlassCard, GlassBadge } from '@/components/glass';
import { FadeIn, CountUp } from '@/components/animations';
import { ClientFormula } from '@/components/shared/ClientFormula';
import { RFM_SEGMENTS, SOURCE_LABELS } from '@/schemas/client';
import type { ClientRow, ClientAppointment, ClientPhoto } from '@/lib/queries/clients';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientDetailProps {
  client: ClientRow;
  appointments: ClientAppointment[];
  photos: ClientPhoto[];
}

const RFM_BADGE_MAP: Record<string, 'vip' | 'loyal' | 'regular' | 'new' | 'sleeping' | 'lost'> = {
  vip: 'vip',
  loyal: 'loyal',
  regular: 'regular',
  new: 'new',
  sleeping: 'sleeping',
  lost: 'lost',
};

// ─── Tabs Config ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'info', label: 'Інформація', icon: UserCircle },
  { id: 'formula', label: 'Формула', icon: FlaskConical },
  { id: 'photos', label: 'Фото', icon: Camera },
  { id: 'history', label: 'Історія', icon: History },
  { id: 'finances', label: 'Фінанси', icon: DollarSign },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string | null): string {
  return `${first[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

function avatarColor(name: string): string {
  const colors = [
    'from-violet-400 to-purple-500',
    'from-blue-400 to-cyan-500',
    'from-emerald-400 to-green-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length]!;
}

const STATUS_MAP: Record<
  string,
  { variant: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'default'; label: string }
> = {
  completed: { variant: 'success', label: 'Завершено' },
  confirmed: { variant: 'info', label: 'Підтверджено' },
  scheduled: { variant: 'warning', label: 'Заплановано' },
  in_progress: { variant: 'primary', label: 'В процесі' },
  cancelled: { variant: 'error', label: 'Скасовано' },
  no_show: { variant: 'error', label: 'Не прийшов' },
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Готівка',
  card: 'Картка',
  transfer: 'Переказ',
  mixed: 'Змішана',
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function ClientDetail({ client, appointments, photos }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [copied, setCopied] = useState(false);
  const fullName = `${client.first_name} ${client.last_name ?? ''}`.trim();

  const copyPhone = useCallback(async () => {
    await navigator.clipboard.writeText(client.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [client.phone]);

  return (
    <div className="space-y-6">
      {/* ── Back + Header ─────────────────────────── */}
      <FadeIn>
        <Link
          href="/dashboard/clients"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад до клієнтів
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white',
                avatarColor(fullName)
              )}
            >
              {getInitials(client.first_name, client.last_name)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-foreground text-xl font-bold sm:text-2xl">{fullName}</h1>
                <GlassBadge variant={RFM_BADGE_MAP[client.rfm_segment] ?? 'default'} size="md">
                  {RFM_SEGMENTS.find((s) => s.key === client.rfm_segment)?.label ??
                    client.rfm_segment}
                </GlassBadge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <button
                  onClick={copyPhone}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {client.phone}
                  {copied ? (
                    <Check className="text-success h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-50" />
                  )}
                </button>
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {client.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/calendar"
            className="inline-flex items-center gap-2 self-start rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40"
          >
            <Calendar className="h-4 w-4" />
            Новий запис
          </Link>
        </div>
      </FadeIn>

      {/* ── Tabs ──────────────────────────────────── */}
      <div className="relative border-b border-[var(--glass-border)]">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex shrink-0 items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {active && (
                  <motion.div
                    layoutId="client-tab-indicator"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────── */}
      <div>
        {activeTab === 'info' && <InfoTab client={client} />}
        {activeTab === 'formula' && (
          <ClientFormula
            clientId={client.id}
            formulas={client.formulas as Record<string, unknown>}
          />
        )}
        {activeTab === 'photos' && <PhotosTab photos={photos} />}
        {activeTab === 'history' && <HistoryTab appointments={appointments} />}
        {activeTab === 'finances' && <FinancesTab appointments={appointments} client={client} />}
      </div>
    </div>
  );
}

// ─── Info Tab ────────────────────────────────────────────────────────────────

function InfoTab({ client }: { client: ClientRow }) {
  return (
    <GlassCard padding="md">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InfoField label="Ім'я" value={client.first_name} />
        <InfoField label="Прізвище" value={client.last_name ?? '—'} />
        <InfoField label="Телефон" value={client.phone} mono />
        <InfoField label="Email" value={client.email ?? '—'} />
        <InfoField
          label="Дата народження"
          value={
            client.birthday ? format(new Date(client.birthday), 'd MMMM yyyy', { locale: uk }) : '—'
          }
        />
        <InfoField label="Джерело" value={SOURCE_LABELS[client.source] ?? client.source} />
        <div className="sm:col-span-2">
          <InfoField label="Нотатки" value={client.notes ?? '—'} />
        </div>
        <InfoField
          label="Дата створення"
          value={format(new Date(client.created_at), 'd MMMM yyyy, HH:mm', { locale: uk })}
        />
      </div>
    </GlassCard>
  );
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-xs font-medium">{label}</p>
      <p className={cn('text-foreground text-sm', mono && 'font-mono')}>{value}</p>
    </div>
  );
}

// ─── Photos Tab ──────────────────────────────────────────────────────────────

function PhotosTab({ photos }: { photos: ClientPhoto[] }) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/12">
          <ImageOff className="h-7 w-7 text-violet-400" />
        </div>
        <h3 className="text-foreground text-lg font-semibold">Немає фото</h3>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          Фото додаються при завершенні запису
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => (
        <GlassCard key={photo.id} padding="none" className="overflow-hidden">
          <div className="bg-surface aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnail_url ?? photo.photo_url}
              alt={photo.description ?? 'Фото роботи'}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-2.5">
            <p className="text-foreground truncate text-xs font-medium">
              {photo.service?.name ?? 'Послуга'}
            </p>
            <p className="text-muted-foreground text-xs">
              {format(new Date(photo.created_at), 'd MMM yyyy', { locale: uk })}
            </p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// ─── History Tab ─────────────────────────────────────────────────────────────

function HistoryTab({ appointments }: { appointments: ClientAppointment[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? appointments : appointments.slice(0, 10);

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/12">
          <Clock className="h-7 w-7 text-violet-400" />
        </div>
        <h3 className="text-foreground text-lg font-semibold">Немає візитів</h3>
        <p className="text-muted-foreground mt-1 text-sm">Історія візитів порожня</p>
      </div>
    );
  }

  // Group by month
  const grouped: Record<string, ClientAppointment[]> = {};
  for (const appt of visible) {
    const key = format(new Date(appt.start_time), 'LLLL yyyy', { locale: uk });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(appt);
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([month, appts]) => (
        <div key={month}>
          <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            {month}
          </h3>
          <div className="relative space-y-3 pl-6">
            {/* Timeline line */}
            <div className="absolute top-2 bottom-2 left-[9px] w-px bg-[var(--glass-border)]" />

            {appts.map((appt) => {
              const status = STATUS_MAP[appt.status] ?? {
                variant: 'default' as const,
                label: appt.status,
              };
              return (
                <div key={appt.id} className="relative">
                  {/* Timeline dot */}
                  <div className="border-primary bg-background absolute top-3 -left-6 h-[7px] w-[7px] rounded-full border-2" />

                  <GlassCard padding="sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-mono text-sm font-medium">
                            {format(new Date(appt.start_time), 'd MMM, HH:mm', { locale: uk })}
                          </span>
                          <GlassBadge variant={status.variant} size="sm" dot>
                            {status.label}
                          </GlassBadge>
                        </div>
                        <p className="text-foreground mt-1 text-sm font-medium">
                          {appt.service?.name ?? 'Послуга'}
                        </p>
                        {appt.staff && (
                          <p className="text-muted-foreground text-xs">
                            {appt.staff.first_name} {appt.staff.last_name}
                          </p>
                        )}
                        {appt.notes && (
                          <p className="text-muted-foreground mt-1 text-xs italic">{appt.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-mono text-sm font-medium">
                          {(appt.final_price ?? appt.price).toLocaleString('uk-UA')} ₴
                        </p>
                        {appt.payment_method && (
                          <p className="text-muted-foreground text-xs">
                            {PAYMENT_LABELS[appt.payment_method] ?? appt.payment_method}
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!showAll && appointments.length > 10 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-primary hover:text-primary/80 mx-auto block text-sm font-medium transition-colors"
        >
          Показати ще ({appointments.length - 10})
        </button>
      )}
    </div>
  );
}

// ─── Finances Tab ────────────────────────────────────────────────────────────

function FinancesTab({
  appointments,
  client,
}: {
  appointments: ClientAppointment[];
  client: ClientRow;
}) {
  const completedAppts = appointments.filter((a) => a.status === 'completed');
  const totalSpent = completedAppts.reduce((s, a) => s + (a.final_price ?? a.price), 0);
  const avgCheck = completedAppts.length > 0 ? Math.round(totalSpent / completedAppts.length) : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard padding="sm">
          <p className="text-muted-foreground text-xs font-medium">Загальна сума</p>
          <p className="text-foreground mt-1 font-mono text-xl font-bold">
            <CountUp end={client.total_spent} suffix=" ₴" />
          </p>
        </GlassCard>
        <GlassCard padding="sm">
          <p className="text-muted-foreground text-xs font-medium">Середній чек</p>
          <p className="text-foreground mt-1 font-mono text-xl font-bold">
            <CountUp end={avgCheck} suffix=" ₴" />
          </p>
        </GlassCard>
        <GlassCard padding="sm">
          <p className="text-muted-foreground text-xs font-medium">Кількість візитів</p>
          <p className="text-foreground mt-1 font-mono text-xl font-bold">
            <CountUp end={client.total_visits} />
          </p>
        </GlassCard>
      </div>

      {/* Transaction table */}
      {completedAppts.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">Немає фінансових даних</p>
      ) : (
        <GlassCard padding="none" hover={false}>
          <table className="w-full">
            <thead>
              <tr className="text-muted-foreground border-b border-[var(--glass-border)] text-left text-xs font-medium">
                <th className="px-5 py-3">Дата</th>
                <th className="px-5 py-3">Послуга</th>
                <th className="px-5 py-3 text-right">Сума</th>
                <th className="hidden px-5 py-3 sm:table-cell">Оплата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {completedAppts.map((appt) => (
                <tr key={appt.id}>
                  <td className="text-muted-foreground px-5 py-3 font-mono text-sm">
                    {format(new Date(appt.start_time), 'd.MM.yy', { locale: uk })}
                  </td>
                  <td className="text-foreground px-5 py-3 text-sm">{appt.service?.name ?? '—'}</td>
                  <td className="text-foreground px-5 py-3 text-right font-mono text-sm">
                    {(appt.final_price ?? appt.price).toLocaleString('uk-UA')} ₴
                  </td>
                  <td className="text-muted-foreground hidden px-5 py-3 text-sm sm:table-cell">
                    {appt.payment_method
                      ? (PAYMENT_LABELS[appt.payment_method] ?? appt.payment_method)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}
