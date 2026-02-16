import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';
import { SupplierSchema } from '@/schemas/supplier';
import type { SupplierWithStats } from '@/types/supplier';
import { ZodError } from 'zod';

/**
 * GET /api/suppliers — list suppliers for current salon with product & order counts.
 */
export async function GET() {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch suppliers:', error.message);
      return NextResponse.json(
        { error: 'Не вдалося завантажити постачальників' },
        { status: 500 },
      );
    }

    if (!suppliers || suppliers.length === 0) {
      return NextResponse.json({ suppliers: [] });
    }

    const supplierIds = suppliers.map((s) => s.id);

    // Fetch product counts per supplier
    const { data: productCounts } = await supabase
      .from('supplier_products')
      .select('supplier_id')
      .in('supplier_id', supplierIds);

    // Fetch order counts per supplier
    const { data: orderCounts } = await supabase
      .from('supplier_orders')
      .select('supplier_id')
      .in('supplier_id', supplierIds);

    const productsMap = new Map<string, number>();
    for (const row of productCounts ?? []) {
      productsMap.set(row.supplier_id, (productsMap.get(row.supplier_id) ?? 0) + 1);
    }

    const ordersMap = new Map<string, number>();
    for (const row of orderCounts ?? []) {
      ordersMap.set(row.supplier_id, (ordersMap.get(row.supplier_id) ?? 0) + 1);
    }

    const result: SupplierWithStats[] = suppliers.map((s) => ({
      ...s,
      products_count: productsMap.get(s.id) ?? 0,
      orders_count: ordersMap.get(s.id) ?? 0,
    }));

    return NextResponse.json({ suppliers: result });
  } catch (err) {
    console.error('Unexpected error in GET /api/suppliers:', err);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/suppliers — create a new supplier.
 */
export async function POST(request: NextRequest) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    const body = await request.json();
    const parsed = SupplierSchema.parse(body);

    const { data, error } = await supabase
      .from('suppliers')
      .insert({ ...parsed, salon_id: salonId })
      .select()
      .single();

    if (error) {
      console.error('Failed to create supplier:', error.message);

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Постачальник із таким slug вже існує' },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: 'Не вдалося створити постачальника' },
        { status: 500 },
      );
    }

    return NextResponse.json({ supplier: data }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Невірні дані', details: err.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error('Unexpected error in POST /api/suppliers:', err);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}
