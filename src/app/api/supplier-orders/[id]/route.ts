import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';
import { getSupplierProvider } from '@/lib/suppliers/manager';
import type { OrderStatus } from '@/types/supplier';

// ─── Valid status transitions ────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['completed'],
  completed: [],
  cancelled: ['draft'],
};

const STATUS_TIMESTAMP_MAP: Partial<Record<OrderStatus, string>> = {
  pending: 'ordered_at',
  confirmed: 'confirmed_at',
  shipped: 'shipped_at',
  delivered: 'delivered_at',
};

// ─── GET /api/supplier-orders/[id] — order details ─────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('supplier_orders')
    .select(
      `
      *,
      supplier:suppliers(id, name, type),
      items:supplier_order_items(
        *,
        supplier_product:supplier_products(id, name, brand, image_url, external_url),
        inventory_item:inventory_items(id, name, quantity)
      )
      `,
    )
    .eq('id', id)
    .eq('salon_id', salonId)
    .single();

  if (error) {
    console.error('[SUPPLIER-ORDERS] Get error:', error.message);
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Замовлення не знайдено' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Помилка завантаження замовлення' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: order });
}

// ─── PATCH /api/supplier-orders/[id] — update order status ─────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: { status?: string; tracking_number?: string; tracking_url?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Невалідний JSON' },
      { status: 400 },
    );
  }

  if (!body.status) {
    return NextResponse.json(
      { error: 'Статус обовʼязковий' },
      { status: 422 },
    );
  }

  const newStatus = body.status as OrderStatus;
  const supabase = await createClient();

  // Fetch current order
  const { data: order, error: fetchErr } = await supabase
    .from('supplier_orders')
    .select('id, status, supplier_id, external_order_id')
    .eq('id', id)
    .eq('salon_id', salonId)
    .single();

  if (fetchErr || !order) {
    return NextResponse.json(
      { error: 'Замовлення не знайдено' },
      { status: 404 },
    );
  }

  // Validate status transition
  const currentStatus = order.status as OrderStatus;
  const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      {
        error: `Неможливо змінити статус з "${currentStatus}" на "${newStatus}"`,
      },
      { status: 422 },
    );
  }

  // Build update payload
  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  const timestampField = STATUS_TIMESTAMP_MAP[newStatus];
  if (timestampField) {
    updateData[timestampField] = new Date().toISOString();
  }

  if (body.tracking_number) {
    updateData.tracking_number = body.tracking_number;
  }
  if (body.tracking_url) {
    updateData.tracking_url = body.tracking_url;
  }
  if (body.notes !== undefined) {
    updateData.notes = body.notes;
  }

  const { data: updated, error: updateErr } = await supabase
    .from('supplier_orders')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (updateErr) {
    console.error('[SUPPLIER-ORDERS] Update error:', updateErr.message);
    return NextResponse.json(
      { error: 'Помилка оновлення замовлення' },
      { status: 500 },
    );
  }

  // If transitioning to 'pending' and has no external_order_id, try provider
  if (newStatus === 'pending' && !order.external_order_id) {
    try {
      const provider = await getSupplierProvider(supabase, order.supplier_id);

      // Fetch order items for the provider request
      const { data: items } = await supabase
        .from('supplier_order_items')
        .select('supplier_product_id, quantity')
        .eq('order_id', id);

      if (items && items.length > 0) {
        const result = await provider.createOrder({
          items: items.map((i) => ({
            productId: i.supplier_product_id,
            quantity: i.quantity,
          })),
        });

        await supabase
          .from('supplier_orders')
          .update({ external_order_id: result.externalOrderId })
          .eq('id', id);

        updated.external_order_id = result.externalOrderId;
      }
    } catch (err) {
      console.warn(
        '[SUPPLIER-ORDERS] Provider createOrder failed:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  return NextResponse.json({ data: updated });
}
