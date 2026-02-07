import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';

/**
 * GET /api/settings — fetch salon data
 */
export async function GET() {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.from('salons').select('*').eq('id', salonId).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ salon: data });
}

/**
 * PUT /api/settings — update salon fields
 * Body: { field: "profile" | "branding" | "schedule" | "booking" | "integrations", data: {...} }
 */
export async function PUT(request: NextRequest) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await request.json();
  const { field, data } = body as { field: string; data: Record<string, unknown> };

  if (!field || !data) {
    return NextResponse.json({ error: 'Missing field or data' }, { status: 400 });
  }

  let updateFields: Record<string, unknown> = {};

  switch (field) {
    case 'profile':
      updateFields = {
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        city: data.city ?? undefined,
        address: data.address ?? undefined,
        phone: data.phone ?? undefined,
        email: data.email ?? undefined,
        slug: data.slug ?? undefined,
      };
      break;

    case 'branding':
      updateFields = {
        accent_color: data.accent_color ?? undefined,
        logo_url: data.logo_url ?? undefined,
      };
      break;

    case 'schedule':
      updateFields = {
        working_hours: data.working_hours ?? undefined,
      };
      break;

    case 'booking':
      updateFields = {
        booking_enabled: data.booking_enabled,
        booking_advance_days: data.booking_advance_days,
        booking_slot_duration: data.booking_slot_duration,
        booking_confirmation_required: data.booking_confirmation_required,
        notifications_email: data.notifications_email,
        notifications_telegram: data.notifications_telegram,
        notifications_sms: data.notifications_sms,
      };
      break;

    case 'integrations':
      updateFields = {
        telegram_bot_token: data.telegram_bot_token ?? undefined,
        telegram_chat_id: data.telegram_chat_id ?? undefined,
      };
      break;

    default:
      return NextResponse.json({ error: `Unknown field: ${field}` }, { status: 400 });
  }

  // Remove undefined values
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(updateFields)) {
    if (v !== undefined) cleaned[k] = v;
  }

  const { error } = await supabase.from('salons').update(cleaned).eq('id', salonId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
