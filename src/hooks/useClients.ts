import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ClientFormData } from "@/lib/validations/client";
import type { Database } from "@/types/database";

interface CreateClientData extends ClientFormData {
  salon_id: string;
}

type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClientData) => {
      const supabase = createClient();

      // Об'єднуємо first_name та last_name в full_name
      const full_name = data.last_name
        ? `${data.first_name} ${data.last_name}`
        : data.first_name;

      const insertData: ClientInsert = {
        salon_id: data.salon_id,
        full_name,
        phone: data.phone,
        instagram: data.instagram || null,
        notes: data.notes || null,
        birthday: data.birth_date || null,
        rfm_segment: "New",
        total_visits: 0,
        total_spent: 0,
      };

      const { data: client, error } = await supabase
        .from("clients")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return client;
    },
    onSuccess: () => {
      // Інвалідуємо кеш клієнтів для оновлення списку
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
