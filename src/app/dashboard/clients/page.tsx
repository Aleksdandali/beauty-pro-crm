"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, X, Search, Phone, Instagram, MessageCircle, 
  Calendar, Edit, Trash2, UserPlus, Users, TrendingUp,
  ChevronRight, Clock
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator, PullToRefreshWrapper } from "@/components/PullToRefresh";

const SALON_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

type Client = {
  id: string;
  full_name: string;
  phone: string;
  instagram: string | null;
  telegram: string | null;
  notes: string | null;
  rfm_segment: string;
  total_visits: number;
  total_spent: number;
  created_at: string;
};

const RFM_INFO: Record<string, { color: string; bg: string; label: string; desc: string }> = {
  VIP: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", label: "VIP", desc: "Найкращі клієнти" },
  Loyal: { color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20", label: "Лояльний", desc: "Постійні клієнти" },
  Regular: { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20", label: "Регулярний", desc: "Приходять час від часу" },
  Sleeping: { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20", label: "Сплячий", desc: "Давно не відвідували" },
  Lost: { color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", label: "Втрачений", desc: "Потрібна реактивація" },
  New: { color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20", label: "Новий", desc: "Нещодавно доданий" },
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSegment, setFilterSegment] = useState<string>("all");
  
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    instagram: "",
    telegram: "",
    notes: "",
  });

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("salon_id", SALON_ID)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.from("clients").insert({
      salon_id: SALON_ID,
      full_name: form.full_name,
      phone: form.phone,
      instagram: form.instagram || null,
      telegram: form.telegram || null,
      notes: form.notes || null,
      rfm_segment: "New",
      total_visits: 0,
      total_spent: 0,
    });

    if (error) {
      alert("Помилка: " + error.message);
    } else {
      setShowAddModal(false);
      setForm({ full_name: "", phone: "", instagram: "", telegram: "", notes: "" });
      loadClients();
    }
    setSaving(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("clients")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        instagram: form.instagram || null,
        telegram: form.telegram || null,
        notes: form.notes || null,
      })
      .eq("id", editingClient.id);

    if (error) {
      alert("Помилка: " + error.message);
    } else {
      setEditingClient(null);
      setSelectedClient(null);
      setForm({ full_name: "", phone: "", instagram: "", telegram: "", notes: "" });
      loadClients();
    }
    setSaving(false);
  };

  const openEditModal = (client: Client) => {
    setForm({
      full_name: client.full_name,
      phone: client.phone,
      instagram: client.instagram || "",
      telegram: client.telegram || "",
      notes: client.notes || "",
    });
    setEditingClient(client);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити клієнта?")) return;
    
    const supabase = createClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);
    
    if (error) {
      alert("Помилка: " + error.message);
    } else {
      setSelectedClient(null);
      loadClients();
    }
  };

  const filtered = clients.filter((c) => {
    const matchesSearch = 
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesSegment = filterSegment === "all" || c.rfm_segment === filterSegment;
    return matchesSearch && matchesSegment;
  });

  const stats = {
    total: clients.length,
    newThisMonth: clients.filter(c => {
      const created = new Date(c.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    totalSpent: clients.reduce((sum, c) => sum + c.total_spent, 0),
  };

  const getRfmInfo = (segment: string) => RFM_INFO[segment] || RFM_INFO.New;

  // Pull to refresh
  const handleRefresh = async () => {
    await loadClients();
  };

  const { isRefreshing, pullDistance, threshold } = usePullToRefresh(handleRefresh);

  return (
    <>
      <PullToRefreshIndicator 
        isRefreshing={isRefreshing} 
        pullDistance={pullDistance} 
        threshold={threshold}
      />
      <PullToRefreshWrapper pullDistance={pullDistance} isRefreshing={isRefreshing}>
        <div className="min-h-full pb-safe">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            
            {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Клієнти</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Управляйте базою клієнтів
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
            >
              <UserPlus size={18} />
              Додати клієнта
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-[#111111] rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                  <Users className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Всього</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg">
                  <UserPlus className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Нових</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.newThisMonth}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-white/10 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg">
                  <TrendingUp className="text-amber-600 dark:text-amber-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Дохід</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">₴{stats.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Пошук..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>
            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="all">Всі сегменти</option>
              <option value="VIP">⭐ VIP</option>
              <option value="Loyal">💚 Лояльні</option>
              <option value="Regular">💙 Регулярні</option>
              <option value="Sleeping">🟠 Сплячі</option>
              <option value="Lost">🔴 Втрачені</option>
              <option value="New">🆕 Нові</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl mb-4">
            Помилка: {error}
            <button onClick={loadClients} className="ml-4 underline">Спробувати знову</button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
                <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {search || filterSegment !== "all" ? "Нічого не знайдено" : "Поки немає клієнтів"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {search || filterSegment !== "all" 
                    ? "Змініть параметри пошуку" 
                    : "Додайте першого клієнта"}
                </p>
                {!search && filterSegment === "all" && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
                  >
                    <Plus size={18} />
                    Додати
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                    <tr>
                      <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Клієнт</th>
                      <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Контакти</th>
                      <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Сегмент</th>
                      <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Стат.</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filtered.map((client) => {
                      const rfm = getRfmInfo(client.rfm_segment);
                      return (
                        <tr 
                          key={client.id} 
                          className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => setSelectedClient(client)}
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                {client.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">{client.full_name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 sm:hidden truncate">{client.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                              <Phone size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{client.phone}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${rfm.bg} ${rfm.color}`}>
                              {rfm.label}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {client.total_visits} віз. • ₴{client.total_spent}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                            <ChevronRight className="text-gray-400" size={18} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#111111] rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Новий клієнт</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Ім'я <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Олена Петренко"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="+380671234567"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Instagram</label>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Telegram</label>
                    <input
                      type="text"
                      value={form.telegram}
                      onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Нотатки</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                    rows={3}
                    placeholder="Алергії, побажання..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Зберігаю..." : "Додати"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingClient && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-[#111111] rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Редагувати</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{editingClient.full_name}</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingClient(null);
                    setForm({ full_name: "", phone: "", instagram: "", telegram: "", notes: "" });
                  }} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Ім'я <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Instagram</label>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Telegram</label>
                    <input
                      type="text"
                      value={form.telegram}
                      onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Нотатки</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingClient(null);
                      setForm({ full_name: "", phone: "", instagram: "", telegram: "", notes: "" });
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Зберігаю..." : "Зберегти"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Client Detail Slide-over */}
        {selectedClient && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0a0a0a] shadow-2xl overflow-y-auto border-l border-gray-200 dark:border-white/10">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-lg sm:text-xl font-medium flex-shrink-0">
                        {selectedClient.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{selectedClient.full_name}</h2>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${getRfmInfo(selectedClient.rfm_segment).bg} ${getRfmInfo(selectedClient.rfm_segment).color}`}>
                          {getRfmInfo(selectedClient.rfm_segment).label}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedClient(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg flex-shrink-0"
                    >
                      <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Контакти</h3>
                    <div className="space-y-2">
                      <a href={`tel:${selectedClient.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <Phone className="text-gray-400" size={18} />
                        <span className="text-gray-900 dark:text-white">{selectedClient.phone}</span>
                      </a>
                      {selectedClient.instagram && (
                        <a href={`https://instagram.com/${selectedClient.instagram}`} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                          <Instagram className="text-pink-500" size={18} />
                          <span className="text-gray-900 dark:text-white">@{selectedClient.instagram}</span>
                        </a>
                      )}
                      {selectedClient.telegram && (
                        <a href={`https://t.me/${selectedClient.telegram}`} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                          <MessageCircle className="text-blue-500" size={18} />
                          <span className="text-gray-900 dark:text-white">@{selectedClient.telegram}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Статистика</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Візитів</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedClient.total_visits}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Витрачено</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₴{selectedClient.total_spent}</p>
                      </div>
                    </div>
                  </div>

                  {/* RFM Info */}
                  <div className={`p-4 rounded-xl border ${getRfmInfo(selectedClient.rfm_segment).bg}`}>
                    <p className={`text-sm font-medium ${getRfmInfo(selectedClient.rfm_segment).color}`}>
                      {getRfmInfo(selectedClient.rfm_segment).desc}
                    </p>
                  </div>

                  {/* Notes */}
                  {selectedClient.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Нотатки</h3>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-4 rounded-xl">{selectedClient.notes}</p>
                    </div>
                  )}

                  {/* History */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Історія</h3>
                    <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <Clock className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Історія візитів з'явиться пізніше</p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 sm:p-6 border-t border-gray-200 dark:border-white/10">
                  <div className="flex gap-3">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors">
                      <Calendar size={18} />
                      Записати
                    </button>
                    <button 
                      onClick={() => openEditModal(selectedClient)}
                      className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      <Edit size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedClient.id)}
                      className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

            <Toaster />
          </div>
        </div>
      </PullToRefreshWrapper>
    </>
  );
}
