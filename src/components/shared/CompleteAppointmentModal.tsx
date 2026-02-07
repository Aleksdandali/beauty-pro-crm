'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, StickyNote } from 'lucide-react';
import { GlassModal } from '@/components/glass';
import { createClient } from '@/lib/supabase/client';

interface CompleteAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  clientName: string;
  serviceName: string;
  onCompleted?: () => void;
}

export function CompleteAppointmentModal({
  open,
  onClose,
  appointmentId,
  clientName,
  serviceName,
  onCompleted,
}: CompleteAppointmentModalProps) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Помилка завершення');
        setSubmitting(false);
        return;
      }

      // Also update client formula if needed
      const supabase = createClient();
      if (notes) {
        await supabase.from('appointments').update({ notes }).eq('id', appointmentId);
      }

      setSubmitting(false);
      setNotes('');
      onClose();
      onCompleted?.();
    } catch {
      setError('Помилка мережі');
      setSubmitting(false);
    }
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Завершити запис" size="md">
      <div className="space-y-5">
        {/* Summary */}
        <div className="rounded-lg bg-[var(--glass-bg)] p-3">
          <p className="text-foreground text-sm font-medium">{clientName}</p>
          <p className="text-muted-foreground text-xs">{serviceName}</p>
        </div>

        {/* Notes */}
        <div>
          <label className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs font-medium">
            <StickyNote className="h-3.5 w-3.5" />
            Нотатки
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Нотатки до запису..."
            rows={3}
            className="text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--glass-border)] pt-4">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleComplete}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Завершити запис
          </button>
        </div>
      </div>
    </GlassModal>
  );
}
