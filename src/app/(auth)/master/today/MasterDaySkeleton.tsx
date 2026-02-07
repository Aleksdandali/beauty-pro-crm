'use client';

import { Shimmer } from '@/components/animations';

export function MasterDaySkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Shimmer width={200} height={16} rounded="sm" />
        <Shimmer width={280} height={28} rounded="md" />
        <Shimmer height={8} rounded="full" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[var(--glass-border)] p-4">
          <Shimmer width={180} height={16} rounded="sm" className="mb-3" />
          <Shimmer height={14} rounded="sm" className="mb-2" />
          <Shimmer height={14} rounded="sm" className="mb-2" />
          <Shimmer width={120} height={14} rounded="sm" className="mb-4" />
          <div className="flex gap-2">
            <Shimmer width={140} height={44} rounded="lg" />
            <Shimmer width={100} height={44} rounded="lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
