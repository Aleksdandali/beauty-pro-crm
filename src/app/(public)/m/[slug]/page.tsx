import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getPublicSalonBySlug,
  getPortfolioPhotos,
  getLastSterilizationCycle,
} from '@/lib/queries/public';
import { MasterSiteContent } from './MasterSiteContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicSalonBySlug(slug);
  return {
    title: result ? `${result.salon.name} — Онлайн-запис` : 'Міні-сайт',
    description: result
      ? `${result.salon.name}${result.salon.city ? ` — ${result.salon.city}` : ''}. Онлайн-запис, послуги, портфоліо.`
      : 'Міні-сайт майстра',
  };
}

export default async function MiniSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublicSalonBySlug(slug);

  if (!result) notFound();

  const [portfolio, lastCycle] = await Promise.all([
    getPortfolioPhotos(result.salon.id),
    getLastSterilizationCycle(result.salon.id),
  ]);

  return (
    <MasterSiteContent
      salon={result.salon}
      services={result.services}
      portfolio={portfolio}
      lastCycle={lastCycle}
      slug={slug}
    />
  );
}
