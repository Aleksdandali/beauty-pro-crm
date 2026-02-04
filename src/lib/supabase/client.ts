import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  // Используем hardcoded значения для production, чтобы избежать проблем с env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YssVxNhCmNyPnFWdEOzHCQ_2i195gJs';
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  );
}
