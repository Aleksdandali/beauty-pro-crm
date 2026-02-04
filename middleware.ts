import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Hardcoded fallback для production
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDY1MDQsImV4cCI6MjA4NTcyMjUwNH0.27eDH-gQE6KtcFIq6RVYHQJUPKOpMe3UQiCMIu_t1Zg';

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // REFRESH SESSION on every request
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    await supabase.auth.refreshSession();
  }

  const pathname = request.nextUrl.pathname;

  // Public routes (no auth required)
  const publicRoutes = ["/", "/login", "/signup", "/test-login"];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));

  // If it's a public route, allow
  if (isPublicRoute) {
    return response;
  }

  // Protected routes: Check session
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if user has staff record (onboarding completed)
  const isOnboardingRoute = pathname.includes("/onboarding");
  
  try {
    const { data: staffRecord } = await supabase
      .from("staff")
      .select("salon_id, role")
      .eq("user_id", session.user.id)
      .maybeSingle();

    // If NO staff record and NOT on onboarding → redirect to onboarding
    if (!staffRecord && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/uk/onboarding", request.url));
    }

    // If HAS staff record and ON onboarding → redirect to dashboard
    if (staffRecord && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (error) {
    console.error("[Middleware] Error checking staff:", error);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
