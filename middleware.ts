import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware({
  locales: ["uk", "en"],
  defaultLocale: "uk",
  localePrefix: "never", // Don't add locale prefix to URLs
});

export async function middleware(request: NextRequest) {
  // Step 1: Handle authentication first (SECURITY)
  const authResponse = await updateSession(request);
  
  // Step 2: Handle internationalization
  const intlResponse = intlMiddleware(request);
  
  // Step 3: Merge headers from both middlewares
  if (intlResponse) {
    authResponse.headers.forEach((value, key) => {
      intlResponse.headers.set(key, value);
    });
    return intlResponse;
  }
  
  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|api|.*\\..*).*)",
    "/",
  ],
};
