'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
        <p className="mt-1 text-sm text-gray-500">Відновлення паролю</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
        {sent ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle className="mb-3 h-10 w-10 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Перевірте пошту</h2>
            <p className="mt-1 text-sm text-gray-400">
              Ми надіслали посилання для відновлення паролю на {email}
            </p>
            <Link
              href="/login"
              className="mt-4 flex items-center gap-1 text-sm text-violet-400 transition-colors hover:text-violet-300"
            >
              <ArrowLeft className="h-3 w-3" />
              Повернутись до входу
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Mail className="h-4 w-4" />
              )}
              {loading ? 'Надсилаємо...' : 'Надіслати посилання'}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              <ArrowLeft className="h-3 w-3" />
              Повернутись до входу
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
