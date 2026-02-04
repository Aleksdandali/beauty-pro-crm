import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  // Используем hardcoded значения для production, чтобы избежать проблем с env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDY1MDQsImV4cCI6MjA4NTcyMjUwNH0.27eDH-gQE6KtcFIq6RVYHQJUPKOpMe3UQiCMIu_t1Zg';
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  );
}
