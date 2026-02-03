// @ts-nocheck - Temporary disable type checking until database types are generated
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Salon {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export function useSalon() {
  return useQuery({
    queryKey: ["salon"],
    queryFn: async () => {
      const supabase = createClient();
      
      // Get current user's salon through staff table
      const { data: staffData } = await supabase
        .from("staff")
        .select("salon_id")
        .single();

      if (!staffData?.salon_id) return null;

      const { data: salonData, error } = await supabase
        .from("salons")
        .select("*")
        .eq("id", staffData.salon_id)
        .single();

      if (error) throw error;
      return salonData as Salon;
    },
  });
}
