'use client';

import { GlassCard } from '@/components/glass';
import { Shimmer } from '@/components/animations';

export function ClientsListSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Shimmer width={200} height={32} rounded="md" />
        <Shimmer width={140} height={36} rounded="lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} padding="sm">
            <Shimmer width={60} height={14} rounded="sm" />
            <Shimmer width={80} height={28} rounded="md" className="mt-2" />
          </GlassCard>
        ))}
      </div>

      {/* Search + filters */}
      <div className="space-y-4">
        <Shimmer height={40} rounded="lg" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} width={80} height={32} rounded="full" />
          ))}
        </div>
      </div>

      {/* Table rows */}
      <GlassCard padding="none">
        <div className="space-y-0 divide-y divide-[var(--glass-border)]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Shimmer width={40} height={40} rounded="full" />
              <div className="flex-1 space-y-2">
                <Shimmer width={160} height={16} rounded="sm" />
                <Shimmer width={100} height={12} rounded="sm" />
              </div>
              <Shimmer width={70} height={24} rounded="full" />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
