'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Clock,
  Scissors,
  Camera,
  Shield,
  CheckCircle,
  Calendar,
  Star,
  ExternalLink,
  X,
  Sparkles,
  Building,
  QrCode,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import type { PublicSalonFull, PublicServiceItem, PortfolioPhoto } from '@/lib/queries/public';
import type { WorkingHours } from '@/types/database';

/* ═══════════════════════════════════════════════════════════════════════════ */

const ACCENT: Record<
  string,
  { gradient: string; bg: string; text: string; shadow: string; border: string; glow: string }
> = {
  violet: {
    gradient: 'from-violet-500 to-fuchsia-500',
    bg: 'bg-violet-500',
    text: 'text-violet-400',
    shadow: 'shadow-violet-500/25',
    border: 'border-violet-500/40',
    glow: 'shadow-violet-500/30',
  },
  fuchsia: {
    gradient: 'from-fuchsia-500 to-pink-500',
    bg: 'bg-fuchsia-500',
    text: 'text-fuchsia-400',
    shadow: 'shadow-fuchsia-500/25',
    border: 'border-fuchsia-500/40',
    glow: 'shadow-fuchsia-500/30',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500',
    text: 'text-rose-400',
    shadow: 'shadow-rose-500/25',
    border: 'border-rose-500/40',
    glow: 'shadow-rose-500/30',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500',
    text: 'text-emerald-400',
    shadow: 'shadow-emerald-500/25',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/30',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    shadow: 'shadow-blue-500/25',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/30',
  },
  amber: {
    gradient: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-500',
    text: 'text-amber-400',
    shadow: 'shadow-amber-500/25',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/30',
  },
  orange: {
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500',
    text: 'text-orange-400',
    shadow: 'shadow-orange-500/25',
    border: 'border-orange-500/40',
    glow: 'shadow-orange-500/30',
  },
};
const DA = ACCENT.violet!;

const DAY_LABELS: Record<string, string> = {
  mon: 'Пн',
  tue: 'Вт',
  wed: 'Ср',
  thu: 'Чт',
  fri: 'Пт',
  sat: 'Сб',
  sun: 'Нд',
};
const DAY_NAMES: Record<string, string> = {
  mon: 'Понеділок',
  tue: 'Вівторок',
  wed: 'Середа',
  thu: 'Четвер',
  fri: "П'ятниця",
  sat: 'Субота',
  sun: 'Неділя',
};
const DAY_ORDER: (keyof WorkingHours)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface Props {
  salon: PublicSalonFull;
  services: PublicServiceItem[];
  portfolio: PortfolioPhoto[];
  lastCycle: { cycle_number: string; completed_at: string; result: string; id: string } | null;
  slug: string;
}

export function MasterSiteContent({ salon, services, portfolio, lastCycle, slug }: Props) {
  const a = ACCENT[salon.accent_color] ?? DA;
  const [lightbox, setLightbox] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('ms-vis');
            observerRef.current?.unobserve(e.target);
          }
        }),
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    document.querySelectorAll('[data-ms]').forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  // Deduplicate services by id
  const uniqueServices = useMemo(() => {
    const seen = new Set<string>();
    return services.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [services]);

  const categories = useMemo(() => {
    const map = new Map<string, PublicServiceItem[]>();
    for (const s of uniqueServices) {
      const c = s.category || 'Інше';
      map.set(c, [...(map.get(c) ?? []), s]);
    }
    return Array.from(map.entries());
  }, [uniqueServices]);

  const todayKey = DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div className="min-h-[100dvh] bg-[#08080d]">
      {/* Inline animation styles */}
      <style>{`
        [data-ms]{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s ease}
        [data-ms].ms-vis{opacity:1;transform:translateY(0)}
        @keyframes avatar-ring{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,.3)}50%{box-shadow:0 0 0 6px rgba(139,92,246,0)}}
      `}</style>

      {/* Background gradient mesh */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,.6) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, rgba(217,70,239,.5) 0%, transparent 70%)' }}
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 mx-auto max-w-[480px] pb-28">
        {/* ══════════ HERO ══════════ */}
        <div className="relative overflow-hidden">
          {/* Cover gradient */}
          <div className="h-44">
            {salon.cover_url ? (
              <img src={salon.cover_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${a.gradient} opacity-20`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-[#08080d]/60 to-transparent" />
          </div>

          {/* Profile */}
          <div className="relative -mt-16 px-5">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div
                className={`rounded-full bg-gradient-to-br p-[3px] ${a.gradient}`}
                style={{ animation: 'avatar-ring 3s ease-in-out infinite' }}
              >
                {salon.logo_url ? (
                  <img
                    src={salon.logo_url}
                    alt=""
                    className="h-20 w-20 rounded-full border-[3px] border-[#08080d] object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[#08080d] bg-[#12121a] text-white">
                    <Building className="h-8 w-8" />
                  </div>
                )}
              </div>

              <h1 className="mt-3 text-xl font-extrabold tracking-tight text-white">
                {salon.name}
              </h1>

              {(salon.city || salon.address) && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3" />
                  {salon.city ? `${salon.city}, ` : ''}
                  {salon.address}
                </p>
              )}

              {/* Rating */}
              <div className="mt-2 flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1.5 text-xs font-[var(--font-jetbrains)] font-bold text-white">
                  4.9
                </span>
              </div>

              {/* Social buttons */}
              <div className="mt-3 flex items-center gap-2">
                {salon.phone && (
                  <a
                    href={`tel:${salon.phone}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
                {salon.instagram && (
                  <a
                    href={
                      salon.instagram.startsWith('http')
                        ? salon.instagram
                        : `https://instagram.com/${salon.instagram.replace('@', '')}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* CTA */}
              <a
                href={`/book/${slug}`}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${a.gradient} py-3.5 text-sm font-bold text-white shadow-lg ${a.shadow} transition-all hover:brightness-110`}
              >
                <Calendar className="h-4 w-4" />
                Записатись онлайн
              </a>
            </div>
          </div>
        </div>

        {/* ══════════ DESCRIPTION ══════════ */}
        {salon.description && (
          <div data-ms className="px-5 pt-6">
            <p className="text-center text-sm leading-relaxed text-gray-400">{salon.description}</p>
          </div>
        )}

        <div className="space-y-6 px-5 pt-6">
          {/* ══════════ SERVICES ══════════ */}
          <section data-ms>
            <SectionTitle
              icon={<Scissors className={`h-4 w-4 ${a.text}`} />}
              title="Послуги і ціни"
            />

            {categories.map(([cat, svcs]) => (
              <div key={cat} className="mt-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                    {cat}
                  </span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>
                <div className="space-y-1.5">
                  {svcs.map((svc) => (
                    <div
                      key={svc.id}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <div
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: svc.color || '#8B5CF6' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-200">{svc.name}</p>
                        <p className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          {svc.duration} хв
                        </p>
                      </div>
                      <p className={`text-sm font-[var(--font-jetbrains)] font-bold ${a.text}`}>
                        {svc.price.toLocaleString('uk-UA')} ₴
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {uniqueServices.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-600">Послуги скоро будуть додані</p>
            )}
          </section>

          {/* ══════════ PORTFOLIO ══════════ */}
          <section data-ms>
            <SectionTitle icon={<Camera className={`h-4 w-4 ${a.text}`} />} title="Портфоліо" />

            {portfolio.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-1">
                {portfolio.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setLightbox(p.url)}
                    className="group relative aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={p.url}
                      alt={p.description || ''}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                      <Eye className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3 flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-12 text-center backdrop-blur-sm">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                  <ImageIcon className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-500">Портфоліо скоро</p>
              </div>
            )}
          </section>

          {/* ══════════ STERILIZATION ══════════ */}
          <section data-ms>
            <SectionTitle
              icon={<Shield className="h-4 w-4 text-emerald-400" />}
              title="Стерилізація"
            />

            <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] backdrop-blur-sm">
              <div className="flex items-center gap-2.5 border-b border-emerald-500/10 px-4 py-3">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">
                  Дотримуємось стандартів МОЗ
                </span>
              </div>

              <div className="px-4 py-3">
                {lastCycle ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Останній цикл</span>
                      <span className="text-xs font-[var(--font-jetbrains)] font-medium text-gray-200">
                        {lastCycle.cycle_number}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Дата</span>
                      <span className="text-gray-300">{fmtDate(lastCycle.completed_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Результат</span>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        Успішно
                      </span>
                    </div>
                    <a
                      href={`/verify/${lastCycle.id}`}
                      className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 py-2.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/10"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Перевірити сертифікат
                    </a>
                  </div>
                ) : (
                  <p className="py-2 text-sm text-gray-500">Інформація скоро буде доступна</p>
                )}
              </div>
            </div>
          </section>

          {/* ══════════ SCHEDULE ══════════ */}
          {salon.working_hours && (
            <section data-ms>
              <SectionTitle
                icon={<Clock className={`h-4 w-4 ${a.text}`} />}
                title="Графік роботи"
              />

              <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
                {DAY_ORDER.map((key) => {
                  const day = (salon.working_hours as WorkingHours)?.[key];
                  const isToday = key === todayKey;
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm ${isToday ? 'bg-white/[0.04]' : ''} ${key !== 'sun' ? 'border-b border-white/[0.04]' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {isToday && <div className={`h-1.5 w-1.5 rounded-full ${a.bg}`} />}
                        <span className={isToday ? 'font-semibold text-white' : 'text-gray-400'}>
                          {DAY_NAMES[key]}
                        </span>
                        <span className="text-[10px] text-gray-600 uppercase">
                          {DAY_LABELS[key]}
                        </span>
                      </div>
                      {day ? (
                        <span
                          className={`text-xs font-[var(--font-jetbrains)] ${isToday ? 'font-bold text-white' : 'font-medium text-gray-300'}`}
                        >
                          {day.start} — {day.end}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">Вихідний</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ══════════ CONTACTS ══════════ */}
          <section data-ms>
            <SectionTitle icon={<Phone className={`h-4 w-4 ${a.text}`} />} title="Контакти" />

            <div className="mt-3 flex flex-wrap gap-2">
              {salon.phone && (
                <a
                  href={`tel:${salon.phone}`}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-gray-200 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/[0.05]"
                >
                  <Phone className="h-4 w-4 text-gray-500" />
                  {salon.phone}
                </a>
              )}
              {salon.instagram && (
                <a
                  href={
                    salon.instagram.startsWith('http')
                      ? salon.instagram
                      : `https://instagram.com/${salon.instagram.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-gray-200 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/[0.05]"
                >
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  {salon.instagram.startsWith('@') ? salon.instagram : `@${salon.instagram}`}
                </a>
              )}
              {salon.address && (
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-gray-200 backdrop-blur-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
                  {salon.city ? `${salon.city}, ` : ''}
                  {salon.address}
                </div>
              )}
            </div>
          </section>

          {/* ══════════ FOOTER ══════════ */}
          <div className="pt-6 pb-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 transition-colors hover:text-gray-400"
            >
              <Sparkles className="h-3 w-3" />
              Створено в Shine Beauty CRM
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 sm:hidden">
        <div className="mx-auto max-w-[480px] border-t border-white/[0.06] bg-[#08080d]/90 px-5 py-3 backdrop-blur-xl">
          <a
            href={`/book/${slug}`}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${a.gradient} py-3.5 text-sm font-bold text-white shadow-lg ${a.shadow}`}
          >
            <Calendar className="h-4 w-4" />
            Записатись онлайн
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Shared ─────────────────────────────────────────────────────────────── */

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-sm font-bold tracking-tight text-white">{title}</h2>
    </div>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
