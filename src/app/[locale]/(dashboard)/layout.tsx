"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/features/sidebar";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${locale}/auth/signin`);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [locale, router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/auth/signin`);
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar locale={locale} onSignOut={handleSignOut} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
