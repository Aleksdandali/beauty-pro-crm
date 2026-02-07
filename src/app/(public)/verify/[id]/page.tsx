import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVerifyCycle } from '@/lib/queries/public';
import { VerifyContent } from './VerifyContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cycle = await getVerifyCycle(id);
  return {
    title: cycle
      ? `Сертифікат ${cycle.cycle_number} — Shine Beauty CRM`
      : 'QR Верифікація — Shine Beauty CRM',
    description: cycle
      ? `Сертифікат стерилізації ${cycle.cycle_number}. Салон: ${cycle.salon_name}`
      : 'Перевірка стерилізації інструментів',
  };
}

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cycle = await getVerifyCycle(id);

  if (!cycle) notFound();

  return <VerifyContent cycle={cycle} />;
}
