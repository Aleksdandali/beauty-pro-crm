"use client";

import { useTranslations } from "next-intl";
import { Header } from "@/components/features/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Briefcase } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  const stats = [
    {
      title: t("todayAppointments"),
      value: "12",
      icon: Calendar,
      trend: "+3 from yesterday",
    },
    {
      title: t("totalClients"),
      value: "248",
      icon: Users,
      trend: "+12 this month",
    },
    {
      title: t("monthRevenue"),
      value: "₴45,230",
      icon: DollarSign,
      trend: "+8% from last month",
    },
    {
      title: t("activeStaff"),
      value: "6",
      icon: Briefcase,
      trend: "All available",
    },
  ];

  return (
    <div>
      <Header title={t("title")} />
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-zinc-500 mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div>
                      <p className="font-medium">Client Name {i}</p>
                      <p className="text-sm text-zinc-500">Haircut - 10:00 AM</p>
                    </div>
                    <span className="text-xs bg-zinc-100 px-2 py-1 rounded">Confirmed</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div>
                      <p className="font-medium">Client Name {i}</p>
                      <p className="text-sm text-zinc-500">Last visit: 2 days ago</p>
                    </div>
                    <span className="text-sm font-medium">₴850</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
