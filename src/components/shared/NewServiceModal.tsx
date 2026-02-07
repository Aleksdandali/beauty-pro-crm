'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Loader2 } from 'lucide-react';
import { GlassModal } from '@/components/glass';
import { serviceSchema, type ServiceFormData, CATEGORY_LABELS } from '@/schemas/service';
import { createClient } from '@/lib/supabase/client';
import { useSalonId } from '@/components/providers/AuthProvider';

interface NewServiceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function NewServiceModal({ open, onClose, onCreated }: NewServiceModalProps) {
  const salonId = useSalonId();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      category: 'manicure',
      price: 0,
      duration: 60,
      description: '',
      color: '#8B5CF6',
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase.from('services').insert({
      salon_id: salonId,
      name: data.name,
      category: data.category,
      price: data.price,
      duration: data.duration,
      description: data.description || null,
      color: data.color,
    });

    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }

    reset();
    onClose();
    onCreated?.();
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <GlassModal open={open} onClose={handleClose} title="Нова послуга" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <FieldGroup label="Назва *" error={errors.name?.message}>
          <input
            {...register('name')}
            placeholder="Манікюр з покриттям"
            className="text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
          />
        </FieldGroup>

        {/* Category + Duration */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="Категорія *" error={errors.category?.message}>
            <select
              {...register('category')}
              className="text-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup
            label="Тривалість (хв) *"
            error={errors.duration?.message as string | undefined}
          >
            <input
              {...register('duration', { valueAsNumber: true })}
              type="number"
              min={5}
              step={5}
              className="text-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 font-mono text-sm"
            />
          </FieldGroup>
        </div>

        {/* Price + Color */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="Ціна (₴) *" error={errors.price?.message as string | undefined}>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              min={0}
              step={10}
              className="text-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 font-mono text-sm"
            />
          </FieldGroup>
          <FieldGroup label="Колір">
            <input
              {...register('color')}
              type="color"
              className="h-10 w-full cursor-pointer rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-1"
            />
          </FieldGroup>
        </div>

        {/* Description */}
        <FieldGroup label="Опис">
          <textarea
            {...register('description')}
            placeholder="Деталі послуги..."
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
              <Sparkles className="h-4 w-4" />
            )}
            Створити
          </button>
        </div>
      </form>
    </GlassModal>
  );
}

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
