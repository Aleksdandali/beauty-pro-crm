'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Camera,
  FileSpreadsheet,
  ClipboardPaste,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Users,
  Trash2,
  Edit3,
  ImagePlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import { GlassCard } from '@/components/glass';
import { useSalonId } from '@/components/providers/AuthProvider';
import type { ImportClientRow } from '@/lib/import-utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type ImportMode = 'photo' | 'excel' | 'manual';
type Step = 'choose' | 'upload' | 'review' | 'result';

interface ApiPreviewResponse {
  success: boolean;
  error?: string;
  clients: ImportClientRow[];
  summary: {
    total: number;
    new: number;
    duplicates: number;
    possible_duplicates: number;
    errors: number;
  };
}

interface ApiConfirmResponse {
  success: boolean;
  imported: number;
  skipped: number;
  error?: string;
}

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS_META: { key: Step; label: string; shortLabel: string }[] = [
  { key: 'choose', label: 'Спосіб', shortLabel: '1' },
  { key: 'upload', label: 'Завантаження', shortLabel: '2' },
  { key: 'review', label: 'Перевірка', shortLabel: '3' },
  { key: 'result', label: 'Готово', shortLabel: '4' },
];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS_META.findIndex((s) => s.key === current);
  return (
    <div className="mb-6 flex items-center justify-center gap-1.5 sm:mb-8 sm:gap-2">
      {STEPS_META.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.key} className="flex items-center gap-1.5 sm:gap-2">
            {i > 0 && (
              <div
                className={cn('h-px w-4 sm:w-8', done ? 'bg-violet-500' : 'bg-[var(--border)]')}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold transition-colors sm:h-8 sm:w-8 sm:text-xs',
                  done && 'bg-violet-500 text-white',
                  active &&
                    'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30',
                  !done &&
                    !active &&
                    'text-text-muted border border-[var(--border)] bg-[var(--glass-bg)]'
                )}
              >
                {done ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-[10px] sm:block sm:text-xs',
                  active ? 'text-text-primary font-medium' : 'text-text-muted'
                )}
              >
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ImportContent() {
  const salonId = useSalonId();

  const [step, setStep] = useState<Step>('choose');
  const [mode, setMode] = useState<ImportMode | null>(null);

  // Photo state
  const [photos, setPhotos] = useState<string[]>([]);

  // Excel state
  const [excelFile, setExcelFile] = useState<string | null>(null);
  const [excelName, setExcelName] = useState('');

  // Text state
  const [textInput, setTextInput] = useState('');

  // Review state
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ImportClientRow[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    new: 0,
    duplicates: 0,
    possible_duplicates: 0,
    errors: 0,
  });
  const [editIdx, setEditIdx] = useState<number | null>(null);

  // Result state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────

  const selectedCount = useMemo(() => clients.filter((c) => c.selected).length, [clients]);

  const toggleClient = useCallback((idx: number) => {
    setClients((prev) => prev.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c)));
  }, []);

  const toggleAll = useCallback((selected: boolean) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.status === 'error') return { ...c, selected: false };
        return { ...c, selected };
      })
    );
  }, []);

  const updateClientField = useCallback((idx: number, field: string, value: string) => {
    setClients((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }, []);

  // ── Image compression ──────────────────────────────────────────

  const compressImage = useCallback(
    (dataUrl: string, maxWidth = 1500, quality = 0.7): Promise<string> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          console.log(
            '[IMPORT] Compressed:',
            Math.round(dataUrl.length / 1024),
            'KB →',
            Math.round(compressed.length / 1024),
            'KB'
          );
          resolve(compressed);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      });
    },
    []
  );

  // ── File handlers ──────────────────────────────────────────────

  const processImageFile = useCallback(
    (file: File) => {
      console.log('[IMPORT] Processing:', file.name, Math.round(file.size / 1024), 'KB');
      const reader = new FileReader();
      reader.onload = () => {
        const raw = reader.result as string;
        compressImage(raw).then((compressed) => {
          setPhotos((prev) => {
            if (prev.length >= 5) return prev;
            console.log('[IMPORT] Photo added, total:', prev.length + 1);
            return [...prev, compressed];
          });
        });
      };
      reader.onerror = () => console.error('[IMPORT] FileReader error:', reader.error);
      reader.readAsDataURL(file);
    },
    [compressImage]
  );

  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log('[IMPORT] Photo select, files:', e.target.files?.length);
      const files = e.target.files;
      if (!files || files.length === 0) return;
      Array.from(files).forEach((file) => processImageFile(file));
      e.target.value = '';
    },
    [processImageFile]
  );

  const handleExcelSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelName(file.name);
    const reader = new FileReader();
    reader.onload = () => setExcelFile(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleExcelDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setExcelName(file.name);
    const reader = new FileReader();
    reader.onload = () => setExcelFile(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  // ── Can proceed (from upload step) ──────────────────────────────

  const canProceed =
    (mode === 'photo' && photos.length > 0) ||
    (mode === 'excel' && excelFile !== null) ||
    (mode === 'manual' && textInput.trim().length > 0);

  // ── API: Analyze ───────────────────────────────────────────────

  const analyzeClients = useCallback(async () => {
    console.log('[IMPORT] analyzeClients, mode:', mode);
    setLoading(true);
    setStep('review');
    setImportError(null);

    try {
      let bodyData: unknown;
      let bodyMode: ImportMode = 'manual';

      if (mode === 'photo') {
        bodyMode = 'photo';
        bodyData = photos;
        console.log(
          '[IMPORT] Sending',
          photos.length,
          'photos, sizes:',
          photos.map((p) => Math.round(p.length / 1024) + 'KB')
        );
      } else if (mode === 'excel') {
        bodyMode = 'excel';
        bodyData = excelFile;
      } else {
        bodyMode = 'manual';
        bodyData = textInput;
      }

      const payload = JSON.stringify({
        salon_id: salonId,
        mode: bodyMode,
        data: bodyData,
      });
      console.log('[IMPORT] Payload:', Math.round(payload.length / 1024), 'KB');

      const res = await fetch('/api/import/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      console.log('[IMPORT] Response status:', res.status);
      const json = (await res.json()) as ApiPreviewResponse;

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Analysis failed (HTTP ${res.status})`);
      }

      setClients(json.clients);
      setSummary(json.summary);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      console.error('[IMPORT] Error:', msg);
      setImportError(msg);
      setClients([]);
      setSummary({ total: 0, new: 0, duplicates: 0, possible_duplicates: 0, errors: 0 });
    } finally {
      setLoading(false);
    }
  }, [mode, photos, excelFile, textInput, salonId]);

  // ── API: Confirm import ────────────────────────────────────────

  const confirmImport = useCallback(async () => {
    setImporting(true);
    setStep('result');
    setImportError(null);

    try {
      const toImport = clients
        .filter((c) => c.selected)
        .map((c) => ({
          name: c.name,
          phone: c.phone,
          email: c.email,
          instagram: c.instagram,
          last_service: c.last_service,
          notes: c.notes,
          first_name: c.first_name,
          last_name: c.last_name,
        }));

      const res = await fetch('/api/import/clients/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salon_id: salonId, clients: toImport }),
      });

      const json = (await res.json()) as ApiConfirmResponse;

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Import failed');
      }

      setImportResult({ imported: json.imported, skipped: json.skipped });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setImporting(false);
    }
  }, [clients, salonId]);

  // ── Reset ──────────────────────────────────────────────────────

  const resetAll = useCallback(() => {
    setStep('choose');
    setMode(null);
    setPhotos([]);
    setExcelFile(null);
    setExcelName('');
    setTextInput('');
    setClients([]);
    setSummary({ total: 0, new: 0, duplicates: 0, possible_duplicates: 0, errors: 0 });
    setImportResult(null);
    setImportError(null);
  }, []);

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-28 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/clients"
          className="text-text-muted hover:text-text-primary flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] transition-colors hover:bg-[var(--glass-bg-hover)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-text-primary text-xl font-bold sm:text-2xl">Імпорт клієнтів</h1>
          <p className="text-text-secondary text-sm">Фото, Excel або текст — AI розпізнає все</p>
        </div>
      </div>

      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STEP 1: Choose method                                     */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {step === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Photo card */}
            <button
              type="button"
              onClick={() => {
                setMode('photo');
                setStep('upload');
              }}
              className="flex w-full items-center gap-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 text-left transition-all hover:border-violet-500/40 hover:bg-violet-500/5 active:scale-[0.98] sm:p-6"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary text-base font-semibold">Фото зошита</p>
                <p className="text-text-secondary mt-0.5 text-sm">
                  Сфоткайте зошит з клієнтами — AI розпізнає імена та телефони
                </p>
              </div>
              <ArrowRight className="text-text-muted h-5 w-5 shrink-0" />
            </button>

            {/* Excel card */}
            <button
              type="button"
              onClick={() => {
                setMode('excel');
                setStep('upload');
              }}
              className="flex w-full items-center gap-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 text-left transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5 active:scale-[0.98] sm:p-6"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                <FileSpreadsheet className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary text-base font-semibold">Excel / CSV</p>
                <p className="text-text-secondary mt-0.5 text-sm">
                  Завантажте файл з клієнтською базою
                </p>
              </div>
              <ArrowRight className="text-text-muted h-5 w-5 shrink-0" />
            </button>

            {/* Text card */}
            <button
              type="button"
              onClick={() => {
                setMode('manual');
                setStep('upload');
              }}
              className="flex w-full items-center gap-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 text-left transition-all hover:border-amber-500/40 hover:bg-amber-500/5 active:scale-[0.98] sm:p-6"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                <ClipboardPaste className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary text-base font-semibold">Вставити текст</p>
                <p className="text-text-secondary mt-0.5 text-sm">
                  Скопіюйте список клієнтів з будь-якого джерела
                </p>
              </div>
              <ArrowRight className="text-text-muted h-5 w-5 shrink-0" />
            </button>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STEP 2: Upload / input data                               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── PHOTO MODE ──────────────────────────────────── */}
            {mode === 'photo' && (
              <div className="space-y-4">
                <h2 className="text-text-primary text-lg font-semibold">
                  Сфоткайте зошит з клієнтами
                </h2>
                <p className="text-text-secondary text-sm">
                  Зробіть фото або виберіть з галереї. AI розпізнає імена, телефони та інші дані.
                </p>

                {/* Photo preview grid */}
                {photos.length > 0 && (
                  <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
                    <p className="text-text-primary mb-2 text-sm font-medium">
                      Фото: {photos.length}/5
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {photos.map((src, i) => (
                        <div key={i} className="relative aspect-square">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`Фото ${i + 1}`}
                            className="h-full w-full rounded-lg border border-[var(--border)] object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload buttons */}
                {photos.length < 5 && (
                  <div className="flex flex-col gap-3">
                    {/* Camera — full width, tall */}
                    <label className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-transform active:scale-[0.97]">
                      <Camera className="h-5 w-5" />
                      Зробити фото
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={handlePhotoSelect}
                      />
                    </label>

                    {/* Gallery — full width, tall */}
                    <label className="text-text-primary flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] text-sm font-semibold transition-all hover:bg-[var(--glass-bg-hover)] active:scale-[0.97]">
                      <ImagePlus className="h-5 w-5 text-violet-400" />
                      Вибрати з галереї
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={handlePhotoSelect}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* ── EXCEL MODE ──────────────────────────────────── */}
            {mode === 'excel' && (
              <div className="space-y-4">
                <h2 className="text-text-primary text-lg font-semibold">
                  Завантажте файл з клієнтами
                </h2>
                <p className="text-text-secondary text-sm">
                  Підтримуються формати .xlsx, .xls та .csv
                </p>

                {excelFile ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary truncate text-sm font-medium">{excelName}</p>
                      <p className="text-text-secondary text-xs">Файл завантажено</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setExcelFile(null);
                        setExcelName('');
                      }}
                      className="text-text-muted hover:text-red-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--glass-bg)] py-12 transition-colors hover:border-emerald-500/40"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-emerald-500/60');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-emerald-500/60');
                    }}
                    onDrop={(e) => {
                      e.currentTarget.classList.remove('border-emerald-500/60');
                      handleExcelDrop(e);
                    }}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                      <FileSpreadsheet className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-text-secondary text-sm">Перетягніть файл сюди або</p>
                    <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.97]">
                      <Upload className="h-4 w-4" />
                      Обрати файл
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="sr-only"
                        onChange={handleExcelSelect}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* ── TEXT MODE ────────────────────────────────────── */}
            {mode === 'manual' && (
              <div className="space-y-4">
                <h2 className="text-text-primary text-lg font-semibold">Вставте список клієнтів</h2>
                <p className="text-text-secondary text-sm">
                  Кожен клієнт з нового рядка. AI розпізнає імена, телефони та Instagram.
                </p>

                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`Олена Коваленко +380501234567\nНаталія Шевченко 0671234567\nАнна @anna_nails 0931234567`}
                  rows={10}
                  className="text-text-primary placeholder:text-text-muted w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] p-4 text-sm leading-relaxed transition-colors outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                />
              </div>
            )}

            {/* ── Bottom nav ──────────────────────────────────── */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep('choose');
                  // Clear data for the mode we're leaving
                  if (mode === 'photo') setPhotos([]);
                  if (mode === 'excel') {
                    setExcelFile(null);
                    setExcelName('');
                  }
                  if (mode === 'manual') setTextInput('');
                  setMode(null);
                }}
                className="text-text-secondary hover:text-text-primary flex items-center gap-1.5 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </button>

              <button
                type="button"
                onClick={analyzeClients}
                disabled={!canProceed}
                className={cn(
                  'inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-all',
                  canProceed
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40'
                    : 'cursor-not-allowed bg-gray-600 opacity-40'
                )}
              >
                <Sparkles className="h-4 w-4" />
                Аналізувати
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STEP 3: Review                                            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-20">
                <div className="relative">
                  <Sparkles className="h-12 w-12 animate-pulse text-violet-400" />
                  <div className="absolute inset-0 animate-ping opacity-20">
                    <Sparkles className="h-12 w-12 text-violet-400" />
                  </div>
                </div>
                <p className="text-text-primary mt-5 text-lg font-semibold">AI аналізує...</p>
                <p className="text-text-secondary mt-1 text-sm">
                  {mode === 'photo'
                    ? 'Розпізнаємо текст з фото'
                    : mode === 'excel'
                      ? 'Парсимо файл'
                      : 'Обробляємо текст'}
                </p>
              </div>
            ) : importError ? (
              <div className="flex flex-col items-center rounded-xl border border-red-500/20 bg-red-500/5 py-12">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <p className="text-text-primary mt-4 font-semibold">Помилка аналізу</p>
                <p className="text-text-secondary mt-1 max-w-sm text-center text-sm">
                  {importError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('upload');
                    setImportError(null);
                  }}
                  className="mt-5 text-sm font-medium text-violet-400 hover:underline"
                >
                  Спробувати ще раз
                </button>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-sm">
                  <span className="text-text-primary font-semibold">Знайдено: {summary.total}</span>
                  {summary.new > 0 && (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      {summary.new} нових
                    </span>
                  )}
                  {summary.duplicates > 0 && (
                    <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-400">
                      {summary.duplicates} дублікатів
                    </span>
                  )}
                  {summary.possible_duplicates > 0 && (
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                      {summary.possible_duplicates} можливих
                    </span>
                  )}
                  {summary.errors > 0 && (
                    <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                      {summary.errors} помилок
                    </span>
                  )}
                  <span className="text-text-muted ml-auto text-xs">Обрано: {selectedCount}</span>
                </div>

                {/* Select all / none */}
                <div className="mb-2 flex items-center gap-2 px-1">
                  <button
                    type="button"
                    onClick={() => toggleAll(true)}
                    className="text-xs text-violet-400 hover:underline"
                  >
                    Обрати всіх
                  </button>
                  <span className="text-text-muted text-xs">|</span>
                  <button
                    type="button"
                    onClick={() => toggleAll(false)}
                    className="text-xs text-violet-400 hover:underline"
                  >
                    Зняти всіх
                  </button>
                </div>

                {/* Client list — cards with duplicate details */}
                <div className="space-y-2">
                  {clients.map((c, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'rounded-xl border p-3 transition-opacity',
                        c.status === 'duplicate' && 'border-red-500/30 bg-red-500/5',
                        c.status === 'possible_duplicate' && 'border-amber-500/30 bg-amber-500/5',
                        c.status === 'new' && 'border-[var(--glass-border)] bg-[var(--glass-bg)]',
                        c.status === 'error' && 'border-red-500/20 bg-red-500/5',
                        !c.selected && c.status !== 'error' && 'opacity-50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={c.selected}
                          onChange={() => toggleClient(idx)}
                          disabled={c.status === 'error'}
                          className="mt-1 h-4 w-4 shrink-0 rounded accent-violet-500"
                        />
                        <div className="min-w-0 flex-1">
                          {editIdx === idx ? (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <input
                                value={c.name}
                                onChange={(e) => updateClientField(idx, 'name', e.target.value)}
                                placeholder="Ім'я"
                                className="text-text-primary col-span-2 rounded border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1.5 outline-none"
                              />
                              <input
                                value={c.phone}
                                onChange={(e) => updateClientField(idx, 'phone', e.target.value)}
                                placeholder="Телефон"
                                className="text-text-primary rounded border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1.5 outline-none"
                              />
                              <input
                                value={c.instagram ?? ''}
                                onChange={(e) =>
                                  updateClientField(idx, 'instagram', e.target.value)
                                }
                                placeholder="Instagram"
                                className="text-text-primary rounded border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1.5 outline-none"
                              />
                              <input
                                value={c.notes ?? ''}
                                onChange={(e) => updateClientField(idx, 'notes', e.target.value)}
                                placeholder="Нотатки"
                                className="text-text-primary col-span-2 rounded border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1.5 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setEditIdx(null)}
                                className="col-span-2 mt-1 text-xs text-violet-400 hover:underline"
                              >
                                Готово
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-text-primary truncate text-sm font-medium">
                                  {c.name || `${c.first_name} ${c.last_name}`.trim()}
                                </p>
                                <div className="text-text-secondary flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                                  {c.phone && <span>{c.phone}</span>}
                                  {c.instagram && (
                                    <span className="text-violet-400">{c.instagram}</span>
                                  )}
                                  {c.last_service && <span>{c.last_service}</span>}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditIdx(idx)}
                                className="text-text-muted shrink-0 hover:text-violet-400"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0">
                          {c.status === 'new' && (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              Новий
                            </span>
                          )}
                          {c.status === 'duplicate' && (
                            <span className="rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
                              Дублікат
                            </span>
                          )}
                          {c.status === 'possible_duplicate' && (
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                              Можливий
                            </span>
                          )}
                          {c.status === 'error' && (
                            <span className="rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
                              Помилка
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Duplicate details — shown below the main row */}
                      {(c.status === 'duplicate' || c.status === 'possible_duplicate') &&
                        c.duplicate_reason && (
                          <div
                            className={cn(
                              'mt-2 ml-7 rounded-lg border px-3 py-2 text-xs',
                              c.status === 'duplicate'
                                ? 'border-red-500/20 bg-red-500/5 text-red-300'
                                : 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                            )}
                          >
                            {c.matched_client && (
                              <p className="font-medium">
                                Збіг з: {c.matched_client.name}
                                {c.matched_client.phone && (
                                  <span className="text-text-muted ml-1">
                                    {c.matched_client.phone}
                                  </span>
                                )}
                              </p>
                            )}
                            <p className={cn('mt-0.5', c.matched_client ? 'text-text-muted' : '')}>
                              {c.duplicate_reason}
                            </p>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                {clients.length === 0 && (
                  <div className="flex flex-col items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-12">
                    <Users className="text-text-muted h-10 w-10" />
                    <p className="text-text-secondary mt-3 text-sm">Клієнтів не знайдено</p>
                    <button
                      type="button"
                      onClick={() => setStep('upload')}
                      className="mt-3 text-sm text-violet-400 hover:underline"
                    >
                      Спробувати ще раз
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('upload')}
                    className="text-text-secondary hover:text-text-primary flex items-center gap-1.5 text-sm font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Назад
                  </button>
                  <button
                    type="button"
                    onClick={confirmImport}
                    disabled={selectedCount === 0}
                    className={cn(
                      'inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-all',
                      selectedCount > 0
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40'
                        : 'cursor-not-allowed bg-gray-600 opacity-40'
                    )}
                  >
                    <Upload className="h-4 w-4" />
                    Імпортувати {selectedCount}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STEP 4: Result                                            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-14">
              {importing ? (
                <>
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-[var(--border)]"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="url(#importGrad)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="176"
                        strokeDashoffset="44"
                        className="animate-spin"
                        style={{ animationDuration: '1.5s' }}
                      />
                      <defs>
                        <linearGradient id="importGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <p className="text-text-primary mt-5 font-semibold">Імпортуємо...</p>
                </>
              ) : importError ? (
                <>
                  <AlertCircle className="h-14 w-14 text-red-400" />
                  <p className="text-text-primary mt-4 text-lg font-semibold">Помилка імпорту</p>
                  <p className="text-text-secondary mt-1 text-sm">{importError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('review');
                      setImportError(null);
                    }}
                    className="mt-5 text-sm font-medium text-violet-400 hover:underline"
                  >
                    Спробувати ще раз
                  </button>
                </>
              ) : importResult ? (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle className="h-10 w-10 text-emerald-400" />
                  </div>
                  <p className="text-text-primary mt-5 text-xl font-bold">
                    Імпортовано {importResult.imported}{' '}
                    {importResult.imported === 1
                      ? 'клієнта'
                      : importResult.imported < 5
                        ? 'клієнти'
                        : 'клієнтів'}
                    !
                  </p>
                  {importResult.skipped > 0 && (
                    <p className="text-text-secondary mt-1 text-sm">
                      Пропущено: {importResult.skipped}
                    </p>
                  )}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/dashboard/clients"
                      className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/20"
                    >
                      <Users className="h-4 w-4" />
                      Перейти до клієнтів
                    </Link>
                    <button
                      type="button"
                      onClick={resetAll}
                      className="text-text-secondary hover:text-text-primary inline-flex h-12 items-center gap-2 rounded-xl border border-[var(--border)] px-6 text-sm font-semibold transition-colors hover:bg-[var(--glass-bg-hover)]"
                    >
                      Імпортувати ще
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
