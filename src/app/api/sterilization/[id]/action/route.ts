import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cycleActionSchema } from '@/schemas/sterilization';
import { getCurrentSalonId } from '@/lib/auth';

/**
 * POST /api/sterilization/[id]/action
 *
 * ⚠️ All timestamps are set SERVER-SIDE via NOW() in SQL.
 * Client CANNOT send timestamps — this is a legal requirement.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const parsed = cycleActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { action, ...extraData } = parsed.data;
  const supabase = await createClient();

  // Build update object based on action
  // ⚠️ Timestamps use NOW() — never accept from client
  let updateFields: Record<string, unknown> = {};
  let rawSql = '';

  switch (action) {
    case 'start_preparation':
      updateFields = {
        stage: 'preparation',
        preparation_notes: extraData.preparation_notes ?? null,
        photos_before: extraData.photos_before ?? null,
      };
      rawSql = 'started_at = NOW()';
      break;

    case 'start_disinfection':
      updateFields = {
        stage: 'disinfection',
        disinfection_solution: extraData.disinfection_solution ?? null,
        disinfection_concentration: extraData.disinfection_concentration ?? null,
        disinfection_exposure_minutes: extraData.disinfection_duration_minutes ?? null,
      };
      rawSql = 'disinfection_started_at = NOW()';
      break;

    case 'complete_disinfection':
      updateFields = {};
      rawSql = 'disinfection_completed_at = NOW()';
      break;

    case 'start_pso':
      updateFields = {
        stage: 'pso',
        pso_method: extraData.pso_method ?? null,
      };
      rawSql = 'pso_started_at = NOW()';
      break;

    case 'complete_pso':
      updateFields = {
        azopyramine_test: extraData.azopyramine_result ?? null,
        azopyramine_photo_url: extraData.azopyramine_photo ?? null,
      };
      rawSql = 'pso_completed_at = NOW()';
      break;

    case 'start_drying':
      updateFields = {
        stage: 'drying',
        drying_method: extraData.drying_method ?? null,
      };
      rawSql = 'drying_started_at = NOW()';
      break;

    case 'complete_drying':
      updateFields = {};
      rawSql = 'drying_completed_at = NOW()';
      break;

    case 'start_sterilization':
      updateFields = {
        stage: 'sterilization',
        sterilization_mode: extraData.sterilization_mode ?? null,
        sterilization_temperature: extraData.sterilization_temperature ?? null,
        sterilization_pressure: extraData.sterilization_pressure ?? null,
        sterilization_time_minutes: extraData.sterilization_duration_minutes ?? null,
      };
      rawSql = 'sterilization_started_at = NOW()';
      break;

    case 'complete_sterilization':
      updateFields = {
        chemical_indicator: extraData.chemical_indicator ?? null,
        chemical_indicator_photo_url: extraData.chemical_indicator_photo ?? null,
      };
      rawSql = 'sterilization_completed_at = NOW()';
      break;

    case 'complete_cycle':
      updateFields = {
        stage: 'completed',
        result: extraData.result ?? 'success',
        result_notes: extraData.result_notes ?? null,
        photos_after: extraData.photos_after ?? null,
        packaging_type: extraData.packaging_type ?? null,
        packaging_photo: extraData.packaging_photo ?? null,
        is_locked: true,
      };
      rawSql = 'completed_at = NOW(), locked_at = NOW()';
      break;

    case 'cancel_cycle':
      updateFields = {
        stage: 'completed',
        result: 'cancelled',
        result_notes: extraData.result_notes ?? 'Скасовано оператором',
        is_locked: true,
      };
      rawSql = 'completed_at = NOW(), locked_at = NOW()';
      break;

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  // Use RPC to set server timestamps via NOW()
  // Since Supabase JS doesn't support raw SQL in updates, we use a two-step approach:
  // 1. Update regular fields via Supabase client
  // 2. Use rpc or direct SQL for NOW() timestamps

  // Step 1: Update non-timestamp fields
  if (Object.keys(updateFields).length > 0) {
    const { error: updateError } = await supabase
      .from('sterilization_cycles')
      .update(updateFields)
      .eq('id', id)
      .eq('salon_id', salonId);

    if (updateError) {
      console.error('[STERILIZATION] Action update error:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // Step 2: Set server timestamp via raw SQL (using rpc)
  if (rawSql) {
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      query: `UPDATE sterilization_cycles SET ${rawSql} WHERE id = '${id}' AND salon_id = '${salonId}'`,
    });

    if (sqlError) {
      // Fallback: try direct update with JS Date (less ideal but works)
      console.warn(
        '[STERILIZATION] RPC unavailable, using JS timestamp fallback:',
        sqlError.message
      );
      const nowIso = new Date().toISOString();
      const fallbackFields: Record<string, unknown> = {};

      // Parse rawSql to extract field names
      const assignments = rawSql.split(',').map((s) => s.trim());
      for (const assignment of assignments) {
        const field = assignment.split('=')[0]?.trim();
        if (field) fallbackFields[field] = nowIso;
      }

      if (Object.keys(fallbackFields).length > 0) {
        const { error: fbErr } = await supabase
          .from('sterilization_cycles')
          .update(fallbackFields)
          .eq('id', id)
          .eq('salon_id', salonId);

        if (fbErr) {
          console.error('[STERILIZATION] Fallback timestamp error:', fbErr.message);
          return NextResponse.json({ error: fbErr.message }, { status: 500 });
        }
      }
    }
  }

  // ─── After complete_cycle: auto-create storage per package ──────────────
  if (action === 'complete_cycle') {
    try {
      // Fetch the completed cycle to get packages + cycle_number
      const { data: completedCycle } = await supabase
        .from('sterilization_cycles')
        .select('id, cycle_number, packages')
        .eq('id', id)
        .single();

      if (completedCycle) {
        let packages: Array<{
          set_id?: string;
          set_name?: string;
          instruments?: string[];
          packaging?: string;
        }> = [];

        // Parse packages from DB
        const rawPkgs = completedCycle.packages;
        if (typeof rawPkgs === 'string') {
          try {
            packages = JSON.parse(rawPkgs);
          } catch {
            packages = [];
          }
        } else if (Array.isArray(rawPkgs)) {
          packages = rawPkgs;
        }

        // Expiry calculation based on packaging type
        const getExpiry = (packaging: string): string => {
          switch (packaging) {
            case 'kraft':
              return '1 year';
            case 'pouch':
              return '1 year';
            case 'container':
              return '3 days';
            case 'wrap':
              return '20 days';
            case 'none':
              return '6 hours';
            default:
              return '3 days';
          }
        };

        if (packages.length > 0) {
          const storageRows = packages.map((pkg, idx) => {
            const label = pkg.set_name
              ? `${completedCycle.cycle_number} / Пакет ${idx + 1}: ${pkg.set_name}`
              : `${completedCycle.cycle_number} / Пакет ${idx + 1}: ${(pkg.instruments ?? []).join(', ')}`;
            const expiry = getExpiry(pkg.packaging ?? 'kraft');
            return {
              salon_id: salonId,
              cycle_id: id,
              package_label: label,
              storage_location: null,
              status: 'sterile',
              expires_at_interval: expiry,
            };
          });

          // Insert storage via raw SQL to use NOW() + interval for expires_at
          for (const row of storageRows) {
            const { error: stErr } = await supabase.rpc('exec_sql', {
              query: `INSERT INTO sterilization_storage (salon_id, cycle_id, package_label, storage_location, status, stored_at, expires_at)
                VALUES ('${row.salon_id}', '${row.cycle_id}', '${row.package_label.replace(/'/g, "''")}', NULL, 'sterile', NOW(), NOW() + interval '${row.expires_at_interval}')`,
            });

            if (stErr) {
              // Fallback: use JS dates
              console.warn('[STERILIZATION] Storage RPC failed, using fallback:', stErr.message);
              const now = new Date();
              const expiresAt = new Date(now);
              if (row.expires_at_interval.includes('year'))
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
              else if (row.expires_at_interval.includes('day')) {
                const days = parseInt(row.expires_at_interval) || 3;
                expiresAt.setDate(expiresAt.getDate() + days);
              } else if (row.expires_at_interval.includes('hour')) {
                const hours = parseInt(row.expires_at_interval) || 6;
                expiresAt.setHours(expiresAt.getHours() + hours);
              }
              await supabase.from('sterilization_storage').insert({
                salon_id: salonId,
                cycle_id: id,
                package_label: row.package_label,
                storage_location: null,
                status: 'sterile',
                stored_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
              });
            }
          }
        }
      }
    } catch (storageErr) {
      console.error('[STERILIZATION] Auto-create storage error:', storageErr);
      // Non-blocking — cycle still completes
    }
  }

  // Fetch updated cycle
  const { data: updated } = await supabase
    .from('sterilization_cycles')
    .select('id, cycle_number, stage, is_locked, completed_at')
    .eq('id', id)
    .single();

  return NextResponse.json({ success: true, cycle: updated });
}
