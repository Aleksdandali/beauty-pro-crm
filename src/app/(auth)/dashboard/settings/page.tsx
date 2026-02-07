import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';
import { SettingsContent } from './SettingsContent';
import { Shimmer } from '@/components/animations';

export const metadata = {
  title: 'Налаштування — ShinePRO CRM',
};

function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Shimmer className="h-8 w-48" rounded="lg" />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Shimmer className="h-12 lg:h-80" rounded="lg" />
        <div className="space-y-4">
          <Shimmer className="h-10 w-full" rounded="lg" />
          <Shimmer className="h-48" rounded="lg" />
          <Shimmer className="h-48" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const salonId = await getCurrentSalonId();

  const [{ data: salon }, { data: staff }] = await Promise.all([
    supabase.from('salons').select('*').eq('id', salonId).single(),
    supabase
      .from('staff')
      .select(
        'id, first_name, last_name, phone, email, specialization, role, is_active, commission_rate'
      )
      .eq('salon_id', salonId)
      .order('sort_order'),
  ]);

  // Count clients for plan usage
  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('salon_id', salonId);

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent
        salon={salon as Record<string, unknown>}
        staff={(staff ?? []) as Array<Record<string, unknown>>}
        clientCount={clientCount ?? 0}
      />
    </Suspense>
  );
}
