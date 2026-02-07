'use client';

import { Shimmer } from '@/components/animations';

export function InventorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shimmer width={100} height={32} rounded="md" />
          <Shimmer width={70} height={24} rounded="full" />
        </div>
        <Shimmer width={140} height={40} rounded="lg" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} height={90} rounded="lg" />
        ))}
      </div>

      <div className="flex gap-2">
        <Shimmer width={200} height={40} rounded="lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Shimmer key={i} width={80} height={32} rounded="full" />
        ))}
      </div>

      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} height={56} rounded="lg" />
        ))}
      </div>
    </div>
  );
}
