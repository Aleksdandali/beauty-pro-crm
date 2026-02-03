"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Clients", href: "/dashboard/clients", icon: "👥" },
    { name: "Appointments", href: "/dashboard/appointments", icon: "📅" },
    { name: "Services", href: "/dashboard/services", icon: "💼" },
    { name: "Inventory", href: "/dashboard/inventory", icon: "📦" },
    { name: "Staff", href: "/dashboard/staff", icon: "👨‍💼" },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-xl">💅</span>
              </div>
              <div className="text-xl font-bold text-black">
                Beauty Pro CRM
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-zinc-600 hover:text-black transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-black border-b-2 border-black"
                      : "text-zinc-600 hover:text-black"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
