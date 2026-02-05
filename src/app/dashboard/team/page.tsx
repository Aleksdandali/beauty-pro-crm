"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, X, Search, Phone, Instagram, Mail,
  UserPlus, Users, Calendar, Percent, Edit, Trash2,
  Clock, CheckCircle
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator, PullToRefreshWrapper } from "@/components/PullToRefresh";

const SALON_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

type Master = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  specialization: string | null;
  commission_rate: number | null;
  is_active: boolean;
  role: string;
  created_at: string;
};

export default function TeamPage() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    instagram: "",
    specialization: "",
    commission_rate: "40",
  });

  const loadMasters = async () => {
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("salon_id", SALON_ID)
      .in("role", ["master", "owner", "admin"])
      .order("full_name");

    if (error) {
      setError(error.message);
    } else {
      setMasters(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Ви не авторизовані");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("staff").insert({
      salon_id: SALON_ID,
      user_id: user.id,
      full_name: form.full_name,
      email: form.email || user.email,
      phone: form.phone || null,
      instagram: form.instagram || null,
      specialization: form.specialization || null,
      commission_rate: parseFloat(form.commission_rate) || 40,
      role: "master",
      is_active: true,
    });

    if (error) {
      alert("Помилка: " + error.message);
    } else {
      setShowAddModal(false);
      setForm({ full_name: "", email: "", phone: "", instagram: "", specialization: "", commission_rate: "40" });
      loadMasters();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити майстра?")) return;
    
    const supabase = createClient();
    const { error } = await supabase.from("staff").delete().eq("id", id);
    
    if (error) {
      alert("Помилка: " + error.message);
    } else {
      setSelectedMaster(null);
      loadMasters();
    }
  };

  const toggleActive = async (master: Master) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("staff")
      .update({ is_active: !master.is_active })
      .eq("id", master.id);
    
    if (!error) {
      loadMasters();
      if (selectedMaster?.id === master.id) {
        setSelectedMaster({ ...master, is_active: !master.is_active });
      }
    }
  };

  const filtered = masters.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: masters.length,
    active: masters.filter(m => m.is_active).length,
  };

  // Pull to refresh
  const handleRefresh = async () => {
    await loadMasters();
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Команда</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Управляйте майстрами салону</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
            >
              <UserPlus size={18} />
              Додати майстра
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
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
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Активних</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Пошук..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
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
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-12 sm:py-16 px-4 bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10">
                <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Немає майстрів</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Додайте першого майстра</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg"
                >
                  <Plus size={18} />
                  Додати
                </button>
              </div>
            ) : (
              filtered.map((master) => (
                <div
                  key={master.id}
                  onClick={() => setSelectedMaster(master)}
                  className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-base sm:text-lg flex-shrink-0">
                        {master.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{master.full_name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{master.specialization || "Майстер"}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      master.is_active 
                        ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400" 
                        : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                    }`}>
                      {master.is_active ? "Активний" : "Неактивний"}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {master.phone && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Phone size={14} className="flex-shrink-0" />
                        <span className="truncate">{master.phone}</span>
                      </div>
                    )}
                    {master.commission_rate && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Percent size={14} className="flex-shrink-0" />
                        <span>Комісія: {master.commission_rate}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#111111] rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Новий майстер</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Повне ім'я <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Олена Коваленко"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Спеціалізація</label>
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Манікюр, педикюр"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Телефон</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="+380671234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Instagram</label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Комісія (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.commission_rate}
                    onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/20"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    {saving ? "Зберігаю..." : "Додати"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Master Detail */}
        {selectedMaster && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setSelectedMaster(null)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0a0a0a] shadow-2xl overflow-y-auto border-l border-gray-200 dark:border-white/10">
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl sm:text-2xl font-medium flex-shrink-0">
                      {selectedMaster.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{selectedMaster.full_name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedMaster.specialization || "Майстер"}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMaster(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg flex-shrink-0">
                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <span className="font-medium text-gray-900 dark:text-white">Статус</span>
                    <button
                      onClick={() => toggleActive(selectedMaster)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedMaster.is_active
                          ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {selectedMaster.is_active ? "Активний" : "Неактивний"}
                    </button>
                  </div>

                  {/* Contacts */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Контакти</h3>
                    <div className="space-y-2">
                      {selectedMaster.phone && (
                        <a href={`tel:${selectedMaster.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
                          <Phone size={18} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{selectedMaster.phone}</span>
                        </a>
                      )}
                      {selectedMaster.email && (
                        <a href={`mailto:${selectedMaster.email}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
                          <Mail size={18} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white truncate">{selectedMaster.email}</span>
                        </a>
                      )}
                      {selectedMaster.instagram && (
                        <a href={`https://instagram.com/${selectedMaster.instagram}`} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
                          <Instagram size={18} className="text-pink-500" />
                          <span className="text-gray-900 dark:text-white">@{selectedMaster.instagram}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Commission */}
                  {selectedMaster.commission_rate && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Percent size={18} />
                        <span className="font-medium">Комісія: {selectedMaster.commission_rate}%</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium">
                      <Calendar size={18} />
                      Розклад
                    </button>
                    <button className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20">
                      <Edit size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedMaster.id)}
                      className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20"
                    >
                      <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
        <Toaster />
          </div>
        </div>
      </PullToRefreshWrapper>
    </>
  );
}
