'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Sun, Sunset, Moon, CheckCircle2, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn, StaggerList } from '@/components/animations';
import { AppointmentCard } from '@/components/shared/AppointmentCard';
import { CompleteAppointmentModal } from '@/components/shared/CompleteAppointmentModal';
import type { CalendarAppointment } from '@/lib/queries/appointments';

interface MasterDayContentProps {
  appointments: CalendarAppointment[];
  masterName: string;
}

function getGreeting(): { text: string; icon: React.ElementType } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Доброго ранку', icon: Sun };
  if (h < 18) return { text: 'Доброго дня', icon: Sunset };
  return { text: 'Доброго вечора', icon: Moon };
}

export function MasterDayContent({ appointments, masterName }: MasterDayContentProps) {
  const router = useRouter();
  const [completeModal, setCompleteModal] = useState<{
    id: string;
    clientName: string;
    serviceName: string;
  } | null>(null);

  const greeting = getGreeting();
  const GreetIcon = greeting.icon;
  const today = new Date();

  const completed = useMemo(
    () => appointments.filter((a) => a.status === 'completed').length,
    [appointments]
  );
  const total = appointments.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const handleComplete = (a: CalendarAppointment) => {
    const clientName = a.client
      ? `${a.client.first_name} ${a.client.last_name ?? ''}`.trim()
      : 'Клієнт';
    setCompleteModal({
      id: a.id,
      clientName,
      serviceName: a.service?.name ?? 'Послуга',
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────── */}
      <FadeIn>
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            {format(today, 'EEEE, d MMMM yyyy', { locale: uk })}
          </p>
          <div className="flex items-center gap-2">
            <GreetIcon className="h-5 w-5 text-amber-400" />
            <h1 className="text-foreground text-xl font-bold sm:text-2xl">
              {greeting.text}, {masterName}!
            </h1>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completed} з {total} завершено
              </span>
              <span className="text-foreground font-mono font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--glass-bg)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Appointments ────────────────────── */}
      {total === 0 ? (
        <FadeIn>
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
              <PartyPopper className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-foreground text-lg font-semibold">Сьогодні записів немає</p>
            <p className="text-muted-foreground mt-1 text-sm">Час відпочити!</p>
          </div>
        </FadeIn>
      ) : (
        <StaggerList delay={0.06} className="space-y-4">
          {appointments.map((appt) => {
            const isCompleted = appt.status === 'completed';
            return (
              <div key={appt.id}>
                <AppointmentCard appointment={appt} showFormula>
                  {/* Action buttons */}
                  {!isCompleted && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(appt)}
                        className={cn(
                          'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                          'min-h-[44px]',
                          'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40'
                        )}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Завершити
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-500">Завершено</span>
                    </div>
                  )}
                </AppointmentCard>
              </div>
            );
          })}
        </StaggerList>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <CompleteAppointmentModal
          open={!!completeModal}
          onClose={() => setCompleteModal(null)}
          appointmentId={completeModal.id}
          clientName={completeModal.clientName}
          serviceName={completeModal.serviceName}
          onCompleted={() => {
            setCompleteModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
