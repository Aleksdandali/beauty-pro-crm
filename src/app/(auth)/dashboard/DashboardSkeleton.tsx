'use client';

import { BentoGrid, BentoItem, StatCard, GlassCard } from '@/components/glass';
import { Shimmer } from '@/components/animations';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-1">
        <Shimmer width={200} height={32} rounded="md" />
        <Shimmer width={300} height={20} rounded="md" />
      </div>

      {/* Stat cards */}
      <BentoGrid columns={4} gap="md">
        <BentoItem>
          <StatCard title="" value="" loading />
        </BentoItem>
        <BentoItem>
          <StatCard title="" value="" loading />
        </BentoItem>
        <BentoItem>
          <StatCard title="" value="" loading />
        </BentoItem>
        <BentoItem>
          <StatCard title="" value="" loading />
        </BentoItem>
      </BentoGrid>

      {/* Content blocks */}
      <BentoGrid columns={3} gap="md">
        {/* Schedule */}
        <BentoItem colSpan={2}>
          <GlassCard padding="md">
            <Shimmer width={180} height={24} rounded="md" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Shimmer key={i} height={48} rounded="md" />
              ))}
            </div>
          </GlassCard>
        </BentoItem>

        {/* Sterilization */}
        <BentoItem>
          <GlassCard padding="md">
            <Shimmer width={150} height={24} rounded="md" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Shimmer key={i} height={20} rounded="md" />
              ))}
            </div>
          </GlassCard>
        </BentoItem>

        {/* RFM */}
        <BentoItem colSpan={2}>
          <GlassCard padding="md">
            <Shimmer width={200} height={24} rounded="md" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} height={28} rounded="md" />
              ))}
            </div>
          </GlassCard>
        </BentoItem>

        {/* Activity */}
        <BentoItem>
          <GlassCard padding="md">
            <Shimmer width={160} height={24} rounded="md" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Shimmer key={i} height={40} rounded="md" />
              ))}
            </div>
          </GlassCard>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
