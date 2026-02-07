'use client';

import { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  FileDown,
  BarChart3,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassModal } from '@/components/glass';

// ─── Types ───────────────────────────────────────────────────────────────────

type ExportType = 'stock' | 'purchase' | 'usage' | 'movement';
type ExportFormat = 'xlsx' | 'csv';

const EXPORT_TYPES: { value: ExportType; label: string; desc: string; icon: React.ElementType }[] =
  [
    {
      value: 'stock',
      label: 'Залишки на складі',
      desc: 'Поточний стан всіх товарів',
      icon: Package,
    },
    {
      value: 'purchase',
      label: 'Накладна прихід',
      desc: 'Приходи за вибраний період',
      icon: ArrowDownToLine,
    },
    {
      value: 'usage',
      label: 'Накладна списання',
      desc: 'Списання за вибраний період',
      icon: ArrowUpFromLine,
    },
    { value: 'movement', label: 'Рух товарів', desc: 'Всі операції за період', icon: BarChart3 },
  ];

interface ExportInventoryModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ExportInventoryModal({ open, onClose }: ExportInventoryModalProps) {
  const [type, setType] = useState<ExportType>('stock');
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [supplier, setSupplier] = useState('');
  const [exporting, setExporting] = useState(false);

  const needsDateRange = type !== 'stock';

  const handleExport = async () => {
    setExporting(true);

    try {
      const params = new URLSearchParams({
        type,
        format,
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        ...(supplier && { supplier }),
      });

      const res = await fetch(`/api/inventory/export?${params.toString()}`);

      if (!res.ok) {
        setExporting(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      const ext = format;
      const typeLabel = EXPORT_TYPES.find((t) => t.value === type)?.label ?? 'export';
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `${typeLabel}_${date}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch {
      // ignore
    }

    setExporting(false);
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Експорт даних" size="md">
      <div className="space-y-5">
        {/* Export type */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Тип звіту
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={cn(
                    'flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                    t.value === type
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]'
                  )}
                >
                  <Icon
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      t.value === type ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        'text-xs font-medium',
                        t.value === type ? 'text-foreground' : 'text-foreground'
                      )}
                    >
                      {t.label}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[10px]">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date range */}
        {needsDateRange && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">Від</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">До</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Supplier filter */}
        {needsDateRange && (
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Постачальник (опціонально)
            </label>
            <input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Всі постачальники"
              className="text-foreground placeholder:text-muted-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* Format */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Формат
          </p>
          <div className="flex gap-2">
            {[
              { value: 'xlsx' as const, label: 'Excel (.xlsx)', icon: FileSpreadsheet },
              { value: 'csv' as const, label: 'CSV (.csv)', icon: FileText },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-all',
                    f.value === format
                      ? 'border-primary/50 bg-primary/10 text-foreground'
                      : 'text-muted-foreground border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--glass-border)] pt-4">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium"
          >
            Скасувати
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Експортувати
          </button>
        </div>
      </div>
    </GlassModal>
  );
}
