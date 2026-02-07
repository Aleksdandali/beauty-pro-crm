import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAvailableSlots } from '@/lib/queries/booking';
import type { WorkingHours } from '@/types/database';

/**
 * GET /api/bookings/slots?salon_id=...&staff_id=...&date=...&duration=...
 * Public endpoint — returns available time slots
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const salonId = searchParams.get('salon_id');
  const staffId = searchParams.get('staff_id') || null;
  const date = searchParams.get('date');
  const duration = Number(searchParams.get('duration')) || 60;

  if (!salonId || !date) {
    return NextResponse.json({ error: 'Missing salon_id or date' }, { status: 400 });
  }

  // Get salon working hours
  const supabase = await createClient();
  const { data: salon } = await supabase
    .from('salons')
    .select('working_hours, booking_slot_duration')
    .eq('id', salonId)
    .single();

  const workingHours = (salon?.working_hours as WorkingHours) ?? null;
  const slotStep = (salon?.booking_slot_duration as number) || 30;

  const slots = await getAvailableSlots(salonId, staffId, date, duration, workingHours, slotStep);

  return NextResponse.json({ slots });
}
