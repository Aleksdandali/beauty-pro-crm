'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassModal, GlassBadge } from '@/components/glass';
import { INVENTORY_CATEGORIES } from '@/schemas/inventory';

// ─── Column mapping config ───────────────────────────────────────────────────

const TEMPLATE_COLUMNS = [
  'Назва',
  'Бренд',
  'Категорія',
  'SKU',
  'Ціна закупки',
  'Ціна продажу',
  'Кількість',
  'Мін. залишок',
  'Одиниці',
  'Постачальник',
];

const FIELD_OPTIONS = [
  { value: '', label: '— Пропустити —' },
  { value: 'name', label: 'Назва' },
  { value: 'brand', label: 'Бренд' },
  { value: 'category', label: 'Категорія' },
  { value: 'sku', label: 'SKU' },
  { value: 'purchase_price', label: 'Ціна закупки' },
  { value: 'retail_price', label: 'Ціна продажу' },
  { value: 'quantity', label: 'Кількість' },
  { value: 'min_quantity', label: 'Мін. залишок' },
  { value: 'unit', label: 'Одиниці' },
  { value: 'supplier', label: 'Постачальник' },
];

// Auto-map column headers to fields
function autoMapColumn(header: string): string {
  const h = header.toLowerCase().trim();
  if (h.includes('назв') || h === 'name') return 'name';
  if (h.includes('бренд') || h === 'brand') return 'brand';
  if (h.includes('категор') || h === 'category') return 'category';
  if (h === 'sku' || h.includes('артикул')) return 'sku';
  if (h.includes('закуп') || h.includes('purchase')) return 'purchase_price';
  if (h.includes('продаж') || h.includes('retail')) return 'retail_price';
  if (h.includes('кількіст') || h === 'qty' || h === 'quantity') return 'quantity';
  if (h.includes('мін') || h.includes('min')) return 'min_quantity';
  if (h.includes('одини') || h === 'unit') return 'unit';
  if (h.includes('постачальн') || h.includes('supplier')) return 'supplier';
  return '';
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'upload' | 'preview' | 'result';

interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}

interface ImportInventoryModalProps {
  open: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ImportInventoryModal({ open, onClose, onCompleted }: ImportInventoryModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── Parse file ───────────────────────────

  const parseFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const Papa = (await import('papaparse')).default;
      const text = await file.text();
      const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
      if (parsed.data.length < 2) return;
      const hdr = parsed.data[0] ?? [];
      const data = parsed.data.slice(1);
      setHeaders(hdr);
      setRows(data);
      // Auto-map
      const m: Record<number, string> = {};
      hdr.forEach((h, i) => {
        m[i] = autoMapColumn(h);
      });
      setMapping(m);
      setStep('preview');
    } else if (ext === 'xlsx' || ext === 'xls') {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0] ?? ''];
      if (!ws) return;
      const json = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];
      if (json.length < 2) return;
      const hdr = (json[0] ?? []).map(String);
      const data = json.slice(1).map((r) => r.map(String));
      setHeaders(hdr);
      setRows(data);
      const m: Record<number, string> = {};
      hdr.forEach((h, i) => {
        m[i] = autoMapColumn(h);
      });
      setMapping(m);
      setStep('preview');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  // ── Download template ────────────────────

  const downloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_COLUMNS,
      [
        'KODI Base Extra',
        'KODI Professional',
        'bases',
        'KODI-BASE-12ML',
        '320',
        '0',
        '5',
        '2',
        'мл',
        'Shine Shop',
      ],
      ['Рукавички нітрилові', '', 'consumables', 'GLV-100', '400', '0', '100', '20', 'шт', ''],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Товари');
    XLSX.writeFile(wb, 'inventory_template.xlsx');
  };

  // ── Import ───────────────────────────────

  const handleImport = async () => {
    setImporting(true);

    // Build items from rows + mapping
    const items: Record<string, unknown>[] = [];
    for (const row of rows) {
      const item: Record<string, unknown> = {};
      let hasName = false;

      for (let col = 0; col < row.length; col++) {
        const field = mapping[col];
        const val = row[col]?.trim() ?? '';
        if (!field || !val) continue;

        if (field === 'name') {
          item.name = val;
          hasName = true;
        } else if (
          field === 'purchase_price' ||
          field === 'retail_price' ||
          field === 'quantity' ||
          field === 'min_quantity'
        ) {
          item[field] = parseFloat(val) || 0;
        } else {
          item[field] = val;
        }
      }

      if (hasName) items.push(item);
    }

    if (items.length === 0) {
      setResult({ created: 0, updated: 0, errors: ['Немає валідних рядків для імпорту'] });
      setStep('result');
      setImporting(false);
      return;
    }

    try {
      const res = await fetch('/api/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = (await res.json()) as ImportResult;
      setResult(data);
      setStep('result');
    } catch {
      setResult({ created: 0, updated: 0, errors: ['Помилка мережі'] });
      setStep('result');
    }

    setImporting(false);
  };

  // ── Mapped count ─────────────────────────

  const mappedFields = Object.values(mapping).filter(Boolean);
  const hasNameMapped = mappedFields.includes('name');
  const previewRows = rows.slice(0, 10);

  return (
    <GlassModal open={open} onClose={handleClose} title="Імпорт товарів" size="lg">
      <div className="space-y-4">
        {/* ── Step: Upload ──────────────────── */}
        {step === 'upload' && (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all',
                dragOver
                  ? 'border-primary/60 bg-primary/5'
                  : 'hover:border-primary/30 border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]'
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                <Upload className="h-6 w-6 text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-foreground text-sm font-medium">
                  Перетягніть файл або натисніть
                </p>
                <p className="text-muted-foreground mt-1 text-xs">Підтримуються .xlsx та .csv</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={downloadTemplate}
                className="text-primary inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                Завантажити шаблон .xlsx
              </button>
            </div>
          </>
        )}

        {/* ── Step: Preview ─────────────────── */}
        {step === 'preview' && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-foreground text-sm font-medium">
                Знайдено {rows.length} рядків, {headers.length} колонок
              </p>
              <button onClick={reset} className="text-muted-foreground text-xs hover:underline">
                Обрати інший файл
              </button>
            </div>

            {/* Column mapping */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Маппінг колонок
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {headers.map((h, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-muted-foreground text-[10px]">{h}</span>
                    <select
                      value={mapping[i] ?? ''}
                      onChange={(e) => setMapping((m) => ({ ...m, [i]: e.target.value }))}
                      className="text-foreground w-full rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-1.5 text-xs"
                    >
                      {FIELD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div className="max-h-[200px] overflow-auto rounded-lg border border-[var(--glass-border)]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)]">
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="text-muted-foreground px-2 py-1.5 text-left font-medium whitespace-nowrap"
                      >
                        {mapping[i] ? (
                          <span className="text-primary">
                            {FIELD_OPTIONS.find((f) => f.value === mapping[i])?.label}
                          </span>
                        ) : (
                          <span className="opacity-40">{h}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, ri) => (
                    <tr key={ri} className="border-b border-[var(--glass-border)]">
                      {row.map((cell, ci) => (
                        <td key={ci} className="text-foreground px-2 py-1 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 10 && (
              <p className="text-muted-foreground text-center text-[10px]">
                Показано 10 з {rows.length} рядків
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-4">
              <p className="text-muted-foreground text-xs">
                {mappedFields.length} полів змаповано
                {!hasNameMapped && (
                  <span className="ml-2 text-rose-500">
                    <AlertTriangle className="mr-0.5 inline h-3 w-3" />
                    Поле &quot;Назва&quot; обов&apos;язкове
                  </span>
                )}
              </p>
              <button
                onClick={handleImport}
                disabled={importing || !hasNameMapped}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-60"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Імпортувати {rows.length} товарів
              </button>
            </div>
          </>
        )}

        {/* ── Step: Result ──────────────────── */}
        {step === 'result' && result && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              {result.errors.length === 0 ? (
                <CheckCircle2 className="mb-2 h-10 w-10 text-emerald-500" />
              ) : (
                <AlertTriangle className="mb-2 h-10 w-10 text-amber-500" />
              )}
              <p className="text-foreground text-lg font-bold">Імпорт завершено</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-500">{result.created}</p>
                <p className="text-xs text-emerald-600">Створено</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-blue-500">{result.updated}</p>
                <p className="text-xs text-blue-600">Оновлено</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="max-h-[120px] space-y-1 overflow-y-auto rounded-lg bg-rose-500/10 p-3">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-rose-500">
                    {err}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-end border-t border-[var(--glass-border)] pt-4">
              <button
                onClick={() => {
                  handleClose();
                  onCompleted?.();
                }}
                className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white"
              >
                Готово
              </button>
            </div>
          </div>
        )}
      </div>
    </GlassModal>
  );
}
