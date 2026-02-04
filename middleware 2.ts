import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware({
  locales: ["uk", "en"],
  defaultLocale: "uk",
  localePrefix: "as-needed",
});

export async function middleware(request: NextRequest) {
  // Handle authentication first
  const response = await updateSession(request);
  
  // Then handle internationalization
  const intlResponse = intlMiddleware(request);
  
  // Merge headers if needed
  if (intlResponse) {
    response.headers.forEach((value, key) => {
      intlResponse.headers.set(key, value);
    });
    return intlResponse;
  }
  
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/",
    "/(uk|en)/:path*",
  ],
};
