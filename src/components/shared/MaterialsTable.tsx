'use client';

import { Trash2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass';
import type { MaterialCostItem } from '@/schemas/service';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MaterialsTableProps {
  materials: MaterialCostItem[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

// ─── Formatters ──────────────────────────────────────────────────────────────

function fmtNum(n: number, decimals = 2): string {
  return n.toLocaleString('uk-UA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MaterialsTable({ materials, onRemove, readOnly = false }: MaterialsTableProps) {
  const totalCost = materials.reduce((s, m) => s + m.total_cost, 0);

  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/12">
          <Package className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-foreground text-sm font-medium">Матеріали не додані</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Додайте матеріали для розрахунку собівартості
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop table */}
      <div className="hidden lg:block">
        <GlassCard padding="none" hover={false}>
          <table className="w-full">
            <thead>
              <tr className="text-muted-foreground border-b border-[var(--glass-border)] text-left text-xs font-medium">
                <th className="px-4 py-2.5">Матеріал</th>
                <th className="px-4 py-2.5 text-right">Ціна упак.</th>
                <th className="px-4 py-2.5 text-right">К-сть в упак.</th>
                <th className="px-4 py-2.5 text-right">Ціна за 1</th>
                <th className="px-4 py-2.5 text-right">Витрата</th>
                <th className="px-4 py-2.5 text-right">Вартість</th>
                {!readOnly && <th className="w-10 px-4 py-2.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {materials.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-[var(--glass-bg-hover)]">
                  <td className="text-foreground px-4 py-2.5 text-sm font-medium">
                    {m.product_name}
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 text-right font-mono text-sm">
                    {fmtNum(m.purchase_price)} ₴
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 text-right font-mono text-sm">
                    {fmtNum(m.quantity_in_package, 0)} {m.unit}
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 text-right font-mono text-sm">
                    {fmtNum(m.unit_cost)} ₴
                  </td>
                  <td className="text-foreground px-4 py-2.5 text-right font-mono text-sm">
                    {fmtNum(m.quantity_per_service, 1)} {m.unit}
                  </td>
                  <td className="text-foreground px-4 py-2.5 text-right font-mono text-sm font-medium">
                    {fmtNum(m.total_cost)} ₴
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => onRemove?.(m.id)}
                        className="text-muted-foreground hover:text-error rounded p-1 transition-colors"
                        aria-label="Видалити"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--glass-border)]">
                <td
                  colSpan={readOnly ? 5 : 5}
                  className="text-foreground px-4 py-2.5 text-right text-sm font-semibold"
                >
                  Підсумок матеріалів:
                </td>
                <td className="text-foreground px-4 py-2.5 text-right font-mono text-sm font-bold">
                  {fmtNum(totalCost)} ₴
                </td>
                {!readOnly && <td />}
              </tr>
            </tfoot>
          </table>
        </GlassCard>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 lg:hidden">
        {materials.map((m) => (
          <GlassCard key={m.id} padding="sm" className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-medium">{m.product_name}</p>
              <p className="text-muted-foreground text-xs">
                {fmtNum(m.purchase_price)}₴ / {fmtNum(m.quantity_in_package, 0)} {m.unit}
                {' · '}
                {fmtNum(m.quantity_per_service, 1)} {m.unit} на процедуру
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-mono text-sm font-medium">
                {fmtNum(m.total_cost)} ₴
              </span>
              {!readOnly && (
                <button
                  onClick={() => onRemove?.(m.id)}
                  className="text-muted-foreground hover:text-error rounded p-1 transition-colors"
                  aria-label="Видалити"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </GlassCard>
        ))}

        {/* Total */}
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-foreground text-sm font-semibold">Підсумок матеріалів:</span>
          <span className="text-foreground font-mono text-sm font-bold">{fmtNum(totalCost)} ₴</span>
        </div>
      </div>
    </div>
  );
}
