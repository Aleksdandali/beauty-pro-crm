import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';
import { getSupplierProvider } from '@/lib/suppliers/manager';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/suppliers/[id]/search?q=query&limit=20
 *
 * Search supplier catalog and enrich results with local inventory mapping.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: supplierId } = await params;
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const query = searchParams.get('q') ?? '';
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);

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

    // Get provider and search products
    const provider = await getSupplierProvider(supabase, supplierId);
    const results = await provider.searchProducts(query, { limit });

    // Fetch existing mappings for this supplier to enrich results
    const externalIds = results.map((p) => p.externalId);

    let mappings: Array<{
      external_id: string;
      inventory_item_id: string | null;
    }> = [];

    if (externalIds.length > 0) {
      const { data: mappingRows, error: mappingErr } = await supabase
        .from('supplier_products')
        .select('external_id, inventory_item_id')
        .eq('supplier_id', supplierId)
        .in('external_id', externalIds);

      if (mappingErr) {
        console.error('Failed to fetch product mappings:', mappingErr.message);
      } else {
        mappings = mappingRows ?? [];
      }
    }

    const mappingMap = new Map(
      mappings.map((m) => [m.external_id, m.inventory_item_id]),
    );

    // Merge linkedInventoryItemId into results
    const enrichedResults = results.map((product) => ({
      ...product,
      linkedInventoryItemId: mappingMap.get(product.externalId) ?? null,
    }));

    return NextResponse.json({ data: enrichedResults });
  } catch (err) {
    console.error(
      `Unexpected error in GET /api/suppliers/${supplierId}/search:`,
      err,
    );
    return NextResponse.json(
      { error: 'Помилка пошуку товарів у постачальника' },
      { status: 500 },
    );
  }
}
