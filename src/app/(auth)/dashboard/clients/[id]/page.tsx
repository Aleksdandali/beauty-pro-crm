import { notFound } from 'next/navigation';
import { getClient, getClientAppointments, getClientPhotos } from '@/lib/queries/clients';
import { ClientDetail } from './ClientDetail';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const [client, appointments, photos] = await Promise.all([
    getClient(id),
    getClientAppointments(id),
    getClientPhotos(id),
  ]);

  if (!client) notFound();

  return <ClientDetail client={client} appointments={appointments} photos={photos} />;
}
