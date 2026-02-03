import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  // Используем hardcoded значения для production, чтобы избежать проблем с env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTM0MTQsImV4cCI6MjA1NDA2OTQxNH0.FQHpdt4E7Ny3_Vny4oSrMvCPyLbOGNzd4J7Xmzq7iZo';
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  );
}
