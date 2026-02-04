"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Search } from "lucide-react";

// ⚠️ SALON_ID з бази даних
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    instagram: "",
    telegram: "",
    notes: "",
  });

  // Завантаження клієнтів
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

  // Завантажити при першому рендері
  useEffect(() => {
    loadClients();
  }, []);

  // Додати клієнта
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
      setShowModal(false);
      setForm({ full_name: "", phone: "", instagram: "", telegram: "", notes: "" });
      loadClients();
    }
    setSaving(false);
  };

  // Фільтрація по пошуку
  const filtered = clients.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  // Колір для RFM сегменту
  const rfmColor = (segment: string) => {
    const colors: Record<string, string> = {
      VIP: "bg-yellow-100 text-yellow-800",
      Loyal: "bg-green-100 text-green-800",
      Regular: "bg-blue-100 text-blue-800",
      Sleeping: "bg-orange-100 text-orange-800",
      Lost: "bg-red-100 text-red-800",
      New: "bg-gray-100 text-gray-800",
    };
    return colors[segment] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Клієнти</h1>
          <p className="text-gray-500">{clients.length} клієнтів</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <Plus size={18} />
          Додати клієнта
        </button>
      </div>

      {/* Пошук */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Пошук по імені або телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Стан */}
      {loading && <p className="text-center py-12 text-gray-500">Завантаження...</p>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
          Помилка: {error}
          <button onClick={loadClients} className="ml-4 underline">Спробувати знову</button>
        </div>
      )}

      {/* Таблиця */}
      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Ім'я</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Телефон</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900 hidden md:table-cell">Instagram</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900 hidden md:table-cell">Сегмент</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900 hidden lg:table-cell">Візитів</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900 hidden lg:table-cell">Витрачено</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    {search ? "Нічого не знайдено" : "Немає клієнтів. Додайте першого!"}
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium">{client.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{client.phone}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {client.instagram ? `@${client.instagram}` : "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rfmColor(client.rfm_segment)}`}>
                        {client.rfm_segment}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">{client.total_visits}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">₴{client.total_spent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Модалка */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Новий клієнт</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ім'я <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Олена Петренко"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="+380501234567"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                  <input
                    type="text"
                    value={form.telegram}
                    onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Нотатки</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  rows={3}
                  placeholder="Алергії, побажання..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Зберігаю..." : "Додати"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
