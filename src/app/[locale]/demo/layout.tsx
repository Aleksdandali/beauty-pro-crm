"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DemoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const pathname = usePathname();
  
  const navigation = [
    { name: "Дашборд", href: "/uk/demo", icon: "📊" },
    { name: "Клієнти", href: "/uk/demo/clients", icon: "👥" },
    { name: "Записи", href: "/uk/demo/appointments", icon: "📅" },
    { name: "Послуги", href: "/uk/demo/services", icon: "💼" },
    { name: "Інвентар", href: "/uk/demo/inventory", icon: "📦" },
    { name: "Персонал", href: "/uk/demo/staff", icon: "👨‍💼" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-black">
                Beauty Pro CRM
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                DEMO
              </span>
            </div>
            <div className="text-sm text-zinc-600">
              🎨 Салон &ldquo;Шарм&rdquo; • Олена Власник
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                               (item.href !== "/uk/demo" && pathname.startsWith(item.href));
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
