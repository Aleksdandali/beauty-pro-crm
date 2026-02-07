'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  addDays,
  addWeeks,
  subWeeks,
  subDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  differenceInMinutes,
  eachDayOfInterval,
} from 'date-fns';
import { uk } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Filter,
  X,
  Clock,
  User,
  Phone,
  Copy,
  CheckCircle2,
  FlaskConical,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { GlassCard, GlassBadge } from '@/components/glass';
import { FadeIn } from '@/components/animations';
import { AppointmentCard } from '@/components/shared/AppointmentCard';
import { NewAppointmentModal } from '@/components/shared/NewAppointmentModal';
import { createClient } from '@/lib/supabase/client';
import { STATUS_CONFIG, WORKING_HOURS, type AppointmentStatus } from '@/schemas/appointment';
import type {
  CalendarAppointment,
  StaffMember,
  ServiceOption,
  ClientOption,
} from '@/lib/queries/appointments';
import { useSalonId } from '@/components/providers/AuthProvider';

// ─── Constants ───────────────────────────────────────────────────────────────

const HOUR_HEIGHT = 80; // px per hour — the foundation of pixel-perfect layout
const FIRST_HOUR = WORKING_HOURS.start; // 9
const LAST_HOUR = WORKING_HOURS.end; // 21
const TOTAL_HOURS = LAST_HOUR - FIRST_HOUR;

const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => FIRST_HOUR + i);

// Staff color palette — distinct colors for different masters
const STAFF_COLORS = [
  { bg: 'rgba(139, 92, 246, 0.18)', border: '#8B5CF6', text: '#7C3AED' },
  { bg: 'rgba(59, 130, 246, 0.18)', border: '#3B82F6', text: '#2563EB' },
  { bg: 'rgba(236, 72, 153, 0.18)', border: '#EC4899', text: '#DB2777' },
  { bg: 'rgba(245, 158, 11, 0.18)', border: '#F59E0B', text: '#D97706' },
  { bg: 'rgba(16, 185, 129, 0.18)', border: '#10B981', text: '#059669' },
  { bg: 'rgba(168, 85, 247, 0.18)', border: '#A855F7', text: '#9333EA' },
  { bg: 'rgba(244, 63, 94, 0.18)', border: '#F43F5E', text: '#E11D48' },
  { bg: 'rgba(6, 182, 212, 0.18)', border: '#06B6D4', text: '#0891B2' },
];

type ViewMode = 'day' | 'week' | 'month';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalendarContentProps {
  initialAppointments: CalendarAppointment[];
  staff: StaffMember[];
  services: ServiceOption[];
  clients: ClientOption[];
  initialWeekStart: string;
}

// ─── Overlap Algorithm ───────────────────────────────────────────────────────

interface LayoutBlock {
  appointment: CalendarAppointment;
  top: number;
  height: number;
  column: number;
  totalColumns: number;
}

function getMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function computeLayout(
  appointments: CalendarAppointment[],
  day: Date,
  staffColorMap: Map<string, (typeof STAFF_COLORS)[0]>
): LayoutBlock[] {
  // Filter to this day and sort by start time
  const dayAppts = appointments
    .filter((a) => isSameDay(new Date(a.start_time), day))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  if (dayAppts.length === 0) return [];

  // Compute top/height for each
  const blocks: LayoutBlock[] = dayAppts.map((appt) => {
    const start = new Date(appt.start_time);
    const end = new Date(appt.end_time);
    const startMin = getMinutesFromMidnight(start);
    const endMin = getMinutesFromMidnight(end);
    const topMin = startMin - FIRST_HOUR * 60;
    const durMin = Math.max(endMin - startMin, 15); // min 15min block

    return {
      appointment: appt,
      top: (topMin / 60) * HOUR_HEIGHT,
      height: (durMin / 60) * HOUR_HEIGHT,
      column: 0,
      totalColumns: 1,
    };
  });

  // Overlap detection — greedy column assignment
  // Group overlapping events into clusters
  const clusters: LayoutBlock[][] = [];
  let currentCluster: LayoutBlock[] = [];
  let clusterEnd = -Infinity;

  for (const block of blocks) {
    const blockEnd = block.top + block.height;
    if (block.top < clusterEnd) {
      // Overlaps with current cluster
      currentCluster.push(block);
      clusterEnd = Math.max(clusterEnd, blockEnd);
    } else {
      if (currentCluster.length > 0) clusters.push(currentCluster);
      currentCluster = [block];
      clusterEnd = blockEnd;
    }
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  // Assign columns within each cluster
  for (const cluster of clusters) {
    const columns: number[] = []; // end positions of each column
    for (const block of cluster) {
      // Find first column where block fits
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (block.top >= (columns[c] ?? 0)) {
          block.column = c;
          columns[c] = block.top + block.height;
          placed = true;
          break;
        }
      }
      if (!placed) {
        block.column = columns.length;
        columns.push(block.top + block.height);
      }
    }
    const totalCols = columns.length;
    for (const block of cluster) {
      block.totalColumns = totalCols;
    }
  }

  return blocks;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CalendarContent({
  initialAppointments,
  staff,
  services,
  clients,
  initialWeekStart,
}: CalendarContentProps) {
  const salonId = useSalonId();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(parseISO(initialWeekStart));
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);

  // Staff → color mapping
  const staffColorMap = useMemo(() => {
    const map = new Map<string, (typeof STAFF_COLORS)[0]>();
    staff.forEach((s, i) => {
      const color = STAFF_COLORS[i % STAFF_COLORS.length];
      if (color) map.set(s.id, color);
    });
    return map;
  }, [staff]);

  // Week days
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Filter
  const filtered = useMemo(() => {
    if (staffFilter === 'all') return initialAppointments;
    return initialAppointments.filter((a) => a.staff?.id === staffFilter);
  }, [initialAppointments, staffFilter]);

  // Navigation
  const navigate = useCallback(
    (dir: -1 | 0 | 1) => {
      if (dir === 0) {
        setCurrentDate(new Date());
        return;
      }
      setCurrentDate((d) => {
        if (viewMode === 'day') return dir === 1 ? addDays(d, 1) : subDays(d, 1);
        if (viewMode === 'week') return dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1);
        // month
        const m = new Date(d);
        m.setMonth(m.getMonth() + dir);
        return m;
      });
    },
    [viewMode]
  );

  const handleNewAppointment = useCallback((date?: string) => {
    setSelectedDate(date ?? null);
    setModalOpen(true);
  }, []);

  // Title text
  const headerTitle = useMemo(() => {
    if (viewMode === 'day') return format(currentDate, 'd MMMM yyyy, EEEE', { locale: uk });
    if (viewMode === 'week')
      return `${format(weekStart, 'd MMM', { locale: uk })} — ${format(addDays(weekStart, 6), 'd MMM yyyy', { locale: uk })}`;
    return format(currentDate, 'LLLL yyyy', { locale: uk });
  }, [viewMode, currentDate, weekStart]);

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-2xl font-bold">Календар</h1>
            <GlassBadge variant="primary" size="md">
              {filtered.length} записів
            </GlassBadge>
          </div>
          <button
            onClick={() => handleNewAppointment()}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40"
          >
            <Plus className="h-4 w-4" />
            Новий запис
          </button>
        </div>
      </FadeIn>

      {/* ── Toolbar ─────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="cal-nav-btn">
            <ChevronLeft className="text-foreground h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(0)}
            className="text-primary hover:bg-primary/5 border-primary/30 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
          >
            Сьогодні
          </button>
          <button onClick={() => navigate(1)} className="cal-nav-btn">
            <ChevronRight className="text-foreground h-4 w-4" />
          </button>
          <span className="text-foreground ml-2 text-sm font-semibold capitalize">
            {headerTitle}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="hidden items-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-0.5 sm:flex">
            {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all',
                  v === viewMode
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v === 'day' ? 'День' : v === 'week' ? 'Тиждень' : 'Місяць'}
              </button>
            ))}
          </div>

          {/* Staff filter */}
          {staff.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="text-muted-foreground hidden h-4 w-4 sm:block" />
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="text-foreground h-9 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-sm"
              >
                <option value="all">Всі майстри</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop Views ───────────────────── */}
      <div className="hidden lg:block">
        {viewMode === 'week' && (
          <WeekView
            days={days}
            appointments={filtered}
            staffColorMap={staffColorMap}
            onAppointmentClick={setSelectedAppointment}
            onSlotClick={(date) => handleNewAppointment(date)}
          />
        )}
        {viewMode === 'day' && (
          <DayView
            day={currentDate}
            appointments={filtered}
            staffColorMap={staffColorMap}
            onAppointmentClick={setSelectedAppointment}
            onSlotClick={() => handleNewAppointment(format(currentDate, 'yyyy-MM-dd'))}
          />
        )}
        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            appointments={filtered}
            onDayClick={(d) => {
              setCurrentDate(d);
              setViewMode('day');
            }}
          />
        )}
      </div>

      {/* ── Mobile Day View ─────────────────── */}
      <MobileDayView
        appointments={filtered}
        days={days}
        onNewAppointment={() => handleNewAppointment()}
        onAppointmentClick={setSelectedAppointment}
      />

      {/* ── Side Panel ──────────────────────── */}
      <SidePanel
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        staffColorMap={staffColorMap}
        onStatusChange={() => router.refresh()}
      />

      {/* ── New Appointment Modal ───────────── */}
      <NewAppointmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDate(null);
        }}
        staff={staff}
        services={services}
        clients={clients}
        initialDate={selectedDate}
        onCreated={() => router.refresh()}
      />

      {/* Inline styles for nav buttons */}
      <style jsx global>{`
        .cal-nav-btn {
          display: flex;
          height: 36px;
          width: 36px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          transition: background 0.15s;
        }
        .cal-nav-btn:hover {
          background: var(--glass-bg-hover);
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEEK VIEW — pixel-perfect Google Calendar style
// ═══════════════════════════════════════════════════════════════════════════════

function WeekView({
  days,
  appointments,
  staffColorMap,
  onAppointmentClick,
  onSlotClick,
}: {
  days: Date[];
  appointments: CalendarAppointment[];
  staffColorMap: Map<string, (typeof STAFF_COLORS)[0]>;
  onAppointmentClick: (a: CalendarAppointment) => void;
  onSlotClick: (date: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current hour on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const targetTop = (now.getHours() - FIRST_HOUR - 1) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, targetTop);
    }
  }, []);

  return (
    <GlassCard padding="none" hover={false}>
      {/* Day headers (sticky) */}
      <div
        className="grid border-b border-[var(--glass-border)]"
        style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}
      >
        <div className="border-r border-[var(--glass-border)] p-2" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'border-r border-[var(--glass-border)] px-2 py-2.5 text-center last:border-r-0',
              isToday(day) && 'bg-primary/5'
            )}
          >
            <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
              {format(day, 'EEE', { locale: uk })}
            </p>
            <p
              className={cn(
                'mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                isToday(day)
                  ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                  : 'text-foreground'
              )}
            >
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="max-h-[calc(100vh-280px)] overflow-y-auto">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: '56px repeat(7, 1fr)',
            height: TOTAL_HOURS * HOUR_HEIGHT,
          }}
        >
          {/* Hour labels */}
          <div className="relative border-r border-[var(--glass-border)]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-right"
                style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT }}
              >
                <span className="text-muted-foreground font-mono text-[10px]">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIdx) => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              appointments={appointments}
              staffColorMap={staffColorMap}
              onAppointmentClick={onAppointmentClick}
              onSlotClick={() => onSlotClick(format(day, 'yyyy-MM-dd'))}
              isLast={dayIdx === 6}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Day Column (used in Week view) ──────────────────────────────────────────

function DayColumn({
  day,
  appointments,
  staffColorMap,
  onAppointmentClick,
  onSlotClick,
  isLast,
}: {
  day: Date;
  appointments: CalendarAppointment[];
  staffColorMap: Map<string, (typeof STAFF_COLORS)[0]>;
  onAppointmentClick: (a: CalendarAppointment) => void;
  onSlotClick: () => void;
  isLast: boolean;
}) {
  const blocks = useMemo(
    () => computeLayout(appointments, day, staffColorMap),
    [appointments, day, staffColorMap]
  );

  return (
    <div
      className={cn(
        'relative',
        !isLast && 'border-r border-[var(--glass-border)]',
        isToday(day) && 'bg-primary/[0.03]'
      )}
      onClick={onSlotClick}
    >
      {/* Hour grid lines */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute inset-x-0 border-t border-[var(--glass-border)]"
          style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT }}
        />
      ))}
      {/* Half-hour lines */}
      {HOURS.map((hour) => (
        <div
          key={`${hour}-half`}
          className="absolute inset-x-0 border-t border-[var(--glass-border)] opacity-30"
          style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
        />
      ))}

      {/* Current time indicator */}
      {isToday(day) && <CurrentTimeLine />}

      {/* Appointment blocks */}
      {blocks.map((block) => (
        <AppointmentBlock
          key={block.appointment.id}
          block={block}
          staffColorMap={staffColorMap}
          onClick={(e) => {
            e.stopPropagation();
            onAppointmentClick(block.appointment);
          }}
        />
      ))}
    </div>
  );
}

// ─── Appointment Block ───────────────────────────────────────────────────────

function AppointmentBlock({
  block,
  staffColorMap,
  onClick,
}: {
  block: LayoutBlock;
  staffColorMap: Map<string, (typeof STAFF_COLORS)[0]>;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { appointment: a, top, height, column, totalColumns } = block;
  const status = STATUS_CONFIG[a.status as AppointmentStatus] ?? STATUS_CONFIG.scheduled;
  const staffColor = a.staff ? staffColorMap.get(a.staff.id) : undefined;
  const bgColor = staffColor?.bg ?? status.color + '28';
  const borderColor = staffColor?.border ?? status.color;
  const clientName = a.client ? `${a.client.first_name} ${a.client.last_name ?? ''}`.trim() : '';
  const isSmall = height < 40;

  const widthPercent = 100 / totalColumns;
  const leftPercent = column * widthPercent;

  return (
    <div
      className="group absolute z-10 cursor-pointer overflow-hidden rounded-md border-l-[3px] px-1.5 py-0.5 transition-all duration-150 hover:z-20 hover:shadow-lg hover:brightness-105"
      style={{
        top: Math.max(top, 0),
        height: Math.max(height - 2, 14),
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
        backgroundColor: bgColor,
        borderLeftColor: borderColor,
      }}
      onClick={onClick}
    >
      {isSmall ? (
        <p className="truncate text-[10px] font-medium" style={{ color: borderColor }}>
          {format(new Date(a.start_time), 'HH:mm')} {clientName}
        </p>
      ) : (
        <>
          <p className="truncate text-[10px] font-semibold" style={{ color: borderColor }}>
            {format(new Date(a.start_time), 'HH:mm')} – {format(new Date(a.end_time), 'HH:mm')}
          </p>
          <p className="text-foreground truncate text-[11px] font-medium">{clientName}</p>
          {height >= 56 && (
            <p className="text-muted-foreground truncate text-[10px]">{a.service?.name ?? ''}</p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Current Time Line ───────────────────────────────────────────────────────

function CurrentTimeLine() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const minutes = getMinutesFromMidnight(now) - FIRST_HOUR * 60;
  if (minutes < 0 || minutes > TOTAL_HOURS * 60) return null;

  const top = (minutes / 60) * HOUR_HEIGHT;

  return (
    <div className="pointer-events-none absolute inset-x-0 z-30" style={{ top }}>
      <div className="relative flex items-center">
        <div className="absolute -left-[5px] h-[10px] w-[10px] rounded-full bg-red-500" />
        <div className="h-[2px] w-full bg-red-500" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAY VIEW — single column, larger blocks
// ═══════════════════════════════════════════════════════════════════════════════

function DayView({
  day,
  appointments,
  staffColorMap,
  onAppointmentClick,
  onSlotClick,
}: {
  day: Date;
  appointments: CalendarAppointment[];
  staffColorMap: Map<string, (typeof STAFF_COLORS)[0]>;
  onAppointmentClick: (a: CalendarAppointment) => void;
  onSlotClick: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const targetTop = (now.getHours() - FIRST_HOUR - 1) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, targetTop);
    }
  }, []);

  const blocks = useMemo(
    () => computeLayout(appointments, day, staffColorMap),
    [appointments, day, staffColorMap]
  );

  return (
    <GlassCard padding="none" hover={false}>
      <div ref={scrollRef} className="max-h-[calc(100vh-280px)] overflow-y-auto">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: '56px 1fr', height: TOTAL_HOURS * HOUR_HEIGHT }}
        >
          {/* Hour labels */}
          <div className="relative border-r border-[var(--glass-border)]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-right"
                style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT }}
              >
                <span className="text-muted-foreground font-mono text-[10px]">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="relative" onClick={onSlotClick}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute inset-x-0 border-t border-[var(--glass-border)]"
                style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT }}
              />
            ))}
            {HOURS.map((hour) => (
              <div
                key={`${hour}-half`}
                className="absolute inset-x-0 border-t border-[var(--glass-border)] opacity-30"
                style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
              />
            ))}
            {isToday(day) && <CurrentTimeLine />}
            {blocks.map((block) => (
              <AppointmentBlock
                key={block.appointment.id}
                block={block}
                staffColorMap={staffColorMap}
                onClick={(e) => {
                  e.stopPropagation();
                  onAppointmentClick(block.appointment);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONTH VIEW — grid of days with appointment dots
// ═══════════════════════════════════════════════════════════════════════════════

function MonthView({
  currentDate,
  appointments,
  onDayClick,
}: {
  currentDate: Date;
  appointments: CalendarAppointment[];
  onDayClick: (d: Date) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = addDays(startOfWeek(addDays(monthEnd, 6), { weekStartsOn: 1 }), 0);
  const allDays = eachDayOfInterval({ start: calStart, end: calEnd });

  // Trim to full weeks (max 6 rows)
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return (
    <GlassCard padding="none" hover={false}>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[var(--glass-border)]">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((d) => (
          <div
            key={d}
            className="text-muted-foreground border-r border-[var(--glass-border)] p-2 text-center text-[10px] font-semibold tracking-wider uppercase last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>
      {/* Week rows */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day) => {
            const count = appointments.filter((a) => isSameDay(new Date(a.start_time), day)).length;
            const inMonth = isSameMonth(day, currentDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDayClick(day)}
                className={cn(
                  'relative flex min-h-[80px] flex-col border-r border-b border-[var(--glass-border)] p-1.5 text-left transition-colors last:border-r-0 hover:bg-[var(--glass-bg-hover)]',
                  !inMonth && 'opacity-40',
                  isToday(day) && 'bg-primary/5'
                )}
              >
                <span
                  className={cn(
                    'mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isToday(day)
                      ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                      : 'text-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {count > 0 && (
                  <div className="mt-auto flex flex-wrap gap-0.5">
                    {count <= 3 ? (
                      Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                      ))
                    ) : (
                      <span className="text-[10px] font-medium text-violet-500">{count} зап.</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE DAY VIEW
// ═══════════════════════════════════════════════════════════════════════════════

function MobileDayView({
  appointments,
  days,
  onNewAppointment,
  onAppointmentClick,
}: {
  appointments: CalendarAppointment[];
  days: Date[];
  onNewAppointment: () => void;
  onAppointmentClick: (a: CalendarAppointment) => void;
}) {
  const [dayIdx, setDayIdx] = useState(() => {
    const todayIdx = days.findIndex((d) => isToday(d));
    return todayIdx >= 0 ? todayIdx : 0;
  });

  const currentDay = days[dayIdx];
  if (!currentDay) return null;

  const dayAppts = appointments
    .filter((a) => isSameDay(new Date(a.start_time), currentDay))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="space-y-4 lg:hidden">
      {/* Day selector — arrows + date */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setDayIdx((i) => Math.max(0, i - 1))}
          disabled={dayIdx === 0}
          className="text-muted-foreground disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-foreground text-sm font-semibold">
            {format(currentDay, 'EEEE', { locale: uk })}
          </p>
          <p className="text-muted-foreground text-xs">
            {format(currentDay, 'd MMMM', { locale: uk })}
          </p>
        </div>
        <button
          onClick={() => setDayIdx((i) => Math.min(6, i + 1))}
          disabled={dayIdx >= 6}
          className="text-muted-foreground disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day pills */}
      <div className="flex justify-center gap-1.5">
        {days.map((d, i) => (
          <button
            key={d.toISOString()}
            onClick={() => setDayIdx(i)}
            className={cn(
              'flex h-10 w-10 flex-col items-center justify-center rounded-lg text-xs font-medium transition-all',
              i === dayIdx
                ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                : isToday(d)
                  ? 'border-primary/50 text-primary border'
                  : 'text-muted-foreground bg-[var(--glass-bg)]'
            )}
          >
            <span className="text-[9px] uppercase">{format(d, 'EE', { locale: uk })}</span>
            <span>{format(d, 'd')}</span>
          </button>
        ))}
      </div>

      {/* Appointments list */}
      {dayAppts.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <CalendarDays className="mb-3 h-10 w-10 text-violet-400 opacity-40" />
          <p className="text-muted-foreground text-sm">Немає записів на цей день</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayAppts.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              compact
              onClick={() => onAppointmentClick(appt)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={onNewAppointment}
        className="fixed right-4 bottom-20 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 lg:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIDE PANEL — slide-in details for a selected appointment
// ═══════════════════════════════════════════════════════════════════════════════

function SidePanel({
  appointment: a,
  onClose,
  staffColorMap,
  onStatusChange,
}: {
  appointment: CalendarAppointment | null;
  onClose: () => void;
  staffColorMap: Map<string, (typeof STAFF_COLORS)[0]>;
  onStatusChange: () => void;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!a) return null;

  const status = STATUS_CONFIG[a.status as AppointmentStatus] ?? STATUS_CONFIG.scheduled;
  const clientName = a.client
    ? `${a.client.first_name} ${a.client.last_name ?? ''}`.trim()
    : 'Клієнт';
  const formulas = a.client?.formulas as Record<string, unknown> | undefined;
  const nail = formulas?.nail as Record<string, string> | undefined;
  const allergies = (formulas?.allergies ?? []) as string[];
  const staffColor = a.staff ? staffColorMap.get(a.staff.id) : undefined;
  const duration = differenceInMinutes(new Date(a.end_time), new Date(a.start_time));

  const handleCopyPhone = async () => {
    if (a.client?.phone) {
      await navigator.clipboard.writeText(a.client.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    const supabase = createClient();
    await supabase
      .from('appointments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', a.id);
    setUpdatingStatus(false);
    onStatusChange();
  };

  const handleComplete = async () => {
    setUpdatingStatus(true);
    try {
      await fetch(`/api/appointments/${a.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch {
      // ignore
    }
    setUpdatingStatus(false);
    onStatusChange();
    onClose();
  };

  const handleCancel = async () => {
    await handleStatusChange('cancelled');
    onClose();
  };

  return (
    <AnimatePresence>
      {a && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-background fixed top-0 right-0 z-50 flex h-full w-full max-w-[380px] flex-col border-l border-[var(--glass-border)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-5 py-4">
              <h2 className="text-foreground text-base font-semibold">Деталі запису</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--glass-bg)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {/* Time */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                  <Clock className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-foreground font-mono text-lg font-bold">
                    {format(new Date(a.start_time), 'HH:mm')} –{' '}
                    {format(new Date(a.end_time), 'HH:mm')}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {format(new Date(a.start_time), 'd MMMM yyyy, EEEE', { locale: uk })} ·{' '}
                    {duration} хв
                  </p>
                </div>
              </div>

              {/* Client */}
              <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-sm font-bold text-violet-400">
                    {a.client?.first_name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-semibold">{clientName}</p>
                    {a.client?.phone && (
                      <button
                        onClick={handleCopyPhone}
                        className="text-muted-foreground hover:text-foreground mt-0.5 flex items-center gap-1 text-xs transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        {a.client.phone}
                        {copied ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Service */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Послуга
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-sm font-medium">
                    {a.service?.name ?? '—'}
                  </span>
                  <span className="text-foreground font-mono text-sm font-bold">
                    {(a.final_price ?? a.price).toLocaleString('uk-UA')} ₴
                  </span>
                </div>
              </div>

              {/* Staff */}
              {a.staff && (
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    Майстер
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: staffColor?.border ?? '#8B5CF6' }}
                    />
                    <span className="text-foreground text-sm">
                      {a.staff.first_name} {a.staff.last_name}
                    </span>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Статус
                </label>
                <select
                  value={a.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="text-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm disabled:opacity-60"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Formula */}
              {nail && Object.values(nail).some(Boolean) && (
                <div className="space-y-2">
                  <label className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase">
                    <FlaskConical className="h-3 w-3" />
                    Формула клієнта
                  </label>
                  <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {nail.base && (
                        <div>
                          <span className="text-muted-foreground">База: </span>
                          <span className="text-foreground font-medium">{nail.base}</span>
                        </div>
                      )}
                      {nail.color && (
                        <div>
                          <span className="text-muted-foreground">Колір: </span>
                          <span className="text-foreground font-medium">{nail.color}</span>
                        </div>
                      )}
                      {nail.top && (
                        <div>
                          <span className="text-muted-foreground">Топ: </span>
                          <span className="text-foreground font-medium">{nail.top}</span>
                        </div>
                      )}
                      {nail.design && (
                        <div>
                          <span className="text-muted-foreground">Дизайн: </span>
                          <span className="text-foreground font-medium">{nail.design}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Allergy */}
              {allergies.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <div>
                    <p className="text-xs font-semibold text-rose-500">Алергія</p>
                    <p className="text-xs text-rose-400">{allergies.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {a.notes && (
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    Нотатки
                  </label>
                  <p className="text-foreground text-sm">{a.notes}</p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            {a.status !== 'completed' && a.status !== 'cancelled' && (
              <div className="border-t border-[var(--glass-border)] px-5 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={updatingStatus}
                    className="text-muted-foreground hover:text-foreground flex-1 rounded-lg border border-[var(--glass-border)] px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--glass-bg)] disabled:opacity-50"
                  >
                    Скасувати
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={updatingStatus}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 disabled:opacity-50"
                  >
                    {updatingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Завершити
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
