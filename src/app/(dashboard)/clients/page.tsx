"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { AddClientModal } from "@/components/AddClientModal";

// Types
type RFMSegment = "VIP" | "Loyal" | "Regular" | "Sleeping" | "Lost" | "New";

interface Client {
  id: string;
  full_name: string;
  phone: string;
  instagram: string | null;
  rfm_segment: RFMSegment;
  total_visits: number;
  total_spent: number;
}

interface ClientsResponse {
  data: Client[];
  total: number;
}

// Fetch clients with filters
async function fetchClients(
  page: number,
  pageSize: number,
  searchQuery: string,
  rfmFilter: RFMSegment | "all"
): Promise<ClientsResponse> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("clients")
    .select("id, full_name, phone, instagram, rfm_segment, total_visits, total_spent", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  // Search filter
  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
  }

  // RFM filter
  if (rfmFilter !== "all") {
    query = query.eq("rfm_segment", rfmFilter);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
  };
}

// RFM Segment Badge
function RFMBadge({ segment }: { segment: RFMSegment }) {
  const colors: Record<RFMSegment, string> = {
    VIP: "bg-purple-100 text-purple-800 border-purple-200",
    Loyal: "bg-blue-100 text-blue-800 border-blue-200",
    Regular: "bg-green-100 text-green-800 border-green-200",
    Sleeping: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Lost: "bg-red-100 text-red-800 border-red-200",
    New: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        colors[segment]
      }`}
    >
      {segment}
    </span>
  );
}

export default function ClientsPage() {
  // State
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [rfmFilter, setRFMFilter] = useState<RFMSegment | "all">("all");
  const [salonId, setSalonId] = useState<string | null>(null);
  const pageSize = 20;

  // Get current user's salon_id
  useEffect(() => {
    async function getSalonId() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: staff } = await supabase
          .from("staff")
          .select("salon_id")
          .eq("user_id", user.id)
          .single<{ salon_id: string }>();
        
        if (staff?.salon_id) {
          setSalonId(staff.salon_id);
        }
      }
    }
    getSalonId();
  }, []);

  // Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["clients", page, searchQuery, rfmFilter],
    queryFn: () => fetchClients(page, pageSize, searchQuery, rfmFilter),
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">Клієнти</h1>
            <p className="text-zinc-600 mt-1">
              {data ? `Всього: ${data.total}` : "Завантаження..."}
            </p>
          </div>
          <AddClientModal 
            salonId={salonId || ""}
            trigger={
              <button 
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!salonId}
              >
                <Plus className="w-4 h-4" />
                Додати клієнта
              </button>
            }
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Пошук по імені або телефону..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>

          {/* RFM Filter */}
          <select
            value={rfmFilter}
            onChange={(e) => {
              setRFMFilter(e.target.value as RFMSegment | "all");
              setPage(1); // Reset to first page
            }}
            className="px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm bg-white"
          >
            <option value="all">Всі сегменти</option>
            <option value="VIP">VIP</option>
            <option value="Loyal">Лояльні</option>
            <option value="Regular">Регулярні</option>
            <option value="Sleeping">Сплячі</option>
            <option value="Lost">Втрачені</option>
            <option value="New">Нові</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-600">Завантаження...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            Помилка: {error instanceof Error ? error.message : "Не вдалося завантажити дані"}
          </div>
        </div>
      )}

      {/* Table (Desktop) */}
      {!isLoading && !error && data && (
        <>
          <div className="hidden md:block bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Ім'я
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Телефон
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Instagram
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    RFM-сегмент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Візитів
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Витрачено
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {data.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      {searchQuery || rfmFilter !== "all"
                        ? "Клієнтів не знайдено"
                        : "Ще немає клієнтів"}
                    </td>
                  </tr>
                ) : (
                  data.data.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-900">
                          {client.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-600">{client.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-600">
                          {client.instagram ? (
                            <a
                              href={`https://instagram.com/${client.instagram.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {client.instagram}
                            </a>
                          ) : (
                            "—"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RFMBadge segment={client.rfm_segment} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-900">{client.total_visits}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-900">
                          ₴{client.total_spent.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {data.data.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                {searchQuery || rfmFilter !== "all"
                  ? "Клієнтів не знайдено"
                  : "Ще немає клієнтів"}
              </div>
            ) : (
              data.data.map((client) => (
                <div
                  key={client.id}
                  className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">
                        {client.full_name}
                      </h3>
                      <p className="text-sm text-zinc-600 mt-1">{client.phone}</p>
                      {client.instagram && (
                        <p className="text-sm text-blue-600 mt-1">{client.instagram}</p>
                      )}
                    </div>
                    <RFMBadge segment={client.rfm_segment} />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div className="text-sm">
                      <span className="text-zinc-500">Візитів:</span>{" "}
                      <span className="font-semibold text-zinc-900">{client.total_visits}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-zinc-500">Витрачено:</span>{" "}
                      <span className="font-semibold text-zinc-900">
                        ₴{client.total_spent.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-zinc-600">
                Сторінка {page} з {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Назад
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Вперед
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
