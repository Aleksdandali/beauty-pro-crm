import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';

interface CompleteBody {
  notes?: string;
  formula?: Record<string, unknown>;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as CompleteBody;
  const supabase = await createClient();

  // 1. Get the appointment
  const { data: appointment, error: fetchErr } = await supabase
    .from('appointments')
    .select('id, client_id, service_id, status, materials_deducted')
    .eq('id', id)
    .eq('salon_id', salonId)
    .maybeSingle();

  if (fetchErr || !appointment) {
    return NextResponse.json({ error: 'Запис не знайдено' }, { status: 404 });
  }

  if (appointment.status === 'completed') {
    return NextResponse.json({ error: 'Запис вже завершено' }, { status: 400 });
  }

  // 2. Update appointment status
  const updateData: Record<string, unknown> = {
    status: 'completed',
    updated_at: new Date().toISOString(),
  };
  if (body.notes) updateData.notes = body.notes;
  if (body.formula) updateData.formula_snapshot = body.formula;

  const { error: updateErr } = await supabase.from('appointments').update(updateData).eq('id', id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // 3. Update client formula if provided
  if (body.formula && appointment.client_id) {
    await supabase
      .from('clients')
      .update({ formulas: body.formula })
      .eq('id', appointment.client_id);
  }

  // 4. Auto-deduct materials (if not already done)
  const lowStockAlerts: string[] = [];

  if (!appointment.materials_deducted && appointment.service_id) {
    const { data: materials } = await supabase
      .from('service_materials')
      .select('product_id, quantity')
      .eq('service_id', appointment.service_id)
      .eq('salon_id', salonId);

    if (materials && materials.length > 0) {
      for (const mat of materials) {
        // Create inventory transaction
        await supabase.from('inventory_transactions').insert({
          salon_id: salonId,
          product_id: mat.product_id,
          type: 'auto_deduction',
          quantity: -mat.quantity,
          appointment_id: id,
          notes: `Авто-списання: запис ${id}`,
        });

        // Decrease inventory
        const { data: product } = await supabase
          .from('inventory_items')
          .select('id, name, quantity, min_quantity')
          .eq('id', mat.product_id)
          .maybeSingle();

        if (product) {
          const newQty = product.quantity - mat.quantity;
          await supabase
            .from('inventory_items')
            .update({ quantity: newQty, updated_at: new Date().toISOString() })
            .eq('id', mat.product_id);

          if (newQty < product.min_quantity) {
            lowStockAlerts.push(product.name);
          }
        }
      }

      // Mark materials as deducted
      await supabase.from('appointments').update({ materials_deducted: true }).eq('id', id);
    }
  }

  // 5. Update client stats
  if (appointment.client_id) {
    const { data: clientAppts } = await supabase
      .from('appointments')
      .select('price, final_price, start_time')
      .eq('client_id', appointment.client_id)
      .eq('status', 'completed');

    if (clientAppts) {
      const totalVisits = clientAppts.length;
      const totalSpent = clientAppts.reduce(
        (s, a) => s + ((a.final_price as number | null) ?? (a.price as number)),
        0
      );
      const lastVisit = clientAppts.sort(
        (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      )[0]?.start_time;

      await supabase
        .from('clients')
        .update({
          total_visits: totalVisits,
          total_spent: totalSpent,
          last_visit_at: lastVisit ?? null,
        })
        .eq('id', appointment.client_id);
    }
  }

  return NextResponse.json({
    success: true,
    low_stock_alerts: lowStockAlerts,
  });
}
