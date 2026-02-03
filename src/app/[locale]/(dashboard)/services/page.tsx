"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/features/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, DollarSign } from "lucide-react";

export default function ServicesPage() {
  const t = useTranslations("services");

  // Mock data
  const services = [
    {
      id: "1",
      name: "Стрижка жіноча",
      category: "Перукарські послуги",
      duration: 60,
      price: 850,
      description: "Професійна жіноча стрижка з укладкою",
      isActive: true,
    },
    {
      id: "2",
      name: "Фарбування",
      category: "Перукарські послуги",
      duration: 120,
      price: 2500,
      description: "Фарбування волосся професійними засобами",
      isActive: true,
    },
    {
      id: "3",
      name: "Манікюр класичний",
      category: "Манікюр",
      duration: 90,
      price: 650,
      description: "Класичний манікюр з покриттям",
      isActive: true,
    },
    {
      id: "4",
      name: "Педикюр",
      category: "Педикюр",
      duration: 90,
      price: 750,
      description: "Класичний педикюр",
      isActive: true,
    },
  ];

  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div>
      <Header title={t("title")} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">All Services ({services.length})</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("newService")}
          </Button>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-md font-semibold mb-3 text-zinc-700">{category}</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services
                  .filter((service) => service.category === category)
                  .map((service) => (
                    <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-zinc-600 mb-4">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-zinc-600">
                            <Clock className="mr-1 h-4 w-4" />
                            {service.duration} min
                          </div>
                          <div className="flex items-center font-semibold text-lg">
                            ₴{service.price}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
