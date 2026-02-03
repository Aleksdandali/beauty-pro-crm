import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Salon } from "@/types";

export function useSalon() {
  return useQuery({
    queryKey: ["salon"],
    queryFn: async () => {
      const supabase = createClient();
      
      // Get current user's salon
      const { data: staff, error: staffError } = await supabase
        .from("staff")
        .select("salon_id")
        .single();

      if (staffError) throw staffError;

      const { data: salon, error: salonError } = await supabase
        .from("salons")
        .select("*")
        .eq("id", staff.salon_id)
        .single();

      if (salonError) throw salonError;

      return salon as Salon;
    },
  });
}
