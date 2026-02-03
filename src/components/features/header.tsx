"use client";

import { useTranslations } from "next-intl";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const t = useTranslations();

  return (
    <header className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder={t("common.search")}
            className="pl-10 w-64"
          />
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
