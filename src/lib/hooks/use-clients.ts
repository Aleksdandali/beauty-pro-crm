// @ts-nocheck - Temporary disable type checking until database types are generated
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Client {
  id: string;
  salon_id: string;
  full_name: string;
  phone: string;
  email?: string;
  notes?: string;
  birthday?: string;
  discount_percent: number;
  total_visits: number;
  total_spent: number;
  last_visit?: string;
  created_at: string;
  updated_at: string;
}

export type ClientInsert = Omit<Client, "id" | "created_at" | "updated_at">;
export type ClientUpdate = Partial<ClientInsert>;

export function useClients(salonId?: string) {
  return useQuery({
    queryKey: ["clients", salonId],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (salonId) {
        query = query.eq("salon_id", salonId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("clients").insert(client).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ClientUpdate & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("clients").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
