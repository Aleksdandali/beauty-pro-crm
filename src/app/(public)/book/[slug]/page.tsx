import { notFound } from 'next/navigation';
import { getSalonBySlug, getPublicServices, getPublicStaff } from '@/lib/queries/booking';
import { BookingContent } from './BookingContent';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  return {
    title: salon ? `Запис — ${salon.name}` : 'Онлайн-запис',
  };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);

  if (!salon) notFound();

  const [services, staff] = await Promise.all([
    getPublicServices(salon.id),
    getPublicStaff(salon.id),
  ]);

  return <BookingContent salon={salon} services={services} staff={staff} />;
}
