import { Suspense } from 'react';
import {
  getCycles,
  getEquipment,
  getInstrumentSets,
  getStorage,
  getStats,
  getStaff,
  getActiveCycle,
} from '@/lib/queries/sterilization';
import { SterilizationContent } from './SterilizationContent';
import { Shimmer } from '@/components/animations';

export const metadata = {
  title: 'Журнал стерилізації — ShinePRO CRM',
};

function SterilizationSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-64" rounded="lg" />
        <Shimmer className="h-10 w-36" rounded="lg" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Shimmer key={i} className="h-28" rounded="lg" />
        ))}
      </div>
      <Shimmer className="h-10 w-full" rounded="lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-20" rounded="lg" />
        ))}
      </div>
    </div>
  );
}

export default async function SterilizationPage() {
  const [cycles, equipment, instrumentSets, storage, stats, staff, activeCycle] = await Promise.all(
    [
      getCycles(),
      getEquipment(),
      getInstrumentSets(),
      getStorage(),
      getStats(),
      getStaff(),
      getActiveCycle(),
    ]
  );

  return (
    <Suspense fallback={<SterilizationSkeleton />}>
      <SterilizationContent
        cycles={cycles}
        equipment={equipment}
        instrumentSets={instrumentSets}
        storage={storage}
        stats={stats}
        staff={staff}
        activeCycle={activeCycle}
      />
    </Suspense>
  );
}
