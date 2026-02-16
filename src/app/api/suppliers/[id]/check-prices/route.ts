import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';
import { getSupplierProvider } from '@/lib/suppliers/manager';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/suppliers/[id]/check-prices
 * Body: { externalIds: string[] }
 *
 * Checks current prices from the supplier, compares with stored prices,
 * and updates supplier_products where prices have changed.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: supplierId } = await params;
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Невалідний JSON' },
      { status: 400 },
    );
  }

  const externalIds = (body as { externalIds?: string[] })?.externalIds;
  if (!Array.isArray(externalIds) || externalIds.length === 0) {
    return NextResponse.json(
      { error: 'Необхідно передати масив externalIds' },
      { status: 422 },
    );
  }

  try {
    // Verify supplier belongs to salon
    const { data: supplier, error: supplierErr } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', supplierId)
      .eq('salon_id', salonId)
      .maybeSingle();

    if (supplierErr || !supplier) {
      return NextResponse.json(
        { error: 'Постачальника не знайдено' },
        { status: 404 },
      );
    }

    // Get provider and check prices
    const provider = await getSupplierProvider(supabase, supplierId);
    const priceResults = await provider.checkPrices(externalIds);

    // Fetch current prices from supplier_products
    const { data: currentProducts, error: productsErr } = await supabase
      .from('supplier_products')
      .select('id, external_id, price, in_stock')
      .eq('supplier_id', supplierId)
      .in('external_id', externalIds);

    if (productsErr) {
      console.error('Failed to fetch current prices:', productsErr.message);
      return NextResponse.json(
        { error: 'Помилка завантаження поточних цін' },
        { status: 500 },
      );
    }

    const existingMap = new Map(
      (currentProducts ?? []).map((p) => [p.external_id, p]),
    );

    // Compare and update changed prices
    const changes: Array<{
      externalId: string;
      oldPrice: number;
      newPrice: number;
      inStock: boolean;
    }> = [];

    const now = new Date().toISOString();

    for (const [externalId, result] of priceResults) {
      const existing = existingMap.get(externalId);
      if (!existing) continue;

      const priceChanged = existing.price !== result.price;
      const stockChanged = existing.in_stock !== result.inStock;

      if (priceChanged || stockChanged) {
        changes.push({
          externalId,
          oldPrice: existing.price,
          newPrice: result.price,
          inStock: result.inStock,
        });

        const { error: updateErr } = await supabase
          .from('supplier_products')
          .update({
            price: result.price,
            price_old: priceChanged ? existing.price : result.priceOld ?? null,
            in_stock: result.inStock,
            price_changed_at: priceChanged ? now : undefined,
            last_synced_at: now,
          })
          .eq('id', existing.id);

        if (updateErr) {
          console.error(
            `Failed to update price for ${externalId}:`,
            updateErr.message,
          );
        }
      }
    }

    return NextResponse.json({
      updated: changes.length,
      changes,
    });
  } catch (err) {
    console.error(
      `Unexpected error in POST /api/suppliers/${supplierId}/check-prices:`,
      err,
    );
    return NextResponse.json(
      { error: 'Помилка перевірки цін у постачальника' },
      { status: 500 },
    );
  }
}
