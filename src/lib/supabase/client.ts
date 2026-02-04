import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  // Используем hardcoded значения для production, чтобы избежать проблем с env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDY1MDQsImV4cCI6MjA4NTcyMjUwNH0.27eDH-gQE6KtcFIq6RVYHQJUPKOpMe3UQiCMIu_t1Zg';
  
  // Validation check (with fallback, so it won't crash)
  if (!supabaseUrl) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL");
    throw new Error("Supabase configuration error: Missing URL");
  }
  
  if (!supabaseKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
    throw new Error("Supabase configuration error: Missing API Key");
  }
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  );
}
