"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/features/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Phone, Mail } from "lucide-react";

export default function ClientsPage() {
  const t = useTranslations("clients");

  // Mock data - will be replaced with actual data fetching
  const clients = [
    {
      id: "1",
      name: "Олена Коваленко",
      phone: "+380 50 123 4567",
      email: "olena@example.com",
      totalVisits: 12,
      totalSpent: 8500,
      lastVisit: "2024-02-01",
    },
    {
      id: "2",
      name: "Марія Петренко",
      phone: "+380 67 234 5678",
      email: "maria@example.com",
      totalVisits: 8,
      totalSpent: 5200,
      lastVisit: "2024-01-28",
    },
    {
      id: "3",
      name: "Анна Сидоренко",
      phone: "+380 93 345 6789",
      email: "anna@example.com",
      totalVisits: 15,
      totalSpent: 12300,
      lastVisit: "2024-02-03",
    },
  ];

  return (
    <div>
      <Header title={t("title")} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">All Clients ({clients.length})</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("newClient")}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">{client.name}</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-zinc-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {client.phone}
                    </div>
                    <div className="flex items-center text-zinc-600">
                      <Mail className="mr-2 h-4 w-4" />
                      {client.email}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500">{t("totalVisits")}</p>
                      <p className="font-semibold">{client.totalVisits}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">{t("totalSpent")}</p>
                      <p className="font-semibold">₴{client.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-zinc-500">
                    {t("lastVisit")}: {new Date(client.lastVisit).toLocaleDateString("uk-UA")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
