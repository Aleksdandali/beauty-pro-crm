'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Loader2 } from 'lucide-react';
import { GlassModal } from '@/components/glass';
import { clientSchema, type ClientFormData, SOURCE_LABELS } from '@/schemas/client';
import { createClient } from '@/lib/supabase/client';
import { useSalonId } from '@/components/providers/AuthProvider';

interface NewClientModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export function NewClientModal({ open, onClose, onCreated }: NewClientModalProps) {
  const salonId = useSalonId();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      birthday: '',
      notes: '',
      source: 'manual',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: row, error: err } = await supabase
      .from('clients')
      .insert({
        salon_id: salonId,
        first_name: data.first_name,
        last_name: data.last_name || null,
        phone: data.phone,
        email: data.email || null,
        birthday: data.birthday || null,
        notes: data.notes || null,
        source: data.source,
      })
      .select('id')
      .single();

    setSubmitting(false);

    if (err) {
      setError(err.message);
      return;
    }

    reset();
    onClose();
    if (row) onCreated?.(row.id);
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <GlassModal open={open} onClose={handleClose} title="Новий клієнт" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="Ім'я *" error={errors.first_name?.message}>
            <input
              {...register('first_name')}
              placeholder="Олена"
              className="text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
            />
          </FieldGroup>
          <FieldGroup label="Прізвище" error={errors.last_name?.message}>
            <input
              {...register('last_name')}
              placeholder="Шевченко"
              className="text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
            />
          </FieldGroup>
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="Телефон *" error={errors.phone?.message}>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+380 99 123 4567"
              className="text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 font-mono text-sm"
            />
          </FieldGroup>
          <FieldGroup label="Email" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="olena@email.com"
              className="text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
            />
          </FieldGroup>
        </div>

        {/* Birthday + Source */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="Дата народження">
            <input
              {...register('birthday')}
              type="date"
              className="text-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
            />
          </FieldGroup>
          <FieldGroup label="Джерело">
            <select
              {...register('source')}
              className="text-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
            >
              {Object.entries(SOURCE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </FieldGroup>
        </div>

        {/* Notes */}
        <FieldGroup label="Нотатки">
          <textarea
            {...register('notes')}
            placeholder="Додаткова інформація..."
            rows={3}
            className="text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
          />
        </FieldGroup>

        {/* Error */}
        {error && <p className="text-error text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--glass-border)] pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Створити
          </button>
        </div>
      </form>
    </GlassModal>
  );
}

// ─── Field Group ─────────────────────────────────────────────────────────────

function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-muted-foreground mb-1.5 block text-xs font-medium">{label}</label>
      {children}
      {error && <p className="text-error mt-1 text-xs">{error}</p>}
    </div>
  );
}
