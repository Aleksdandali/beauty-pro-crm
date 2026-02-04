import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SALON_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export async function GET() {
  try {
    // Перевірити чи є послуги
    const { data: existing } = await supabaseAdmin
      .from('services')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: 'Services already exist', count: existing.length });
    }

    // Вставити послуги
    const services = [
      { salon_id: SALON_ID, name: 'Манікюр класичний', category: 'Манікюр', duration: 60, price: 350, color: '#EC4899' },
      { salon_id: SALON_ID, name: 'Манікюр з покриттям', category: 'Манікюр', duration: 90, price: 500, color: '#EC4899' },
      { salon_id: SALON_ID, name: 'Нарощування нігтів', category: 'Манікюр', duration: 180, price: 1200, color: '#EC4899' },
      { salon_id: SALON_ID, name: 'Зняття гель-лаку', category: 'Манікюр', duration: 30, price: 150, color: '#EC4899' },
      { salon_id: SALON_ID, name: 'Педикюр класичний', category: 'Педикюр', duration: 90, price: 450, color: '#F59E0B' },
      { salon_id: SALON_ID, name: 'Педикюр з покриттям', category: 'Педикюр', duration: 120, price: 650, color: '#F59E0B' },
      { salon_id: SALON_ID, name: 'Нарощування вій', category: 'Вії', duration: 150, price: 900, color: '#8B5CF6' },
      { salon_id: SALON_ID, name: 'Корекція вій', category: 'Вії', duration: 90, price: 600, color: '#8B5CF6' },
      { salon_id: SALON_ID, name: 'Ламінування вій', category: 'Вії', duration: 60, price: 500, color: '#8B5CF6' },
      { salon_id: SALON_ID, name: 'Корекція брів', category: 'Брови', duration: 45, price: 300, color: '#10B981' },
      { salon_id: SALON_ID, name: 'Фарбування брів', category: 'Брови', duration: 30, price: 200, color: '#10B981' },
      { salon_id: SALON_ID, name: 'Ламінування брів', category: 'Брови', duration: 60, price: 450, color: '#10B981' },
    ];

    const { data, error } = await supabaseAdmin
      .from('services')
      .insert(services)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Services seeded successfully', count: data?.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
