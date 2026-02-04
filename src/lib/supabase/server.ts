import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  try {
    const cookieStore = await cookies();

    // Hardcoded fallback для production
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDY1MDQsImV4cCI6MjA4NTcyMjUwNH0.27eDH-gQE6KtcFIq6RVYHQJUPKOpMe3UQiCMIu_t1Zg';

    // CRITICAL: Check for missing env vars
    if (!supabaseUrl || supabaseUrl === 'undefined') {
      throw new Error("MISSING_ENV_VARIABLES: NEXT_PUBLIC_SUPABASE_URL is not set. Please add Supabase keys to Vercel Settings.");
    }

    if (!supabaseKey || supabaseKey === 'undefined') {
      throw new Error("MISSING_ENV_VARIABLES: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Please add Supabase keys to Vercel Settings.");
    }

    return createServerClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            try {
              return cookieStore.get(name)?.value;
            } catch (error) {
              console.error("[Server] Cookie get error:", error);
              return undefined;
            }
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
  } catch (error) {
    console.error("[Server] Fatal Supabase initialization error:", error);
    throw error; // Re-throw to be caught by global error boundary
  }
}
