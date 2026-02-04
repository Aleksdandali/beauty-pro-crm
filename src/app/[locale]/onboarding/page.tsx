"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createSalonWithOwner } from "@/lib/actions/onboarding";
import { createSalonSchema, type CreateSalonInput } from "@/lib/validations/salon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSalonInput>({
    resolver: zodResolver(createSalonSchema),
  });

  const onSubmit = async (data: CreateSalonInput) => {
    setIsSubmitting(true);

    try {
      await createSalonWithOwner(data);

      toast({
        title: t("success"),
        description: t("subtitle"),
      });

      // Редирект на dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <span className="text-3xl">💅</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">{t("title")}</h1>
          <p className="text-zinc-600">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Salon Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-black">
              {t("salonName")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t("salonNamePlaceholder")}
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-black">
              {t("phone")}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t("phonePlaceholder")}
              {...register("phone")}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-black">
              {t("city")}
            </Label>
            <Input
              id="city"
              type="text"
              placeholder={t("cityPlaceholder")}
              {...register("city")}
              disabled={isSubmitting}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-black">
              {t("address")}
            </Label>
            <Input
              id="address"
              type="text"
              placeholder={t("addressPlaceholder")}
              {...register("address")}
              disabled={isSubmitting}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-zinc-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("creating") : t("submit")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
