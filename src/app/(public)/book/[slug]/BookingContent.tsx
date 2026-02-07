'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Scissors,
  User,
  Calendar,
  Phone,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Loader2,
  Download,
  Sparkles,
  Shuffle,
  Building,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import type { PublicSalon, PublicService, PublicStaff } from '@/lib/queries/booking';

/* ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  salon: PublicSalon;
  services: PublicService[];
  staff: PublicStaff[];
}

interface BookingState {
  step: number;
  selectedServiceIds: string[];
  selectedStaffId: string;
  selectedDate: string;
  selectedTime: string;
  clientName: string;
  clientPhone: string;
  clientNotes: string;
}

const STEPS = [
  { label: 'Послуга', icon: Scissors },
  { label: 'Майстер', icon: User },
  { label: 'Дата і час', icon: Calendar },
  { label: 'Контакти', icon: Phone },
  { label: 'Готово', icon: Check },
];

const ACCENT: Record<
  string,
  { gradient: string; bg: string; text: string; ring: string; shadow: string; border: string }
> = {
  violet: {
    gradient: 'from-violet-500 to-fuchsia-500',
    bg: 'bg-violet-500',
    text: 'text-violet-400',
    ring: 'ring-violet-500',
    shadow: 'shadow-violet-500/25',
    border: 'border-violet-500/40',
  },
  fuchsia: {
    gradient: 'from-fuchsia-500 to-pink-500',
    bg: 'bg-fuchsia-500',
    text: 'text-fuchsia-400',
    ring: 'ring-fuchsia-500',
    shadow: 'shadow-fuchsia-500/25',
    border: 'border-fuchsia-500/40',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500',
    text: 'text-rose-400',
    ring: 'ring-rose-500',
    shadow: 'shadow-rose-500/25',
    border: 'border-rose-500/40',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500',
    shadow: 'shadow-emerald-500/25',
    border: 'border-emerald-500/40',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    ring: 'ring-blue-500',
    shadow: 'shadow-blue-500/25',
    border: 'border-blue-500/40',
  },
  amber: {
    gradient: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-500',
    text: 'text-amber-400',
    ring: 'ring-amber-500',
    shadow: 'shadow-amber-500/25',
    border: 'border-amber-500/40',
  },
  orange: {
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500',
    text: 'text-orange-400',
    ring: 'ring-orange-500',
    shadow: 'shadow-orange-500/25',
    border: 'border-orange-500/40',
  },
};
const DA = ACCENT.violet!;

/* ═══════════════════════════════════════════════════════════════════════════ */

export function BookingContent({ salon, services, staff }: Props) {
  const ac = ACCENT[salon.accent_color] ?? DA;

  const [state, setState] = useState<BookingState>({
    step: 0,
    selectedServiceIds: [],
    selectedStaffId: '',
    selectedDate: '',
    selectedTime: '',
    clientName: '',
    clientPhone: '',
    clientNotes: '',
  });
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    id: string;
    start_time: string;
    end_time: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  const up = useCallback(
    (patch: Partial<BookingState>) => setState((p) => ({ ...p, ...patch })),
    []
  );

  // Deduplicate services
  const uniqueServices = useMemo(() => {
    const seen = new Set<string>();
    return services.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [services]);

  const selectedServices = useMemo(
    () => uniqueServices.filter((s) => state.selectedServiceIds.includes(s.id)),
    [uniqueServices, state.selectedServiceIds]
  );
  const totalDuration = selectedServices.reduce((a, s) => a + s.duration, 0);
  const totalPrice = selectedServices.reduce((a, s) => a + s.price, 0);
  const selectedStaff = staff.find((s) => s.id === state.selectedStaffId);

  const categories = useMemo(() => {
    const map = new Map<string, PublicService[]>();
    for (const s of uniqueServices) {
      const c = s.category || 'Інше';
      map.set(c, [...(map.get(c) ?? []), s]);
    }
    return Array.from(map.entries());
  }, [uniqueServices]);

  // Dates
  const dates = useMemo(() => {
    const max = salon.booking_advance_days || 30;
    const dk = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const wh = salon.working_hours;
    const r: {
      date: string;
      wd: string;
      day: number;
      month: string;
      disabled: boolean;
      isToday: boolean;
    }[] = [];
    for (let i = 0; i < max; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0]!;
      const dh = wh ? (wh as Record<string, unknown>)[dk[d.getDay()]!] : true;
      r.push({
        date: iso,
        wd: d.toLocaleDateString('uk-UA', { weekday: 'short' }),
        day: d.getDate(),
        month: d.toLocaleDateString('uk-UA', { month: 'short' }),
        disabled: !dh,
        isToday: i === 0,
      });
    }
    return r;
  }, [salon.booking_advance_days, salon.working_hours]);

  // Slot sections
  const slotSections = useMemo(() => {
    const morning: string[] = [],
      afternoon: string[] = [],
      evening: string[] = [];
    for (const t of slots) {
      const h = parseInt(t.split(':')[0]!);
      if (h < 12) morning.push(t);
      else if (h < 17) afternoon.push(t);
      else evening.push(t);
    }
    return [
      { label: 'Ранок', icon: Sun, slots: morning },
      { label: 'День', icon: Sunset, slots: afternoon },
      { label: 'Вечір', icon: Moon, slots: evening },
    ].filter((s) => s.slots.length > 0);
  }, [slots]);

  const fetchSlots = useCallback(
    async (date: string) => {
      setLoadingSlots(true);
      setSlots([]);
      try {
        const p = new URLSearchParams({
          salon_id: salon.id,
          staff_id: state.selectedStaffId || '',
          date,
          duration: String(totalDuration),
        });
        const res = await fetch(`/api/bookings/slots?${p}`);
        const j = await res.json();
        setSlots(j.slots ?? []);
      } catch {
        setSlots([]);
      }
      setLoadingSlots(false);
    },
    [salon.id, state.selectedStaffId, totalDuration]
  );

  const handleDateSelect = (date: string) => {
    up({ selectedDate: date, selectedTime: '' });
    fetchSlots(date);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salon_id: salon.id,
          service_ids: state.selectedServiceIds,
          staff_id: state.selectedStaffId || staff[0]?.id,
          date: state.selectedDate,
          time: state.selectedTime,
          total_duration: totalDuration,
          total_price: totalPrice,
          client_name: state.clientName,
          client_phone: state.clientPhone,
          client_notes: state.clientNotes,
        }),
      });
      const j = await res.json();
      if (!res.ok) setError(j.error ?? 'Помилка');
      else {
        setBookingResult(j.booking);
        up({ step: 5 });
      }
    } catch {
      setError('Помилка мережі');
    }
    setSubmitting(false);
  };

  const canNext = (): boolean => {
    switch (state.step) {
      case 0:
        return state.selectedServiceIds.length > 0;
      case 1:
        return true;
      case 2:
        return !!state.selectedDate && !!state.selectedTime;
      case 3:
        return state.clientName.length > 0 && state.clientPhone.length >= 10;
      default:
        return false;
    }
  };

  const goNext = () => {
    setDirection('left');
    up({ step: state.step + 1 });
  };
  const goBack = () => {
    setDirection('right');
    up({ step: state.step - 1 });
  };

  // ── SUCCESS ──
  if (state.step === 5 && bookingResult) {
    return (
      <Shell salon={salon} ac={ac}>
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
          <style>{`@keyframes success-pop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>
          <div
            className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${ac.gradient} text-white`}
            style={{ animation: 'success-pop .5s ease' }}
          >
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Дякуємо!</h2>
          <p className="mt-1 text-sm text-gray-400">Ваш запис підтверджено</p>

          <div className="mt-6 w-full space-y-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-left backdrop-blur-sm">
            <Row
              icon={<Scissors className="h-4 w-4" />}
              label="Послуга"
              value={selectedServices.map((s) => s.name).join(', ')}
            />
            <Row
              icon={<User className="h-4 w-4" />}
              label="Майстер"
              value={
                selectedStaff
                  ? `${selectedStaff.first_name} ${selectedStaff.last_name}`
                  : 'Будь-який'
              }
            />
            <Row
              icon={<Calendar className="h-4 w-4" />}
              label="Дата"
              value={fmtDateLong(state.selectedDate)}
            />
            <Row icon={<Clock className="h-4 w-4" />} label="Час" value={state.selectedTime} />
            <div className="border-t border-white/[0.06] pt-2">
              <Row
                icon={<Sparkles className="h-4 w-4" />}
                label="Вартість"
                value={`${fmt(totalPrice)} ₴`}
                bold
              />
            </div>
          </div>

          <a
            href={generateIcsUrl(
              selectedServices.map((s) => s.name).join(', '),
              salon.name,
              state.selectedDate,
              state.selectedTime,
              totalDuration
            )}
            download="booking.ics"
            className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
            Додати в календар
          </a>
        </div>
      </Shell>
    );
  }

  return (
    <Shell salon={salon} ac={ac}>
      {/* ── Progress ── */}
      <div className="px-5 pt-4">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < state.step;
            const cur = i === state.step;
            return (
              <div key={i} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all duration-300 ${
                      done
                        ? `bg-gradient-to-br ${ac.gradient} text-white shadow-lg ${ac.shadow}`
                        : cur
                          ? `border-2 ${ac.border} ${ac.text} bg-white/5`
                          : 'border border-white/10 bg-white/[0.02] text-gray-600'
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <span
                    className={`text-[9px] font-semibold ${cur ? ac.text : done ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-1 mb-4 h-px flex-1">
                    <div
                      className={`h-full transition-all duration-500 ${i < state.step ? `bg-gradient-to-r ${ac.gradient}` : 'bg-white/[0.06]'}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <style>{`
          @keyframes slide-in-left{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
          @keyframes slide-in-right{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
          .step-slide{animation:${direction === 'left' ? 'slide-in-left' : 'slide-in-right'} .3s ease}
        `}</style>

        {/* STEP 0: Services */}
        {state.step === 0 && (
          <div key="step0" className="step-slide space-y-4">
            <h2 className="text-lg font-extrabold text-white">Оберіть послугу</h2>

            {categories.map(([cat, svcs]) => (
              <div key={cat}>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                    {cat}
                  </span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>
                <div className="space-y-1.5">
                  {svcs.map((svc) => {
                    const sel = state.selectedServiceIds.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        onClick={() => {
                          const ids = sel
                            ? state.selectedServiceIds.filter((id) => id !== svc.id)
                            : [...state.selectedServiceIds, svc.id];
                          up({ selectedServiceIds: ids });
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                          sel
                            ? `${ac.border} bg-white/[0.05] shadow-lg ${ac.shadow}`
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
                        }`}
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: svc.color || '#8B5CF6' }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-200">{svc.name}</p>
                          <p className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Clock className="h-3 w-3" />
                            {svc.duration} хв
                          </p>
                        </div>
                        <p
                          className={`text-sm font-[var(--font-jetbrains)] font-bold ${sel ? ac.text : 'text-white'}`}
                        >
                          {fmt(svc.price)} ₴
                        </p>
                        {sel && (
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${ac.gradient} text-white`}
                          >
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {state.selectedServiceIds.length > 0 && (
              <div
                className={`rounded-xl border ${ac.border} bg-white/[0.03] p-3 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{selectedServices.length} послуг</span>
                  <span className={`font-[var(--font-jetbrains)] font-bold ${ac.text}`}>
                    {fmt(totalPrice)} ₴ / {totalDuration} хв
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Staff */}
        {state.step === 1 && (
          <div key="step1" className="step-slide space-y-3">
            <h2 className="text-lg font-extrabold text-white">Оберіть майстра</h2>

            <button
              onClick={() => up({ selectedStaffId: '' })}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${state.selectedStaffId === '' ? `${ac.border} bg-white/[0.05] shadow-lg ${ac.shadow}` : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${ac.gradient} text-white`}
              >
                <Shuffle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-200">Будь-який вільний</p>
                <p className="text-[11px] text-gray-500">Перший вільний майстер</p>
              </div>
              {state.selectedStaffId === '' && (
                <div
                  className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${ac.gradient} text-white`}
                >
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>

            {staff.map((s) => {
              const sel = state.selectedStaffId === s.id;
              const initials = `${(s.first_name?.[0] ?? '').toUpperCase()}${(s.last_name?.[0] ?? '').toUpperCase()}`;
              return (
                <button
                  key={s.id}
                  onClick={() => up({ selectedStaffId: s.id })}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${sel ? `${ac.border} bg-white/[0.05] shadow-lg ${ac.shadow}` : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'}`}
                >
                  {s.avatar_url ? (
                    <img
                      src={s.avatar_url}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-gray-400">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-200">
                      {s.first_name} {s.last_name}
                    </p>
                    {s.specialization && (
                      <p className="text-[11px] text-gray-500">{s.specialization}</p>
                    )}
                  </div>
                  {sel && (
                    <div
                      className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${ac.gradient} text-white`}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 2: Date & Time */}
        {state.step === 2 && (
          <div key="step2" className="step-slide space-y-4">
            <h2 className="text-lg font-extrabold text-white">Оберіть дату і час</h2>

            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
              {dates.map((d) => (
                <button
                  key={d.date}
                  disabled={d.disabled}
                  onClick={() => handleDateSelect(d.date)}
                  className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition-all ${
                    d.disabled
                      ? 'cursor-not-allowed border-white/[0.03] opacity-25'
                      : state.selectedDate === d.date
                        ? `${ac.border} bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-lg ${ac.shadow}`
                        : d.isToday
                          ? 'border-white/10 bg-white/[0.04]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  <span className="text-[10px] font-medium text-gray-500">{d.wd}</span>
                  <span
                    className={`text-lg font-[var(--font-jetbrains)] font-bold ${state.selectedDate === d.date ? 'text-white' : 'text-gray-300'}`}
                  >
                    {d.day}
                  </span>
                  <span className="text-[10px] text-gray-500">{d.month}</span>
                </button>
              ))}
            </div>

            {state.selectedDate && (
              <div>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className={`h-6 w-6 animate-spin ${ac.text}`} />
                  </div>
                ) : slotSections.length > 0 ? (
                  <div className="space-y-3">
                    {slotSections.map((sec) => {
                      const Icon = sec.icon;
                      return (
                        <div key={sec.label}>
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Icon className="h-3 w-3 text-gray-500" />
                            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                              {sec.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {sec.slots.map((time) => (
                              <button
                                key={time}
                                onClick={() => up({ selectedTime: time })}
                                className={`rounded-xl border py-2.5 text-center text-sm font-[var(--font-jetbrains)] font-bold transition-all ${
                                  state.selectedTime === time
                                    ? `bg-gradient-to-r ${ac.gradient} border-transparent text-white shadow-lg ${ac.shadow}`
                                    : 'border-white/[0.06] bg-white/[0.02] text-gray-300 hover:border-white/10'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-gray-500">
                    Немає вільних слотів на цю дату
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Contact */}
        {state.step === 3 && (
          <div key="step3" className="step-slide space-y-4">
            <h2 className="text-lg font-extrabold text-white">Ваші контакти</h2>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <User className="h-3 w-3" />
                Ім&apos;я *
              </label>
              <input
                type="text"
                value={state.clientName}
                onChange={(e) => up({ clientName: e.target.value })}
                placeholder="Ваше ім'я"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-gray-600 backdrop-blur-sm transition-colors outline-none focus:border-white/20"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <Phone className="h-3 w-3" />
                Телефон *
              </label>
              <input
                type="tel"
                value={state.clientPhone}
                onChange={(e) => up({ clientPhone: e.target.value })}
                placeholder="+380..."
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-gray-600 backdrop-blur-sm transition-colors outline-none focus:border-white/20"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-gray-400">Коментар</label>
              <textarea
                value={state.clientNotes}
                onChange={(e) => up({ clientNotes: e.target.value })}
                placeholder="Побажання..."
                rows={3}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 backdrop-blur-sm transition-colors outline-none focus:border-white/20"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Confirmation */}
        {state.step === 4 && (
          <div key="step4" className="step-slide space-y-4">
            <h2 className="text-lg font-extrabold text-white">Підтвердження</h2>

            <div className="space-y-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm">
              <Row
                icon={<Scissors className="h-4 w-4" />}
                label="Послуга"
                value={selectedServices.map((s) => s.name).join(', ')}
              />
              <Row
                icon={<User className="h-4 w-4" />}
                label="Майстер"
                value={
                  selectedStaff
                    ? `${selectedStaff.first_name} ${selectedStaff.last_name}`
                    : 'Будь-який вільний'
                }
              />
              <Row
                icon={<Calendar className="h-4 w-4" />}
                label="Дата"
                value={fmtDateLong(state.selectedDate)}
              />
              <Row
                icon={<Clock className="h-4 w-4" />}
                label="Час"
                value={`${state.selectedTime} (${totalDuration} хв)`}
              />
              <Row
                icon={<Phone className="h-4 w-4" />}
                label="Клієнт"
                value={`${state.clientName}, ${state.clientPhone}`}
              />
              <div className="border-t border-white/[0.06] pt-2">
                <Row
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Вартість"
                  value={`${fmt(totalPrice)} ₴`}
                  bold
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${ac.gradient} py-4 text-base font-bold text-white shadow-xl ${ac.shadow} transition-all disabled:opacity-50`}
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              {submitting ? 'Записуємо...' : 'Записатись'}
            </button>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      {state.step < 4 && (
        <div className="border-t border-white/[0.06] bg-[#08080d]/90 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {state.step > 0 && (
              <button
                onClick={goBack}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!canNext()}
              className={`flex flex-1 items-center justify-center gap-1 rounded-2xl bg-gradient-to-r ${ac.gradient} py-3 text-sm font-bold text-white shadow-lg ${ac.shadow} transition-all disabled:opacity-30`}
            >
              Далі
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {state.step === 4 && (
        <div className="border-t border-white/[0.06] bg-[#08080d]/90 px-5 py-3 backdrop-blur-xl">
          <button
            onClick={goBack}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </button>
        </div>
      )}
    </Shell>
  );
}

/* ─── Shell ──────────────────────────────────────────────────────────────── */

function Shell({
  salon,
  ac,
  children,
}: {
  salon: PublicSalon;
  ac: (typeof ACCENT)[string];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#08080d]">
      {/* BG mesh */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,.6) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, rgba(217,70,239,.5) 0%, transparent 70%)' }}
        />
      </div>

      <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[480px] flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#08080d]/80 px-5 py-3 backdrop-blur-xl">
          {salon.logo_url ? (
            <img src={salon.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${ac?.gradient} text-white`}
            >
              <Building className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{salon.name}</p>
            {salon.address && (
              <p className="flex items-center gap-1 truncate text-[11px] text-gray-500">
                <MapPin className="h-3 w-3 shrink-0" />
                {salon.city ? `${salon.city}, ` : ''}
                {salon.address}
              </p>
            )}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}

/* ─── Shared ─────────────────────────────────────────────────────────────── */

function Row({
  icon,
  label,
  value,
  bold,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 shrink-0 text-gray-500">{icon}</span>
      <span className="w-20 shrink-0 text-gray-500">{label}</span>
      <span
        className={`${bold ? `font-[var(--font-jetbrains)] font-bold` : 'font-medium'} text-gray-200`}
      >
        {value}
      </span>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString('uk-UA');
}
function fmtDateLong(iso: string): string {
  if (!iso) return '';
  return new Date(iso + 'T12:00:00').toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function generateIcsUrl(
  service: string,
  salonName: string,
  date: string,
  time: string,
  durationMin: number
): string {
  const start = date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';
  const endDate = new Date(`${date}T${time}:00`);
  endDate.setMinutes(endDate.getMinutes() + durationMin);
  const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0];
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${service} — ${salonName}`,
    `DESCRIPTION:Онлайн-запис у ${salonName}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
}
