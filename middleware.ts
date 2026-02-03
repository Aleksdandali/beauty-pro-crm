import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["uk", "en"],
  defaultLocale: "uk",
  localePrefix: "as-needed",
});

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
