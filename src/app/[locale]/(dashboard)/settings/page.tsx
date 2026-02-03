"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/features/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const t = useTranslations("settings");

  const [salonData, setSalonData] = useState({
    name: "My Beauty Salon",
    address: "вул. Хрещатик 1, Київ",
    phone: "+380 44 123 4567",
    email: "info@mysalon.com",
    currency: "UAH",
    timezone: "Europe/Kiev",
  });

  const handleSave = () => {
    // Save logic will be implemented
    console.log("Saving salon data:", salonData);
  };

  return (
    <div>
      <Header title={t("title")} />
      <div className="p-6">
        <Tabs defaultValue="salon" className="space-y-6">
          <TabsList>
            <TabsTrigger value="salon">{t("salon")}</TabsTrigger>
            <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
            <TabsTrigger value="language">{t("language")}</TabsTrigger>
          </TabsList>

          <TabsContent value="salon">
            <Card>
              <CardHeader>
                <CardTitle>{t("salon")} Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salonName">{t("salonName")}</Label>
                  <Input
                    id="salonName"
                    value={salonData.name}
                    onChange={(e) =>
                      setSalonData({ ...salonData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("address")}</Label>
                  <Input
                    id="address"
                    value={salonData.address}
                    onChange={(e) =>
                      setSalonData({ ...salonData, address: e.target.value })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      value={salonData.phone}
                      onChange={(e) =>
                        setSalonData({ ...salonData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={salonData.email}
                      onChange={(e) =>
                        setSalonData({ ...salonData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t("currency")}</Label>
                    <Input
                      id="currency"
                      value={salonData.currency}
                      onChange={(e) =>
                        setSalonData({ ...salonData, currency: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t("timezone")}</Label>
                    <Input
                      id="timezone"
                      value={salonData.timezone}
                      onChange={(e) =>
                        setSalonData({ ...salonData, timezone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSave} className="mt-4">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile")} Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600">Profile settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>{t("language")} Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = "/uk"}
                  >
                    Українська (UK)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = "/en"}
                  >
                    English (EN)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
