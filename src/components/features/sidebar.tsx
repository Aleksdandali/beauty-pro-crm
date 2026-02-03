"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  locale: string;
  onSignOut: () => void;
}

export function Sidebar({ locale, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();

  const navigation = [
    {
      name: t("dashboard.title"),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: t("appointments.title"),
      href: `/${locale}/appointments`,
      icon: Calendar,
    },
    {
      name: t("clients.title"),
      href: `/${locale}/clients`,
      icon: Users,
    },
    {
      name: t("services.title"),
      href: `/${locale}/services`,
      icon: Briefcase,
    },
    {
      name: t("staff.title"),
      href: `/${locale}/staff`,
      icon: Users,
    },
    {
      name: t("inventory.title"),
      href: `/${locale}/inventory`,
      icon: Package,
    },
    {
      name: t("settings.title"),
      href: `/${locale}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-zinc-200">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200">
        <h1 className="text-xl font-bold">Beauty Pro</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-black text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t("auth.signOut")}
        </Button>
      </div>
    </div>
  );
}
