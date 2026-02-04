"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, X, Search, Phone, Instagram, MessageCircle, 
  Calendar, Edit, Trash2, UserPlus, Users, TrendingUp,
  ChevronRight, Star, Clock
} from "lucide-react";

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

// RFM сегменти з описами
const RFM_INFO: Record<string, { color: string; bg: string; label: string; desc: string }> = {
  VIP: { 
    color: "text-amber-700", 
    bg: "bg-amber-50 border-amber-200", 
    label: "VIP", 
    desc: "Найкращі клієнти — часто відвідують і багато витрачають" 
  },
  Loyal: { 
    color: "text-green-700", 
    bg: "bg-green-50 border-green-200", 
    label: "Лояльний", 
    desc: "Постійні клієнти з регулярними візитами" 
  },
  Regular: { 
    color: "text-blue-700", 
    bg: "bg-blue-50 border-blue-200", 
    label: "Регулярний", 
    desc: "Приходять час від часу" 
  },
  Sleeping: { 
    color: "text-orange-700", 
    bg: "bg-orange-50 border-orange-200", 
    label: "Сплячий", 
    desc: "Давно не відвідували — час нагадати про себе!" 
  },
  Lost: { 
    color: "text-red-700", 
    bg: "bg-red-50 border-red-200", 
    label: "Втрачений", 
    desc: "Дуже давно не були — потрібна реактивація" 
  },
  New: { 
    color: "text-purple-700", 
    bg: "bg-purple-50 border-purple-200", 
    label: "Новий", 
    desc: "Нещодавно доданий клієнт" 
  },
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

  // Фільтрація
  const filtered = clients.filter((c) => {
    const matchesSearch = 
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesSegment = filterSegment === "all" || c.rfm_segment === filterSegment;
    return matchesSearch && matchesSegment;
  });

  // Статистика
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Клієнти</h1>
              <p className="text-gray-500 mt-1">
                Управляйте базою клієнтів вашого салону
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-medium shadow-sm hover:shadow-md"
            >
              <UserPlus size={18} />
              Додати клієнта
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Всього клієнтів</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <UserPlus className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Нових цього місяця</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newThisMonth}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <TrendingUp className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Загальний дохід</p>
                  <p className="text-2xl font-bold text-gray-900">₴{stats.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Пошук по імені або телефону..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
            </div>
            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4">
            Помилка: {error}
            <button onClick={loadClients} className="ml-4 underline">Спробувати знову</button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {search || filterSegment !== "all" ? "Нічого не знайдено" : "Поки немає клієнтів"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {search || filterSegment !== "all" 
                    ? "Спробуйте змінити параметри пошуку" 
                    : "Додайте першого клієнта, щоб почати роботу"}
                </p>
                {!search && filterSegment === "all" && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
                  >
                    <Plus size={18} />
                    Додати клієнта
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Клієнт</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Контакти</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Сегмент</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Статистика</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((client) => {
                    const rfm = getRfmInfo(client.rfm_segment);
                    return (
                      <tr 
                        key={client.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedClient(client)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-medium">
                              {client.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{client.full_name}</p>
                              <p className="text-sm text-gray-500 md:hidden">{client.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone size={14} />
                              {client.phone}
                            </span>
                            {client.instagram && (
                              <span className="flex items-center gap-1 text-sm text-pink-600">
                                <Instagram size={14} />
                                {client.instagram}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${rfm.bg} ${rfm.color}`}>
                            {rfm.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="text-sm">
                            <span className="text-gray-500">{client.total_visits} візитів</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="font-medium text-gray-900">₴{client.total_spent}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="text-gray-400" size={20} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Новий клієнт</h2>
                  <p className="text-sm text-gray-500">Заповніть інформацію про клієнта</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Повне ім'я <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    placeholder="Олена Петренко"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    placeholder="+380 67 123 4567"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={form.instagram}
                        onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telegram</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={form.telegram}
                        onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Нотатки</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    rows={3}
                    placeholder="Алергії, побажання, особливості..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Зберігаю..." : "Додати клієнта"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {editingClient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Редагувати клієнта</h2>
                  <p className="text-sm text-gray-500">{editingClient.full_name}</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingClient(null);
                    setForm({ full_name: "", phone: "", instagram: "", telegram: "", notes: "" });
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Повне ім'я <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telegram</label>
                    <input
                      type="text"
                      value={form.telegram}
                      onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Нотатки</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
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
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xl font-medium">
                        {selectedClient.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedClient.full_name}</h2>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${getRfmInfo(selectedClient.rfm_segment).bg} ${getRfmInfo(selectedClient.rfm_segment).color}`}>
                          {getRfmInfo(selectedClient.rfm_segment).label}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedClient(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Контакти</h3>
                    <div className="space-y-3">
                      <a href={`tel:${selectedClient.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Phone className="text-gray-400" size={18} />
                        <span className="text-gray-900">{selectedClient.phone}</span>
                      </a>
                      {selectedClient.instagram && (
                        <a href={`https://instagram.com/${selectedClient.instagram}`} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <Instagram className="text-pink-500" size={18} />
                          <span className="text-gray-900">@{selectedClient.instagram}</span>
                        </a>
                      )}
                      {selectedClient.telegram && (
                        <a href={`https://t.me/${selectedClient.telegram}`} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <MessageCircle className="text-blue-500" size={18} />
                          <span className="text-gray-900">@{selectedClient.telegram}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Статистика</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Візитів</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedClient.total_visits}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Витрачено</p>
                        <p className="text-2xl font-bold text-gray-900">₴{selectedClient.total_spent}</p>
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
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Нотатки</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedClient.notes}</p>
                    </div>
                  )}

                  {/* History (placeholder) */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Історія візитів</h3>
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                      <p className="text-sm text-gray-500">Історія візитів з'явиться після підключення модуля записів</p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800">
                      <Calendar size={18} />
                      Записати
                    </button>
                    <button 
                      onClick={() => openEditModal(selectedClient)}
                      className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200"
                    >
                      <Edit size={18} className="text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedClient.id)}
                      className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
