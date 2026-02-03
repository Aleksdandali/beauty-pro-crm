import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  let messages = {};
  try {
    messages = await getMessages();
  } catch (error) {
    console.error('Error loading messages:', error);
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
