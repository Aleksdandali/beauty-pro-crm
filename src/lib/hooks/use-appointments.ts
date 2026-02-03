// @ts-nocheck - Temporary disable type checking until database types are generated
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  master_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentInsert = Omit<Appointment, "id" | "created_at" | "updated_at">;
export type AppointmentUpdate = Partial<AppointmentInsert>;

export function useAppointments(salonId?: string) {
  return useQuery({
    queryKey: ["appointments", salonId],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("appointments")
        .select(`
          *,
          client:clients(*),
          master:staff(*),
          service:services(*)
        `)
        .order("start_time", { ascending: true });

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

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("appointments").insert(appointment).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AppointmentUpdate & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("appointments").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
