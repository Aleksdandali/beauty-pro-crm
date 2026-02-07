import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';

interface ImportItem {
  name?: string;
  brand?: string;
  category?: string;
  sku?: string;
  purchase_price?: number;
  retail_price?: number;
  quantity?: number;
  min_quantity?: number;
  unit?: string;
  supplier?: string;
}

export async function POST(request: NextRequest) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { items: ImportItem[] };
  const supabase = await createClient();

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (let i = 0; i < body.items.length; i++) {
    const item = body.items[i];
    if (!item?.name) {
      errors.push(`Рядок ${i + 1}: відсутня назва`);
      continue;
    }

    try {
      // Check if SKU exists → update
      if (item.sku) {
        const { data: existing } = await supabase
          .from('inventory_items')
          .select('id, quantity')
          .eq('salon_id', salonId)
          .eq('sku', item.sku)
          .maybeSingle();

        if (existing) {
          const newQty = (Number(existing.quantity) || 0) + (item.quantity ?? 0);
          const { error: updateErr } = await supabase
            .from('inventory_items')
            .update({
              quantity: newQty,
              purchase_price: item.purchase_price ?? undefined,
              retail_price: item.retail_price ?? undefined,
              supplier: item.supplier ?? undefined,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateErr) {
            console.error('[IMPORT] Update error:', updateErr.message);
            errors.push(`Рядок ${i + 1} (${item.name}): ${updateErr.message}`);
            continue;
          }

          // Create purchase transaction
          if (item.quantity && item.quantity > 0) {
            await supabase.from('inventory_transactions').insert({
              salon_id: salonId,
              product_id: existing.id,
              type: 'purchase',
              quantity: item.quantity,
              cost: (item.quantity ?? 0) * (item.purchase_price ?? 0) || null,
              notes: `Імпорт: оновлення SKU ${item.sku}`,
              supplier: item.supplier ?? null,
            });
          }

          updated++;
          continue;
        }
      }

      // Resolve brand_id if brand name provided
      let brandId: string | null = null;
      if (item.brand) {
        const { data: existingBrand } = await supabase
          .from('inventory_brands')
          .select('id')
          .eq('salon_id', salonId)
          .eq('name', item.brand)
          .maybeSingle();

        if (existingBrand) {
          brandId = existingBrand.id;
        } else {
          const { data: newBrand } = await supabase
            .from('inventory_brands')
            .insert({ salon_id: salonId, name: item.brand })
            .select('id')
            .single();
          brandId = newBrand?.id ?? null;
        }
      }

      // Create new product
      const validUnit = ['шт', 'мл', 'г', 'упак'].includes(item.unit ?? '') ? item.unit : 'шт';

      const { data: newProduct, error: insertErr } = await supabase
        .from('inventory_items')
        .insert({
          salon_id: salonId,
          name: item.name,
          brand_id: brandId,
          category: item.category || 'other',
          sku: item.sku || null,
          purchase_price: item.purchase_price ?? 0,
          retail_price: item.retail_price ?? 0,
          quantity: item.quantity ?? 0,
          min_quantity: item.min_quantity ?? 0,
          unit: validUnit,
          supplier: item.supplier || null,
        })
        .select('id')
        .single();

      if (insertErr) {
        console.error('[IMPORT] Insert error:', insertErr.message);
        errors.push(`Рядок ${i + 1} (${item.name}): ${insertErr.message}`);
        continue;
      }

      // Create initial purchase transaction
      if (newProduct && item.quantity && item.quantity > 0) {
        await supabase.from('inventory_transactions').insert({
          salon_id: salonId,
          product_id: newProduct.id,
          type: 'purchase',
          quantity: item.quantity,
          cost: item.quantity * (item.purchase_price ?? 0) || null,
          notes: 'Імпорт: початковий залишок',
          supplier: item.supplier ?? null,
        });
      }

      created++;
    } catch {
      errors.push(`Рядок ${i + 1} (${item.name}): неочікувана помилка`);
    }
  }

  return NextResponse.json({ created, updated, errors });
}
