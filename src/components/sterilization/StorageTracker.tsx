'use client';

import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassBadge } from '@/components/glass';
import { formatExpiryCountdown } from '@/lib/sterilization-utils';
import type { StoragePackage } from '@/lib/queries/sterilization';

interface StorageTrackerProps {
  packages: StoragePackage[];
}

export function StorageTracker({ packages }: StorageTrackerProps) {
  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
          <Package className="h-7 w-7 text-violet-400" />
        </div>
        <p className="text-foreground font-semibold">Немає пакетів на зберіганні</p>
        <p className="text-muted-foreground mt-1 text-sm">Завершіть цикл стерилізації</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden lg:block">
        <GlassCard padding="none" hover={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)]">
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold">
                  Мітка
                </th>
                <th className="text-muted-foreground px-3 py-3 text-left text-xs font-semibold">
                  Цикл
                </th>
                <th className="text-muted-foreground px-3 py-3 text-left text-xs font-semibold">
                  Дата
                </th>
                <th className="text-muted-foreground px-3 py-3 text-left text-xs font-semibold">
                  Термін
                </th>
                <th className="text-muted-foreground px-3 py-3 text-center text-xs font-semibold">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => {
                const expiry = formatExpiryCountdown(pkg.expires_at);
                const actualStatus =
                  expiry.expired && pkg.status === 'sterile' ? 'expired' : pkg.status;

                return (
                  <tr
                    key={pkg.id}
                    className="border-b border-[var(--glass-border)] transition-colors hover:bg-[var(--glass-bg-hover)]"
                  >
                    <td className="text-foreground px-4 py-3 font-mono text-sm font-medium">
                      {pkg.package_label}
                    </td>
                    <td className="text-muted-foreground px-3 py-3 text-xs">
                      {pkg.cycle_number ?? '—'}
                    </td>
                    <td className="text-muted-foreground px-3 py-3 text-xs">
                      {new Date(pkg.stored_at).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock
                          className={cn(
                            'h-3.5 w-3.5',
                            expiry.urgent ? 'text-rose-500' : 'text-muted-foreground'
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-medium',
                            expiry.urgent ? 'text-rose-500' : 'text-muted-foreground'
                          )}
                        >
                          {expiry.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <StatusBadge status={actualStatus} />
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
        {packages.map((pkg) => {
          const expiry = formatExpiryCountdown(pkg.expires_at);
          const actualStatus = expiry.expired && pkg.status === 'sterile' ? 'expired' : pkg.status;

          return (
            <GlassCard key={pkg.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-mono text-sm font-bold">
                  {pkg.package_label}
                </span>
                <StatusBadge status={actualStatus} />
              </div>
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>Цикл: {pkg.cycle_number ?? '—'}</span>
                <div className="flex items-center gap-1">
                  <Clock className={cn('h-3 w-3', expiry.urgent ? 'text-rose-500' : '')} />
                  <span className={expiry.urgent ? 'font-medium text-rose-500' : ''}>
                    {expiry.text}
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'sterile':
      return (
        <GlassBadge variant="success" size="sm">
          <CheckCircle2 className="mr-0.5 h-3 w-3" /> Стерильний
        </GlassBadge>
      );
    case 'expired':
      return (
        <GlassBadge variant="error" size="sm">
          <XCircle className="mr-0.5 h-3 w-3" /> Прострочений
        </GlassBadge>
      );
    case 'used':
      return (
        <GlassBadge variant="default" size="sm">
          Використаний
        </GlassBadge>
      );
    default:
      return (
        <GlassBadge variant="default" size="sm">
          {status}
        </GlassBadge>
      );
  }
}
