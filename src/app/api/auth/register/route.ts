import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─── Transliterate Ukrainian to Latin slug ──────────────────────────────────

const UA_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ye',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'yi',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'yu',
  я: 'ya',
};

function toSlug(name: string): string {
  const base = name
    .toLowerCase()
    .split('')
    .map((c) => UA_MAP[c] ?? c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

  // Always append random suffix for uniqueness
  const suffix = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${suffix}` : `salon-${suffix}`;
}

/**
 * POST /api/auth/register
 * Creates a new user + salon + user_salons link + owner staff entry.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS for admin inserts.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner_name, email, password, salon_name, city, phone } = body as {
      owner_name: string;
      email: string;
      password: string;
      salon_name: string;
      city?: string;
      phone?: string;
    };

    // ── Validation ───────────────────────────────────────────────
    if (!owner_name || !email || !password || !salon_name) {
      return NextResponse.json({ error: "Заповніть обов'язкові поля" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Пароль має бути не менше 8 символів' }, { status: 400 });
    }

    // ── Supabase admin client (service_role bypasses RLS) ────────
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[REGISTER] Missing env: SUPABASE_URL or SERVICE_ROLE_KEY');
      return NextResponse.json({ error: 'Помилка конфігурації сервера' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Step 1: Create user in Supabase Auth ─────────────────────
    console.log('[REGISTER] Step 1: signUp for', email);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm, no email verification needed
      user_metadata: {
        full_name: owner_name,
        role: 'owner',
      },
    });

    if (authError || !authData.user) {
      console.error('[REGISTER] Step 1 FAILED — auth error:', authError?.message);
      const msg = authError?.message?.includes('already been registered')
        ? 'Цей email вже зареєстрований'
        : (authError?.message ?? 'Помилка створення акаунту');
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const userId = authData.user.id;
    console.log('[REGISTER] Step 1 OK — userId:', userId);

    // ── Step 2: Create salon ─────────────────────────────────────
    const slug = toSlug(salon_name);
    console.log('[REGISTER] Step 2: creating salon, slug:', slug);

    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .insert({
        name: salon_name,
        slug,
        city: city || null,
        phone: phone || null,
        settings: {
          accent_color: 'violet',
          working_hours: {
            mon: { enabled: true, start: '09:00', end: '19:00' },
            tue: { enabled: true, start: '09:00', end: '19:00' },
            wed: { enabled: true, start: '09:00', end: '19:00' },
            thu: { enabled: true, start: '09:00', end: '19:00' },
            fri: { enabled: true, start: '09:00', end: '19:00' },
            sat: { enabled: true, start: '10:00', end: '17:00' },
            sun: { enabled: false },
          },
          booking: {
            enabled: true,
            min_advance_hours: 2,
            max_advance_days: 30,
            auto_confirm: true,
          },
        },
      })
      .select('id')
      .single();

    if (salonError || !salon) {
      console.error(
        '[REGISTER] Step 2 FAILED — salon error:',
        salonError?.message,
        salonError?.details,
        salonError?.hint
      );
      // Rollback: delete the user we just created
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Не вдалося створити салон: ${salonError?.message ?? 'unknown'}` },
        { status: 500 }
      );
    }

    const salonId = salon.id as string;
    console.log('[REGISTER] Step 2 OK — salonId:', salonId);

    // ── Step 3: Update user metadata with salon_id ───────────────
    console.log('[REGISTER] Step 3: updating user metadata');

    const { error: metaError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: owner_name,
        role: 'owner',
        salon_id: salonId,
      },
    });

    if (metaError) {
      console.error('[REGISTER] Step 3 FAILED — metadata error:', metaError.message);
    } else {
      console.log('[REGISTER] Step 3 OK');
    }

    // ── Step 4: Create user_salons link ──────────────────────────
    console.log('[REGISTER] Step 4: creating user_salons link');

    const { error: linkError } = await supabase.from('user_salons').insert({
      user_id: userId,
      salon_id: salonId,
      role: 'owner',
    });

    if (linkError) {
      console.error('[REGISTER] Step 4 FAILED — user_salons error:', linkError.message);
    } else {
      console.log('[REGISTER] Step 4 OK');
    }

    // ── Step 5: Create staff entry for owner ─────────────────────
    console.log('[REGISTER] Step 5: creating owner staff entry');

    const { error: staffError } = await supabase.from('staff').insert({
      salon_id: salonId,
      first_name: owner_name,
      last_name: '',
      email,
      phone: phone || null,
      role: 'owner',
      is_active: true,
      commission_rate: 0,
    });

    if (staffError) {
      console.error('[REGISTER] Step 5 FAILED — staff error:', staffError.message);
    } else {
      console.log('[REGISTER] Step 5 OK');
    }

    // ── Done ─────────────────────────────────────────────────────
    console.log('[REGISTER] ALL DONE — salon:', salonId, 'user:', userId);

    return NextResponse.json({ success: true, salon_id: salonId });
  } catch (err) {
    console.error('[REGISTER] unexpected error:', err);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
