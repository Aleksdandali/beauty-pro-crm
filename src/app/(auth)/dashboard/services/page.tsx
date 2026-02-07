import { Suspense } from 'react';
import { getServices, getSalonOverhead } from '@/lib/queries/services';
import { ServicesContent } from './ServicesContent';
import { ServicesListSkeleton } from './ServicesListSkeleton';

export const dynamic = 'force-dynamic';

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesListSkeleton />}>
      <ServicesDataLoader />
    </Suspense>
  );
}

async function ServicesDataLoader() {
  const [{ services, stats }, overhead] = await Promise.all([getServices(), getSalonOverhead()]);
  return <ServicesContent initialServices={services} stats={stats} overhead={overhead} />;
}
