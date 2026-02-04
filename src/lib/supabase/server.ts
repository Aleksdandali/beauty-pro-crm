import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  // Hardcoded fallback для production
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDY1MDQsImV4cCI6MjA4NTcyMjUwNH0.27eDH-gQE6KtcFIq6RVYHQJUPKOpMe3UQiCMIu_t1Zg';

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting in Server Component/Action
            console.error("[Server] Cookie set error:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Cookie removal in Server Component/Action
            console.error("[Server] Cookie remove error:", error);
          }
        },
      },
    }
  );
}
