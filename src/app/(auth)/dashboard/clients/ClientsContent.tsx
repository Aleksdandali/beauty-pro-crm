'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import {
  Search,
  Plus,
  Users,
  UserPlus,
  Upload,
  Crown,
  DollarSign,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { GlassCard, GlassBadge, StatCard } from '@/components/glass';
import { FadeIn, StaggerList } from '@/components/animations';
import { NewClientModal } from '@/components/shared/NewClientModal';
import { RFM_SEGMENTS, type RfmSegment } from '@/schemas/client';
import type { ClientRow, ClientStats } from '@/lib/queries/clients';

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

const RFM_BADGE_MAP: Record<string, 'vip' | 'loyal' | 'regular' | 'new' | 'sleeping' | 'lost'> = {
  vip: 'vip',
  loyal: 'loyal',
  regular: 'regular',
  new: 'new',
  sleeping: 'sleeping',
  lost: 'lost',
};

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
    'from-fuchsia-400 to-purple-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

function relativeDate(iso: string | null): string {
  if (!iso) return '—';
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: uk });
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientsContentProps {
  initialClients: ClientRow[];
  stats: ClientStats;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ClientsContent({ initialClients, stats }: ClientsContentProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [rfmFilter, setRfmFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Filter + Search ──────────────────────────────
  const filtered = useMemo(() => {
    let list = initialClients;

    if (rfmFilter !== 'all') {
      list = list.filter((c) => c.rfm_segment === rfmFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.first_name.toLowerCase().includes(q) ||
          (c.last_name ?? '').toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    return list;
  }, [initialClients, rfmFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageClients = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  // Reset page on filter change
  const handleFilterChange = (f: string) => {
    setRfmFilter(f);
    setPage(0);
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(0);
  };

  const copyPhone = useCallback(async (id: string, phone: string) => {
    await navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-2xl font-bold">Клієнти</h1>
            <GlassBadge variant="primary" size="md">
              {stats.total}
            </GlassBadge>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/clients/import"
              className="text-text-secondary hover:text-text-primary inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--glass-bg-hover)]"
            >
              <Upload className="h-4 w-4" />
              Імпорт
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40"
            >
              <Plus className="h-4 w-4" />
              Новий клієнт
            </button>
          </div>
        </div>
      </FadeIn>

      {/* ── Mini Stats ────────────────────────────────── */}
      <StaggerList delay={0.06} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Всього"
          value={stats.total}
          icon={<Users className="h-4 w-4" />}
          accentColor="primary"
          size="sm"
        />
        <StatCard
          title="Нових цього місяця"
          value={stats.newThisMonth}
          icon={<CalendarDays className="h-4 w-4" />}
          accentColor="info"
          size="sm"
        />
        <StatCard
          title="VIP клієнтів"
          value={stats.vipCount}
          icon={<Crown className="h-4 w-4" />}
          accentColor="warning"
          size="sm"
        />
        <StatCard
          title="Середній чек"
          value={stats.averageCheck}
          suffix="₴"
          icon={<DollarSign className="h-4 w-4" />}
          accentColor="success"
          size="sm"
        />
      </StaggerList>

      {/* ── Search + Filters ──────────────────────────── */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Пошук за ім'ям або телефоном..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] pr-4 pl-10 text-sm shadow-[var(--shadow-sm)]"
          />
        </div>

        {/* RFM filter pills */}
        <div className="flex flex-wrap gap-2">
          {RFM_SEGMENTS.map((seg) => {
            const active = rfmFilter === seg.key;
            const variant = seg.key === 'all' ? undefined : RFM_BADGE_MAP[seg.key];

            return (
              <button
                key={seg.key}
                onClick={() => handleFilterChange(seg.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  active
                    ? seg.key === 'all'
                      ? 'bg-foreground text-background'
                      : '' // RFM badge styling handles it
                    : 'text-muted-foreground hover:text-foreground border border-[var(--glass-border)] bg-[var(--glass-bg)]'
                )}
              >
                {active && variant ? (
                  <GlassBadge variant={variant} size="sm">
                    {seg.label}
                  </GlassBadge>
                ) : active && seg.key === 'all' ? (
                  seg.label
                ) : (
                  seg.label
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Client List ───────────────────────────────── */}
      {pageClients.length === 0 ? (
        <EmptyState
          onAdd={() => setModalOpen(true)}
          hasFilters={search !== '' || rfmFilter !== 'all'}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <GlassCard padding="none" hover={false}>
              <table className="w-full">
                <thead>
                  <tr className="text-muted-foreground border-b border-[var(--glass-border)] text-left text-xs font-medium">
                    <th className="px-5 py-3">Клієнт</th>
                    <th className="px-5 py-3">Телефон</th>
                    <th className="px-5 py-3">Сегмент</th>
                    <th className="px-5 py-3 text-right">Візити</th>
                    <th className="px-5 py-3 text-right">Витрачено</th>
                    <th className="px-5 py-3">Останній візит</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {pageClients.map((client) => (
                    <tr
                      key={client.id}
                      className="cursor-pointer transition-colors hover:bg-[var(--glass-bg-hover)]"
                      onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white',
                              avatarColor(client.first_name + (client.last_name ?? ''))
                            )}
                          >
                            {getInitials(client.first_name, client.last_name)}
                          </div>
                          <span className="text-foreground text-sm font-medium">
                            {client.first_name} {client.last_name ?? ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyPhone(client.id, client.phone);
                          }}
                          className="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1.5 font-mono text-sm transition-colors"
                        >
                          {client.phone}
                          {copiedId === client.id ? (
                            <Check className="text-success h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <GlassBadge
                          variant={RFM_BADGE_MAP[client.rfm_segment] ?? 'default'}
                          size="sm"
                        >
                          {RFM_SEGMENTS.find((s) => s.key === client.rfm_segment)?.label ??
                            client.rfm_segment}
                        </GlassBadge>
                      </td>
                      <td className="text-foreground px-5 py-3.5 text-right font-mono text-sm">
                        {client.total_visits}
                      </td>
                      <td className="text-foreground px-5 py-3.5 text-right font-mono text-sm">
                        {client.total_spent.toLocaleString('uk-UA')} ₴
                      </td>
                      <td className="text-muted-foreground px-5 py-3.5 text-sm">
                        {relativeDate(client.last_visit_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {pageClients.map((client) => (
              <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="block">
                <GlassCard padding="sm" className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white',
                      avatarColor(client.first_name + (client.last_name ?? ''))
                    )}
                  >
                    {getInitials(client.first_name, client.last_name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate text-sm font-medium">
                        {client.first_name} {client.last_name ?? ''}
                      </span>
                      <GlassBadge
                        variant={RFM_BADGE_MAP[client.rfm_segment] ?? 'default'}
                        size="sm"
                      >
                        {RFM_SEGMENTS.find((s) => s.key === client.rfm_segment)?.label ??
                          client.rfm_segment}
                      </GlassBadge>
                    </div>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                      <span className="font-mono">{client.phone}</span>
                      <span>{client.total_visits} віз.</span>
                      <span>{relativeDate(client.last_visit_at)}</span>
                    </div>
                  </div>

                  <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                </GlassCard>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-lg border border-[var(--glass-border)] px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </button>
              <span className="text-muted-foreground text-sm">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-lg border border-[var(--glass-border)] px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40"
              >
                Далі
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* New Client Modal */}
      <NewClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd, hasFilters }: { onAdd: () => void; hasFilters: boolean }) {
  return (
    <FadeIn>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/12">
          <Users className="h-7 w-7 text-violet-400" />
        </div>
        <h3 className="text-foreground text-lg font-semibold">
          {hasFilters ? 'Нічого не знайдено' : 'Клієнтів поки немає'}
        </h3>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          {hasFilters
            ? 'Спробуйте змінити фільтри або пошуковий запит'
            : 'Додайте першого клієнта, щоб розпочати роботу'}
        </p>
        {!hasFilters && (
          <button
            onClick={onAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20"
          >
            <UserPlus className="h-4 w-4" />
            Додати першого клієнта
          </button>
        )}
      </div>
    </FadeIn>
  );
}
