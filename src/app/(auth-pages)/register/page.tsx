'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Mail,
  Lock,
  Loader2,
  User,
  Building,
  MapPin,
  Phone,
  UserPlus,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    owner_name: '',
    email: '',
    password: '',
    salon_name: '',
    city: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const up = (patch: Partial<typeof form>) => setForm((p) => ({ ...p, ...patch }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Пароль має бути не менше 8 символів');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Помилка реєстрації');
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (loginError) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push('/login');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Помилка мережі');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-2xl font-extrabold text-transparent">
          Shine Beauty
        </h1>
        <p className="mt-1 text-sm text-gray-500">Створіть свій акаунт</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
        <form onSubmit={handleRegister} className="space-y-3">
          <Field
            icon={<User className="h-3 w-3" />}
            label="Ваше ім'я"
            value={form.owner_name}
            onChange={(v) => up({ owner_name: v })}
            placeholder="Олександр"
            required
          />
          <Field
            icon={<Mail className="h-3 w-3" />}
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => up({ email: v })}
            placeholder="your@email.com"
            required
          />
          <Field
            icon={<Lock className="h-3 w-3" />}
            label="Пароль"
            type="password"
            value={form.password}
            onChange={(v) => up({ password: v })}
            placeholder="Мінімум 8 символів"
            required
          />

          <div className="border-t border-white/[0.04] pt-3">
            <p className="mb-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              Про салон
            </p>
          </div>

          <Field
            icon={<Building className="h-3 w-3" />}
            label="Назва салону"
            value={form.salon_name}
            onChange={(v) => up({ salon_name: v })}
            placeholder="Beauty Studio"
            required
          />
          <Field
            icon={<MapPin className="h-3 w-3" />}
            label="Місто"
            value={form.city}
            onChange={(v) => up({ city: v })}
            placeholder="Київ"
          />
          <Field
            icon={<Phone className="h-3 w-3" />}
            label="Телефон"
            type="tel"
            value={form.phone}
            onChange={(v) => up({ phone: v })}
            placeholder="+380..."
          />

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {loading ? 'Створюємо...' : 'Створити акаунт'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Вже є акаунт?{' '}
          <Link href="/login" className="text-violet-400 transition-colors hover:text-violet-300">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors outline-none focus:border-violet-500/40"
        style={{ fontSize: '16px' }}
      />
    </div>
  );
}
