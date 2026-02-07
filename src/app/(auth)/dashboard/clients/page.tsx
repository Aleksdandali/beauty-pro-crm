import { Suspense } from 'react';
import { getClients } from '@/lib/queries/clients';
import { ClientsContent } from './ClientsContent';
import { ClientsListSkeleton } from './ClientsListSkeleton';

export const dynamic = 'force-dynamic';

export default function ClientsPage() {
  return (
    <Suspense fallback={<ClientsListSkeleton />}>
      <ClientsDataLoader />
    </Suspense>
  );
}

async function ClientsDataLoader() {
  const { clients, stats } = await getClients();
  return <ClientsContent initialClients={clients} stats={stats} />;
}
