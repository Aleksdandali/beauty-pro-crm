"use server";

import { createClient } from "@/lib/supabase/server";
import { createSalonSchema, type CreateSalonInput } from "@/lib/validations/salon";
import { redirect } from "next/navigation";

/**
 * Проверить завершил ли пользователь онбординг
 * @returns salon_id если онбординг завершен, null если нет
 */
export async function checkOnboardingStatus(): Promise<string | null> {
  const supabase = await createClient();

  // Получить текущего пользователя
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Проверить есть ли запись в staff для этого пользователя
  const { data: staffRecord, error: staffError } = await supabase
    .from("staff")
    .select("salon_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (staffError || !staffRecord) {
    return null;
  }

  return staffRecord.salon_id;
}

/**
 * Создать салон и привязать пользователя как owner
 */
export async function createSalonWithOwner(input: CreateSalonInput) {
  const supabase = await createClient();

  // Валидация
  const validatedData = createSalonSchema.parse(input);

  // Получить текущего пользователя
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Не авторизований / Not authenticated");
  }

  // Получить email и имя из auth.users
  const userEmail = user.email || "";
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  // Проверить что у пользователя еще нет салона
  const { data: existingStaff } = await supabase
    .from("staff")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingStaff) {
    throw new Error("У вас вже є салон / You already have a salon");
  }

  // Создать slug из названия салона
  const slug = validatedData.name
    .toLowerCase()
    .replace(/[^a-z0-9а-яії]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // 1. Создать салон
  const { data: salon, error: salonError } = await supabase
    .from("salons")
    .insert({
      name: validatedData.name,
      slug: `${slug}-${Date.now()}`, // Добавляем timestamp для уникальности
      phone: validatedData.phone || null,
      city: validatedData.city || null,
      address: validatedData.address || null,
      owner_id: user.id,
    })
    .select()
    .single();

  if (salonError || !salon) {
    console.error("Ошибка создания салона:", salonError);
    throw new Error("Помилка створення салону / Error creating salon");
  }

  // 2. Создать запись в staff (owner)
  const { error: staffError } = await supabase.from("staff").insert({
    salon_id: salon.id,
    user_id: user.id,
    role: "owner",
    name: userName,
    email: userEmail,
    phone: validatedData.phone || null,
    is_active: true,
  });

  if (staffError) {
    console.error("Ошибка создания staff:", staffError);
    // Откатить создание салона
    await supabase.from("salons").delete().eq("id", salon.id);
    throw new Error("Помилка створення облікового запису / Error creating staff record");
  }

  return { success: true, salonId: salon.id };
}

/**
 * Получить salon_id текущего пользователя
 */
export async function getCurrentSalonId(): Promise<string | null> {
  return checkOnboardingStatus();
}
