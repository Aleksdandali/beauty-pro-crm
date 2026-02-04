"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, UserPlus } from "lucide-react";
import { clientSchema, type ClientFormData } from "@/lib/validations/client";
import { useCreateClient } from "@/hooks/useClients";

interface AddClientModalProps {
  salonId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddClientModal({ salonId, trigger, onSuccess }: AddClientModalProps) {
  const [open, setOpen] = useState(false);
  const createClient = useCreateClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
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
    try {
      await createClient.mutateAsync({
        ...data,
        salon_id: salonId,
      });
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (error) {
      // Помилка обробляється в mutation
      console.error(error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
      createClient.reset();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors">
            <UserPlus size={18} />
            Додати клієнта
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-zinc-200 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto z-50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-black">
              Новий клієнт
            </Dialog.Title>
            <Dialog.Close className="text-zinc-400 hover:text-black transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          {createClient.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {createClient.error.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Ім'я */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Ім'я <span className="text-red-500">*</span>
              </label>
              <input
                {...register("first_name")}
                type="text"
                placeholder="Олена"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            {/* Прізвище */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Прізвище
              </label>
              <input
                {...register("last_name")}
                type="text"
                placeholder="Петренко"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-500">{errors.last_name.message}</p>
              )}
            </div>

            {/* Телефон */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+380501234567"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Instagram & Telegram в одному рядку */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Instagram
                </label>
                <input
                  {...register("instagram")}
                  type="text"
                  placeholder="username"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Telegram
                </label>
                <input
                  {...register("telegram")}
                  type="text"
                  placeholder="username"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* День народження */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                День народження
              </label>
              <input
                {...register("birth_date")}
                type="date"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Джерело */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Звідки дізнався
              </label>
              <select
                {...register("source")}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Не вказано</option>
                <option value="instagram">Instagram</option>
                <option value="telegram">Telegram</option>
                <option value="referral">Рекомендація</option>
                <option value="walk-in">Зайшов сам</option>
                <option value="website">Сайт</option>
                <option value="other">Інше</option>
              </select>
            </div>

            {/* Нотатки */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Нотатки
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Алергії, побажання, особливості..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                >
                  Скасувати
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting || createClient.isPending}
                className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSubmitting || createClient.isPending) && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                Додати
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
