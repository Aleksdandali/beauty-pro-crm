import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';
import { getSupplierProvider } from '@/lib/suppliers/manager';
import type { ExternalProduct } from '@/lib/suppliers/types';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/suppliers/[id]/sync — run full catalog sync for a supplier.
 *
 * Flow:
 *  1. Get supplier, create sync_log entry (status: 'started')
 *  2. Get provider via getSupplierProvider
 *  3. Fetch all products via paginated searchProducts('')
 *  4. UPSERT into supplier_products (match on supplier_id + external_id)
 *  5. Update supplier: last_sync_at, sync_status='success'
 *  6. Update sync_log: status='completed', counts, duration_ms
 *  7. On error: sync_status='error', sync_error=message, sync_log status='failed'
 */
export async function POST(
  _request: NextRequest,
  { params }: RouteContext,
) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: supplierId } = await params;
  const supabase = await createClient();
  const startedAt = new Date();

  try {
    // 1. Verify supplier belongs to salon
    const { data: supplier, error: supplierErr } = await supabase
      .from('suppliers')
      .select('id, type, name')
      .eq('id', supplierId)
      .eq('salon_id', salonId)
      .maybeSingle();

    if (supplierErr || !supplier) {
      return NextResponse.json(
        { error: 'Постачальника не знайдено' },
        { status: 404 },
      );
    }

    // Mark supplier as syncing
    await supabase
      .from('suppliers')
      .update({ sync_status: 'syncing', sync_error: null })
      .eq('id', supplierId);

    // Create sync log entry
    const { data: syncLog, error: logErr } = await supabase
      .from('supplier_sync_log')
      .insert({
        salon_id: salonId,
        supplier_id: supplierId,
        sync_type: 'catalog' as const,
        status: 'started' as const,
        items_synced: 0,
        items_added: 0,
        items_updated: 0,
        started_at: startedAt.toISOString(),
      })
      .select()
      .single();

    if (logErr) {
      console.error('Failed to create sync log:', logErr.message);
    }

    const syncLogId = syncLog?.id;

    // 2. Get provider instance
    const provider = await getSupplierProvider(supabase, supplierId);

    // 3. Fetch all products via paginated search
    const allProducts: ExternalProduct[] = [];
    const pageSize = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await provider.searchProducts('', {
        limit: pageSize,
        offset,
      });

      allProducts.push(...batch);
      offset += pageSize;
      hasMore = batch.length === pageSize;
    }

    // 4. UPSERT into supplier_products
    let itemsAdded = 0;
    let itemsUpdated = 0;

    // Fetch existing external_ids for this supplier to differentiate adds vs updates
    const { data: existingProducts } = await supabase
      .from('supplier_products')
      .select('external_id')
      .eq('supplier_id', supplierId);

    const existingIds = new Set(
      (existingProducts ?? []).map((p) => p.external_id),
    );

    // Process in batches to avoid oversized requests
    const upsertBatchSize = 50;
    for (let i = 0; i < allProducts.length; i += upsertBatchSize) {
      const batch = allProducts.slice(i, i + upsertBatchSize);

      const rows = batch.map((product) => ({
        salon_id: salonId,
        supplier_id: supplierId,
        external_id: product.externalId,
        external_sku: product.externalSku ?? null,
        external_url: product.externalUrl ?? null,
        name: product.name,
        brand: product.brand ?? null,
        category: product.category ?? null,
        description: product.description ?? null,
        image_url: product.imageUrl ?? null,
        price: product.price,
        price_old: product.priceOld ?? null,
        currency: product.currency,
        unit: product.unit,
        volume: product.volume ?? null,
        in_stock: product.inStock,
        stock_quantity: product.stockQuantity ?? null,
        last_synced_at: new Date().toISOString(),
        is_discontinued: false,
      }));

      const { error: upsertErr } = await supabase
        .from('supplier_products')
        .upsert(rows, {
          onConflict: 'supplier_id,external_id',
          ignoreDuplicates: false,
        });

      if (upsertErr) {
        console.error('Upsert batch error:', upsertErr.message);
        throw new Error(`Помилка збереження товарів: ${upsertErr.message}`);
      }

      for (const product of batch) {
        if (existingIds.has(product.externalId)) {
          itemsUpdated++;
        } else {
          itemsAdded++;
          existingIds.add(product.externalId);
        }
      }
    }

    // 5. Update supplier: last_sync_at, sync_status='success'
    const now = new Date().toISOString();
    await supabase
      .from('suppliers')
      .update({
        last_sync_at: now,
        sync_status: 'success',
        sync_error: null,
        updated_at: now,
      })
      .eq('id', supplierId);

    // 6. Update sync_log: status='completed'
    const durationMs = Date.now() - startedAt.getTime();

    if (syncLogId) {
      await supabase
        .from('supplier_sync_log')
        .update({
          status: 'completed' as const,
          items_synced: allProducts.length,
          items_added: itemsAdded,
          items_updated: itemsUpdated,
          duration_ms: durationMs,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLogId);
    }

    return NextResponse.json({
      success: true,
      items_synced: allProducts.length,
      items_added: itemsAdded,
      items_updated: itemsUpdated,
      duration_ms: durationMs,
    });
  } catch (err) {
    // 7. Error handling: update supplier and sync_log
    const errorMessage = err instanceof Error ? err.message : 'Unknown sync error';
    const durationMs = Date.now() - startedAt.getTime();

    console.error(`Sync failed for supplier ${supplierId}:`, errorMessage);

    await supabase
      .from('suppliers')
      .update({
        sync_status: 'error',
        sync_error: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', supplierId);

    // Try to update sync_log if it was created
    await supabase
      .from('supplier_sync_log')
      .update({
        status: 'failed' as const,
        error_message: errorMessage,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      })
      .eq('supplier_id', supplierId)
      .eq('status', 'started')
      .order('started_at', { ascending: false })
      .limit(1);

    return NextResponse.json(
      { error: 'Помилка синхронізації каталогу', details: errorMessage },
      { status: 500 },
    );
  }
}
