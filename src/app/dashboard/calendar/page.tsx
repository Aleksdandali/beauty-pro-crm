"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, User,
  Scissors, Calendar as CalendarIcon, Check, XCircle,
  Phone, MoreVertical, AlertCircle
} from "lucide-react";

const SALON_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

type Appointment = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  notes: string | null;
  client: { id: string; full_name: string; phone: string } | null;
  staff: { id: string; first_name: string; last_name: string } | null;
  service: { id: string; name: string; duration: number; color: string } | null;
};

type Client = { id: string; full_name: string; phone: string };
type Staff = { id: string; first_name: string; last_name: string };
type Service = { id: string; name: string; duration: number; price: number; color: string };

const STATUSES = {
  scheduled: { label: "Заплановано", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  confirmed: { label: "Підтверджено", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  in_progress: { label: "В процесі", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  completed: { label: "Завершено", color: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400" },
  cancelled: { label: "Скасовано", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
  no_show: { label: "Не прийшов", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("uk-UA", { weekday: "short", day: "numeric", month: "short" });
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);

  // Дані для форми
  const [clients, setClients] = useState<Client[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [form, setForm] = useState({
    client_id: "",
    staff_id: "",
    service_id: "",
    date: "",
    time: "10:00",
    notes: "",
  });

  // Завантаження записів
  const loadAppointments = async () => {
    setLoading(true);
    const supabase = createClient();

    // Визначити діапазон дат
    let startDate: Date, endDate: Date;
    if (viewMode === "day") {
      startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (viewMode === "week") {
      // Тиждень
      startDate = new Date(currentDate);
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Місяць
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        client:clients(id, full_name, phone),
        staff:staff(id, first_name, last_name),
        service:services(id, name, duration, color)
      `)
      .eq("salon_id", SALON_ID)
      .gte("start_time", startDate.toISOString())
      .lte("start_time", endDate.toISOString())
      .order("start_time", { ascending: true });

    if (!error) {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  // Завантаження даних для форми
  const loadFormData = async () => {
    const supabase = createClient();
    
    const [clientsRes, staffRes, servicesRes] = await Promise.all([
      supabase.from("clients").select("id, full_name, phone").eq("salon_id", SALON_ID),
      supabase.from("staff").select("id, first_name, last_name").eq("salon_id", SALON_ID),
      supabase.from("services").select("id, name, duration, price, color").eq("salon_id", SALON_ID),
    ]);

    setClients(clientsRes.data || []);
    setStaffList(staffRes.data || []);
    setServices(servicesRes.data || []);
  };

  useEffect(() => {
    loadAppointments();
  }, [currentDate, viewMode]);

  useEffect(() => {
    loadFormData();
  }, []);

  // Навігація
  const goToday = () => setCurrentDate(new Date());
  
  const goPrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };
  
  const goNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Відкрити модалку для нового запису
  const openNewModal = (date?: Date, hour?: number) => {
    const d = date || currentDate;
    setForm({
      client_id: "",
      staff_id: "",
      service_id: "",
      date: d.toISOString().split("T")[0],
      time: hour ? `${hour.toString().padStart(2, "0")}:00` : "10:00",
      notes: "",
    });
    setSelectedAppointment(null);
    setShowModal(true);
  };

  // Зберегти запис
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const service = services.find(s => s.id === form.service_id);
    const startTime = new Date(`${form.date}T${form.time}`);
    const endTime = new Date(startTime.getTime() + (service?.duration || 60) * 60000);

    const supabase = createClient();
    const appointmentData = {
      salon_id: SALON_ID,
      client_id: form.client_id || null,
      staff_id: form.staff_id || null,
      service_id: form.service_id || null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      price: service?.price || 0,
      notes: form.notes || null,
      status: "scheduled",
    };

    let error;
    if (selectedAppointment) {
      const { error: updateError } = await supabase
        .from("appointments")
        .update(appointmentData)
        .eq("id", selectedAppointment.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("appointments")
        .insert(appointmentData);
      error = insertError;
    }

    if (error) {
      alert("Помилка: " + error.message);
    } else {
      setShowModal(false);
      loadAppointments();
    }
    setSaving(false);
  };

  // Змінити статус
  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from("appointments").update({ status }).eq("id", id);
    loadAppointments();
  };

  // Видалити запис
  const deleteAppointment = async (id: string) => {
    if (!confirm("Видалити запис?")) return;
    const supabase = createClient();
    await supabase.from("appointments").delete().eq("id", id);
    setSelectedAppointment(null);
    loadAppointments();
  };

  // Отримати записи для години
  const getAppointmentsForHour = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return isSameDay(aptDate, date) && aptDate.getHours() === hour;
    });
  };

  // Дні тижня
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  // Дні місяця
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Перший день місяця
    const firstDay = new Date(year, month, 1);
    // Останній день місяця
    const lastDay = new Date(year, month + 1, 0);
    
    // День тижня першого дня (0 = неділя, 1 = понеділок)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Конвертуємо в понеділок = 0
    
    const days: (Date | null)[] = [];
    
    // Пусті клітинки до першого дня
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Дні місяця
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date();

  return (
    <div className="min-h-full pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Календар</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {currentDate.toLocaleDateString("uk-UA", { month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => openNewModal()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
          >
            <Plus size={18} />
            Новий запис
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={goToday}
                className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
              >
                Сьогодні
              </button>
              <button
                onClick={goNext}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Date display */}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {viewMode === "day" 
                ? currentDate.toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" })
                : viewMode === "week"
                ? `${weekDays[0].toLocaleDateString("uk-UA", { day: "numeric", month: "short" })} - ${weekDays[6].toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}`
                : currentDate.toLocaleDateString("uk-UA", { month: "long", year: "numeric" })
              }
            </h2>

            {/* View mode */}
            <div className="flex bg-gray-100 dark:bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("day")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "day"
                    ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                День
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "week"
                    ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Тиждень
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "month"
                    ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Місяць
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : viewMode === "day" ? (
            /* Day View */
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {HOURS.map(hour => {
                const hourAppointments = getAppointmentsForHour(currentDate, hour);
                return (
                  <div
                    key={hour}
                    className="flex min-h-[80px] hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => openNewModal(currentDate, hour)}
                  >
                    <div className="w-20 flex-shrink-0 p-3 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-white/5">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    <div className="flex-1 p-2 space-y-1">
                      {hourAppointments.map(apt => (
                        <div
                          key={apt.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); }}
                          className="p-3 rounded-lg cursor-pointer transition-all hover:shadow-md"
                          style={{ backgroundColor: apt.service?.color + "20", borderLeft: `4px solid ${apt.service?.color || "#8B5CF6"}` }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {apt.client?.full_name || "Клієнт не вказаний"}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUSES[apt.status as keyof typeof STATUSES]?.color}`}>
                              {STATUSES[apt.status as keyof typeof STATUSES]?.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatTime(apt.start_time)} - {formatTime(apt.end_time)} • {apt.service?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {apt.staff?.first_name} {apt.staff?.last_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Week View */
            <div>
              {/* Header */}
              <div className="grid grid-cols-8 border-b border-gray-200 dark:border-white/10">
                <div className="p-3"></div>
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className={`p-3 text-center border-l border-gray-100 dark:border-white/5 ${
                      isSameDay(day, today) ? "bg-violet-50 dark:bg-violet-500/10" : ""
                    }`}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                      {day.toLocaleDateString("uk-UA", { weekday: "short" })}
                    </div>
                    <div className={`text-lg font-semibold mt-1 ${
                      isSameDay(day, today) ? "text-violet-600 dark:text-violet-400" : "text-gray-900 dark:text-white"
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              {/* Time slots */}
              <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[600px] overflow-y-auto">
                {HOURS.map(hour => (
                  <div key={hour} className="grid grid-cols-8 min-h-[60px]">
                    <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-white/5">
                      {hour}:00
                    </div>
                    {weekDays.map((day, i) => {
                      const dayAppointments = getAppointmentsForHour(day, hour);
                      return (
                        <div
                          key={i}
                          className="p-1 border-l border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                          onClick={() => openNewModal(day, hour)}
                        >
                          {dayAppointments.map(apt => (
                            <div
                              key={apt.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); }}
                              className="text-xs p-1 rounded truncate mb-1"
                              style={{ backgroundColor: apt.service?.color + "30", color: apt.service?.color }}
                            >
                              {apt.client?.full_name?.split(" ")[0]}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Month View */
            <div>
              {/* Header з днями тижня */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/10">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((day, i) => (
                  <div key={i} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {day}
                  </div>
                ))}
              </div>
              {/* Дні місяця */}
              <div className="grid grid-cols-7">
                {getMonthDays().map((day, i) => {
                  const dayAppointments = day ? appointments.filter(apt => isSameDay(new Date(apt.start_time), day)) : [];
                  const isToday = day && isSameDay(day, today);
                  
                  return (
                    <div
                      key={i}
                      className={`min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-white/5 ${
                        day ? "hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer" : "bg-gray-50 dark:bg-white/5"
                      } ${isToday ? "bg-violet-50 dark:bg-violet-500/10" : ""}`}
                      onClick={() => day && (setCurrentDate(day), setViewMode("day"))}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isToday 
                              ? "w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center" 
                              : "text-gray-900 dark:text-white"
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map(apt => (
                              <div
                                key={apt.id}
                                className="text-xs p-1 rounded truncate"
                                style={{ backgroundColor: apt.service?.color + "30", color: apt.service?.color }}
                                onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); }}
                              >
                                {formatTime(apt.start_time)} {apt.client?.full_name?.split(" ")[0]}
                              </div>
                            ))}
                            {dayAppointments.length > 3 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                +{dayAppointments.length - 3} ще
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* New/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#111111] rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedAppointment ? "Редагувати запис" : "Новий запис"}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Клієнт</label>
                  <select
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="">Оберіть клієнта</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} • {c.phone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Послуга *</label>
                  <select
                    required
                    value={form.service_id}
                    onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="">Оберіть послугу</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} • {s.duration} хв • ₴{s.price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Майстер</label>
                  <select
                    value={form.staff_id}
                    onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="">Оберіть майстра</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Дата *</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Час *</label>
                    <select
                      required
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      {HOURS.flatMap(h => ["00", "30"].map(m => (
                        <option key={`${h}:${m}`} value={`${h.toString().padStart(2, "0")}:${m}`}>
                          {h.toString().padStart(2, "0")}:{m}
                        </option>
                      )))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Нотатки</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                    rows={2}
                    placeholder="Додаткова інформація..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    {saving ? "..." : "Зберегти"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Appointment Detail Slide-over */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAppointment(null)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0a0a0a] shadow-2xl border-l border-gray-200 dark:border-white/10 overflow-y-auto">
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedAppointment.client?.full_name || "Клієнт не вказаний"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(selectedAppointment.start_time).toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Time */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <Clock className="text-gray-400" size={24} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round((new Date(selectedAppointment.end_time).getTime() - new Date(selectedAppointment.start_time).getTime()) / 60000)} хв
                      </p>
                    </div>
                  </div>

                  {/* Service */}
                  {selectedAppointment.service && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedAppointment.service.color + "20" }}>
                        <Scissors size={20} style={{ color: selectedAppointment.service.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.service.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">₴{selectedAppointment.price}</p>
                      </div>
                    </div>
                  )}

                  {/* Staff */}
                  {selectedAppointment.staff && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-medium">
                        {selectedAppointment.staff.first_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedAppointment.staff.first_name} {selectedAppointment.staff.last_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Майстер</p>
                      </div>
                    </div>
                  )}

                  {/* Client contact */}
                  {selectedAppointment.client && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Контакт</h3>
                      <a href={`tel:${selectedAppointment.client.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
                        <Phone className="text-gray-400" size={18} />
                        <span className="text-gray-900 dark:text-white">{selectedAppointment.client.phone}</span>
                      </a>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Статус</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STATUSES).map(([key, { label, color }]) => (
                        <button
                          key={key}
                          onClick={() => updateStatus(selectedAppointment.id, key)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedAppointment.status === key
                              ? color + " ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-600"
                              : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 flex gap-3">
                  <button
                    onClick={() => {
                      setForm({
                        client_id: selectedAppointment.client?.id || "",
                        staff_id: selectedAppointment.staff?.id || "",
                        service_id: selectedAppointment.service?.id || "",
                        date: new Date(selectedAppointment.start_time).toISOString().split("T")[0],
                        time: formatTime(selectedAppointment.start_time),
                        notes: selectedAppointment.notes || "",
                      });
                      setShowModal(true);
                    }}
                    className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => deleteAppointment(selectedAppointment.id)}
                    className="px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-medium"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
