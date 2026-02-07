import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  getInventoryItem,
  getItemTransactions,
  getProductServiceUsage,
} from '@/lib/queries/inventory';
import { InventoryDetail } from './InventoryDetail';
import { Shimmer } from '@/components/animations';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default function InventoryItemPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ItemDataLoader params={params} />
    </Suspense>
  );
}

async function ItemDataLoader({ params }: Props) {
  const { id } = await params;
  const [item, transactions, serviceUsage] = await Promise.all([
    getInventoryItem(id),
    getItemTransactions(id),
    getProductServiceUsage(id),
  ]);

  if (!item) notFound();

  return <InventoryDetail item={item} transactions={transactions} serviceUsage={serviceUsage} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shimmer width={60} height={20} rounded="md" />
        <Shimmer width={200} height={28} rounded="md" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} width={100} height={36} rounded="lg" />
        ))}
      </div>
      <Shimmer height={300} rounded="lg" />
    </div>
  );
}
