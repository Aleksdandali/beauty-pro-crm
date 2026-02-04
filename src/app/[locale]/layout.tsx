import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  let locale = "uk"; // default fallback
  let messages = {};

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale || "uk";
    
    // Safe message loading
    try {
      messages = await getMessages();
    } catch (messageError) {
      console.error("[Layout] Failed to load messages:", messageError);
      // Continue with empty messages - app will still render
    }
  } catch (error) {
    console.error("[Layout] Critical error:", error);
    // Use fallback values - don't crash the layout
  }

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
