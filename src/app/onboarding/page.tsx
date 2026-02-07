'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Eye,
  Footprints,
  Gem,
  Heart,
  Loader2,
  Paintbrush,
  Plus,
  Scissors,
  Sparkles,
  Store,
  Trash2,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass';
import { FadeIn } from '@/components/animations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  salonSchema,
  serviceSchema,
  staffSchema,
  defaultWorkingHours,
  SERVICE_CATEGORIES,
  SERVICE_TEMPLATES,
  SPECIALIZATIONS,
  DAY_LABELS,
  type SalonFormData,
  type ServiceTemplate,
} from '@/schemas/onboarding';

// ─── Constants ───────────────────────────────────────────────────────────────

// salon_id comes from useSalonId() hook below

const STEPS = [
  { number: 1, title: 'Ваш салон', icon: Store },
  { number: 2, title: 'Послуги', icon: Sparkles },
  { number: 3, title: 'Команда', icon: Users },
  { number: 4, title: 'Готово!', icon: CheckCircle2 },
] as const;

// ─── Category icon map ───────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  manicure: Paintbrush,
  pedicure: Footprints,
  nail_extension: Gem,
  brow: Eye,
  lash: Sparkles,
  hair: Scissors,
  cosmetology: Droplets,
  massage: Heart,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  rose: { bg: 'bg-rose-500/12', text: 'text-rose-400', border: 'border-rose-500/30' },
  orange: { bg: 'bg-orange-500/12', text: 'text-orange-400', border: 'border-orange-500/30' },
  pink: { bg: 'bg-pink-500/12', text: 'text-pink-400', border: 'border-pink-500/30' },
  amber: { bg: 'bg-amber-500/12', text: 'text-amber-400', border: 'border-amber-500/30' },
  violet: { bg: 'bg-violet-500/12', text: 'text-violet-400', border: 'border-violet-500/30' },
  sky: { bg: 'bg-sky-500/12', text: 'text-sky-400', border: 'border-sky-500/30' },
  cyan: { bg: 'bg-cyan-500/12', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  emerald: { bg: 'bg-emerald-500/12', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 22; h++) {
  for (const m of ['00', '30']) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${m}`);
  }
}

// ─── Slug generator ──────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  const translitMap: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'h',
    ґ: 'g',
    д: 'd',
    е: 'e',
    є: 'ye',
    ж: 'zh',
    з: 'z',
    и: 'y',
    і: 'i',
    ї: 'yi',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ь: '',
    ю: 'yu',
    я: 'ya',
  };

  return name
    .toLowerCase()
    .split('')
    .map((c) => translitMap[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

// ─── Framer Motion slide variants ────────────────────────────────────────────

function slideVariants(direction: number) {
  return {
    initial: { x: direction > 0 ? 300 : -300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: direction > 0 ? -300 : 300, opacity: 0 },
  };
}

// ─── Combined form schema (superset) ────────────────────────────────────────

const servicesArraySchema = z.object({
  services: z.array(serviceSchema),
});

const staffArraySchema = z.object({
  members: z.array(staffSchema),
});

// ═════════════════════════════════════════════════════════════════════════════
// Onboarding Page
// ═════════════════════════════════════════════════════════════════════════════

export default function OnboardingPage() {
  const router = useRouter();
  const [salonId, setSalonId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Get salon_id from user metadata (client-side, since /onboarding is outside dashboard layout)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const id = user?.user_metadata?.salon_id as string;
      if (id) setSalonId(id);
      else router.push('/login');
    });
  }, [router]);
  const [direction, setDirection] = useState(1);
  const [isSoloMaster, setIsSoloMaster] = useState(false);
  const [loadDemoData, setLoadDemoData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // ── Step 1: Salon Form ───────────────────────────────────────────────

  const salonForm = useForm<SalonFormData>({
    resolver: zodResolver(salonSchema),
    defaultValues: {
      name: '',
      city: '',
      address: '',
      phone: '',
      slug: '',
      working_hours: defaultWorkingHours,
    },
  });

  // ── Step 2: Services ─────────────────────────────────────────────────

  const servicesForm = useForm<z.infer<typeof servicesArraySchema>>({
    resolver: zodResolver(servicesArraySchema),
    defaultValues: { services: [] },
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
    replace: replaceServices,
  } = useFieldArray({
    control: servicesForm.control,
    name: 'services',
  });

  // ── Step 3: Staff ────────────────────────────────────────────────────

  const staffForm = useForm<z.infer<typeof staffArraySchema>>({
    resolver: zodResolver(staffArraySchema),
    defaultValues: { members: [] },
  });

  const {
    fields: staffFields,
    append: appendStaff,
    remove: removeStaff,
  } = useFieldArray({
    control: staffForm.control,
    name: 'members',
  });

  // ── Category toggle handler ──────────────────────────────────────────

  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      setSelectedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(categoryId)) {
          next.delete(categoryId);
        } else {
          next.add(categoryId);
        }

        // Rebuild services list from selected categories
        const allServices: ServiceTemplate[] = [];
        for (const catId of next) {
          const templates = SERVICE_TEMPLATES[catId];
          if (templates) allServices.push(...templates);
        }
        replaceServices(allServices);

        return next;
      });
    },
    [replaceServices]
  );

  // ── Slug auto-generation ─────────────────────────────────────────────

  const watchedName = salonForm.watch('name');
  const currentSlug = salonForm.watch('slug');

  const handleNameBlur = useCallback(() => {
    if (!currentSlug || currentSlug === generateSlug(watchedName.slice(0, -1))) {
      salonForm.setValue('slug', generateSlug(watchedName), { shouldValidate: true });
    }
  }, [watchedName, currentSlug, salonForm]);

  // ── Navigation ───────────────────────────────────────────────────────

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 1:
        return true; // validated on button click
      case 2:
        return serviceFields.length > 0;
      case 3:
        return isSoloMaster || staffFields.length > 0;
      default:
        return true;
    }
  }, [currentStep, serviceFields.length, staffFields.length, isSoloMaster]);

  const goNext = useCallback(async () => {
    if (currentStep === 1) {
      const valid = await salonForm.trigger();
      if (!valid) return;
    }
    if (currentStep === 3 && !isSoloMaster) {
      const valid = await staffForm.trigger();
      if (!valid) return;
    }
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, 4));
  }, [currentStep, salonForm, staffForm, isSoloMaster]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  // ── Final Save ───────────────────────────────────────────────────────

  const handleFinish = useCallback(async () => {
    setIsSaving(true);

    try {
      const supabase = createClient();
      const salonData = salonForm.getValues();
      const servicesData = servicesForm.getValues().services;

      // 1. Upsert salon
      const { error: salonError } = await supabase.from('salons').upsert(
        {
          id: salonId,
          name: salonData.name,
          city: salonData.city,
          address: salonData.address || null,
          phone: salonData.phone,
          slug: salonData.slug,
          working_hours: salonData.working_hours,
        },
        { onConflict: 'id' }
      );

      if (salonError) throw new Error(`Салон: ${salonError.message}`);

      // 2. Insert services
      if (servicesData.length > 0) {
        const serviceInserts = servicesData.map((s, idx) => ({
          salon_id: salonId,
          name: s.name,
          category: s.category,
          price: s.price,
          duration: s.duration,
          sort_order: idx,
        }));

        const { error: servicesError } = await supabase.from('services').insert(serviceInserts);
        if (servicesError) throw new Error(`Послуги: ${servicesError.message}`);
      }

      // 3. Insert staff
      if (isSoloMaster) {
        // Create staff record from salon owner data
        const nameParts = salonData.name.split(' ');
        const { error: staffError } = await supabase.from('staff').insert({
          salon_id: salonId,
          first_name: nameParts[0] || 'Власник',
          last_name: nameParts[1] || '',
          phone: salonData.phone,
          role: 'owner',
          specialization: 'nail',
          is_active: true,
        });
        if (staffError) throw new Error(`Майстер: ${staffError.message}`);
      } else {
        const staffData = staffForm.getValues().members;
        if (staffData.length > 0) {
          const staffInserts = staffData.map((s, idx) => ({
            salon_id: salonId,
            first_name: s.first_name,
            last_name: s.last_name,
            specialization: s.specialization,
            phone: s.phone || null,
            role: idx === 0 ? ('owner' as const) : ('master' as const),
            is_active: true,
          }));

          const { error: staffError } = await supabase.from('staff').insert(staffInserts);
          if (staffError) throw new Error(`Команда: ${staffError.message}`);
        }
      }

      // 4. Seed demo data
      if (loadDemoData) {
        const res = await fetch('/api/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ salon_id: salonId }),
        });
        if (!res.ok) {
          const errBody = (await res.json()) as { error?: string };
          throw new Error(`Демо-дані: ${errBody.error ?? 'Unknown error'}`);
        }
      }

      // 5. Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding save error:', error);
      alert(error instanceof Error ? error.message : 'Помилка збереження');
    } finally {
      setIsSaving(false);
    }
  }, [salonForm, servicesForm, staffForm, isSoloMaster, loadDemoData, router]);

  // ═════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <FadeIn>
          <div className="mb-8 text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              Shine Beauty CRM
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Налаштуйте свій салон за 2 хвилини
            </p>
          </div>
        </FadeIn>

        {/* ── Stepper ──────────────────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => (
                <div key={step.number} className="flex items-center">
                  {/* Step circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                        currentStep > step.number && 'border-violet-500 bg-violet-500 text-white',
                        currentStep === step.number &&
                          'border-violet-500 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30',
                        currentStep < step.number &&
                          'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text-secondary)]'
                      )}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-1.5 hidden text-xs font-medium transition-colors sm:inline',
                        currentStep >= step.number
                          ? 'text-[var(--color-text)]'
                          : 'text-[var(--color-text-secondary)]'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>

                  {/* Connector line */}
                  {idx < STEPS.length - 1 && (
                    <div className="mx-1 h-0.5 w-8 flex-1 sm:mx-2 sm:w-16">
                      <div
                        className={cn(
                          'h-full rounded-full transition-colors duration-300',
                          currentStep > step.number ? 'bg-violet-500' : 'bg-[var(--glass-border)]'
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-[var(--glass-border)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={false}
                animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </FadeIn>

        {/* ── Step Content ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait" custom={direction}>
          {currentStep === 1 && (
            <StepWrapper key="step-1" direction={direction}>
              <Step1Salon form={salonForm} onNameBlur={handleNameBlur} />
            </StepWrapper>
          )}
          {currentStep === 2 && (
            <StepWrapper key="step-2" direction={direction}>
              <Step2Services
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                serviceFields={serviceFields}
                servicesForm={servicesForm}
                onRemoveService={removeService}
                onAddCustomService={() =>
                  appendService({ name: '', category: 'other', price: 0, duration: 30 })
                }
              />
            </StepWrapper>
          )}
          {currentStep === 3 && (
            <StepWrapper key="step-3" direction={direction}>
              <Step3Team
                isSoloMaster={isSoloMaster}
                onToggleSolo={setIsSoloMaster}
                staffFields={staffFields}
                staffForm={staffForm}
                onAddStaff={() =>
                  appendStaff({
                    first_name: '',
                    last_name: '',
                    specialization: 'nail',
                    phone: '',
                  })
                }
                onRemoveStaff={removeStaff}
              />
            </StepWrapper>
          )}
          {currentStep === 4 && (
            <StepWrapper key="step-4" direction={direction}>
              <Step4Summary
                salonName={salonForm.getValues('name')}
                servicesCount={serviceFields.length}
                staffCount={isSoloMaster ? 1 : staffFields.length}
                loadDemoData={loadDemoData}
                onToggleDemo={setLoadDemoData}
              />
            </StepWrapper>
          )}
        </AnimatePresence>

        {/* ── Navigation Buttons ───────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--glass-bg)] hover:text-[var(--color-text)]"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className={cn(
                'flex items-center gap-1 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all',
                canGoNext
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                  : 'cursor-not-allowed bg-gray-500 opacity-50'
              )}
            >
              Далі
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Зберігаємо...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Почати роботу
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step Wrapper (AnimatePresence slide animation)
// ═════════════════════════════════════════════════════════════════════════════

function StepWrapper({ children, direction }: { children: React.ReactNode; direction: number }) {
  const variants = slideVariants(direction);
  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 1: Salon
// ═════════════════════════════════════════════════════════════════════════════

function Step1Salon({
  form,
  onNameBlur,
}: {
  form: ReturnType<typeof useForm<SalonFormData>>;
  onNameBlur: () => void;
}) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const workingHours = watch('working_hours');
  const slug = watch('slug');

  return (
    <GlassCard padding="lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/12">
          <Store className="h-5 w-5 text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)]">Ваш салон</h2>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name">Назва салону *</Label>
          <Input
            id="name"
            placeholder="Студія краси Анна"
            {...register('name')}
            onBlur={onNameBlur}
            className="mt-1.5"
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city">Місто *</Label>
          <Input id="city" placeholder="Одеса" {...register('city')} className="mt-1.5" />
          {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city.message}</p>}
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address">Адреса</Label>
          <Input
            id="address"
            placeholder="вул. Дерибасівська, 1"
            {...register('address')}
            className="mt-1.5"
          />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Телефон *</Label>
          <Input
            id="phone"
            placeholder="+380 67 123 45 67"
            {...register('phone')}
            className="mt-1.5"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
        </div>

        {/* Slug */}
        <div>
          <Label htmlFor="slug">Посилання (slug)</Label>
          <Input id="slug" placeholder="anna-studio" {...register('slug')} className="mt-1.5" />
          {slug && (
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              shinebeautycrm.com/m/<span className="text-violet-400">{slug}</span>
            </p>
          )}
          {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p>}
        </div>

        {/* Working Hours */}
        <div>
          <Label className="mb-3">Графік роботи</Label>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const isActive = workingHours[day] !== null;
              return (
                <div
                  key={day}
                  className="flex items-center gap-3 rounded-lg bg-[var(--glass-bg)] p-2.5"
                >
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => {
                      setValue(
                        `working_hours.${day}`,
                        checked
                          ? {
                              start: day === 'sat' ? '10:00' : '09:00',
                              end: day === 'sat' ? '17:00' : '19:00',
                            }
                          : null,
                        { shouldValidate: true }
                      );
                    }}
                  />
                  <span className="w-12 text-sm font-medium text-[var(--color-text)] sm:w-24">
                    <span className="hidden sm:inline">{DAY_LABELS[day]}</span>
                    <span className="sm:hidden">{DAY_LABELS[day]?.slice(0, 2)}</span>
                  </span>

                  {isActive ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={workingHours[day]?.start ?? '09:00'}
                        onChange={(e) => setValue(`working_hours.${day}.start`, e.target.value)}
                        className="rounded-md border border-[var(--glass-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)]"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-[var(--color-text-secondary)]">—</span>
                      <select
                        value={workingHours[day]?.end ?? '19:00'}
                        onChange={(e) => setValue(`working_hours.${day}.end`, e.target.value)}
                        className="rounded-md border border-[var(--glass-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)]"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--color-text-secondary)]">Вихідний</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 2: Services
// ═════════════════════════════════════════════════════════════════════════════

function Step2Services({
  selectedCategories,
  onCategoryToggle,
  serviceFields,
  servicesForm,
  onRemoveService,
  onAddCustomService,
}: {
  selectedCategories: Set<string>;
  onCategoryToggle: (id: string) => void;
  serviceFields: { id: string }[];
  servicesForm: ReturnType<typeof useForm<z.infer<typeof servicesArraySchema>>>;
  onRemoveService: (index: number) => void;
  onAddCustomService: () => void;
}) {
  const {
    register,
    formState: { errors },
  } = servicesForm;

  return (
    <GlassCard padding="lg">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/12">
          <Sparkles className="h-5 w-5 text-fuchsia-400" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)]">Ваші послуги</h2>
      </div>
      <p className="mb-5 text-sm text-[var(--color-text-secondary)]">
        Оберіть категорії — ми додамо типові послуги з цінами
      </p>

      {/* Category chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SERVICE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.has(cat.id);
          const IconComponent = CATEGORY_ICONS[cat.id];
          const colorSet = CATEGORY_COLORS[cat.color];
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryToggle(cat.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all',
                isSelected
                  ? cn('shadow-sm', colorSet?.border, colorSet?.bg, colorSet?.text)
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text-secondary)] hover:border-[var(--glass-border-hover)] hover:text-[var(--color-text)]'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-lg',
                  isSelected
                    ? cn(colorSet?.bg, colorSet?.text)
                    : 'bg-[var(--glass-bg)] text-[var(--color-text-secondary)]'
                )}
              >
                {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
              </span>
              <span>{cat.label}</span>
              {isSelected && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {/* Service list */}
      {serviceFields.length > 0 && (
        <div className="space-y-2">
          <div className="mb-2 hidden grid-cols-[1fr_80px_80px_32px] gap-2 px-1 text-xs font-medium text-[var(--color-text-secondary)] sm:grid">
            <span>Послуга</span>
            <span>Ціна, ₴</span>
            <span>Час, хв</span>
            <span />
          </div>

          <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
            {serviceFields.map((field, idx) => {
              const nameValue = servicesForm.getValues(`services.${idx}.name`);
              const isCustom = nameValue === '';

              // Custom service row — full editable form
              if (isCustom) {
                return (
                  <div
                    key={field.id}
                    className="space-y-2 rounded-lg border border-violet-500/20 bg-[var(--glass-bg)] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-violet-400">Нова послуга</span>
                      <button
                        type="button"
                        onClick={() => onRemoveService(idx)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Назва послуги"
                        className="h-8 text-sm"
                        {...register(`services.${idx}.name`)}
                      />
                      <select
                        className="h-8 rounded-md border border-[var(--glass-border)] bg-[var(--color-bg)] px-2 text-xs text-[var(--color-text)]"
                        {...register(`services.${idx}.category`)}
                      >
                        {SERVICE_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                        <option value="other">Інше</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="mb-1 block text-xs text-[var(--color-text-secondary)]">
                          Ціна, ₴
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-8 text-center text-xs"
                          {...register(`services.${idx}.price`, { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <span className="mb-1 block text-xs text-[var(--color-text-secondary)]">
                          Час, хв
                        </span>
                        <Input
                          type="number"
                          placeholder="30"
                          className="h-8 text-center text-xs"
                          {...register(`services.${idx}.duration`, { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              // Template service row — compact
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_70px_70px_32px] items-center gap-2 rounded-lg bg-[var(--glass-bg)] p-2 sm:grid-cols-[1fr_80px_80px_32px]"
                >
                  <span className="truncate text-sm text-[var(--color-text)]">{nameValue}</span>
                  <Input
                    type="number"
                    className="h-8 text-center text-xs"
                    {...register(`services.${idx}.price`, { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    className="h-8 text-center text-xs"
                    {...register(`services.${idx}.duration`, { valueAsNumber: true })}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveService(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {errors.services && <p className="text-xs text-red-400">Перевірте дані послуг</p>}

          <p className="pt-2 text-center text-xs text-[var(--color-text-secondary)]">
            {serviceFields.length} послуг обрано
          </p>
        </div>
      )}

      {serviceFields.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--glass-border)] py-12 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Оберіть категорії вище, щоб додати послуги
          </p>
        </div>
      )}

      {/* Add custom service */}
      <button
        type="button"
        onClick={onAddCustomService}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--glass-border)] py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-violet-500/50 hover:text-violet-400"
      >
        <Plus className="h-4 w-4" />
        Додати свою послугу
      </button>
    </GlassCard>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 3: Team
// ═════════════════════════════════════════════════════════════════════════════

function Step3Team({
  isSoloMaster,
  onToggleSolo,
  staffFields,
  staffForm,
  onAddStaff,
  onRemoveStaff,
}: {
  isSoloMaster: boolean;
  onToggleSolo: (v: boolean) => void;
  staffFields: { id: string }[];
  staffForm: ReturnType<typeof useForm<z.infer<typeof staffArraySchema>>>;
  onAddStaff: () => void;
  onRemoveStaff: (index: number) => void;
}) {
  const {
    register,
    formState: { errors },
  } = staffForm;

  return (
    <GlassCard padding="lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/12">
          <Users className="h-5 w-5 text-sky-400" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)]">Ваша команда</h2>
      </div>

      {/* Solo / Team toggle */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onToggleSolo(true)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
            isSoloMaster
              ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
              : 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text-secondary)] hover:border-[var(--glass-border-hover)]'
          )}
        >
          <User className="h-6 w-6" />
          <span className="text-sm font-medium">Я єдиний майстер</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleSolo(false)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
            !isSoloMaster
              ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
              : 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text-secondary)] hover:border-[var(--glass-border-hover)]'
          )}
        >
          <Users className="h-6 w-6" />
          <span className="text-sm font-medium">У мене є команда</span>
        </button>
      </div>

      {isSoloMaster ? (
        <div className="rounded-lg border border-dashed border-[var(--glass-border)] py-8 text-center">
          <User className="mx-auto mb-2 h-10 w-10 text-violet-400" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            Ми створимо ваш профіль майстра автоматично
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Staff list */}
          {staffFields.map((field, idx) => (
            <div
              key={field.id}
              className="relative rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4"
            >
              <button
                type="button"
                onClick={() => onRemoveStaff(idx)}
                className="absolute top-3 right-3 rounded-md p-1 text-red-400 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Ім&apos;я *</Label>
                  <Input
                    placeholder="Олена"
                    {...register(`members.${idx}.first_name`)}
                    className="mt-1"
                  />
                  {errors.members?.[idx]?.first_name && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.members[idx].first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Прізвище *</Label>
                  <Input
                    placeholder="Шевченко"
                    {...register(`members.${idx}.last_name`)}
                    className="mt-1"
                  />
                  {errors.members?.[idx]?.last_name && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.members[idx].last_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Спеціалізація</Label>
                  <Select
                    defaultValue="nail"
                    onValueChange={(value) =>
                      staffForm.setValue(`members.${idx}.specialization`, value)
                    }
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Оберіть" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec.id} value={spec.id}>
                          {spec.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Телефон</Label>
                  <Input
                    placeholder="+380 67 123 45 67"
                    {...register(`members.${idx}.phone`)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAddStaff}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--glass-border)] py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-violet-500/50 hover:text-violet-400"
          >
            <Plus className="h-4 w-4" />
            Додати майстра
          </button>
        </div>
      )}
    </GlassCard>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 4: Summary
// ═════════════════════════════════════════════════════════════════════════════

function Step4Summary({
  salonName,
  servicesCount,
  staffCount,
  loadDemoData,
  onToggleDemo,
}: {
  salonName: string;
  servicesCount: number;
  staffCount: number;
  loadDemoData: boolean;
  onToggleDemo: (v: boolean) => void;
}) {
  return (
    <GlassCard padding="lg">
      <div className="text-center">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30"
        >
          <CheckCircle2 className="h-10 w-10 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-2 text-2xl font-bold text-[var(--color-text)]"
        >
          Готово!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-sm text-[var(--color-text-secondary)]"
        >
          Ваш салон налаштовано
        </motion.p>

        {/* Summary cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 grid grid-cols-3 gap-3"
        >
          <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
            <p className="text-2xl font-bold text-violet-400">{salonName ? '1' : '0'}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Салон</p>
            <p className="mt-0.5 truncate text-xs font-medium text-[var(--color-text)]">
              {salonName || '—'}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
            <p className="text-2xl font-bold text-fuchsia-400">{servicesCount}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Послуг</p>
          </div>
          <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
            <p className="text-2xl font-bold text-violet-400">{staffCount}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Майстрів</p>
          </div>
        </motion.div>

        {/* Demo data toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text)]">Завантажити демо-дані</p>
              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                30 клієнтів, 50 записів — побачите як працює CRM
              </p>
            </div>
            <Switch checked={loadDemoData} onCheckedChange={onToggleDemo} />
          </div>
          {loadDemoData && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-violet-400" />
              Демо-дані допоможуть вам побачити як працює CRM. Їх можна видалити пізніше.
            </p>
          )}
        </motion.div>
      </div>
    </GlassCard>
  );
}
