import { notFound } from 'next/navigation';
import {
  getService,
  getSalonOverhead,
  getInventoryProducts,
  getServiceAppointmentStats,
} from '@/lib/queries/services';
import { ServiceDetail } from './ServiceDetail';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  const [service, overhead, products, appointmentStats] = await Promise.all([
    getService(id),
    getSalonOverhead(),
    getInventoryProducts(),
    getServiceAppointmentStats(id),
  ]);

  if (!service) notFound();

  return (
    <ServiceDetail
      service={service}
      overhead={overhead}
      products={products}
      appointmentStats={appointmentStats}
    />
  );
}
