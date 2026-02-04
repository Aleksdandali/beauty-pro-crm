"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Client {
  id: string;
  salon_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  notes: string | null;
  discount_percent: number | null;
  total_visits: number;
  total_spent: number;
  last_visit: string | null;
  created_at: string;
  updated_at: string;
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
      const supabase = createClient();

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setClients(data || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-600">Loading clients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight mb-2">
            Clients
          </h1>
          <p className="text-base text-zinc-600">
            Manage your customer database
          </p>
        </div>
        <button className="px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
          + Add Client
        </button>
      </div>

      {/* Empty State */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-200 rounded-lg">
          <svg
            className="w-16 h-16 text-zinc-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">
            No clients yet
          </h3>
          <p className="text-sm text-zinc-500 mb-4">
            Get started by adding your first client
          </p>
          <button className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-md text-sm font-medium transition-all">
            Add Your First Client
          </button>
        </div>
      ) : (
        <>
          {/* Clients Table (Desktop) */}
          <div className="hidden md:block bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Last Visit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {clients.map((client) => (
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
                      <div className="text-sm text-zinc-600">
                        {client.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600">
                        {client.email || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-900">
                        {client.total_visits}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900">
                        ₴{client.total_spent.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600">
                        {client.last_visit
                          ? new Date(client.last_visit).toLocaleDateString(
                              "uk-UA"
                            )
                          : "—"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">
                      {client.full_name}
                    </h3>
                    <p className="text-sm text-zinc-600 mt-1">
                      {client.phone}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                    {client.total_visits} visits
                  </span>
                </div>

                {client.email && (
                  <p className="text-sm text-zinc-600 mb-2">{client.email}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                  <div className="text-sm">
                    <span className="text-zinc-500">Total:</span>{" "}
                    <span className="font-semibold text-zinc-900">
                      ₴{client.total_spent.toFixed(2)}
                    </span>
                  </div>
                  {client.last_visit && (
                    <div className="text-xs text-zinc-500">
                      Last visit:{" "}
                      {new Date(client.last_visit).toLocaleDateString("uk-UA")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Count */}
          <div className="mt-6 text-center text-sm text-zinc-600">
            Total: <span className="font-semibold">{clients.length}</span>{" "}
            {clients.length === 1 ? "client" : "clients"}
          </div>
        </>
      )}
    </div>
  );
}
