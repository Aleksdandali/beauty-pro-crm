'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Невірний email або пароль'
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div>
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-2xl font-extrabold text-transparent">
          Shine Beauty
        </h1>
        <p className="mt-1 text-sm text-gray-500">Увійдіть у свій акаунт</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
              <Mail className="h-3 w-3" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors outline-none focus:border-violet-500/40"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
              <Lock className="h-3 w-3" />
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Мінімум 8 символів"
              required
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors outline-none focus:border-violet-500/40"
              style={{ fontSize: '16px' }}
            />
          </div>

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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? 'Входимо...' : 'Увійти'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <Link
            href="/forgot-password"
            className="text-gray-500 transition-colors hover:text-gray-300"
          >
            Забули пароль?
          </Link>
          <Link
            href="/register"
            className="text-violet-400 transition-colors hover:text-violet-300"
          >
            Немає акаунту? Зареєструватись
          </Link>
        </div>
      </div>
    </div>
  );
}
