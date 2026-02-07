import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as XLSX from 'xlsx';
import { getCurrentSalonId } from '@/lib/auth';
import {
  normalizePhone,
  matchColumns,
  rowsToClients,
  parseTextInput,
  markDuplicates,
  type ParsedClient,
  type ExistingClient,
} from '@/lib/import-utils';

// ─── Admin Supabase client ───────────────────────────────────────────────────

function getAdmin() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!url || !key) throw new Error('Missing SUPABASE env vars');
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Claude Vision helper ────────────────────────────────────────────────────

async function recognizeFromPhoto(images: string[]): Promise<ParsedClient[]> {
  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  console.log('[IMPORT] ANTHROPIC_API_KEY present:', !!apiKey, 'length:', apiKey.length);
  if (!apiKey)
    throw new Error('ANTHROPIC_API_KEY not configured. Add it to Vercel Environment Variables.');

  const anthropic = new Anthropic({ apiKey });

  const imageBlocks: Anthropic.Messages.ContentBlockParam[] = images.map((img) => {
    // img is base64 data URL or raw base64
    const base64 = img.includes(',') ? img.split(',')[1]! : img;
    // Detect media type
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
    if (img.startsWith('data:image/png')) mediaType = 'image/png';
    else if (img.startsWith('data:image/webp')) mediaType = 'image/webp';
    else if (img.startsWith('data:image/gif')) mediaType = 'image/gif';

    return {
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: mediaType, data: base64 },
    };
  });

  console.log('[IMPORT] Calling Claude API with', images.length, 'image(s)...');
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system:
      'Ти — AI-асистент для імпорту клієнтів beauty-салону. ' +
      'Розпізнай з фото імена, телефони, послуги, дати візитів, нотатки. ' +
      'Телефони нормалізуй до формату +380XXXXXXXXX (Ukrainian mobile). ' +
      'Відповідай ТІЛЬКИ валідним JSON масивом без markdown, коментарів чи пояснень.',
    messages: [
      {
        role: 'user',
        content: [
          ...imageBlocks,
          {
            type: 'text' as const,
            text: 'Розпізнай клієнтів з цього фото. Поверни JSON масив: [{"name":"...","phone":"...","email":"...","instagram":"...","last_service":"...","last_visit":"YYYY-MM-DD","notes":"..."}]. Якщо поле невідоме — пропусти його. Телефони нормалізуй до +380XXXXXXXXX.',
          },
        ],
      },
    ],
  });
  console.log('[IMPORT] Claude response received, usage:', message.usage);

  // Extract text from response
  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') return [];

  let raw = textBlock.text.trim();
  // Strip markdown fencing if present
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((item: Record<string, unknown>) => ({
      name: String(item.name ?? ''),
      phone: item.phone ? normalizePhone(String(item.phone)) : '',
      email: item.email ? String(item.email) : undefined,
      instagram: item.instagram ? String(item.instagram) : undefined,
      last_service: item.last_service ? String(item.last_service) : undefined,
      last_visit: item.last_visit ? String(item.last_visit) : undefined,
      notes: item.notes ? String(item.notes) : undefined,
    }));
  } catch {
    console.error('[IMPORT] Failed to parse Claude response:', raw.slice(0, 200));
    return [];
  }
}

// ─── Excel / CSV parser ──────────────────────────────────────────────────────

async function parseExcel(base64: string): Promise<ParsedClient[]> {
  // Decode base64
  const raw = base64.includes(',') ? base64.split(',')[1]! : base64;
  const buffer = Buffer.from(raw, 'base64');
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName]!;
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
  }) as string[][];

  if (rows.length < 2) return [];

  const headers = (rows[0] ?? []).map((h) => String(h));
  const colMap = matchColumns(headers);

  // If we couldn't find name or phone columns, try Claude to figure it out
  if (colMap.name === undefined && colMap.phone === undefined) {
    // Fall back: try first 5 rows with Claude
    return await recognizeExcelWithAI(rows.slice(0, 6));
  }

  return rowsToClients(rows.slice(1), colMap);
}

async function recognizeExcelWithAI(sampleRows: string[][]): Promise<ParsedClient[]> {
  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  if (!apiKey) {
    // Without Claude, try heuristic: first col = name, second = phone
    return sampleRows.slice(1).map((row) => ({
      name: String(row[0] ?? ''),
      phone: row[1] ? normalizePhone(String(row[1])) : '',
    }));
  }

  const anthropic = new Anthropic({ apiKey });
  const csv = sampleRows.map((r) => r.join(' | ')).join('\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system:
      'Ти — AI-асистент. Визнач колонки в даних beauty-салону. ' +
      'Відповідай ТІЛЬКИ JSON об\'єктом {"column_map": {"name": 0, "phone": 1, ...}}.',
    messages: [
      {
        role: 'user',
        content: `Визнач яка колонка що означає. Рядки:\n${csv}\n\nПоверни JSON: {"column_map": {"name": <index>, "phone": <index>, "email": <index>, "instagram": <index>, "notes": <index>}}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') return [];

  let raw = textBlock.text.trim();
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  try {
    const parsed = JSON.parse(raw) as { column_map: Record<string, number> };
    return rowsToClients(sampleRows.slice(1), parsed.column_map);
  } catch {
    return [];
  }
}

// ─── GET existing clients for duplicate check ────────────────────────────────

async function getExistingClients(salonId: string): Promise<ExistingClient[]> {
  const sb = getAdmin();
  const { data } = await sb
    .from('clients')
    .select('id, phone, first_name, last_name, instagram')
    .eq('salon_id', salonId);
  return (data ?? []) as ExistingClient[];
}

// ─── Route config — allow larger payloads for image upload ───────────────────

export const maxDuration = 60; // seconds (for Claude API calls)

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      salon_id?: string;
      mode: 'photo' | 'excel' | 'manual';
      data: string | string[] | ParsedClient[];
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

    let parsed: ParsedClient[] = [];

    // ── Mode: photo ──────────────────────────────────────────────────
    if (body.mode === 'photo') {
      const images = Array.isArray(body.data) ? (body.data as string[]) : [body.data as string];
      if (images.length === 0) {
        return NextResponse.json({ error: 'No images provided' }, { status: 400 });
      }
      console.log('[IMPORT] Photo mode —', images.length, 'image(s)');
      parsed = await recognizeFromPhoto(images);
    }

    // ── Mode: excel ──────────────────────────────────────────────────
    else if (body.mode === 'excel') {
      const fileData = body.data as string;
      if (!fileData) {
        return NextResponse.json({ error: 'No file data' }, { status: 400 });
      }
      console.log('[IMPORT] Excel mode');
      parsed = await parseExcel(fileData);
    }

    // ── Mode: manual (text) ──────────────────────────────────────────
    else if (body.mode === 'manual') {
      if (typeof body.data === 'string') {
        console.log('[IMPORT] Manual text mode');
        parsed = parseTextInput(body.data);
      } else if (Array.isArray(body.data)) {
        console.log('[IMPORT] Manual array mode');
        parsed = body.data as ParsedClient[];
      }
    } else {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    if (parsed.length === 0) {
      return NextResponse.json({
        success: true,
        salon_id: salonId,
        clients: [],
        summary: { total: 0, new: 0, duplicates: 0, errors: 0 },
      });
    }

    // Check duplicates against existing salon clients
    const existing = await getExistingClients(salonId);
    console.log('[IMPORT] Salon:', salonId, '| Existing clients in DB:', existing.length, '| Parsed from input:', parsed.length);
    
    const rows = markDuplicates(parsed, existing);

    const summary = {
      total: rows.length,
      new: rows.filter((r) => r.status === 'new').length,
      duplicates: rows.filter((r) => r.status === 'duplicate').length,
      possible_duplicates: rows.filter((r) => r.status === 'possible_duplicate').length,
      errors: rows.filter((r) => r.status === 'error').length,
    };

    console.log('[IMPORT] Result:', summary, '| Duplicate details:', rows.filter(r => r.status === 'duplicate' || r.status === 'possible_duplicate').map(r => ({ name: r.name, phone: r.phone, status: r.status, reason: r.duplicate_reason, score: r.match_score })));

    return NextResponse.json({
      success: true,
      salon_id: salonId,
      clients: rows,
      summary,
    });
  } catch (error) {
    console.error('[IMPORT] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
