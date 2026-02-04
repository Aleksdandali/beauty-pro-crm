import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['uk', 'en'],
  defaultLocale: 'uk',
  localePrefix: 'never' // Don't add locale prefix to URLs
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
