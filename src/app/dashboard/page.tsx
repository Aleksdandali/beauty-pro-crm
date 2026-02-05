"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const SALON_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

// Helper to format time
function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper to format relative time
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "щойно";
  if (diffMins < 60) return `${diffMins} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  return `${diffDays} дн тому`;
}

// Dashboard Stats Hook
function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats", SALON_ID],
    queryFn: async () => {
      const supabase = createClient();

      // Calculate date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      // 1. Total Revenue (last 30 days, completed appointments)
      const { data: revenueData, error: revenueError } = await supabase
        .from("appointments")
        .select("price")
        .eq("salon_id", SALON_ID)
        .eq("status", "completed")
        .gte("start_time", thirtyDaysAgo.toISOString());

      if (revenueError) throw revenueError;

      const totalRevenue = revenueData?.reduce((sum, a) => sum + (a.price || 0), 0) || 0;

      // 2. Active Clients count
      const { count: clientsCount, error: clientsError } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", SALON_ID);

      if (clientsError) throw clientsError;

      // 3. Today's appointments count
      const { count: todayCount, error: todayError } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", SALON_ID)
        .gte("start_time", todayStart.toISOString())
        .lt("start_time", tomorrowStart.toISOString());

      if (todayError) throw todayError;

      // 4. Last month appointments for growth calculation
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: lastMonthData } = await supabase
        .from("appointments")
        .select("price")
        .eq("salon_id", SALON_ID)
        .eq("status", "completed")
        .gte("start_time", sixtyDaysAgo.toISOString())
        .lt("start_time", thirtyDaysAgo.toISOString());

      const lastMonthRevenue = lastMonthData?.reduce((sum, a) => sum + (a.price || 0), 0) || 0;
      const revenueGrowth = lastMonthRevenue > 0 
        ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) 
        : 0;

      return {
        totalRevenue,
        activeClients: clientsCount || 0,
        todayAppointments: todayCount || 0,
        revenueGrowth,
      };
    },
    staleTime: 60000, // 1 minute
  });
}

// Today's Schedule Hook
function useTodaySchedule() {
  return useQuery({
    queryKey: ["today-schedule", SALON_ID],
    queryFn: async () => {
      const supabase = createClient();

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          start_time,
          status,
          client:clients(full_name),
          service:services(name)
        `)
        .eq("salon_id", SALON_ID)
        .gte("start_time", todayStart.toISOString())
        .lt("start_time", tomorrowStart.toISOString())
        .order("start_time", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000, // 30 seconds
  });
}

// Recent Activity Hook
function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity", SALON_ID],
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          status,
          created_at,
          client:clients(full_name)
        `)
        .eq("salon_id", SALON_ID)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });
}

// Inventory Alerts Hook
function useInventoryAlerts() {
  return useQuery({
    queryKey: ["inventory-alerts", SALON_ID],
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("inventory_products")
        .select(`
          id,
          name,
          quantity,
          min_quantity,
          brand:inventory_brands(name)
        `)
        .eq("salon_id", SALON_ID)
        .order("quantity", { ascending: true })
        .limit(4);

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000, // 5 minutes
  });
}

// Status to action text
function getStatusAction(status: string) {
  switch (status) {
    case "scheduled":
      return "Запис створено";
    case "confirmed":
      return "Запис підтверджено";
    case "completed":
      return "Оплату отримано";
    case "cancelled":
      return "Запис скасовано";
    case "no_show":
      return "Клієнт не прийшов";
    default:
      return "Новий запис";
  }
}

// Loading skeleton component
function StatCardSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-zinc-200 rounded w-24" />
        <div className="h-4 bg-zinc-200 rounded w-10" />
      </div>
      <div className="h-8 bg-zinc-200 rounded w-32 mb-1" />
      <div className="h-3 bg-zinc-200 rounded w-20" />
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 md:gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg animate-pulse">
      <div className="h-4 bg-zinc-200 rounded w-12" />
      <div className="flex-1">
        <div className="h-4 bg-zinc-200 rounded w-32 mb-1" />
        <div className="h-3 bg-zinc-200 rounded w-24" />
      </div>
      <div className="h-6 bg-zinc-200 rounded w-16" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: schedule, isLoading: scheduleLoading } = useTodaySchedule();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  const { data: inventory, isLoading: inventoryLoading } = useInventoryAlerts();

  return (
    <div>
      {/* Desktop Header */}
      <div className="mb-8 hidden md:block">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
          Overview
        </h1>
        <p className="text-base text-zinc-600">Welcome back! Here's your salon performance</p>
      </div>

      {/* Mobile Title */}
      <div className="mb-6 md:hidden">
        <h1 className="text-xl font-bold text-black tracking-tight">
          Beauty Pro CRM
        </h1>
        <p className="text-sm text-zinc-600 mt-1">Панель керування салоном</p>
      </div>

      {/* Error State */}
      {statsError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Помилка завантаження даних. Спробуйте оновити сторінку.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs md:text-sm font-medium text-zinc-500">Total Revenue</div>
                <span className={`text-xs font-medium ${(stats?.revenueGrowth || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {(stats?.revenueGrowth || 0) >= 0 ? '+' : ''}{stats?.revenueGrowth || 0}%
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
                ₴ {(stats?.totalRevenue || 0).toLocaleString("uk-UA")}
              </div>
              <div className="text-xs text-zinc-500">Останні 30 днів</div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs md:text-sm font-medium text-zinc-500">Active Clients</div>
                <span className="text-emerald-600 text-xs font-medium">Total</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
                {stats?.activeClients || 0}
              </div>
              <div className="text-xs text-zinc-500">Зареєстровані клієнти</div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs md:text-sm font-medium text-zinc-500">Appointments</div>
                <span className="text-blue-600 text-xs font-medium">Сьогодні</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
                {stats?.todayAppointments || 0}
              </div>
              <div className="text-xs text-zinc-500">Записів на сьогодні</div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Today's Schedule */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold text-zinc-900 mb-4">
            Розклад на сьогодні
          </h2>
          <div className="space-y-2 md:space-y-3">
            {scheduleLoading ? (
              <>
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </>
            ) : schedule && schedule.length > 0 ? (
              schedule.map((appt: any) => (
                <div key={appt.id} className="flex items-center gap-3 md:gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <div className="text-xs md:text-sm font-semibold text-zinc-900 w-12 md:w-14">
                    {formatTime(appt.start_time)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 text-xs md:text-sm truncate">
                      {appt.client?.full_name || "Клієнт"}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {appt.service?.name || "Послуга"}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap ${
                    appt.status === 'confirmed' || appt.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700' 
                      : appt.status === 'cancelled' || appt.status === 'no_show'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appt.status === 'confirmed' ? 'Підтверджено' : 
                     appt.status === 'completed' ? 'Завершено' :
                     appt.status === 'cancelled' ? 'Скасовано' :
                     appt.status === 'no_show' ? 'Не прийшов' :
                     'Очікує'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-400 text-sm">
                Немає записів на сьогодні
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold text-zinc-900 mb-4">
            Остання активність
          </h2>
          <div className="space-y-2 md:space-y-3">
            {activityLoading ? (
              <>
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </>
            ) : activity && activity.length > 0 ? (
              activity.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 md:gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {item.client?.full_name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 text-xs md:text-sm truncate">
                      {item.client?.full_name || "Клієнт"}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {getStatusAction(item.status)}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 whitespace-nowrap">
                    {formatRelativeTime(item.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-400 text-sm">
                Немає останньої активності
              </div>
            )}
          </div>
        </div>

        {/* Inventory Alert */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 md:p-6 shadow-sm lg:col-start-1">
          <h2 className="text-sm md:text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <span>📦</span> Стан Інвентарю
          </h2>
          <div className="space-y-2 md:space-y-3">
            {inventoryLoading ? (
              <>
                <ListItemSkeleton />
                <ListItemSkeleton />
              </>
            ) : inventory && inventory.length > 0 ? (
              inventory.map((item: any) => {
                const status = item.quantity <= 0 ? 'critical' : 
                               item.quantity <= item.min_quantity ? 'low' : 'ok';
                return (
                  <div key={item.id} className="flex items-center gap-3 md:gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-900 text-xs md:text-sm truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {item.brand?.name || "Бренд"}
                      </div>
                    </div>
                    <div className={`text-sm md:text-base font-bold whitespace-nowrap ${
                      status === 'critical' ? 'text-red-600' : 
                      status === 'low' ? 'text-orange-600' :
                      'text-emerald-600'
                    }`}>
                      {item.quantity} шт
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-zinc-400 text-sm">
                Інвентар не налаштовано
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
