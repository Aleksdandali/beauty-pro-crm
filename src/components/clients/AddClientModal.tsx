"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, UserPlus, Instagram as InstagramIcon, MessageCircle, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clientFormSchema, type ClientFormData } from "@/lib/validations/client-form";
import { toast } from "@/components/ui/use-toast";

interface AddClientModalProps {
  salonId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AddClientModal({ salonId, onSuccess, trigger }: AddClientModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      instagram: "",
      telegram: "",
      birth_date: "",
      notes: "",
      source: "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Перевірка унікальності телефону
      const { data: existingClient, error: checkError } = await supabase
        .from("clients")
        .select("id")
        .eq("phone", data.phone)
        .eq("salon_id", salonId)
        .single();

      if (existingClient) {
        toast({
          title: "Помилка",
          description: "Клієнт з таким телефоном вже існує",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Комбінуємо first_name і last_name в full_name
      const full_name = data.last_name
        ? `${data.first_name} ${data.last_name}`
        : data.first_name;

      // Нормалізуємо телефон (завжди +380...)
      const normalizedPhone = data.phone.startsWith("+")
        ? data.phone
        : `+38${data.phone.substring(1)}`;

      // Створюємо клієнта
      const { error: insertError } = await supabase.from("clients").insert({
        salon_id: salonId,
        full_name,
        phone: normalizedPhone,
        instagram: data.instagram || null,
        telegram: data.telegram || null,
        birthday: data.birth_date || null,
        notes: data.notes || null,
        rfm_segment: "New",
        total_visits: 0,
        total_spent: 0,
      });

      if (insertError) throw insertError;

      toast({
        title: "Успіх!",
        description: "Клієнта успішно додано",
      });

      setOpen(false);
      reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error adding client:", error);
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося додати клієнта",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-medium shadow-sm hover:shadow-md">
            <UserPlus size={18} />
            Додати клієнта
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-2xl font-bold text-white">
                Новий клієнт
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-400 mt-1">
                Заповніть інформацію про клієнта
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-2 hover:bg-gray-800 transition-colors">
              <X size={20} className="text-gray-400" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Ім'я та Прізвище */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Ім'я <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("first_name")}
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                  placeholder="Олена"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Прізвище
                </label>
                <input
                  {...register("last_name")}
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                  placeholder="Петренко"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Телефон */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Телефон <span className="text-red-400">*</span>
              </label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                placeholder="+380671234567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Instagram & Telegram */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Instagram
                </label>
                <div className="relative">
                  <InstagramIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    {...register("instagram")}
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                    placeholder="username"
                  />
                </div>
                {errors.instagram && (
                  <p className="mt-1 text-sm text-red-400">{errors.instagram.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Telegram
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    {...register("telegram")}
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                    placeholder="username"
                  />
                </div>
                {errors.telegram && (
                  <p className="mt-1 text-sm text-red-400">{errors.telegram.message}</p>
                )}
              </div>
            </div>

            {/* Дата народження */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Дата народження
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  {...register("birth_date")}
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                />
              </div>
              {errors.birth_date && (
                <p className="mt-1 text-sm text-red-400">{errors.birth_date.message}</p>
              )}
            </div>

            {/* Джерело */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Звідки дізнався
              </label>
              <select
                {...register("source")}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
              >
                <option value="">Не вказано</option>
                <option value="instagram">Instagram</option>
                <option value="telegram">Telegram</option>
                <option value="referral">Рекомендація</option>
                <option value="walk-in">Зайшов сам</option>
                <option value="website">Сайт</option>
                <option value="other">Інше</option>
              </select>
              {errors.source && (
                <p className="mt-1 text-sm text-red-400">{errors.source.message}</p>
              )}
            </div>

            {/* Нотатки */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Нотатки
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all resize-none"
                placeholder="Алергії, побажання, особливості..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-400">{errors.notes.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Скасувати
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Додаю...
                  </>
                ) : (
                  "Додати клієнта"
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
