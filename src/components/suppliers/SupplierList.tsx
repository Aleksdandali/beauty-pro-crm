'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Globe,
  ShoppingBag,
  Server,
  User,
  Plus,
  RefreshCw,
  Settings,
  Package,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { GlassCard, GlassBadge } from '@/components/glass';
import { AddSupplierModal } from './AddSupplierModal';
import type { SupplierType, SyncStatus, SupplierWithStats } from '@/types/supplier';

// ─── Type Icon Map ──────────────────────────────────────────────────────────

const typeIcons: Record<SupplierType, typeof Store> = {
  shine_shop: Store,
  prom_ua: Globe,
  rozetka: ShoppingBag,
  api: Server,
  manual: User,
};

const typeColors: Record<SupplierType, string> = {
  shine_shop: 'bg-violet-500/20 text-violet-400',
  prom_ua: 'bg-emerald-500/20 text-emerald-400',
  rozetka: 'bg-green-500/20 text-green-400',
  api: 'bg-blue-500/20 text-blue-400',
  manual: 'bg-amber-500/20 text-amber-400',
};

const syncStatusColors: Record<SyncStatus, string> = {
  success: 'bg-emerald-400',
  syncing: 'bg-yellow-400',
  error: 'bg-red-400',
  never: 'bg-gray-500',
};

const syncStatusLabels: Record<SyncStatus, string> = {
  success: 'Синхронізовано',
  syncing: 'Синхронізація...',
  error: 'Помилка синхронізації',
  never: 'Не синхронізовано',
};

// ─── Toast Component ────────────────────────────────────────────────────────

function InlineToast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-[300] -translate-x-1/2',
        'rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg',
        'animate-in fade-in slide-in-from-bottom-4 duration-300',
        type === 'success'
          ? 'bg-emerald-500/90 text-white'
          : 'bg-red-500/90 text-white'
      )}
    >
      {message}
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SupplierSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <GlassCard key={i} hover={false} padding="md">
          <div className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-white/10" />
                <div className="h-3 w-48 rounded bg-white/5" />
                <div className="flex gap-4 pt-1">
                  <div className="h-3 w-24 rounded bg-white/5" />
                  <div className="h-3 w-20 rounded bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<SupplierWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Toast helper ────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch suppliers ─────────────────────────────────────────────────────
  const fetchSuppliers = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/suppliers');
      if (!res.ok) throw new Error('Не вдалося завантажити постачальників');
      const json = await res.json();
      setSuppliers(json.data ?? json);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // ── Sync handler ────────────────────────────────────────────────────────
  const handleSync = useCallback(
    async (supplierId: string) => {
      setSyncingIds((prev) => new Set(prev).add(supplierId));
      try {
        const res = await fetch(`/api/suppliers/${supplierId}/sync`, { method: 'POST' });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Помилка синхронізації');
        }
        showToast('Синхронізацію розпочато', 'success');
        // Refresh supplier list to pick up new status
        await fetchSuppliers();
      } catch (err) {
        console.error('Sync error:', err);
        showToast(err instanceof Error ? err.message : 'Помилка синхронізації', 'error');
      } finally {
        setSyncingIds((prev) => {
          const next = new Set(prev);
          next.delete(supplierId);
          return next;
        });
      }
    },
    [fetchSuppliers, showToast]
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-xl font-semibold sm:text-2xl">Постачальники</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
            'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
            'transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25',
            'active:scale-[0.97] min-h-[44px]'
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Додати постачальника</span>
          <span className="sm:hidden">Додати</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <GlassCard hover={false} padding="md">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </GlassCard>
      )}

      {/* Loading state */}
      {loading && <SupplierSkeleton />}

      {/* Empty state */}
      {!loading && !error && suppliers.length === 0 && (
        <GlassCard hover={false} padding="lg">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
              <Package className="h-6 w-6 text-text-muted" />
            </div>
            <div>
              <p className="text-text-primary font-medium">Немає постачальників</p>
              <p className="text-text-muted mt-1 text-sm">Додайте першого!</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Supplier list */}
      {!loading && suppliers.length > 0 && (
        <div className="space-y-3">
          {suppliers.map((supplier) => {
            const Icon = typeIcons[supplier.type] ?? Store;
            const isSyncing = syncingIds.has(supplier.id);
            const canSync = supplier.capabilities?.includes('catalog_sync');

            return (
              <GlassCard key={supplier.id} hover padding="md">
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      typeColors[supplier.type]
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    {/* Name + status row */}
                    <div className="flex items-center gap-2">
                      <h3 className="text-text-primary truncate text-sm font-semibold">
                        {supplier.name}
                      </h3>
                      {/* Sync status dot */}
                      <span
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full',
                          syncStatusColors[supplier.sync_status]
                        )}
                        title={syncStatusLabels[supplier.sync_status]}
                      />
                      {supplier.sync_status === 'error' && (
                        <GlassBadge variant="error" size="sm">
                          Помилка
                        </GlassBadge>
                      )}
                    </div>

                    {/* Website + manager */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      {supplier.website && (
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate max-w-[180px]">
                            {supplier.website.replace(/^https?:\/\//, '')}
                          </span>
                        </a>
                      )}
                      {supplier.manager_name && (
                        <span className="text-text-muted text-xs">
                          {supplier.manager_name}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-text-secondary">
                      <span>
                        Каталог: <span className="text-text-primary font-medium">{supplier.products_count}</span> товарів
                      </span>
                      <span>
                        Замовлень: <span className="text-text-primary font-medium">{supplier.orders_count}</span>
                      </span>
                    </div>

                    {/* Last sync */}
                    <p className="text-text-muted mt-1 text-xs">
                      Остання синхр.:{' '}
                      {supplier.last_sync_at
                        ? formatDistanceToNow(new Date(supplier.last_sync_at), {
                            addSuffix: true,
                            locale: uk,
                          })
                        : 'Ніколи'}
                    </p>

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {canSync && (
                        <button
                          onClick={() => handleSync(supplier.id)}
                          disabled={isSyncing}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium',
                            'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
                            'transition-all duration-200 hover:shadow-md hover:shadow-violet-500/20',
                            'disabled:opacity-60 disabled:cursor-not-allowed',
                            'min-h-[44px] sm:min-h-0 sm:py-1.5'
                          )}
                        >
                          <RefreshCw
                            className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')}
                          />
                          Синхронізувати
                        </button>
                      )}
                      <button
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium',
                          'bg-white/5 border border-white/10 text-text-secondary',
                          'transition-colors hover:bg-white/10 hover:text-text-primary',
                          'min-h-[44px] sm:min-h-0 sm:py-1.5'
                        )}
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Налаштувати
                      </button>
                      <button
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium',
                          'bg-white/5 border border-white/10 text-text-secondary',
                          'transition-colors hover:bg-white/10 hover:text-text-primary',
                          'min-h-[44px] sm:min-h-0 sm:py-1.5'
                        )}
                      >
                        <Package className="h-3.5 w-3.5" />
                        Замовлення
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add Supplier Modal */}
      <AddSupplierModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => {
          setShowAddModal(false);
          fetchSuppliers();
        }}
      />

      {/* Toast notification */}
      {toast && <InlineToast message={toast.message} type={toast.type} />}
    </div>
  );
}
