'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  Palette,
  Clock,
  Users,
  Calendar,
  Plug,
  CreditCard,
  Save,
  Upload,
  Check,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
  Shield,
  Zap,
  Crown,
  Database,
  AlertTriangle,
  Sparkles,
  Download,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassBadge } from '@/components/glass';
import { useSalonId } from '@/components/providers/AuthProvider';
import { FadeIn } from '@/components/animations';
import { SupplierList } from '@/components/suppliers/SupplierList';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  salon: Record<string, unknown> | null;
  staff: Array<Record<string, unknown>>;
  clientCount: number;
}

type SettingsTab =
  | 'profile'
  | 'branding'
  | 'schedule'
  | 'team'
  | 'booking'
  | 'integrations'
  | 'suppliers'
  | 'plan'
  | 'data';

const TABS: { key: SettingsTab; label: string; icon: typeof Building }[] = [
  { key: 'profile', label: 'Профіль салону', icon: Building },
  { key: 'branding', label: 'Брендинг', icon: Palette },
  { key: 'schedule', label: 'Графік роботи', icon: Clock },
  { key: 'team', label: 'Команда', icon: Users },
  { key: 'booking', label: 'Онлайн-запис', icon: Calendar },
  { key: 'integrations', label: 'Інтеграції', icon: Plug },
  { key: 'suppliers', label: 'Постачальники', icon: Truck },
  { key: 'plan', label: 'Тариф', icon: CreditCard },
  { key: 'data', label: 'Дані', icon: Database },
];

const ACCENT_COLORS = [
  { value: 'violet', label: 'Violet', bg: 'bg-violet-500', ring: 'ring-violet-500' },
  { value: 'fuchsia', label: 'Fuchsia', bg: 'bg-fuchsia-500', ring: 'ring-fuchsia-500' },
  { value: 'rose', label: 'Rose', bg: 'bg-rose-500', ring: 'ring-rose-500' },
  { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-500', ring: 'ring-blue-500' },
  { value: 'amber', label: 'Amber', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-500', ring: 'ring-orange-500' },
];

const DAYS = [
  { key: 'mon', label: 'Понеділок' },
  { key: 'tue', label: 'Вівторок' },
  { key: 'wed', label: 'Середа' },
  { key: 'thu', label: 'Четвер' },
  { key: 'fri', label: "П'ятниця" },
  { key: 'sat', label: 'Субота' },
  { key: 'sun', label: 'Неділя' },
] as const;

const ADVANCE_OPTIONS = [
  { value: 1, label: '1 година' },
  { value: 2, label: '2 години' },
  { value: 4, label: '4 години' },
  { value: 24, label: '24 години' },
];

const MAX_ADVANCE_OPTIONS = [
  { value: 7, label: '7 днів' },
  { value: 14, label: '14 днів' },
  { value: 30, label: '30 днів' },
  { value: 60, label: '60 днів' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSupabaseClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

function inputClass(extra = '') {
  return cn(
    'text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm',
    extra
  );
}

// ─── Toast (inline mini-toast) ──────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2500);
  }, []);
  return { msg, show };
}

function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="fixed right-4 bottom-20 z-50 flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 lg:bottom-6">
      <Check className="h-4 w-4" />
      {msg}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsContent({ salon, staff, clientCount }: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const toast = useToast();

  return (
    <FadeIn className="space-y-6">
      <Toast msg={toast.msg} />

      {/* Header */}
      <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
        Налаштування
      </h1>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar (desktop) */}
        <nav className="hidden space-y-1 lg:block">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all',
                  isActive
                    ? 'text-foreground border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg-hover)]'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-violet-500' : '')} />
                {tab.label}
                {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-violet-500" />}
              </button>
            );
          })}
        </nav>

        {/* Mobile tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1 lg:hidden">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-w-0">
          {activeTab === 'profile' && <ProfileTab salon={salon} toast={toast} />}
          {activeTab === 'branding' && <BrandingTab salon={salon} toast={toast} />}
          {activeTab === 'schedule' && <ScheduleTab salon={salon} toast={toast} />}
          {activeTab === 'team' && <TeamTab staff={staff} toast={toast} />}
          {activeTab === 'booking' && <BookingTab salon={salon} toast={toast} />}
          {activeTab === 'integrations' && <IntegrationsTab salon={salon} toast={toast} />}
          {activeTab === 'suppliers' && <SupplierList />}
          {activeTab === 'plan' && (
            <PlanTab salon={salon} staffCount={staff.length} clientCount={clientCount} />
          )}
          {activeTab === 'data' && <DataTab toast={toast} />}
        </div>
      </div>
    </FadeIn>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: Profile
// ═══════════════════════════════════════════════════════════════════════════════

function ProfileTab({
  salon,
  toast,
}: {
  salon: Record<string, unknown> | null;
  toast: { show: (msg: string) => void };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: (salon?.name as string) ?? '',
    description: (salon?.description as string) ?? '',
    city: (salon?.city as string) ?? '',
    address: (salon?.address as string) ?? '',
    phone: (salon?.phone as string) ?? '',
    email: (salon?.email as string) ?? '',
    slug: (salon?.slug as string) ?? '',
  });

  const slugError = form.slug && !/^[a-z0-9-]*$/.test(form.slug) ? 'Тільки a-z, 0-9, дефіс' : '';

  const handleSave = async () => {
    if (slugError) return;
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'profile', data: form }),
    });
    setSaving(false);
    toast.show('Профіль збережено');
    router.refresh();
  };

  return (
    <GlassCard className="space-y-4">
      <p className="text-foreground text-lg font-bold">Профіль салону</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldInput
          label="Назва салону *"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <FieldInput
          label="Місто"
          value={form.city}
          onChange={(v) => setForm({ ...form, city: v })}
        />
      </div>
      <FieldInput
        label="Адреса"
        value={form.address}
        onChange={(v) => setForm({ ...form, address: v })}
      />
      <FieldInput
        label="Опис"
        value={form.description}
        onChange={(v) => setForm({ ...form, description: v })}
        textarea
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldInput
          label="Телефон"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />
        <FieldInput
          label="Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="text-muted-foreground mb-1 block text-xs font-medium">
          Slug міні-сайту
        </label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground hidden text-xs sm:inline">
            shine-crm-app.vercel.app/m/
          </span>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
            placeholder="my-salon"
            className={inputClass()}
            style={{ fontSize: '16px' }}
          />
        </div>
        {form.slug && !slugError && (
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
            <ExternalLink className="h-3 w-3" />
            shine-crm-app.vercel.app/m/{form.slug}
          </div>
        )}
        {slugError && <p className="mt-1 text-xs text-rose-500">{slugError}</p>}
      </div>

      <SaveButton saving={saving} onClick={handleSave} disabled={!!slugError} />
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: Branding
// ═══════════════════════════════════════════════════════════════════════════════

function BrandingTab({
  salon,
  toast,
}: {
  salon: Record<string, unknown> | null;
  toast: { show: (msg: string) => void };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [accent, setAccent] = useState((salon?.accent_color as string) ?? 'violet');
  const [logoUrl, setLogoUrl] = useState((salon?.logo_url as string) ?? '');

  const handleSaveAccent = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: 'branding',
        data: { accent_color: accent, logo_url: logoUrl },
      }),
    });
    setSaving(false);
    toast.show('Брендинг збережено');
    router.refresh();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/settings/upload-logo', { method: 'POST', body: formData });
    const json = await res.json();
    if (json.url) {
      setLogoUrl(json.url);
      toast.show('Лого завантажено');
    }
    setUploading(false);
  };

  return (
    <GlassCard className="space-y-5">
      <p className="text-foreground text-lg font-bold">Брендинг</p>

      {/* Accent color */}
      <div>
        <label className="text-muted-foreground mb-2 block text-xs font-medium">
          Акцентний колір
        </label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setAccent(c.value)}
              className={cn(
                'h-10 w-10 rounded-full transition-all',
                c.bg,
                accent === c.value ? 'ring-2 ring-offset-2 ring-offset-[var(--bg)]' : '',
                accent === c.value ? c.ring : ''
              )}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Logo upload */}
      <div>
        <label className="text-muted-foreground mb-2 block text-xs font-medium">Логотип</label>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-16 w-16 rounded-xl border border-[var(--glass-border)] object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-[var(--glass-border)] bg-[var(--surface)]">
              <Building className="text-muted-foreground h-6 w-6" />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--glass-bg-hover)]">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Завантаження...' : 'Завантажити'}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-[var(--glass-border)] p-4">
        <p className="text-muted-foreground mb-2 text-xs font-medium">Попередній перегляд</p>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg text-white',
                ACCENT_COLORS.find((c) => c.value === accent)?.bg ?? 'bg-violet-500'
              )}
            >
              <Building className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="text-foreground font-semibold">
              {(salon?.name as string) ?? 'Ваш салон'}
            </p>
            <p className="text-muted-foreground text-xs">shine-crm-app.vercel.app</p>
          </div>
        </div>
      </div>

      <SaveButton saving={saving} onClick={handleSaveAccent} />
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: Schedule
// ═══════════════════════════════════════════════════════════════════════════════

interface DaySchedule {
  start: string;
  end: string;
}

function ScheduleTab({
  salon,
  toast,
}: {
  salon: Record<string, unknown> | null;
  toast: { show: (msg: string) => void };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const wh = (salon?.working_hours as Record<string, DaySchedule | null>) ?? {};

  const [schedule, setSchedule] = useState<
    Record<string, { enabled: boolean; start: string; end: string }>
  >(() => {
    const init: Record<string, { enabled: boolean; start: string; end: string }> = {};
    for (const day of DAYS) {
      const d = wh[day.key];
      init[day.key] = d
        ? { enabled: true, start: d.start, end: d.end }
        : { enabled: false, start: '09:00', end: '19:00' };
    }
    return init;
  });

  const updateDay = (key: string, field: string, value: string | boolean) => {
    setSchedule((prev) => {
      const existing = prev[key] ?? { enabled: false, start: '09:00', end: '19:00' };
      return {
        ...prev,
        [key]: {
          enabled: existing.enabled,
          start: existing.start,
          end: existing.end,
          [field]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const whData: Record<string, DaySchedule | null> = {};
    for (const day of DAYS) {
      const d = schedule[day.key];
      whData[day.key] = d?.enabled ? { start: d.start, end: d.end } : null;
    }
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'schedule', data: { working_hours: whData } }),
    });
    setSaving(false);
    toast.show('Графік збережено');
    router.refresh();
  };

  return (
    <GlassCard className="space-y-4">
      <p className="text-foreground text-lg font-bold">Графік роботи</p>
      <p className="text-muted-foreground text-xs">
        Вкажіть робочі години для кожного дня. Вихідні дні залиште вимкненими.
      </p>

      <div className="space-y-2">
        {DAYS.map((day) => {
          const d = schedule[day.key];
          return (
            <div
              key={day.key}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                d?.enabled
                  ? 'border-violet-500/20 bg-violet-500/5'
                  : 'border-[var(--glass-border)] bg-[var(--surface)]'
              )}
            >
              {/* Toggle */}
              <button
                onClick={() => updateDay(day.key, 'enabled', !d?.enabled)}
                className={cn(
                  'flex h-6 w-10 items-center rounded-full p-0.5 transition-colors',
                  d?.enabled ? 'bg-violet-500' : 'bg-[var(--glass-border)]'
                )}
              >
                <span
                  className={cn(
                    'h-5 w-5 rounded-full bg-white transition-transform',
                    d?.enabled ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>

              <span
                className={cn(
                  'w-24 text-sm font-medium',
                  d?.enabled ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {day.label}
              </span>

              {d?.enabled ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={d.start}
                    onChange={(e) => updateDay(day.key, 'start', e.target.value)}
                    className="text-foreground rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-1.5 text-sm"
                    style={{ fontSize: '16px' }}
                  />
                  <span className="text-muted-foreground text-xs">—</span>
                  <input
                    type="time"
                    value={d.end}
                    onChange={(e) => updateDay(day.key, 'end', e.target.value)}
                    className="text-foreground rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-1.5 text-sm"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Вихідний</span>
              )}
            </div>
          );
        })}
      </div>

      <SaveButton saving={saving} onClick={handleSave} />
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: Team
// ═══════════════════════════════════════════════════════════════════════════════

function TeamTab({
  staff,
  toast,
}: {
  staff: Array<Record<string, unknown>>;
  toast: { show: (msg: string) => void };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const s of staff) init[s.id as string] = (s.commission_rate as number) ?? 35;
    return init;
  });

  const handleSaveRate = async (staffId: string) => {
    setSaving(staffId);
    const supabase = getSupabaseClient();
    await supabase.from('staff').update({ commission_rate: rates[staffId] }).eq('id', staffId);
    setSaving(null);
    toast.show('Комісію збережено');
    router.refresh();
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-foreground text-lg font-bold">Команда</p>
        <GlassBadge variant="default" size="sm">
          {staff.length} майстрів
        </GlassBadge>
      </div>

      <div className="space-y-3">
        {staff.map((s) => {
          const id = s.id as string;
          const isActive = (s.is_active as boolean) !== false;
          return (
            <div
              key={id}
              className={cn(
                'rounded-xl border p-3 transition-colors',
                isActive
                  ? 'border-[var(--glass-border)] bg-[var(--surface)]'
                  : 'border-rose-500/20 bg-rose-500/5 opacity-60'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {s.first_name as string} {s.last_name as string}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {(s.specialization as string) ?? (s.role as string) ?? 'Майстер'}
                  </p>
                </div>
                <GlassBadge variant={isActive ? 'success' : 'error'} size="sm">
                  {isActive ? 'Активний' : 'Неактивний'}
                </GlassBadge>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <label className="text-muted-foreground text-xs font-medium">Комісія:</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rates[id] ?? 35}
                  onChange={(e) => setRates({ ...rates, [id]: Number(e.target.value) })}
                  className="text-foreground w-20 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-1.5 text-center text-sm"
                  style={{ fontSize: '16px' }}
                />
                <span className="text-muted-foreground text-xs">%</span>
                <button
                  onClick={() => handleSaveRate(id)}
                  disabled={saving === id}
                  className="ml-auto flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-xs font-medium text-violet-500 transition-colors hover:bg-violet-500/20 disabled:opacity-50"
                >
                  {saving === id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  Зберегти
                </button>
              </div>
            </div>
          );
        })}
        {staff.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Немає майстрів. Додайте у розділі Команда.
          </p>
        )}
      </div>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: Booking
// ═══════════════════════════════════════════════════════════════════════════════

function BookingTab({
  salon,
  toast,
}: {
  salon: Record<string, unknown> | null;
  toast: { show: (msg: string) => void };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    enabled: (salon?.booking_enabled as boolean) ?? true,
    minAdvance: (salon?.booking_slot_duration as number) ?? 2,
    maxAdvance: (salon?.booking_advance_days as number) ?? 30,
    autoConfirm: !(salon?.booking_confirmation_required as boolean),
    remind24h: (salon?.notifications_email as boolean) ?? true,
    remind2h: (salon?.notifications_sms as boolean) ?? false,
  });

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: 'booking',
        data: {
          booking_enabled: form.enabled,
          booking_advance_days: form.maxAdvance,
          booking_slot_duration: form.minAdvance,
          booking_confirmation_required: !form.autoConfirm,
          notifications_email: form.remind24h,
          notifications_sms: form.remind2h,
        },
      }),
    });
    setSaving(false);
    toast.show('Налаштування запису збережено');
    router.refresh();
  };

  return (
    <GlassCard className="space-y-5">
      <p className="text-foreground text-lg font-bold">Онлайн-запис</p>

      {/* Enable toggle */}
      <ToggleRow
        label="Увімкнути онлайн-запис"
        description="Клієнти зможуть записуватись через міні-сайт"
        value={form.enabled}
        onChange={(v) => setForm({ ...form, enabled: v })}
      />

      {/* Min advance */}
      <div>
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
          Мінімальний час до запису
        </label>
        <div className="flex flex-wrap gap-2">
          {ADVANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setForm({ ...form, minAdvance: opt.value })}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                form.minAdvance === opt.value
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-500'
                  : 'text-muted-foreground hover:text-foreground border-[var(--glass-border)]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Max advance */}
      <div>
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
          Максимальний час наперед
        </label>
        <div className="flex flex-wrap gap-2">
          {MAX_ADVANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setForm({ ...form, maxAdvance: opt.value })}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                form.maxAdvance === opt.value
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-500'
                  : 'text-muted-foreground hover:text-foreground border-[var(--glass-border)]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation */}
      <ToggleRow
        label="Автоматичне підтвердження"
        description="Записи підтверджуються автоматично без участі адміністратора"
        value={form.autoConfirm}
        onChange={(v) => setForm({ ...form, autoConfirm: v })}
      />

      {/* Reminders */}
      <div>
        <label className="text-muted-foreground mb-2 block text-xs font-medium">
          Нагадування клієнту
        </label>
        <div className="space-y-2">
          <ToggleRow
            label="За 24 години"
            value={form.remind24h}
            onChange={(v) => setForm({ ...form, remind24h: v })}
            compact
          />
          <ToggleRow
            label="За 2 години"
            value={form.remind2h}
            onChange={(v) => setForm({ ...form, remind2h: v })}
            compact
          />
        </div>
      </div>

      <SaveButton saving={saving} onClick={handleSave} />
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6: Integrations
// ═══════════════════════════════════════════════════════════════════════════════

function IntegrationsTab({
  salon,
  toast,
}: {
  salon: Record<string, unknown> | null;
  toast: { show: (msg: string) => void };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    telegramToken: (salon?.telegram_bot_token as string) ?? '',
    telegramChatId: (salon?.telegram_chat_id as string) ?? '',
  });

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: 'integrations',
        data: {
          telegram_bot_token: form.telegramToken,
          telegram_chat_id: form.telegramChatId,
        },
      }),
    });
    setSaving(false);
    toast.show('Інтеграції збережено');
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Telegram */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>
          <div>
            <p className="text-foreground font-semibold">Telegram Bot</p>
            <p className="text-muted-foreground text-xs">Нагадування та сповіщення</p>
          </div>
        </div>
        <FieldInput
          label="Bot Token"
          value={form.telegramToken}
          onChange={(v) => setForm({ ...form, telegramToken: v })}
          placeholder="123456:ABC-DEF..."
          mono
        />
        <FieldInput
          label="Chat ID"
          value={form.telegramChatId}
          onChange={(v) => setForm({ ...form, telegramChatId: v })}
          placeholder="-1001234567890"
          mono
        />
        <SaveButton saving={saving} onClick={handleSave} />
      </GlassCard>

      {/* Future integrations */}
      <GlassCard className="space-y-3">
        <p className="text-foreground font-semibold">Скоро</p>
        {[
          { name: 'Instagram', desc: 'Автопостинг та відгуки' },
          { name: 'Google Maps', desc: 'Збір відгуків' },
          { name: 'Shine Shop', desc: 'Автозамовлення матеріалів' },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] p-3"
          >
            <div>
              <p className="text-foreground text-sm font-medium">{item.name}</p>
              <p className="text-muted-foreground text-xs">{item.desc}</p>
            </div>
            <GlassBadge variant="default" size="sm">
              Скоро
            </GlassBadge>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7: Plan
// ═══════════════════════════════════════════════════════════════════════════════

function PlanTab({
  salon,
  staffCount,
  clientCount,
}: {
  salon: Record<string, unknown> | null;
  staffCount: number;
  clientCount: number;
}) {
  const plan = (salon?.subscription_plan as string) ?? 'free';

  const PLANS = [
    {
      key: 'free',
      name: 'Free',
      price: '0 ₴',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-gray-400',
      bg: 'bg-gray-500/10',
      limits: { clients: 100, masters: 2, storage: '100 МБ' },
      features: ['Базовий календар', 'До 100 клієнтів', 'До 2 майстрів'],
    },
    {
      key: 'pro',
      name: 'Pro',
      price: '499 ₴/міс',
      icon: <Zap className="h-5 w-5" />,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      limits: { clients: 1000, masters: 10, storage: '5 ГБ' },
      features: [
        'Все з Free',
        'До 1000 клієнтів',
        'До 10 майстрів',
        'Аналітика та RFM',
        'Онлайн-запис',
        'Telegram бот',
      ],
    },
    {
      key: 'business',
      name: 'Business',
      price: '999 ₴/міс',
      icon: <Crown className="h-5 w-5" />,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      limits: { clients: 99999, masters: 99, storage: '50 ГБ' },
      features: [
        'Все з Pro',
        'Необмежені клієнти',
        'До 99 майстрів',
        'Стерилізація',
        'Фінанси та маржинальність',
        'Мережа салонів',
        'Пріоритетна підтримка',
      ],
    },
  ];

  const currentPlan = PLANS.find((p) => p.key === plan) ?? PLANS[0]!;
  const clientLimit = currentPlan.limits.clients;
  const masterLimit = currentPlan.limits.masters;

  return (
    <div className="space-y-4">
      {/* Current plan */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              currentPlan.bg,
              currentPlan.color
            )}
          >
            {currentPlan.icon}
          </div>
          <div>
            <p className="text-foreground text-lg font-bold">Тариф {currentPlan.name}</p>
            <p className="text-muted-foreground text-sm">{currentPlan.price}</p>
          </div>
        </div>

        {/* Usage */}
        <div className="space-y-3">
          <UsageBar label="Клієнти" current={clientCount} max={clientLimit} />
          <UsageBar label="Майстри" current={staffCount} max={masterLimit} />
        </div>
      </GlassCard>

      {/* Plan comparison */}
      <GlassCard>
        <p className="text-foreground mb-4 text-lg font-bold">Порівняння тарифів</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => {
            const isCurrent = p.key === plan;
            return (
              <div
                key={p.key}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  isCurrent
                    ? 'border-violet-500/40 bg-violet-500/5'
                    : 'border-[var(--glass-border)]'
                )}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg',
                      p.bg,
                      p.color
                    )}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-bold">{p.name}</p>
                    <p className="text-muted-foreground text-xs">{p.price}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="text-muted-foreground flex items-start gap-1.5 text-xs">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="mt-3 rounded-lg bg-violet-500/10 py-2 text-center text-xs font-medium text-violet-500">
                    Поточний тариф
                  </div>
                ) : (
                  <button className="text-foreground mt-3 w-full rounded-lg border border-[var(--glass-border)] py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-bg-hover)]">
                    Оновити
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Shared Components
// ═══════════════════════════════════════════════════════════════════════════════

function SaveButton({
  saving,
  onClick,
  disabled = false,
}: {
  saving: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving || disabled}
      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-xl disabled:opacity-50"
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {saving ? 'Збереження...' : 'Зберегти'}
    </button>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-muted-foreground mb-1 block text-xs font-medium">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={inputClass(mono ? 'font-mono text-xs' : '')}
          style={{ fontSize: '16px' }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass(mono ? 'font-mono text-xs' : '')}
          style={{ fontSize: '16px' }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Data Tab — Seed / Delete demo data
// ═══════════════════════════════════════════════════════════════════════════════

function DataTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const salonId = useSalonId();
  const router = useRouter();
  const [seedLoading, setSeedLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmSeed, setConfirmSeed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSeed = async () => {
    setConfirmSeed(false);
    setSeedLoading(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salon_id: salonId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error');
      toast.show(
        `Демо-дані завантажено: ${data.summary?.clients ?? 0} клієнтів, ${data.summary?.appointments ?? 0} записів`
      );
      router.refresh();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Помилка');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salon_id: salonId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error');
      toast.show('Всі дані салону видалено');
      router.refresh();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Помилка');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seed demo data */}
      <GlassCard className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <Sparkles className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="text-foreground text-base font-bold">Демо-дані</p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Завантажте реалістичні дані для тестування: 30 клієнтів, 15 послуг, 80 записів, склад,
              витрати, стерилізація. Існуючі дані будуть замінені.
            </p>
          </div>
        </div>

        {confirmSeed ? (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <p className="text-foreground text-sm font-medium">
              Це завантажить демо-дані та замінить існуючі. Продовжити?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSeed}
                disabled={seedLoading}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
              >
                {seedLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {seedLoading ? 'Завантаження...' : 'Так, завантажити'}
              </button>
              <button
                onClick={() => setConfirmSeed(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg border border-[var(--glass-border)] px-4 py-2 text-sm font-medium transition-colors"
              >
                Скасувати
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmSeed(true)}
            disabled={seedLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {seedLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {seedLoading ? 'Завантаження...' : 'Завантажити демо-дані'}
          </button>
        )}
      </GlassCard>

      {/* Delete all data */}
      <GlassCard className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <p className="text-foreground text-base font-bold">Видалити всі дані</p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Видаляє клієнтів, записи, послуги, склад, витрати, стерилізацію. Акаунт салону та
              власник залишаються.
            </p>
          </div>
        </div>

        {confirmDelete ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <p className="text-foreground text-sm font-medium">
              Ця дія незворотня. Всі дані салону будуть видалені. Ви впевнені?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-rose-600 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                {deleteLoading ? 'Видалення...' : 'Так, видалити все'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg border border-[var(--glass-border)] px-4 py-2 text-sm font-medium transition-colors"
              >
                Скасувати
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleteLoading}
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 px-5 py-2.5 text-sm font-medium text-rose-400 transition-all hover:border-rose-500/50 hover:bg-rose-500/5 disabled:opacity-50"
          >
            {deleteLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleteLoading ? 'Видалення...' : 'Видалити всі дані'}
          </button>
        )}
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════════════════════════

function ToggleRow({
  label,
  description,
  value,
  onChange,
  compact,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        compact
          ? 'py-1'
          : 'rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 py-3'
      )}
    >
      <div>
        <p className={cn('text-foreground font-medium', compact ? 'text-xs' : 'text-sm')}>
          {label}
        </p>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'flex h-6 w-10 items-center rounded-full p-0.5 transition-colors',
          value ? 'bg-violet-500' : 'bg-[var(--glass-border)]'
        )}
      >
        <span
          className={cn(
            'h-5 w-5 rounded-full bg-white transition-transform',
            value ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

function UsageBar({ label, current, max }: { label: string; current: number; max: number }) {
  const pct = max > 0 ? Math.min(Math.round((current / max) * 100), 100) : 0;
  const isHigh = pct >= 80;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className={cn('font-bold', isHigh ? 'text-rose-500' : 'text-foreground')}>
          {current} / {max >= 99999 ? '∞' : max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isHigh
              ? 'bg-gradient-to-r from-rose-500 to-orange-500'
              : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
