'use client';

import { GlassCard } from '@/components/glass';
import { Shimmer } from '@/components/animations';

export function ServicesListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Shimmer width={180} height={32} rounded="md" />
        <Shimmer width={140} height={36} rounded="lg" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} padding="sm">
            <Shimmer width={80} height={14} rounded="sm" />
            <Shimmer width={60} height={28} rounded="md" className="mt-2" />
          </GlassCard>
        ))}
      </div>

      <div className="space-y-3">
        <Shimmer height={40} rounded="lg" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} width={80} height={32} rounded="full" />
          ))}
        </div>
      </div>

      <GlassCard padding="none">
        <div className="divide-y divide-[var(--glass-border)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Shimmer width={8} height={32} rounded="sm" />
              <div className="flex-1 space-y-2">
                <Shimmer width={160} height={16} rounded="sm" />
                <Shimmer width={100} height={12} rounded="sm" />
              </div>
              <Shimmer width={60} height={16} rounded="sm" />
              <Shimmer width={60} height={16} rounded="sm" />
              <Shimmer width={50} height={24} rounded="full" />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
