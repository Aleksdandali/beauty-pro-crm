"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/features/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppointmentsPage() {
  const t = useTranslations("appointments");

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-zinc-100 text-zinc-800",
    cancelled: "bg-red-100 text-red-800",
  };

  // Mock data
  const appointments = [
    {
      id: "1",
      client: "Олена Коваленко",
      staff: "Марія Іванова",
      service: "Стрижка жіноча",
      date: "2024-02-03",
      time: "10:00",
      duration: 60,
      price: 850,
      status: "confirmed",
    },
    {
      id: "2",
      client: "Анна Сидоренко",
      staff: "Олександра Петрова",
      service: "Фарбування",
      date: "2024-02-03",
      time: "11:30",
      duration: 120,
      price: 2500,
      status: "scheduled",
    },
    {
      id: "3",
      client: "Марія Петренко",
      staff: "Марія Іванова",
      service: "Манікюр",
      date: "2024-02-03",
      time: "14:00",
      duration: 90,
      price: 650,
      status: "in_progress",
    },
  ];

  return (
    <div>
      <Header title={t("title")} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            Today's Appointments ({appointments.length})
          </h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("newAppointment")}
          </Button>
        </div>

        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{appointment.client}</h4>
                        <p className="text-sm text-zinc-600">{appointment.service}</p>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-3 py-1 rounded-full font-medium",
                          statusColors[appointment.status]
                        )}
                      >
                        {t(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-zinc-600">
                        <User className="mr-2 h-4 w-4" />
                        {appointment.staff}
                      </div>
                      <div className="flex items-center text-zinc-600">
                        <Clock className="mr-2 h-4 w-4" />
                        {appointment.time} ({appointment.duration} min)
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end gap-2">
                    <span className="text-2xl font-bold">₴{appointment.price}</span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
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
