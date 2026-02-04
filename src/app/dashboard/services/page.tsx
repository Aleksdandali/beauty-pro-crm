"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, X, Search, Clock, DollarSign, Scissors,
  Edit, Trash2, ChevronRight, Palette, MoreVertical,
  Tag, Filter
} from "lucide-react";

const SALON_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration: number;
  price: number;
  is_active: boolean;
  color: string;
  created_at: string;
};

const CATEGORIES = [
  { name: "Манікюр", color: "#EC4899" },
  { name: "Педикюр", color: "#F59E0B" },
  { name: "Вії", color: "#8B5CF6" },
  { name: "Брови", color: "#10B981" },
  { name: "Волосся", color: "#3B82F6" },
  { name: "Обличчя", color: "#EF4444" },
  { name: "Інше", color: "#6B7280" },
];

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} хв`;
  if (mins === 0) return `${hours} год`;
  return `${hours} год ${mins} хв`;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Манікюр",
    duration: "60",
    price: "",
    color: "#EC4899",
  });

  const loadServices = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("salon_id", SALON_ID)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const serviceData = {
      salon_id: SALON_ID,
      name: form.name,
      description: form.description || null,
      category: form.category,
      duration: parseInt(form.duration),
      price: parseFloat(form.price),
      color: form.color,
      is_active: true,
    };

    let error;
    if (editingService) {
      const { error: updateError } = await supabase
        .from("services")
        .update(serviceData)
        .eq("id", editingService.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("services")
        .insert(serviceData);
      error = insertError;
    }

    if (error) {
      alert("Помилка: " + error.message);
    } else {
      closeModal();
      loadServices();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити послугу?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      alert("Помилка: " + error.message);
    } else {
      loadServices();
    }
  };

  const openEditModal = (service: Service) => {
    setForm({
      name: service.name,
      description: service.description || "",
      category: service.category || "Манікюр",
      duration: service.duration.toString(),
      price: service.price.toString(),
      color: service.color,
    });
    setEditingService(service);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setForm({
      name: "",
      description: "",
      category: "Манікюр",
      duration: "60",
      price: "",
      color: "#EC4899",
    });
  };

  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Групування по категоріях
  const grouped = filtered.reduce((acc, service) => {
    const cat = service.category || "Інше";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const stats = {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    avgPrice: services.length > 0 
      ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length)
      : 0,
  };

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];

  return (
    <div className="min-h-full pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Послуги</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Прайс-лист вашого салону</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
            >
              <Plus size={18} />
              Додати послугу
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
            <div className="bg-white dark:bg-[#111111] rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-500/10 rounded-lg hidden sm:block">
                  <Scissors className="text-violet-600 dark:text-violet-400" size={20} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Послуг</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg hidden sm:block">
                  <Tag className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Категорій</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg hidden sm:block">
                  <DollarSign className="text-amber-600 dark:text-amber-400" size={20} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Сер. ціна</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">₴{stats.avgPrice}</p>
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
                placeholder="Пошук послуги..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="all">Всі категорії</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {Object.keys(grouped).length === 0 ? (
              <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 text-center py-16 px-4">
                <Scissors className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Немає послуг</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Додайте першу послугу</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg"
                >
                  <Plus size={18} />
                  Додати
                </button>
              </div>
            ) : (
              Object.entries(grouped).map(([category, categoryServices]) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryServices[0]?.color || "#8B5CF6" }}
                    />
                    {category}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({categoryServices.length})
                    </span>
                  </h2>
                  <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                      {categoryServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div
                              className="w-1 h-12 rounded-full flex-shrink-0"
                              style={{ backgroundColor: service.color }}
                            />
                            <div className="min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {service.name}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {formatDuration(service.duration)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              ₴{service.price}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(service)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <Edit size={16} className="text-gray-500" />
                              </button>
                              <button
                                onClick={() => handleDelete(service.id)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#111111] rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {editingService ? "Редагувати послугу" : "Нова послуга"}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Назва <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Манікюр з покриттям"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Категорія
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const cat = CATEGORIES.find(c => c.name === e.target.value);
                      setForm({ ...form, category: e.target.value, color: cat?.color || form.color });
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Тривалість (хв) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      <option value="15">15 хв</option>
                      <option value="30">30 хв</option>
                      <option value="45">45 хв</option>
                      <option value="60">1 год</option>
                      <option value="90">1.5 год</option>
                      <option value="120">2 год</option>
                      <option value="150">2.5 год</option>
                      <option value="180">3 год</option>
                      <option value="240">4 год</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Ціна (₴) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="10"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Колір
                  </label>
                  <div className="flex gap-2">
                    {["#EC4899", "#F59E0B", "#8B5CF6", "#10B981", "#3B82F6", "#EF4444", "#6B7280"].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, color })}
                        className={`w-8 h-8 rounded-full transition-transform ${form.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Опис
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                    rows={2}
                    placeholder="Детальний опис послуги..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "..." : editingService ? "Зберегти" : "Додати"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
