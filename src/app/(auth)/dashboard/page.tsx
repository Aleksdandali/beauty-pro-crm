import { Suspense } from 'react';
import { getDashboardData } from '@/lib/queries/dashboard';
import { DashboardContent } from './DashboardContent';
import { DashboardSkeleton } from './DashboardSkeleton';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardDataLoader />
    </Suspense>
  );
}

async function DashboardDataLoader() {
  const data = await getDashboardData();
  return <DashboardContent data={data} />;
}
