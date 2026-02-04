"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Calendar", href: "/dashboard/calendar", icon: "📅" },
    { name: "Clients", href: "/dashboard/clients", icon: "👥" },
    { name: "Menu", href: "#", icon: "☰", isMenu: true },
  ];

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <span className="text-white text-lg font-bold">💅</span>
            </div>
            <span className="text-black font-bold text-sm">Beauty Pro</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navigation.filter(item => !item.isMenu).map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-zinc-100 text-zinc-900 font-medium"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-zinc-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
          >
            <span>←</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        {/* Mobile & Desktop Header */}
        <header className="bg-white border-b border-zinc-200">
          {/* Top Bar - Logo & User */}
          <div className="flex items-center justify-between px-4 md:px-6 h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">💅</span>
              </div>
              <span className="text-black font-bold text-base">Beauty Pro CRM</span>
            </div>
            {userEmail && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm text-zinc-600">{userEmail}</span>
                <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-sm">
                  👤
                </div>
              </div>
            )}
          </div>

          {/* Mobile Tabs Navigation - Only on Mobile */}
          <div className="md:hidden flex border-t border-zinc-200 overflow-x-auto">
            {navigation.filter(item => !item.isMenu).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex-1 min-w-fit px-4 py-3 text-center text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? "border-black text-black"
                      : "border-transparent text-zinc-600"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            
            if (item.isMenu) {
              return (
                <button
                  key={item.name}
                  onClick={handleSignOut}
                  className="flex flex-col items-center justify-center py-2 px-4 min-w-0 flex-1"
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs text-zinc-600">{item.name}</span>
                </button>
              );
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-4 min-w-0 flex-1 transition-colors ${
                  isActive ? "text-black" : "text-zinc-600"
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
