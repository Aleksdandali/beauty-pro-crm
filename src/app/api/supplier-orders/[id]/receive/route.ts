import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';
import { ReceiveOrderItemsSchema } from '@/schemas/supplier';

// ─── POST /api/supplier-orders/[id]/receive — confirm receiving items ──────

export async function POST(
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Невалідний JSON' },
      { status: 400 },
    );
  }

  const parsed = ReceiveOrderItemsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Помилка валідації', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { items } = parsed.data;
  const supabase = await createClient();

  // Verify order exists and belongs to salon
  const { data: order, error: orderErr } = await supabase
    .from('supplier_orders')
    .select('id, status')
    .eq('id', id)
    .eq('salon_id', salonId)
    .single();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: 'Замовлення не знайдено' },
      { status: 404 },
    );
  }

  // Only shipped or confirmed orders can receive items
  if (!['shipped', 'confirmed', 'delivered'].includes(order.status)) {
    return NextResponse.json(
      {
        error: `Неможливо прийняти товар для замовлення зі статусом "${order.status}"`,
      },
      { status: 422 },
    );
  }

  // Update each item's quantity_received
  // (the DB trigger process_order_delivery handles inventory_transactions + inventory_items.quantity)
  const errors: string[] = [];

  for (const item of items) {
    const { error: updateErr } = await supabase
      .from('supplier_order_items')
      .update({
        quantity_received: item.quantity_received,
        received_at: item.quantity_received > 0 ? new Date().toISOString() : null,
      })
      .eq('id', item.id)
      .eq('order_id', id);

    if (updateErr) {
      console.error('[RECEIVE] Item update error:', updateErr.message);
      errors.push(`Товар ${item.id}: ${updateErr.message}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Помилка оновлення деяких товарів', details: errors },
      { status: 500 },
    );
  }

  // Check if ALL items are fully received
  const { data: allItems, error: itemsErr } = await supabase
    .from('supplier_order_items')
    .select('quantity, quantity_received')
    .eq('order_id', id);

  if (itemsErr) {
    console.error('[RECEIVE] Items check error:', itemsErr.message);
    return NextResponse.json(
      { error: 'Помилка перевірки статусу товарів' },
      { status: 500 },
    );
  }

  const allReceived =
    allItems != null &&
    allItems.length > 0 &&
    allItems.every((item) => item.quantity_received >= item.quantity);

  if (allReceived) {
    const { error: statusErr } = await supabase
      .from('supplier_orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (statusErr) {
      console.error('[RECEIVE] Status update error:', statusErr.message);
    }
  }

  return NextResponse.json({
    data: {
      order_id: id,
      all_received: allReceived,
      status: allReceived ? 'delivered' : order.status,
    },
  });
}
