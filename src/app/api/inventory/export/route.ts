import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';
import { getCurrentSalonId } from '@/lib/auth';

export async function GET(request: NextRequest) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type') ?? 'stock';
  const fmt = searchParams.get('format') ?? 'xlsx';
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const supplier = searchParams.get('supplier');

  const supabase = await createClient();

  let rows: Record<string, unknown>[] = [];
  let sheetName = 'Export';
  let headers: string[] = [];

  // ── Stock report ──────────────────────────
  if (type === 'stock') {
    sheetName = 'Залишки';
    headers = [
      'Назва',
      'Бренд',
      'Категорія',
      'SKU',
      'Ціна закупки',
      'Ціна продажу',
      'Залишок',
      'Мін. залишок',
      'Одиниці',
      'Постачальник',
      'Вартість на складі',
    ];

    // Use select('*') + try join separately for robustness
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('salon_id', salonId)
      .order('name');

    if (error) {
      console.error('[EXPORT] Stock query error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    rows = (data ?? []).map((r: Record<string, unknown>) => {
      const qty = Number(r.quantity ?? 0);
      const price = Number(r.purchase_price ?? r.cost_price ?? 0);
      return {
        Назва: r.name ?? '',
        Бренд: '',
        Категорія: r.category ?? '',
        SKU: r.sku ?? '',
        'Ціна закупки': price,
        'Ціна продажу': Number(r.retail_price ?? r.sell_price ?? 0),
        Залишок: qty,
        'Мін. залишок': Number(r.min_quantity ?? 0),
        Одиниці: r.unit ?? 'шт',
        Постачальник: r.supplier ?? '',
        'Вартість на складі': Math.round(qty * price),
      };
    });
  }

  // ── Purchase/Usage/Movement reports ────────
  if (type === 'purchase' || type === 'usage' || type === 'movement') {
    const typeMap: Record<string, string[]> = {
      purchase: ['purchase'],
      usage: ['usage', 'auto_deduction'],
      movement: ['purchase', 'usage', 'auto_deduction', 'adjustment', 'return'],
    };

    sheetName = type === 'purchase' ? 'Прихід' : type === 'usage' ? 'Списання' : 'Рух товарів';
    headers = ['Дата', 'Товар', 'Тип', 'Кількість', 'Вартість', 'Постачальник', 'Нотатки'];

    let query = supabase
      .from('inventory_transactions')
      .select('created_at, type, quantity, cost, supplier, notes, inventory_items!product_id(name)')
      .eq('salon_id', salonId)
      .in('type', typeMap[type] ?? [])
      .order('created_at', { ascending: false });

    if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
    if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);
    if (supplier) query = query.eq('supplier', supplier);

    const { data, error } = await query;

    if (error) {
      console.error('[EXPORT] Transactions query error:', error.message);

      // Fallback without join
      let q2 = supabase
        .from('inventory_transactions')
        .select('*')
        .eq('salon_id', salonId)
        .in('type', typeMap[type] ?? [])
        .order('created_at', { ascending: false });

      if (dateFrom) q2 = q2.gte('created_at', `${dateFrom}T00:00:00`);
      if (dateTo) q2 = q2.lte('created_at', `${dateTo}T23:59:59`);
      if (supplier) q2 = q2.eq('supplier', supplier);

      const { data: fb } = await q2;

      const typeLabels: Record<string, string> = {
        purchase: 'Прихід',
        usage: 'Списання',
        auto_deduction: 'Авто-списання',
        adjustment: 'Коригування',
        return: 'Повернення',
      };

      rows = (fb ?? []).map((r: Record<string, unknown>) => ({
        Дата: new Date(r.created_at as string).toLocaleDateString('uk-UA'),
        Товар: '',
        Тип: typeLabels[r.type as string] ?? r.type,
        Кількість: r.quantity,
        Вартість: r.cost ?? '',
        Постачальник: r.supplier ?? '',
        Нотатки: r.notes ?? '',
      }));
    } else {
      const typeLabels: Record<string, string> = {
        purchase: 'Прихід',
        usage: 'Списання',
        auto_deduction: 'Авто-списання',
        adjustment: 'Коригування',
        return: 'Повернення',
      };

      rows = (data ?? []).map((r: Record<string, unknown>) => {
        const product = r.inventory_items as { name: string } | null;
        return {
          Дата: new Date(r.created_at as string).toLocaleDateString('uk-UA'),
          Товар: product?.name ?? '',
          Тип: typeLabels[r.type as string] ?? r.type,
          Кількість: r.quantity,
          Вартість: r.cost ?? '',
          Постачальник: r.supplier ?? '',
          Нотатки: r.notes ?? '',
        };
      });
    }
  }

  // ── Generate file ─────────────────────────

  if (fmt === 'csv') {
    const csvRows = [headers.join(',')];
    for (const row of rows) {
      csvRows.push(
        headers
          .map((h) => {
            const val = String(row[h] ?? '');
            return val.includes(',') ? `"${val}"` : val;
          })
          .join(',')
      );
    }
    const csvContent = csvRows.join('\n');
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${sheetName}.csv"`,
      },
    });
  }

  // XLSX
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${sheetName}.xlsx"`,
    },
  });
}
