import { Suspense } from 'react';
import {
  getAppointments,
  getStaff,
  getServiceOptions,
  getClientOptions,
} from '@/lib/queries/appointments';
import { CalendarContent } from './CalendarContent';
import { CalendarSkeleton } from './CalendarSkeleton';
import { startOfWeek, endOfWeek, addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarDataLoader />
    </Suspense>
  );
}

async function CalendarDataLoader() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = addDays(endOfWeek(now, { weekStartsOn: 1 }), 1);

  const [appointments, staff, services, clients] = await Promise.all([
    getAppointments(weekStart.toISOString(), weekEnd.toISOString()),
    getStaff(),
    getServiceOptions(),
    getClientOptions(),
  ]);

  return (
    <CalendarContent
      initialAppointments={appointments}
      staff={staff}
      services={services}
      clients={clients}
      initialWeekStart={weekStart.toISOString()}
    />
  );
}
