import createMiddleware from 'next-intl/middleware';
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// next-intl middleware configuration
const intlMiddleware = createMiddleware({
  locales: ['uk', 'en'],
  defaultLocale: 'uk'
});

export async function middleware(request: NextRequest) {
  // Run next-intl middleware for locale handling
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware wants to redirect, let it
  if (intlResponse && intlResponse.status === 307) {
    return intlResponse;
  }
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Hardcoded fallback для production
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDY1MDQsImV4cCI6MjA4NTcyMjUwNH0.27eDH-gQE6KtcFIq6RVYHQJUPKOpMe3UQiCMIu_t1Zg';

    // Validate env vars exist
    if (!supabaseUrl || !supabaseKey) {
      console.error("[Middleware] Missing Supabase credentials");
      return response; // Allow request to proceed without auth check
    }

    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            try {
              return request.cookies.get(name)?.value;
            } catch (error) {
              console.error("[Middleware] Cookie get error:", error);
              return undefined;
            }
          },
          set(name: string, value: string, options: any) {
            try {
              request.cookies.set({ name, value, ...options });
              response = NextResponse.next({ request: { headers: request.headers } });
              response.cookies.set({ name, value, ...options });
            } catch (error) {
              console.error("[Middleware] Cookie set error:", error);
            }
          },
          remove(name: string, options: any) {
            try {
              request.cookies.set({ name, value: "", ...options });
              response = NextResponse.next({ request: { headers: request.headers } });
              response.cookies.set({ name, value: "", ...options });
            } catch (error) {
              console.error("[Middleware] Cookie remove error:", error);
            }
          },
        },
      }
    );

    // REFRESH SESSION on every request (with error handling)
    let session = null;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
      
      if (session) {
        await supabase.auth.refreshSession();
      }
    } catch (authError) {
      console.error("[Middleware] Auth error:", authError);
      // Continue without session - user will be treated as logged out
    }

    const pathname = request.nextUrl.pathname;

  // Extract locale from pathname (e.g., /uk/dashboard -> uk)
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "uk"; // default to 'uk'

  // Public routes (no auth required)
  const publicRoutes = [
    "/",
    "/uk/login",
    "/uk/signup",
    "/en/login",
    "/en/signup",
    "/test-login",
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));

  // If it's a public route, allow
  if (isPublicRoute) {
    return response;
  }

    // Protected routes: Check session
    if (!session) {
      // Redirect to login with locale
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    return response;
  } catch (error) {
    console.error("[Middleware] Fatal error:", error);
    // On any error, allow the request to proceed
    // The global error boundary will catch issues downstream
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - static assets (svg, png, jpg, jpeg, gif, webp, ico, css, js)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$|api).*)",
  ],
};
