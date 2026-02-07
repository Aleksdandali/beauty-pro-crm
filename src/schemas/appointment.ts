import { z } from 'zod';

// ─── Appointment Schema ──────────────────────────────────────────────────────

export const appointmentSchema = z.object({
  client_id: z.string().uuid('Оберіть клієнта'),
  service_id: z.string().uuid('Оберіть послугу'),
  staff_id: z.string().uuid('Оберіть майстра'),
  date: z.string().min(1, 'Оберіть дату'),
  start_time: z.string().min(1, 'Оберіть час'),
  notes: z.string(),
  price: z.number().min(0),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

// ─── Complete Appointment Schema ─────────────────────────────────────────────

export const completeAppointmentSchema = z.object({
  notes: z.string(),
  formula_snapshot: z.record(z.string(), z.unknown()).optional(),
});

export type CompleteAppointmentFormData = z.infer<typeof completeAppointmentSchema>;

// ─── Status Config ───────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export const STATUS_CONFIG: Record<
  AppointmentStatus,
  {
    label: string;
    variant: 'primary' | 'info' | 'warning' | 'success' | 'error' | 'default';
    color: string;
  }
> = {
  scheduled: { label: 'Заплановано', variant: 'primary', color: '#8B5CF6' },
  confirmed: { label: 'Підтверджено', variant: 'info', color: '#3B82F6' },
  in_progress: { label: 'В процесі', variant: 'warning', color: '#F59E0B' },
  completed: { label: 'Завершено', variant: 'success', color: '#10B981' },
  cancelled: { label: 'Скасовано', variant: 'error', color: '#6B7280' },
  no_show: { label: 'Не прийшов', variant: 'error', color: '#F43F5E' },
};

// ─── Time Slots ──────────────────────────────────────────────────────────────

export const WORKING_HOURS = { start: 9, end: 21 };
export const SLOT_DURATION = 30; // minutes

export function generateTimeSlots(
  startHour = WORKING_HOURS.start,
  endHour = WORKING_HOURS.end,
  step = SLOT_DURATION
): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += step) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}
