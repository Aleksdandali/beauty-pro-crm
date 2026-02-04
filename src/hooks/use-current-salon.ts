"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook для получения текущего salon_id пользователя
 * Кэширует результат через TanStack Query
 */
export function useCurrentSalon() {
  return useQuery({
    queryKey: ["current-salon"],
    queryFn: async () => {
      const supabase = createClient();

      // Получить текущего пользователя
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      // Получить salon_id из staff
      const { data: staffRecord, error: staffError } = await supabase
        .from("staff")
        .select("salon_id, salon:salons(id, name, slug, phone, email, address, city)")
        .eq("user_id", user.id)
        .single();

      if (staffError || !staffRecord) {
        throw new Error("Salon not found");
      }

      return {
        salonId: staffRecord.salon_id,
        salon: staffRecord.salon,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 минут
    retry: false,
  });
}

/**
 * Hook для получения только salon_id (упрощенная версия)
 */
export function useCurrentSalonId() {
  const { data, isLoading, error } = useCurrentSalon();
  return {
    salonId: data?.salonId || null,
    isLoading,
    error,
  };
}
