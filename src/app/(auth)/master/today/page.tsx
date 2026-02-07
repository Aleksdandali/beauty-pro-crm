import { Suspense } from 'react';
import { getTodayAppointments, getStaff } from '@/lib/queries/appointments';
import { MasterDayContent } from './MasterDayContent';
import { MasterDaySkeleton } from './MasterDaySkeleton';

export const dynamic = 'force-dynamic';

export default function MasterTodayPage() {
  return (
    <Suspense fallback={<MasterDaySkeleton />}>
      <MasterDayDataLoader />
    </Suspense>
  );
}

async function MasterDayDataLoader() {
  // In a real app, we'd get the current staff member from auth
  // For now, load all today appointments
  const [appointments, staff] = await Promise.all([getTodayAppointments(), getStaff()]);

  // Default to first staff member name
  const masterName = staff[0]?.first_name ?? 'Майстер';

  return <MasterDayContent appointments={appointments} masterName={masterName} />;
}
