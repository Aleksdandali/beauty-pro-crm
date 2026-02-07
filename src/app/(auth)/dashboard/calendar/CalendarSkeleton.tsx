'use client';

import { Shimmer } from '@/components/animations';

export function CalendarSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shimmer width={140} height={32} rounded="md" />
          <Shimmer width={80} height={24} rounded="full" />
        </div>
        <Shimmer width={140} height={40} rounded="lg" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shimmer width={36} height={36} rounded="lg" />
          <Shimmer width={80} height={36} rounded="lg" />
          <Shimmer width={36} height={36} rounded="lg" />
          <Shimmer width={160} height={20} rounded="md" className="ml-2" />
        </div>
        <div className="flex items-center gap-3">
          <Shimmer width={180} height={32} rounded="lg" />
          <Shimmer width={140} height={36} rounded="lg" />
        </div>
      </div>

      {/* Week grid skeleton */}
      <div className="hidden rounded-2xl border border-[var(--glass-border)] lg:block">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-[var(--glass-border)]">
          <div className="border-r border-[var(--glass-border)] p-3" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 border-r border-[var(--glass-border)] p-3 last:border-r-0"
            >
              <Shimmer width={24} height={12} rounded="sm" />
              <Shimmer width={32} height={32} rounded="full" />
            </div>
          ))}
        </div>
        {/* Hour rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-8" style={{ height: 80 }}>
            <div className="flex items-start justify-end border-r border-[var(--glass-border)] pt-0 pr-2">
              <Shimmer width={32} height={12} rounded="sm" />
            </div>
            {Array.from({ length: 7 }).map((_, j) => (
              <div
                key={j}
                className="border-r border-b border-[var(--glass-border)] p-1 last:border-r-0"
              >
                {i % 3 === 0 && j % 2 === 0 && <Shimmer height={i === 0 ? 60 : 40} rounded="md" />}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Mobile skeleton */}
      <div className="space-y-4 lg:hidden">
        <div className="flex items-center justify-between">
          <Shimmer width={20} height={20} rounded="sm" />
          <div className="flex flex-col items-center gap-1">
            <Shimmer width={80} height={16} rounded="sm" />
            <Shimmer width={60} height={12} rounded="sm" />
          </div>
          <Shimmer width={20} height={20} rounded="sm" />
        </div>
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Shimmer key={i} width={40} height={40} rounded="lg" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} height={80} rounded="lg" />
        ))}
      </div>
    </div>
  );
}
