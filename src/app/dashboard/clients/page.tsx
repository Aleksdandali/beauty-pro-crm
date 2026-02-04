"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Client {
  id: string;
  created_at: string;
  salon_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  birthday: string | null;
  discount_percent: number | null;
  total_visits: number;
  total_spent: number;
  last_visit: string | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      // Fetch clients (RLS will filter by user automatically)
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error("Error fetching clients:", fetchError);
        setError(fetchError.message);
      } else {
        setClients(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header - Hidden on Mobile */}
      <div className="mb-8 hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
            Clients
          </h1>
          <p className="text-base text-zinc-600">Manage your client database</p>
        </div>
        <button className="px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
          + Add Client
        </button>
      </div>

      {/* Mobile Header */}
      <div className="mb-6 md:hidden flex items-center justify-between">
        <h1 className="text-xl font-bold text-black tracking-tight">
          Clients
        </h1>
        <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold">
          + Add
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <p className="text-sm text-zinc-600 mt-4">Loading clients...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-red-600 font-medium">Error: {error}</p>
          <button 
            onClick={fetchClients}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && clients.length === 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">No clients yet</h3>
          <p className="text-sm text-zinc-600 mb-6">
            Start building your client database by adding your first client
          </p>
          <button className="px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
            + Add Your First Client
          </button>
        </div>
      )}

      {/* Clients Table */}
      {!isLoading && !error && clients.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 text-sm">{client.full_name}</div>
                      {client.notes && (
                        <div className="text-xs text-zinc-500 mt-1 truncate max-w-xs">{client.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {client.email || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(client.created_at).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm text-zinc-600 hover:text-black font-medium transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-zinc-100">
            {clients.map((client) => (
              <div key={client.id} className="p-4 hover:bg-zinc-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-900 text-sm mb-1">
                      {client.full_name}
                    </div>
                    <div className="text-xs text-zinc-600 mb-1">📱 {client.phone}</div>
                    {client.email && (
                      <div className="text-xs text-zinc-600">✉️ {client.email}</div>
                    )}
                  </div>
                  <button className="text-xs text-zinc-600 hover:text-black font-medium">
                    Edit
                  </button>
                </div>
                {client.notes && (
                  <p className="text-xs text-zinc-500 bg-zinc-50 p-2 rounded-md">
                    {client.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Count */}
      {!isLoading && !error && clients.length > 0 && (
        <div className="mt-4 text-sm text-zinc-500">
          Total clients: <span className="font-semibold text-zinc-900">{clients.length}</span>
        </div>
      )}
    </div>
  );
}
