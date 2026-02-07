import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { getCurrentSalonId } from '@/lib/auth';
import { normalizePhone, splitName } from '@/lib/import-utils';

// ─── Admin client ────────────────────────────────────────────────────────────

function getAdmin() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!url || !key) throw new Error('Missing SUPABASE env vars');
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientToImport {
  name: string;
  phone: string;
  email?: string;
  instagram?: string;
  last_service?: string;
  last_visit?: string;
  notes?: string;
  first_name?: string;
  last_name?: string;
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      salon_id?: string;
      clients: ClientToImport[];
    };

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

    const clients = body.clients ?? [];
    if (clients.length === 0) {
      return NextResponse.json({ success: true, imported: 0, skipped: 0 });
    }

    const sb = getAdmin();

    // ── Step 1: Fetch ALL existing clients for this salon to check duplicates ──
    const { data: existingClients } = await sb
      .from('clients')
      .select('id, phone, first_name, last_name')
      .eq('salon_id', salonId);

    const existingPhones = new Set<string>();
    const existingNames = new Set<string>();
    for (const ec of existingClients ?? []) {
      if (ec.phone) {
        existingPhones.add(normalizePhone(ec.phone));
      }
      const fullName = `${(ec.first_name || '').toLowerCase().trim()} ${(ec.last_name || '').toLowerCase().trim()}`.trim();
      if (fullName) {
        existingNames.add(fullName);
      }
    }

    console.log(
      '[IMPORT CONFIRM] Salon:', salonId,
      '| Existing clients:', existingClients?.length ?? 0,
      '| Existing phones:', existingPhones.size,
      '| Clients to import:', clients.length
    );

    // ── Step 2: Filter out duplicates & prepare inserts ────────────────────────
    const toInsert: Array<Record<string, unknown>> = [];
    let skipped = 0;
    const insertedPhones = new Set<string>(); // Track within this batch too

    for (const c of clients) {
      const phone = c.phone ? normalizePhone(c.phone) : '';
      const { first_name, last_name } = c.first_name
        ? { first_name: c.first_name, last_name: c.last_name ?? '' }
        : splitName(c.name);

      // Check 1: Phone already in DB
      if (phone && existingPhones.has(phone)) {
        console.log('[IMPORT CONFIRM] SKIP (phone in DB):', first_name, last_name, phone);
        skipped++;
        continue;
      }

      // Check 2: Phone already in this import batch (intra-batch dedup)
      if (phone && insertedPhones.has(phone)) {
        console.log('[IMPORT CONFIRM] SKIP (phone in batch):', first_name, last_name, phone);
        skipped++;
        continue;
      }

      // Check 3: Exact name match (case-insensitive) — skip only if no phone to differentiate
      const fullName = `${(first_name || '').toLowerCase().trim()} ${(last_name || '').toLowerCase().trim()}`.trim();
      if (!phone && fullName && existingNames.has(fullName)) {
        console.log('[IMPORT CONFIRM] SKIP (name in DB, no phone):', first_name, last_name);
        skipped++;
        continue;
      }

      // Build notes
      const notesParts: string[] = [];
      if (c.notes) notesParts.push(c.notes);
      if (c.instagram) notesParts.push(`Instagram: ${c.instagram}`);
      if (c.last_service) notesParts.push(`Остання послуга: ${c.last_service}`);

      toInsert.push({
        salon_id: salonId,
        first_name: first_name || 'Без імені',
        last_name: last_name || '',
        phone: phone || '',
        email: c.email || null,
        notes: notesParts.length > 0 ? notesParts.join('. ') : null,
        source: 'manual',
        rfm_segment: 'new',
        total_visits: 0,
        total_spent: 0,
        is_active: true,
        formulas: {},
      });

      if (phone) insertedPhones.add(phone);
    }

    console.log('[IMPORT CONFIRM] After dedup: to insert:', toInsert.length, '| skipped:', skipped);

    // ── Step 3: Insert in batches ──────────────────────────────────────────────
    const BATCH_SIZE = 50;
    let imported = 0;

    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);

      const { data, error } = await sb.from('clients').insert(batch).select('id');

      if (error) {
        console.error('[IMPORT CONFIRM] Batch insert error:', error.message, error.details);
        // Try inserting one by one for this failed batch
        for (const row of batch) {
          const { data: single, error: singleErr } = await sb
            .from('clients')
            .insert(row)
            .select('id');
          if (singleErr) {
            console.error('[IMPORT CONFIRM] Single insert failed:', (row as { first_name: string }).first_name, singleErr.message);
            skipped++;
          } else if (single && single.length > 0) {
            imported++;
          }
        }
      } else {
        imported += (data ?? []).length;
      }
    }

    console.log('[IMPORT CONFIRM] Final — imported:', imported, '| skipped:', skipped);

    return NextResponse.json({
      success: true,
      imported,
      skipped,
    });
  } catch (error) {
    console.error('[IMPORT CONFIRM] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Confirm import failed' },
      { status: 500 }
    );
  }
}
