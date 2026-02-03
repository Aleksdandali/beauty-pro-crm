import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Appointment, AppointmentWithDetails } from "@/types";
import type { Database } from "@/types/database";

type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

export function useAppointments(salonId?: string, date?: Date) {
  return useQuery({
    queryKey: ["appointments", salonId, date?.toISOString()],
    queryFn: async () => {
      const supabase = createClient();
      
      let query = supabase
        .from("appointments")
        .select(`
          *,
          client:clients(*),
          staff:staff(*),
          service:services(*)
        `)
        .order("start_time", { ascending: true });
      
      if (salonId) {
        query = query.eq("salon_id", salonId);
      }

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.gte("start_time", startOfDay.toISOString()).lte("start_time", endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as AppointmentWithDetails[];
    },
    enabled: !!salonId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("appointments").insert(appointment as any).select().single();

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
