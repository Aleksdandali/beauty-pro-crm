import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { getCurrentSalonId } from '@/lib/auth';

/* ═══════════════════════════════════════════════════════════════════════════
   SEED API — realistic demo data for Ukrainian beauty salon
   Uses service_role key to bypass RLS.
   ═══════════════════════════════════════════════════════════════════════════ */

function getAdminClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!url || !key) throw new Error('Missing SUPABASE env vars');
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}
function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function phone(): string {
  const ops = ['50', '63', '66', '67', '68', '73', '93', '95', '96', '97', '98', '99'];
  const op = pick(ops);
  const d = () => String(rnd(0, 9));
  return `+380${op}${d()}${d()}${d()}${d()}${d()}${d()}${d()}`;
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function rndDate(from: Date, to: Date): Date {
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}
function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Олена',
  'Наталія',
  'Анна',
  'Марія',
  'Юлія',
  'Катерина',
  'Вікторія',
  'Дарина',
  'Софія',
  'Аліна',
  'Діана',
  'Яна',
  'Карина',
  'Поліна',
  'Марина',
  'Оксана',
  'Валентина',
  'Надія',
  'Ірина',
  'Ольга',
  'Тетяна',
  'Світлана',
  'Людмила',
  'Лариса',
  'Інна',
  'Жанна',
  'Ангеліна',
  'Кристина',
  'Ева',
  'Галина',
];
const LAST_NAMES = [
  'Коваленко',
  'Шевченко',
  'Бондаренко',
  'Мельник',
  'Ткаченко',
  'Кравченко',
  'Олійник',
  'Романенко',
  'Петренко',
  'Іваненко',
  'Григоренко',
  'Савченко',
  'Лисенко',
  'Мороз',
  'Тимошенко',
  'Кузьменко',
  'Поліщук',
  'Гончарова',
  'Сидоренко',
  'Левченко',
  'Маркова',
  'Павленко',
  'Новікова',
  'Козлова',
  'Волкова',
  'Соколова',
  'Кравчук',
  'Демченко',
  'Назаренко',
  'Бойко',
];
const SOURCES = ['manual', 'online_booking', 'instagram', 'telegram'] as const;
const NOTES_POOL = [
  'Алергія на гель-лак Kodi',
  'Любить натуральні відтінки',
  'VIP клієнт',
  'Не любить довгі нігті',
  'Хоче спробувати дизайн',
  'Завжди точно приходить',
  'Приходить з подругою',
  'Любить матовий топ',
  'Працює медсестрою — короткі нігті',
  'Бажає нарощування на свято',
  'Часто змінює колір',
  'Хоче ламінування брів',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];
const FORMULAS = [
  {
    base: 'KODI Base Gel',
    color: 'Komilfo 045',
    top: 'KODI No Sticky Top',
    design: 'Френч',
    nail_plate: 'Нормальна',
  },
  {
    base: 'OXXI Cover Base #1',
    color: 'KODI 70R',
    top: 'Глянцевий KODI',
    design: 'Однотонне',
    nail_plate: 'Тонка, суха',
  },
  {
    base: 'Komilfo Rubber Base',
    color: 'Komilfo GR001',
    top: 'OXXI No Wipe Top',
    design: 'Градієнт',
    nail_plate: 'Нормальна',
  },
  {
    base: 'KODI Natural Base',
    color: 'Komilfo Deluxe 028',
    top: 'Матовий Komilfo',
    design: 'Мінімалізм',
    nail_plate: 'Суха, ламка',
  },
  {
    base: 'OXXI Grand Rubber',
    color: 'KODI Moon Light 01',
    top: 'Глянцевий OXXI',
    design: 'Френч + стрази',
    nail_plate: 'Міцна',
  },
  {
    base: 'Siller Cover Base 3',
    color: 'Siller 045',
    top: 'Siller Top',
    design: 'Кішкине око',
    nail_plate: 'Нормальна',
  },
  {
    base: 'KODI Base Extra',
    color: 'Komilfo 112',
    top: 'KODI Rubber Top',
    design: 'Геометрія',
    nail_plate: 'Тонка',
  },
  {
    base: 'OXXI Base Extra',
    color: 'OXXI 056',
    top: 'Матовий OXXI',
    design: 'Омбре',
    nail_plate: 'Нормальна',
  },
];

const SERVICES = [
  { name: 'Манікюр класичний', cat: 'Манікюр', price: 400, dur: 60, color: '#8b5cf6' },
  { name: 'Манікюр апаратний', cat: 'Манікюр', price: 500, dur: 60, color: '#a78bfa' },
  { name: 'Манікюр + покриття гель-лак', cat: 'Манікюр', price: 700, dur: 90, color: '#7c3aed' },
  { name: 'Зняття + манікюр + покриття', cat: 'Манікюр', price: 800, dur: 120, color: '#6d28d9' },
  { name: 'Нарощування нігтів', cat: 'Манікюр', price: 1200, dur: 150, color: '#5b21b6' },
  { name: 'Ремонт нігтя', cat: 'Манікюр', price: 150, dur: 15, color: '#c4b5fd' },
  { name: 'Педикюр класичний', cat: 'Педикюр', price: 500, dur: 60, color: '#ec4899' },
  { name: 'Педикюр апаратний', cat: 'Педикюр', price: 600, dur: 75, color: '#db2777' },
  { name: 'Педикюр + покриття', cat: 'Педикюр', price: 800, dur: 90, color: '#be185d' },
  { name: 'Корекція брів', cat: 'Брови', price: 300, dur: 30, color: '#f59e0b' },
  { name: 'Фарбування брів', cat: 'Брови', price: 350, dur: 30, color: '#d97706' },
  { name: 'Ламінування брів', cat: 'Брови', price: 600, dur: 45, color: '#b45309' },
  { name: 'Парафінотерапія рук', cat: 'Догляд', price: 250, dur: 30, color: '#10b981' },
  { name: 'SPA-манікюр', cat: 'Догляд', price: 900, dur: 120, color: '#059669' },
  { name: 'Зміцнення нігтів IBX', cat: 'Догляд', price: 400, dur: 30, color: '#047857' },
];

const STAFF_DATA = [
  { first: 'Олександра', last: 'Петренко', spec: ['nail'], comm: 40, role: 'master' as const },
  { first: 'Вікторія', last: 'Сидоренко', spec: ['nail'], comm: 40, role: 'master' as const },
  {
    first: 'Катерина',
    last: 'Іваненко',
    spec: ['brow', 'lash'],
    comm: 35,
    role: 'master' as const,
  },
];

// CHECK constraint: ('rent','utilities','materials','salary','marketing','equipment','tax','other')
const EXPENSES = [
  { cat: 'rent', desc: 'Оренда приміщення', amt: 25000, rec: true, per: 'monthly' },
  { cat: 'utilities', desc: 'Комуналка', amt: 5500, rec: true, per: 'monthly' },
  { cat: 'other', desc: 'Інтернет + телефон', amt: 800, rec: true, per: 'monthly' },
  { cat: 'marketing', desc: 'Реклама Instagram', amt: 8000, rec: true, per: 'monthly' },
  { cat: 'marketing', desc: 'Реклама Google', amt: 5000, rec: true, per: 'monthly' },
  { cat: 'other', desc: 'Клінінг', amt: 4000, rec: true, per: 'monthly' },
  { cat: 'other', desc: 'Бухгалтерія', amt: 3000, rec: true, per: 'monthly' },
  { cat: 'tax', desc: 'Податки ФОП', amt: 7500, rec: true, per: 'monthly' },
  { cat: 'materials', desc: 'Закупка матеріалів', amt: 12000, rec: true, per: 'monthly' },
  { cat: 'equipment', desc: 'Амортизація обладнання', amt: 2000, rec: true, per: 'monthly' },
  { cat: 'salary', desc: 'Навчання персоналу', amt: 3000, rec: true, per: 'quarterly' },
  { cat: 'other', desc: 'Непередбачені витрати', amt: 2000, rec: true, per: 'monthly' },
];

const INVENTORY = [
  {
    name: 'KODI Base Gel 12ml',
    cat: 'base',
    price: 280,
    qty: 8,
    min: 3,
    unit: 'шт',
    brand: 'KODI',
  },
  {
    name: 'KODI Rubber Top 14ml',
    cat: 'top',
    price: 310,
    qty: 5,
    min: 3,
    unit: 'шт',
    brand: 'KODI',
  },
  {
    name: 'Komilfo Gel Polish 045',
    cat: 'color',
    price: 195,
    qty: 12,
    min: 5,
    unit: 'шт',
    brand: 'Komilfo',
  },
  {
    name: 'Komilfo Gel Polish 112',
    cat: 'color',
    price: 195,
    qty: 3,
    min: 5,
    unit: 'шт',
    brand: 'Komilfo',
  },
  {
    name: 'OXXI Base Extra 15ml',
    cat: 'base',
    price: 250,
    qty: 6,
    min: 3,
    unit: 'шт',
    brand: 'OXXI',
  },
  {
    name: 'Siller Cover Base 3',
    cat: 'base',
    price: 220,
    qty: 4,
    min: 3,
    unit: 'шт',
    brand: 'Siller',
  },
  {
    name: 'DEZIK Дезінфектант 1л',
    cat: 'liquid',
    price: 185,
    qty: 2,
    min: 3,
    unit: 'шт',
    brand: 'DEZIK',
  },
  {
    name: 'DEZIK Антисептик 500мл',
    cat: 'liquid',
    price: 95,
    qty: 10,
    min: 5,
    unit: 'шт',
    brand: 'DEZIK',
  },
  {
    name: 'GETLOUD Крафт-пакети 100шт',
    cat: 'disposable',
    price: 120,
    qty: 15,
    min: 5,
    unit: 'упак',
    brand: 'GETLOUD',
  },
  {
    name: 'GETLOUD Індикатори 100шт',
    cat: 'disposable',
    price: 85,
    qty: 20,
    min: 10,
    unit: 'упак',
    brand: 'GETLOUD',
  },
  {
    name: 'Пилки 180/240 (10шт)',
    cat: 'tool',
    price: 150,
    qty: 25,
    min: 10,
    unit: 'упак',
    brand: 'GETLOUD',
  },
  {
    name: 'Бафи 180 (10шт)',
    cat: 'tool',
    price: 120,
    qty: 20,
    min: 10,
    unit: 'упак',
    brand: 'GETLOUD',
  },
  {
    name: 'Фрези алмазні набір',
    cat: 'tool',
    price: 450,
    qty: 5,
    min: 2,
    unit: 'набір',
    brand: 'GETLOUD',
  },
  {
    name: 'Апельсинові палички 100шт',
    cat: 'disposable',
    price: 60,
    qty: 30,
    min: 10,
    unit: 'упак',
    brand: 'GETLOUD',
  },
  {
    name: 'Серветки безворсові 200шт',
    cat: 'disposable',
    price: 80,
    qty: 15,
    min: 5,
    unit: 'упак',
    brand: 'GETLOUD',
  },
  {
    name: 'Рукавички нітрилові М 100шт',
    cat: 'disposable',
    price: 250,
    qty: 8,
    min: 3,
    unit: 'упак',
    brand: 'DEZIK',
  },
  {
    name: 'Масло для кутикули 15мл',
    cat: 'care',
    price: 95,
    qty: 12,
    min: 5,
    unit: 'шт',
    brand: 'KODI',
  },
  {
    name: 'Знежирювач 150мл',
    cat: 'liquid',
    price: 110,
    qty: 7,
    min: 3,
    unit: 'шт',
    brand: 'KODI',
  },
  {
    name: 'LED лампа 48W (запасна)',
    cat: 'equipment',
    price: 1200,
    qty: 1,
    min: 1,
    unit: 'шт',
    brand: 'GETLOUD',
  },
  {
    name: 'Пилосос манікюрний фільтр',
    cat: 'equipment',
    price: 350,
    qty: 2,
    min: 1,
    unit: 'шт',
    brand: 'GETLOUD',
  },
];

const BRAND_NAMES = ['KODI', 'Komilfo', 'OXXI', 'Siller', 'DEZIK', 'GETLOUD'];

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/seed — create demo data
// ═════════════════════════════════════════════════════════════════════════════

export async function POST(request: Request) {
  try {
    // Auth: get salon_id from body or from auth
    const body = (await request.json().catch(() => ({}))) as { salon_id?: string };
    let salonId = body.salon_id;

    if (!salonId) {
      try {
        salonId = await getCurrentSalonId();
      } catch {
        /* ignore */
      }
    }
    if (!salonId) {
      return NextResponse.json({ error: 'salon_id is required' }, { status: 400 });
    }

    const sb = getAdminClient();
    const now = new Date();
    const errors: string[] = [];

    // ── 0. Clean existing demo data for this salon (idempotent) ──────
    console.log('[SEED] Cleaning old data for salon', salonId);
    await cleanSalonData(sb, salonId);

    // ── 1. Brands ────────────────────────────────────────────────────
    console.log('[SEED] Step 1: brands');
    const { data: brands, error: brandsErr } = await sb
      .from('inventory_brands')
      .insert(BRAND_NAMES.map((name) => ({ salon_id: salonId, name })))
      .select('id, name');

    if (brandsErr) {
      console.error('[SEED] brands error:', brandsErr.message);
      errors.push(`brands: ${brandsErr.message}`);
    }
    const brandMap = new Map(
      (brands ?? []).map((b: { name: string; id: string }) => [b.name, b.id])
    );

    // ── 2. Inventory items ───────────────────────────────────────────
    console.log('[SEED] Step 2: inventory');
    const invInserts = INVENTORY.map((p) => ({
      salon_id: salonId,
      name: p.name,
      category: p.cat,
      purchase_price: p.price,
      unit: p.unit,
      quantity: p.qty,
      min_quantity: p.min,
      brand_id: brandMap.get(p.brand) ?? null,
    }));
    const { data: invData, error: invErr } = await sb
      .from('inventory_items')
      .insert(invInserts)
      .select('id, name');
    if (invErr) {
      console.error('[SEED] inventory error:', invErr.message);
      errors.push(`inventory: ${invErr.message}`);
    }
    const invMap = new Map((invData ?? []).map((i) => [i.name, i.id]));

    // ── 3. Services ──────────────────────────────────────────────────
    console.log('[SEED] Step 3: services');
    const svcInserts = SERVICES.map((s, i) => ({
      salon_id: salonId,
      name: s.name,
      category: s.cat,
      price: s.price,
      duration: s.dur,
      color: s.color,
      is_active: true,
      sort_order: i,
    }));
    const { data: svcData, error: svcErr } = await sb
      .from('services')
      .insert(svcInserts)
      .select('id, name, price, duration');
    if (svcErr) {
      console.error('[SEED] services error:', svcErr.message);
      errors.push(`services: ${svcErr.message}`);
    }
    const svcs = svcData ?? [];

    // ── 4. Staff ─────────────────────────────────────────────────────
    console.log('[SEED] Step 4: staff');
    // Check if staff already exists (owner from registration)
    const { data: existingStaff } = await sb
      .from('staff')
      .select('id, role')
      .eq('salon_id', salonId);
    const hasOwner = (existingStaff ?? []).some((s) => s.role === 'owner');

    const staffInserts = STAFF_DATA.map((s) => ({
      salon_id: salonId,
      first_name: s.first,
      last_name: s.last,
      phone: phone(),
      email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@example.com`,
      specialization: s.spec.join(', '),
      commission_rate: s.comm,
      role: s.role,
      is_active: true,
    }));
    const { data: newStaff, error: staffErr } = await sb
      .from('staff')
      .insert(staffInserts)
      .select('id, first_name');
    if (staffErr) {
      console.error('[SEED] staff error:', staffErr.message);
      errors.push(`staff: ${staffErr.message}`);
    }

    // Combine all staff IDs (existing + new)
    const allStaffIds = [
      ...(existingStaff ?? []).map((s) => s.id),
      ...(newStaff ?? []).map((s) => s.id),
    ];

    // ── 5. Clients ───────────────────────────────────────────────────
    console.log('[SEED] Step 5: clients (30)');
    const usedNames = new Set<string>();
    interface ClientSeed {
      salon_id: string;
      first_name: string;
      last_name: string;
      phone: string;
      notes: string | null;
      source: string;
      rfm_segment: string;
      total_visits: number;
      total_spent: number;
      last_visit_at: string | null;
      formulas: Record<string, unknown>;
      created_at: string;
      is_active: boolean;
    }
    const clientSeeds: ClientSeed[] = [];

    const RFM: {
      seg: string;
      n: number;
      vMin: number;
      vMax: number;
      dMin: number;
      dMax: number;
    }[] = [
      { seg: 'vip', n: 3, vMin: 10, vMax: 18, dMin: 1, dMax: 14 },
      { seg: 'loyal', n: 5, vMin: 5, vMax: 10, dMin: 1, dMax: 21 },
      { seg: 'regular', n: 8, vMin: 3, vMax: 5, dMin: 7, dMax: 30 },
      { seg: 'new', n: 5, vMin: 1, vMax: 2, dMin: 1, dMax: 30 },
      { seg: 'sleeping', n: 5, vMin: 2, vMax: 4, dMin: 31, dMax: 90 },
      { seg: 'lost', n: 4, vMin: 1, vMax: 3, dMin: 91, dMax: 180 },
    ];
    let fIdx = 0;

    for (const r of RFM) {
      for (let i = 0; i < r.n; i++) {
        let fn: string, ln: string, combo: string;
        do {
          fn = pick(FIRST_NAMES);
          ln = pick(LAST_NAMES);
          combo = `${fn} ${ln}`;
        } while (usedNames.has(combo));
        usedNames.add(combo);

        const visits = rnd(r.vMin, r.vMax);
        const avgSpend = rnd(400, 900);
        const spent = visits * avgSpend;
        const lastDays = rnd(r.dMin, r.dMax);
        const lastVisit = daysAgo(lastDays);
        const created = rndDate(daysAgo(180), daysAgo(Math.max(lastDays, 1)));
        const igHandle = `@${fn.toLowerCase()}_${ln.toLowerCase().slice(0, 4)}`;
        const formula =
          (r.seg === 'vip' || r.seg === 'loyal') && fIdx < FORMULAS.length
            ? (FORMULAS[fIdx++] as Record<string, unknown>)
            : {};

        // Build note with optional Instagram handle
        const baseNote = pick(NOTES_POOL);
        const noteWithIg =
          Math.random() < 0.6
            ? baseNote
              ? `${baseNote}. Instagram: ${igHandle}`
              : `Instagram: ${igHandle}`
            : baseNote;

        clientSeeds.push({
          salon_id: salonId!,
          first_name: fn,
          last_name: ln,
          phone: phone(),
          notes: noteWithIg,
          source: pick(SOURCES),
          rfm_segment: r.seg,
          total_visits: visits,
          total_spent: spent,
          last_visit_at: lastVisit.toISOString(),
          formulas: formula,
          created_at: created.toISOString(),
          is_active: true,
        });
      }
    }

    const { data: clientsData, error: clientsErr } = await sb
      .from('clients')
      .insert(clientSeeds)
      .select('id');
    if (clientsErr) {
      console.error('[SEED] clients error:', clientsErr.message);
      errors.push(`clients: ${clientsErr.message}`);
    }
    const clientIds = (clientsData ?? []).map((c) => c.id as string);

    // ── 6. Appointments (80) ─────────────────────────────────────────
    console.log('[SEED] Step 6: appointments (80)');
    interface ApptSeed {
      salon_id: string;
      client_id: string;
      staff_id: string;
      service_id: string;
      start_time: string;
      end_time: string;
      status: string;
      price: number;
      final_price: number;
      payment_method: string | null;
      source: string;
    }
    const apptSeeds: ApptSeed[] = [];
    const dist: { st: string; n: number; future: boolean }[] = [
      { st: 'completed', n: 48, future: false },
      { st: 'scheduled', n: 12, future: true },
      { st: 'cancelled', n: 8, future: false },
      { st: 'no_show', n: 6, future: false },
      { st: 'confirmed', n: 6, future: true },
    ];
    const PMETHODS = ['cash', 'card', 'transfer'] as const;

    for (const { st, n, future } of dist) {
      for (let i = 0; i < n; i++) {
        const svc = pick(svcs);
        if (!svc) continue;
        const cId = pick(clientIds);
        const sId = pick(allStaffIds);
        if (!cId || !sId) continue;

        const base = future ? rndDate(now, daysAgo(-14)) : rndDate(daysAgo(90), daysAgo(1));
        const hour = rnd(9, 17);
        const min = pick([0, 15, 30, 45]);
        const start = new Date(base);
        start.setHours(hour, min, 0, 0);
        // Skip weekends for realism
        if (start.getDay() === 0) start.setDate(start.getDate() + 1);
        const end = new Date(start.getTime() + svc.duration * 60000);
        const price = svc.price;
        const discount = Math.random() < 0.12 ? rnd(50, 150) : 0;

        apptSeeds.push({
          salon_id: salonId!,
          client_id: cId,
          staff_id: sId,
          service_id: svc.id,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status: st,
          price,
          final_price: price - discount,
          payment_method: st === 'completed' ? pick(PMETHODS) : null,
          source: pick(['manual', 'online', 'phone'] as const),
        });
      }
    }

    const { error: apptErr } = await sb.from('appointments').insert(apptSeeds);
    if (apptErr) {
      console.error('[SEED] appointments error:', apptErr.message);
      errors.push(`appointments: ${apptErr.message}`);
    }

    // ── 7. Expenses (last 3 months) ──────────────────────────────────
    console.log('[SEED] Step 7: expenses');
    const expInserts: {
      salon_id: string;
      category: string;
      description: string;
      amount: number;
      date: string;
      is_recurring: boolean;
      recurring_period: string | null;
    }[] = [];
    for (let m = 0; m < 3; m++) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, rnd(1, 5));
      for (const e of EXPENSES) {
        if (e.per === 'quarterly' && m % 3 !== 0) continue;
        expInserts.push({
          salon_id: salonId!,
          category: e.cat,
          description: e.desc,
          amount: e.amt + rnd(-200, 200),
          date: isoDate(d),
          is_recurring: e.rec,
          recurring_period: e.per,
        });
      }
    }
    const { error: expErr } = await sb.from('expenses').insert(expInserts);
    if (expErr) {
      console.error('[SEED] expenses error:', expErr.message);
      errors.push(`expenses: ${expErr.message}`);
    }

    // ── 8. Sterilization ─────────────────────────────────────────────
    console.log('[SEED] Step 8: sterilization');

    // Equipment
    const { data: eqData } = await sb
      .from('sterilization_equipment')
      .insert([
        {
          salon_id: salonId,
          name: 'CLINIPAK Автоклав 12L',
          type: 'autoclave',
          brand: 'CLINIPAK',
          model: 'CP-12',
          serial_number: 'CLP-2024-0847',
          certification_expires: new Date(now.getFullYear() + 1, 5, 15).toISOString(),
          is_active: true,
          parameters: { max_temp: 134, max_pressure: 2.2 },
        },
      ])
      .select('id');

    const equipmentId = eqData?.[0]?.id;

    // Instrument sets
    const { data: setsData } = await sb
      .from('sterilization_instrument_sets')
      .insert([
        {
          salon_id: salonId,
          name: 'Манікюрний базовий',
          instruments: ['Пушер', 'Кусачки', 'Ножиці'],
          category: 'manicure',
        },
        {
          salon_id: salonId,
          name: 'Педикюрний',
          instruments: ['Фреза педикюрна', 'Кусачки педикюрні', 'Шліфувальник'],
          category: 'pedicure',
        },
        {
          salon_id: salonId,
          name: 'Фрезерний набір',
          instruments: ['Фреза конус', 'Фреза куля', "Фреза полум'я"],
          category: 'manicure',
        },
      ])
      .select('id, name');

    const setIds = (setsData ?? []).map((s) => s.id as string);
    const operatorId = allStaffIds[0] ?? null;

    // 5 completed cycles
    if (equipmentId && setIds.length > 0 && operatorId) {
      for (let c = 0; c < 5; c++) {
        const cycleDate = daysAgo(rnd(1, 28));
        const startH = rnd(9, 14);
        const prepTime = new Date(cycleDate);
        prepTime.setHours(startH, 0, 0, 0);
        const disStart = new Date(prepTime.getTime() + 5 * 60000);
        const disEnd = new Date(disStart.getTime() + 15 * 60000);
        const psoStart = new Date(disEnd.getTime() + 2 * 60000);
        const psoEnd = new Date(psoStart.getTime() + 15 * 60000);
        const dryStart = new Date(psoEnd.getTime() + 2 * 60000);
        const dryEnd = new Date(dryStart.getTime() + 10 * 60000);
        const sterStart = new Date(dryEnd.getTime() + 2 * 60000);
        const sterEnd = new Date(sterStart.getTime() + 60 * 60000);
        const completed = new Date(sterEnd.getTime() + 5 * 60000);

        const cycleNum = `ST-${now.getFullYear()}-${String(c + 1).padStart(4, '0')}`;
        const setId = pick(setIds);
        const pkgType = pick(['kraft', 'film', 'container']);

        const { data: cycleData } = await sb
          .from('sterilization_cycles')
          .insert({
            salon_id: salonId,
            equipment_id: equipmentId,
            instrument_set_id: setId,
            operator_id: operatorId,
            cycle_number: cycleNum,
            stage: 'completed',
            started_at: prepTime.toISOString(),
            disinfection_solution: pick(['DEZIK Концентрат', 'Бацилол АФ']),
            disinfection_concentration: pick(['2%', '3%']),
            disinfection_started_at: disStart.toISOString(),
            disinfection_duration_minutes: 15,
            disinfection_completed_at: disEnd.toISOString(),
            pso_method: pick(['ultrasonic', 'manual']),
            pso_started_at: psoStart.toISOString(),
            pso_completed_at: psoEnd.toISOString(),
            azopyramine_result: 'negative',
            drying_method: pick(['air', 'towel']),
            drying_started_at: dryStart.toISOString(),
            drying_completed_at: dryEnd.toISOString(),
            sterilization_mode: '134°C / 2.2 атм / 5 хв',
            sterilization_temperature: 134,
            sterilization_pressure: 2.2,
            sterilization_started_at: sterStart.toISOString(),
            sterilization_duration_minutes: 60,
            sterilization_completed_at: sterEnd.toISOString(),
            chemical_indicator: 'passed',
            packaging_type: pkgType,
            completed_at: completed.toISOString(),
            result: 'success',
            is_locked: true,
            locked_at: completed.toISOString(),
            packages: [
              {
                set_id: setId,
                set_name: (setsData ?? []).find((s) => s.id === setId)?.name ?? 'Набір',
                packaging: pkgType,
              },
            ],
          })
          .select('id');

        if (cycleData?.[0]?.id) {
          const expiresAt = new Date(
            completed.getTime() +
              (pkgType === 'kraft' ? 365 : pkgType === 'film' ? 180 : 3) * 24 * 60 * 60000
          );
          await sb.from('sterilization_storage').insert({
            salon_id: salonId,
            cycle_id: cycleData[0].id,
            package_label: `${cycleNum} / ${(setsData ?? []).find((s) => s.id === setId)?.name ?? 'Пакет'}`,
            storage_location: pick(['Шафа 1', 'Шафа 2', 'Стіл майстра']),
            expires_at: expiresAt.toISOString(),
            status: expiresAt > now ? 'sterile' : 'expired',
          });
        }
      }
    }

    // ── 9. Service materials (for margin calculator) ─────────────────
    console.log('[SEED] Step 9: service_materials');
    const maniSvc = svcs.find((s) => s.name === 'Манікюр + покриття гель-лак');
    const naroSvc = svcs.find((s) => s.name === 'Нарощування нігтів');

    if (maniSvc) {
      const matPairs: [string, number][] = [
        ['KODI Base Gel 12ml', 0.5],
        ['Komilfo Gel Polish 045', 0.3],
        ['KODI Rubber Top 14ml', 0.5],
        ['Пилки 180/240 (10шт)', 0.1],
        ['Бафи 180 (10шт)', 0.1],
        ['Серветки безворсові 200шт', 5],
        ['Рукавички нітрилові М 100шт', 2],
      ];
      const matInserts = matPairs
        .filter(([name]) => invMap.has(name))
        .map(([name, qty]) => ({
          salon_id: salonId,
          service_id: maniSvc.id,
          product_id: invMap.get(name)!,
          quantity: qty,
        }));
      if (matInserts.length > 0) {
        await sb.from('service_materials').insert(matInserts);
      }
    }

    if (naroSvc) {
      const matPairs: [string, number][] = [
        ['KODI Base Gel 12ml', 1],
        ['Komilfo Gel Polish 045', 0.5],
        ['KODI Rubber Top 14ml', 1],
        ['OXXI Base Extra 15ml', 0.5],
        ['Пилки 180/240 (10шт)', 0.2],
        ['Бафи 180 (10шт)', 0.2],
        ['Серветки безворсові 200шт', 8],
        ['Рукавички нітрилові М 100шт', 2],
        ['Знежирювач 150мл', 3],
      ];
      const matInserts = matPairs
        .filter(([name]) => invMap.has(name))
        .map(([name, qty]) => ({
          salon_id: salonId,
          service_id: naroSvc.id,
          product_id: invMap.get(name)!,
          quantity: qty,
        }));
      if (matInserts.length > 0) {
        await sb.from('service_materials').insert(matInserts);
      }
    }

    // ── 10. Verify data was inserted ─────────────────────────────────
    const { count: clientCount } = await sb
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId);
    const { count: svcCount } = await sb
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId);
    const { count: apptCount } = await sb
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId);

    console.log('[SEED] DONE for salon', salonId);
    console.log(
      '[SEED] Verified counts — clients:',
      clientCount,
      'services:',
      svcCount,
      'appointments:',
      apptCount
    );

    return NextResponse.json({
      success: errors.length === 0,
      salon_id: salonId,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        clients: clientCount ?? 0,
        services: svcCount ?? 0,
        staff: (newStaff ?? []).length,
        appointments: apptCount ?? 0,
        expenses: expInserts.length,
        inventory: (invData ?? []).length,
        sterilization_cycles: equipmentId ? 5 : 0,
        brands: brandMap.size,
      },
    });
  } catch (error) {
    console.error('[SEED] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// DELETE /api/seed — remove all salon data (keep salon + owner)
// ═════════════════════════════════════════════════════════════════════════════

export async function DELETE(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { salon_id?: string };
    let salonId = body.salon_id;

    if (!salonId) {
      try {
        salonId = await getCurrentSalonId();
      } catch {
        /* ignore */
      }
    }
    if (!salonId) {
      return NextResponse.json({ error: 'salon_id is required' }, { status: 400 });
    }

    const sb = getAdminClient();
    await cleanSalonData(sb, salonId);

    return NextResponse.json({
      success: true,
      message: 'Всі дані салону видалено',
    });
  } catch (error) {
    console.error('[SEED DELETE] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Clean all salon data (shared by POST cleanup & DELETE)
// ═════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanSalonData(sb: any, salonId: string) {
  console.log('[CLEAN] Removing data for salon:', salonId);

  // Helper: safe delete that ignores errors (table might not exist)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function del(table: string, extra?: (q: any) => any) {
    try {
      let q = sb.from(table).delete().eq('salon_id', salonId);
      if (extra) q = extra(q);
      const { error } = await q;
      if (error) console.warn(`[CLEAN] ${table}: ${error.message}`);
      else console.log(`[CLEAN] ${table}: OK`);
    } catch (e) {
      console.warn(`[CLEAN] ${table}: skipped (${e})`);
    }
  }

  // Order: children before parents (FK constraints)
  await del('appointments');
  await del('service_materials');
  await del('sterilization_storage');
  await del('sterilization_cycles');
  await del('sterilization_instrument_sets');
  await del('sterilization_equipment');
  await del('inventory_items');
  await del('inventory_brands');
  await del('expenses');
  await del('payroll');
  await del('clients');
  await del('services');
  // Staff: keep owner
  await del('staff', (q) => q.neq('role', 'owner'));

  console.log('[CLEAN] Done');
}
