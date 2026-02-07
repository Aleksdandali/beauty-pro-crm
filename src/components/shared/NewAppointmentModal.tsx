'use client';

import { useState, useMemo } from 'react';
import { format, addMinutes, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import {
  Users,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassModal, GlassBadge } from '@/components/glass';
import { createClient } from '@/lib/supabase/client';
import { generateTimeSlots } from '@/schemas/appointment';
import type { StaffMember, ServiceOption, ClientOption } from '@/lib/queries/appointments';
import { useSalonId } from '@/components/providers/AuthProvider';

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  staff: StaffMember[];
  services: ServiceOption[];
  clients: ClientOption[];
  initialDate?: string | null;
  onCreated?: () => void;
}

const STEPS = [
  { icon: Users, label: 'Клієнт' },
  { icon: Sparkles, label: 'Послуга' },
  { icon: CalendarDays, label: 'Дата/Час' },
  { icon: CheckCircle2, label: 'Підтвердження' },
];

export function NewAppointmentModal({
  open,
  onClose,
  staff,
  services,
  clients,
  initialDate,
  onCreated,
}: NewAppointmentModalProps) {
  const salonId = useSalonId();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState(initialDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedService = services.find((s) => s.id === serviceId);
  const selectedStaff = staff.find((s) => s.id === staffId);

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        (c.last_name ?? '').toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [clients, clientSearch]);

  const filteredServices = useMemo(() => {
    if (!serviceSearch) return services;
    const q = serviceSearch.toLowerCase();
    return services.filter((s) => s.name.toLowerCase().includes(q));
  }, [services, serviceSearch]);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const canNext =
    (step === 0 && clientId) ||
    (step === 1 && serviceId && staffId) ||
    (step === 2 && date && time) ||
    step === 3;

  const handleSubmit = async () => {
    if (!selectedService) return;
    setSubmitting(true);

    const supabase = createClient();
    const startTime = parseISO(`${date}T${time}`);
    const endTime = addMinutes(startTime, selectedService.duration);

    const { error } = await supabase.from('appointments').insert({
      salon_id: salonId,
      client_id: clientId,
      service_id: serviceId,
      staff_id: staffId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      price: selectedService.price,
      final_price: selectedService.price,
      notes: notes || null,
      status: 'scheduled',
    });

    setSubmitting(false);

    if (!error) {
      resetForm();
      onClose();
      onCreated?.();
    }
  };

  const resetForm = () => {
    setStep(0);
    setClientId('');
    setServiceId('');
    setStaffId('');
    setTime('');
    setNotes('');
    setClientSearch('');
    setServiceSearch('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <GlassModal open={open} onClose={handleClose} title="Новий запис" size="lg">
      <div className="space-y-5">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center gap-1">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all',
                    i === step
                      ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                      : i < step
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'text-muted-foreground bg-[var(--glass-bg)]'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-6',
                      i < step ? 'bg-emerald-500' : 'bg-[var(--glass-border)]'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {/* Step 1: Client */}
          {step === 0 && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Пошук клієнта..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="text-foreground placeholder:text-muted-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] py-2.5 pr-3 pl-10 text-sm"
                />
              </div>
              <div className="max-h-[250px] space-y-1 overflow-y-auto">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setClientId(c.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      c.id === clientId
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-[var(--glass-bg-hover)]'
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-xs font-bold text-violet-400">
                      {c.first_name[0]}
                    </div>
                    <div>
                      <p className="font-medium">
                        {c.first_name} {c.last_name ?? ''}
                      </p>
                      <p className="text-muted-foreground text-xs">{c.phone}</p>
                    </div>
                    {c.id === clientId && <CheckCircle2 className="text-primary ml-auto h-4 w-4" />}
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    Клієнтів не знайдено
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Service + Staff */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1.5 text-xs font-medium">Послуга</label>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Пошук послуги..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="text-foreground placeholder:text-muted-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] py-2.5 pr-3 pl-10 text-sm"
                  />
                </div>
                <div className="mt-2 max-h-[180px] space-y-1 overflow-y-auto">
                  {filteredServices.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setServiceId(s.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        s.id === serviceId
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-[var(--glass-bg-hover)]'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: s.color || '#8B5CF6' }}
                        />
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground text-xs">{s.duration} хв</span>
                      </div>
                      <span className="font-mono text-xs">{s.price} ₴</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1.5 text-xs font-medium">Майстер</label>
                <div className="grid grid-cols-2 gap-2">
                  {staff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStaffId(s.id)}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 text-left text-sm transition-all',
                        s.id === staffId
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'text-foreground border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]'
                      )}
                    >
                      <p className="font-medium">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-muted-foreground text-xs">{s.role}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Date / Time */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1.5 text-xs font-medium">Дата</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1.5 text-xs font-medium">Час</label>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={cn(
                        'rounded-lg py-2 text-center text-xs font-medium transition-all',
                        slot === time
                          ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                          : 'text-foreground border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]'
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-muted-foreground mb-1.5 text-xs font-medium">Нотатки</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Нотатки до запису..."
                  rows={2}
                  className="text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 3 && (
            <div className="space-y-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
              <h3 className="text-foreground text-sm font-semibold">Підсумок</h3>
              <div className="space-y-3">
                <Row
                  label="Клієнт"
                  value={
                    selectedClient
                      ? `${selectedClient.first_name} ${selectedClient.last_name ?? ''}`
                      : ''
                  }
                />
                <Row label="Послуга" value={selectedService?.name ?? ''} />
                <Row
                  label="Майстер"
                  value={
                    selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name}` : ''
                  }
                />
                <Row
                  label="Дата"
                  value={date ? format(parseISO(date), 'd MMMM yyyy', { locale: uk }) : ''}
                />
                <Row
                  label="Час"
                  value={
                    time
                      ? `${time} — ${selectedService ? format(addMinutes(parseISO(`${date}T${time}`), selectedService.duration), 'HH:mm') : ''}`
                      : ''
                  }
                />
                <Row label="Ціна" value={selectedService ? `${selectedService.price} ₴` : ''} />
                {notes && <Row label="Нотатки" value={notes} />}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-4">
          <button
            onClick={() => (step === 0 ? handleClose() : setStep((s) => s - 1))}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? 'Скасувати' : 'Назад'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-40"
            >
              Далі
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Створити запис
            </button>
          )}
        </div>
      </div>
    </GlassModal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground text-sm font-medium">{value}</span>
    </div>
  );
}
