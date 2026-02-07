'use client';

import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Clock, User, AlertTriangle, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassBadge } from '@/components/glass';
import { STATUS_CONFIG, type AppointmentStatus } from '@/schemas/appointment';
import type { CalendarAppointment } from '@/lib/queries/appointments';

interface AppointmentCardProps {
  appointment: CalendarAppointment;
  compact?: boolean;
  showFormula?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function AppointmentCard({
  appointment: a,
  compact = false,
  showFormula = false,
  onClick,
  children,
}: AppointmentCardProps) {
  const status = STATUS_CONFIG[a.status as AppointmentStatus] ?? STATUS_CONFIG.scheduled;
  const clientName = a.client
    ? `${a.client.first_name} ${a.client.last_name ?? ''}`.trim()
    : 'Клієнт';
  const isCompleted = a.status === 'completed';
  const formulas =
    showFormula && a.client?.formulas ? (a.client.formulas as Record<string, unknown>) : null;
  const nail = formulas?.nail as Record<string, string> | undefined;
  const allergies = (formulas?.allergies ?? []) as string[];

  return (
    <GlassCard
      padding={compact ? 'sm' : 'md'}
      className={cn(
        'transition-all',
        isCompleted && 'border-emerald-500/30',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {/* Time + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="text-muted-foreground h-3.5 w-3.5" />
          <span className="text-foreground font-mono font-medium">
            {format(new Date(a.start_time), 'HH:mm')} - {format(new Date(a.end_time), 'HH:mm')}
          </span>
        </div>
        <GlassBadge variant={status.variant} size="sm">
          {status.label}
        </GlassBadge>
      </div>

      {/* Client + Service */}
      <div className="mt-2">
        <div className="flex items-center gap-1.5">
          <User className="text-muted-foreground h-3.5 w-3.5" />
          <span className="text-foreground text-sm font-medium">{clientName}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-muted-foreground text-sm">{a.service?.name ?? 'Послуга'}</span>
          <span className="text-foreground font-mono text-sm font-medium">
            {(a.final_price ?? a.price).toLocaleString('uk-UA')} ₴
          </span>
        </div>
        {a.staff && !compact && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {a.staff.first_name} {a.staff.last_name}
          </p>
        )}
      </div>

      {/* Formula (if showFormula) */}
      {showFormula && nail && Object.values(nail).some(Boolean) && (
        <div className="mt-3 rounded-lg bg-[var(--glass-bg)] p-2.5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <FlaskConical className="text-primary h-3.5 w-3.5" />
            <span className="text-foreground text-xs font-semibold">Формула:</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
            {nail.base && (
              <div>
                <span className="text-muted-foreground">База: </span>
                <span className="text-foreground">{nail.base}</span>
              </div>
            )}
            {nail.color && (
              <div>
                <span className="text-muted-foreground">Колір: </span>
                <span className="text-foreground">{nail.color}</span>
              </div>
            )}
            {nail.top && (
              <div>
                <span className="text-muted-foreground">Топ: </span>
                <span className="text-foreground">{nail.top}</span>
              </div>
            )}
            {nail.design && (
              <div>
                <span className="text-muted-foreground">Дизайн: </span>
                <span className="text-foreground">{nail.design}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Allergy warning */}
      {showFormula && allergies.length > 0 && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-rose-500/10 p-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
          <p className="text-xs text-rose-500">Алергія: {allergies.join(', ')}</p>
        </div>
      )}

      {/* Notes */}
      {a.notes && !compact && (
        <p className="text-muted-foreground mt-2 text-xs italic">{a.notes}</p>
      )}

      {/* Action buttons (slot for children) */}
      {children && <div className="mt-3">{children}</div>}
    </GlassCard>
  );
}
