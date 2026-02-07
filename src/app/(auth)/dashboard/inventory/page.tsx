import { Suspense } from 'react';
import { getInventoryItems, getInventoryStats, getBrands } from '@/lib/queries/inventory';
import { InventoryContent } from './InventoryContent';
import { InventorySkeleton } from './InventorySkeleton';

export const dynamic = 'force-dynamic';

export default function InventoryPage() {
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <InventoryDataLoader />
    </Suspense>
  );
}

async function InventoryDataLoader() {
  const [items, stats, brands] = await Promise.all([
    getInventoryItems(),
    getInventoryStats(),
    getBrands(),
  ]);

  return <InventoryContent items={items} stats={stats} brands={brands} />;
}
