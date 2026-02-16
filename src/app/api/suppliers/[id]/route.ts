import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';
import { SupplierSchema } from '@/schemas/supplier';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/suppliers/[id] — get supplier details.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  try {
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('salon_id', salonId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch supplier:', error.message);
      return NextResponse.json(
        { error: 'Не вдалося завантажити постачальника' },
        { status: 500 },
      );
    }

    if (!supplier) {
      return NextResponse.json(
        { error: 'Постачальника не знайдено' },
        { status: 404 },
      );
    }

    // Fetch product & order counts
    const [{ count: productsCount }, { count: ordersCount }] = await Promise.all([
      supabase
        .from('supplier_products')
        .select('*', { count: 'exact', head: true })
        .eq('supplier_id', id),
      supabase
        .from('supplier_orders')
        .select('*', { count: 'exact', head: true })
        .eq('supplier_id', id),
    ]);

    return NextResponse.json({
      supplier: {
        ...supplier,
        products_count: productsCount ?? 0,
        orders_count: ordersCount ?? 0,
      },
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/suppliers/[id]:', err);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/suppliers/[id] — update supplier fields.
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  try {
    const body = await request.json();
    const parsed = SupplierSchema.partial().parse(body);

    // Ensure the supplier belongs to this salon
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .eq('salon_id', salonId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Постачальника не знайдено' },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('salon_id', salonId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update supplier:', error.message);

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Постачальник із таким slug вже існує' },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: 'Не вдалося оновити постачальника' },
        { status: 500 },
      );
    }

    return NextResponse.json({ supplier: data });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Невірні дані', details: err.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error('Unexpected error in PATCH /api/suppliers/[id]:', err);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/suppliers/[id] — delete supplier and CASCADE related data.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  try {
    // Verify ownership
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .eq('salon_id', salonId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Постачальника не знайдено' },
        { status: 404 },
      );
    }

    // Delete supplier — CASCADE in DB handles products, orders, rules, sync_logs
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('salon_id', salonId);

    if (error) {
      console.error('Failed to delete supplier:', error.message);
      return NextResponse.json(
        { error: 'Не вдалося видалити постачальника' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in DELETE /api/suppliers/[id]:', err);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}
