import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const bookingSchema = z.object({
  salon_id: z.string().uuid(),
  service_ids: z.array(z.string().uuid()).min(1),
  staff_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  total_duration: z.number().min(1),
  total_price: z.number().min(0),
  client_name: z.string().min(1),
  client_phone: z.string().min(5),
  client_notes: z.string().optional(),
});

/**
 * POST /api/bookings — create an online booking
 * Public endpoint — no auth required
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Невірні дані', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    salon_id,
    service_ids,
    staff_id,
    date,
    time,
    total_duration,
    total_price,
    client_name,
    client_phone,
    client_notes,
  } = parsed.data;

  const supabase = await createClient();

  // ── Race condition protection: check slot is still free ──
  const startTime = `${date}T${time}:00`;
  const endMinutes = timeToMinutes(time) + total_duration;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endTime = `${date}T${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;

  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('salon_id', salon_id)
    .eq('staff_id', staff_id)
    .in('status', ['scheduled', 'confirmed', 'in_progress'])
    .lt('start_time', endTime)
    .gt('end_time', startTime)
    .limit(1);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json(
      { error: 'Цей час вже зайнято. Оберіть інший слот.' },
      { status: 409 }
    );
  }

  // ── Find or create client by phone ──
  const normalizedPhone = client_phone.replace(/\s/g, '');

  let clientId: string;

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('salon_id', salon_id)
    .eq('phone', normalizedPhone)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    // Parse name into first_name / last_name
    const nameParts = client_name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? client_name;
    const lastName = nameParts.slice(1).join(' ') || null;

    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        salon_id,
        first_name: firstName,
        last_name: lastName,
        full_name: client_name,
        phone: normalizedPhone,
        source: 'online',
      })
      .select('id')
      .single();

    if (clientError || !newClient) {
      console.error('[BOOKING] Client create error:', clientError?.message);
      return NextResponse.json({ error: 'Помилка створення клієнта' }, { status: 500 });
    }

    clientId = newClient.id;
  }

  // ── Create appointment (one per first service, or multiple) ──
  // For simplicity, create one appointment with the first service
  const primaryServiceId = service_ids[0]!;

  const { data: appointment, error: apptError } = await supabase
    .from('appointments')
    .insert({
      salon_id,
      client_id: clientId,
      staff_id,
      service_id: primaryServiceId,
      start_time: startTime,
      end_time: endTime,
      status: 'scheduled',
      price: total_price,
      source: 'online',
      client_notes: client_notes || null,
    })
    .select('id, start_time, end_time, status')
    .single();

  if (apptError || !appointment) {
    console.error('[BOOKING] Appointment create error:', apptError?.message);
    return NextResponse.json({ error: 'Помилка створення запису' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    booking: {
      id: appointment.id,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
    },
  });
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
