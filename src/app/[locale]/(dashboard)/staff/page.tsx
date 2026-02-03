"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/features/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Mail, Phone } from "lucide-react";

export default function StaffPage() {
  const t = useTranslations("staff");

  // Mock data
  const staff = [
    {
      id: "1",
      name: "Марія Іванова",
      email: "maria.ivanova@example.com",
      phone: "+380 50 111 2233",
      role: "admin",
      specialization: "Перукар-стиліст",
      isActive: true,
    },
    {
      id: "2",
      name: "Олександра Петрова",
      email: "oleksandra.petrova@example.com",
      phone: "+380 67 222 3344",
      role: "staff",
      specialization: "Колорист",
      isActive: true,
    },
    {
      id: "3",
      name: "Юлія Коваль",
      email: "yulia.koval@example.com",
      phone: "+380 93 333 4455",
      role: "staff",
      specialization: "Майстер манікюру",
      isActive: true,
    },
  ];

  return (
    <div>
      <Header title={t("title")} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">All Staff ({staff.length})</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("newStaff")}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{member.name}</h4>
                      <p className="text-sm text-zinc-600">{member.specialization}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {t(member.role)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-zinc-600">
                      <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-zinc-600">
                      <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                      {member.phone}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100">
                    <span className={`inline-flex items-center text-xs px-2 py-1 rounded ${
                      member.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-zinc-100 text-zinc-800"
                    }`}>
                      {member.isActive ? t("active") : "Inactive"}
                    </span>
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
