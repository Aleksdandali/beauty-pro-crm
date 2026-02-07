'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Droplets,
  Microscope,
  Wind,
  Thermometer,
  Package,
  Lock,
  Building,
  User,
  Cpu,
  Camera,
  X,
  Sparkles,
} from 'lucide-react';
import type { VerifyCycle } from '@/lib/queries/public';

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  cycle: VerifyCycle;
}

export function VerifyContent({ cycle }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const success = cycle.result === 'success';
  const isLocked = cycle.is_locked;

  // Collect all photos
  const photos: { url: string; label: string }[] = [];
  if (cycle.photos_before?.length) {
    cycle.photos_before.forEach((u) => photos.push({ url: u, label: 'Фото до' }));
  }
  if (cycle.azopyramine_photo_url) {
    photos.push({ url: cycle.azopyramine_photo_url, label: 'Азопірамова проба' });
  }
  if (cycle.chemical_indicator_photo_url) {
    photos.push({ url: cycle.chemical_indicator_photo_url, label: 'Хімічний індикатор' });
  }
  if (cycle.packaging_photo) {
    photos.push({ url: cycle.packaging_photo, label: 'Пакування' });
  }
  if (cycle.photos_after?.length) {
    cycle.photos_after.forEach((u) => photos.push({ url: u, label: 'Фото після' }));
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] text-white">
      {/* ── Header ── */}
      <header className="border-b border-white/[0.06] px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Сертифікат стерилізації</h1>
            <p className="text-xs text-gray-500">{cycle.cycle_number}</p>
          </div>
          {isLocked && success && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              Верифіковано
            </div>
          )}
          {isLocked && !success && (
            <div className="flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-400">
              <XCircle className="h-3.5 w-3.5" />
              Не пройшов
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {/* ── Main Info Card ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="space-y-3">
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Номер"
              value={cycle.cycle_number}
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Дата"
              value={fmtDate(cycle.completed_at || cycle.created_at)}
            />
            <InfoRow
              icon={<Building className="h-4 w-4" />}
              label="Салон"
              value={cycle.salon_name}
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Оператор"
              value={cycle.operator_name}
            />
            <InfoRow
              icon={<Cpu className="h-4 w-4" />}
              label="Обладнання"
              value={
                cycle.equipment_name +
                (cycle.equipment_serial ? ` (${cycle.equipment_serial})` : '')
              }
            />
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="mb-3 text-xs font-semibold text-gray-500 uppercase">Етапи</p>
          <div className="space-y-3">
            {/* Disinfection */}
            <TimelineStep
              icon={<Droplets className="h-4 w-4" />}
              label="Дезінфекція"
              start={cycle.disinfection_started_at}
              end={cycle.disinfection_completed_at}
              details={
                cycle.disinfection_solution
                  ? `${cycle.disinfection_solution}${cycle.disinfection_concentration ? `, ${cycle.disinfection_concentration}` : ''}`
                  : undefined
              }
            />

            {/* PSO */}
            <TimelineStep
              icon={<Microscope className="h-4 w-4" />}
              label="ПСО"
              start={cycle.pso_started_at}
              end={cycle.pso_completed_at}
              details={cycle.pso_method ?? undefined}
            />

            {/* Drying */}
            <TimelineStep
              icon={<Wind className="h-4 w-4" />}
              label="Сушка"
              start={cycle.drying_started_at}
              end={cycle.drying_completed_at}
              details={cycle.drying_method ?? undefined}
            />

            {/* Sterilization */}
            <TimelineStep
              icon={<Thermometer className="h-4 w-4" />}
              label="Стерилізація"
              start={cycle.sterilization_started_at}
              end={cycle.sterilization_completed_at}
              details={
                cycle.sterilization_mode ||
                (cycle.sterilization_temperature
                  ? `${cycle.sterilization_temperature}°C${cycle.sterilization_pressure ? ` / ${cycle.sterilization_pressure} атм` : ''} / ${cycle.sterilization_time_minutes ?? '?'} хв`
                  : undefined)
              }
            />

            {/* Packaging */}
            <TimelineStep
              icon={<Package className="h-4 w-4" />}
              label="Пакування"
              start={cycle.completed_at}
              details={cycle.packaging_type ?? undefined}
            />

            {/* Locked */}
            {isLocked && (
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <span className="text-gray-300">Завершено та заблоковано</span>
                <span className="ml-auto font-mono text-[10px] text-gray-500">
                  {fmtTime(cycle.completed_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Tests ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="mb-3 text-xs font-semibold text-gray-500 uppercase">Тести</p>
          <div className="space-y-3">
            <TestRow
              label="Азопірамова проба"
              result={cycle.azopyramine_test}
              goodValue="negative"
              goodLabel="Негативна"
              badLabel="Позитивна"
            />
            <TestRow
              label="Хімічний індикатор"
              result={cycle.chemical_indicator}
              goodValue="passed"
              goodLabel="Норма"
              badLabel="Не в нормі"
            />
          </div>
        </div>

        {/* ── Photos ── */}
        {photos.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4 text-gray-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase">Фото</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(p.url)}
                  className="group relative aspect-square overflow-hidden rounded-xl"
                >
                  <img
                    src={p.url}
                    alt={p.label}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 px-2 py-1 text-[10px] text-white">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="pt-4 pb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-300"
          >
            <Sparkles className="h-3 w-3" />
            Powered by Shine Beauty CRM
          </Link>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 shrink-0 text-gray-500">{icon}</span>
      <span className="w-24 shrink-0 text-gray-500">{label}</span>
      <span className="font-medium text-gray-200">{value}</span>
    </div>
  );
}

function TimelineStep({
  icon,
  label,
  start,
  end,
  details,
}: {
  icon: React.ReactNode;
  label: string;
  start?: string | null;
  end?: string | null;
  details?: string;
}) {
  const done = !!start;
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          done ? 'bg-violet-500/15 text-violet-400' : 'bg-white/5 text-gray-600'
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={done ? 'font-medium text-gray-200' : 'text-gray-600'}>{label}</span>
          {start && (
            <span className="ml-auto font-mono text-[10px] text-gray-500">
              {fmtTime(start)}
              {end && end !== start ? `\u2013${fmtTime(end)}` : ''}
            </span>
          )}
        </div>
        {details && <p className="mt-0.5 text-xs text-gray-500">{details}</p>}
      </div>
    </div>
  );
}

function TestRow({
  label,
  result,
  goodValue,
  goodLabel,
  badLabel,
}: {
  label: string;
  result: string | null;
  goodValue: string;
  goodLabel: string;
  badLabel: string;
}) {
  if (!result) return null;
  const passed = result === goodValue;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
          passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
        }`}
      >
        {passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {passed ? goodLabel : badLabel}
      </span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}
