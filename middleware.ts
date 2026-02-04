import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes (no auth required)
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
  ];

  const isPublicRoute = publicRoutes.includes(pathname);
  const isOnboardingRoute = pathname.includes("/onboarding");

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user IS authenticated, check onboarding status
  if (user && !isPublicRoute) {
    // Check if user has completed onboarding (has staff record)
    const { data: staffRecord } = await supabase
      .from("staff")
      .select("salon_id")
      .eq("user_id", user.id)
      .single();

    const hasCompletedOnboarding = !!staffRecord;

    // If NOT completed onboarding and NOT on onboarding page → redirect to onboarding
    if (!hasCompletedOnboarding && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/uk/onboarding", request.url));
    }

    // If completed onboarding and ON onboarding page → redirect to dashboard
    if (hasCompletedOnboarding && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect authenticated users from /login to /dashboard (if onboarding completed)
  if (pathname === "/login" && user) {
    // Check onboarding status before redirecting
    const { data: staffRecord } = await supabase
      .from("staff")
      .select("salon_id")
      .eq("user_id", user.id)
      .single();

    if (staffRecord) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/uk/onboarding", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
