'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Store,
  Globe,
  ShoppingBag,
  Server,
  User,
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass';
import type { SupplierType, SupplierCapability } from '@/types/supplier';

// ─── Props ──────────────────────────────────────────────────────────────────

interface AddSupplierModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface SupplierTypeOption {
  type: SupplierType;
  icon: typeof Store;
  label: string;
  description: string;
  disabled?: boolean;
}

interface FormData {
  type: SupplierType | null;
  name: string;
  slug: string;
  website: string;
  phone: string;
  email: string;
  manager_name: string;
  api_key: string;
  base_url: string;
  auth_type: 'bearer' | 'x-api-key';
  min_order_amount: string;
  delivery_days: string;
  payment_terms: string;
  discount_percent: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SUPPLIER_TYPES: SupplierTypeOption[] = [
  {
    type: 'shine_shop',
    icon: Store,
    label: 'Shine Shop',
    description: 'Прямий доступ до каталогу nail-матеріалів',
  },
  {
    type: 'prom_ua',
    icon: Globe,
    label: 'Prom.ua',
    description: 'Підключіть через API-ключ',
  },
  {
    type: 'rozetka',
    icon: ShoppingBag,
    label: 'Rozetka',
    description: 'Скоро',
    disabled: true,
  },
  {
    type: 'api',
    icon: Server,
    label: 'Свій API',
    description: 'Будь-який REST API постачальника',
  },
  {
    type: 'manual',
    icon: User,
    label: 'Ручний',
    description: 'Без автоматизації, тільки облік замовлень',
  },
];

const PAYMENT_OPTIONS = [
  { value: '', label: 'Оберіть...' },
  { value: 'prepaid', label: 'Передоплата' },
  { value: 'postpaid', label: 'Післяплата' },
  { value: 'invoice', label: 'Рахунок' },
  { value: 'other', label: 'Інше' },
];

const CAPABILITIES_BY_TYPE: Record<SupplierType, SupplierCapability[]> = {
  shine_shop: ['catalog_sync', 'price_sync', 'stock_check', 'auto_order'],
  prom_ua: ['catalog_sync', 'price_sync'],
  rozetka: ['catalog_sync', 'price_sync'],
  api: ['catalog_sync', 'price_sync', 'stock_check'],
  manual: [],
};

const INITIAL_FORM: FormData = {
  type: null,
  name: '',
  slug: '',
  website: '',
  phone: '',
  email: '',
  manager_name: '',
  api_key: '',
  base_url: '',
  auth_type: 'bearer',
  min_order_amount: '',
  delivery_days: '',
  payment_terms: '',
  discount_percent: '',
};

// ─── Slug generator ─────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── Animation variants ─────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    transition: { duration: 0.15 },
  }),
};

// ─── Input styles ───────────────────────────────────────────────────────────

const inputClass = cn(
  'w-full rounded-lg px-3 py-2.5 text-sm',
  'bg-white/5 border border-white/10',
  'text-text-primary placeholder:text-text-muted',
  'focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30',
  'transition-colors duration-200'
);

const labelClass = 'block text-text-secondary text-xs font-medium mb-1.5';

// ─── Component ──────────────────────────────────────────────────────────────

export function AddSupplierModal({ open, onClose, onCreated }: AddSupplierModalProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [createdSupplierId, setCreatedSupplierId] = useState<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name') {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
    if (key === 'api_key') setVerified(false);
  }, []);

  const reset = useCallback(() => {
    setStep(1);
    setDirection(1);
    setForm(INITIAL_FORM);
    setSaving(false);
    setVerifying(false);
    setVerified(false);
    setShowSyncConfirm(false);
    setCreatedSupplierId(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // ── Prefill on type select ──────────────────────────────────────────────

  const selectType = useCallback(
    (type: SupplierType) => {
      const updates: Partial<FormData> = { type };

      if (type === 'shine_shop') {
        updates.name = 'Shine Shop';
        updates.slug = 'shine-shop';
        updates.website = 'https://shineshopb2b.com';
      } else if (type === 'prom_ua') {
        updates.name = '';
        updates.slug = '';
        updates.website = '';
      } else {
        updates.name = '';
        updates.slug = '';
        updates.website = '';
      }

      setForm((prev) => ({ ...prev, ...updates }));
      setVerified(false);
      goNext();
    },
    [goNext]
  );

  // ── Verify API key ─────────────────────────────────────────────────────

  const handleVerify = useCallback(async () => {
    if (!form.api_key.trim()) return;
    setVerifying(true);
    try {
      // Simulate API key verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setVerified(true);
    } catch {
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  }, [form.api_key]);

  // ── Save ────────────────────────────────────────────────────────────────

  const capabilities = useMemo<SupplierCapability[]>(
    () => (form.type ? CAPABILITIES_BY_TYPE[form.type] : []),
    [form.type]
  );

  const handleSave = useCallback(async () => {
    if (!form.type || !form.name.trim()) return;
    setSaving(true);

    try {
      const apiConfig: Record<string, unknown> = {};
      if (form.type === 'shine_shop' || form.type === 'prom_ua') {
        apiConfig.api_key = form.api_key;
      } else if (form.type === 'api') {
        apiConfig.api_key = form.api_key;
        apiConfig.base_url = form.base_url;
        apiConfig.auth_type = form.auth_type;
      }

      const body = {
        name: form.name.trim(),
        slug: form.slug || generateSlug(form.name),
        type: form.type,
        website: form.website || null,
        phone: form.phone || null,
        email: form.email || null,
        manager_name: form.manager_name || null,
        api_config: apiConfig,
        capabilities,
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
        delivery_days: form.delivery_days ? Number(form.delivery_days) : null,
        payment_terms: form.payment_terms || null,
        discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      };

      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Не вдалося створити постачальника');
      }

      const result = await res.json();
      const newId = result.data?.id ?? result.id;

      if (capabilities.includes('catalog_sync') && newId) {
        setCreatedSupplierId(newId);
        setShowSyncConfirm(true);
      } else {
        onCreated();
        reset();
      }
    } catch (err) {
      console.error('Save supplier error:', err);
      alert(err instanceof Error ? err.message : 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  }, [form, capabilities, onCreated, reset]);

  // ── Sync after create ──────────────────────────────────────────────────

  const handleSyncNow = useCallback(async () => {
    if (!createdSupplierId) return;
    try {
      await fetch(`/api/suppliers/${createdSupplierId}/sync`, { method: 'POST' });
    } catch {
      // Non-critical — sync will happen later
    }
    onCreated();
    reset();
  }, [createdSupplierId, onCreated, reset]);

  const handleSyncLater = useCallback(() => {
    onCreated();
    reset();
  }, [onCreated, reset]);

  // ── Step validity ──────────────────────────────────────────────────────

  const canProceedStep2 = useMemo(() => {
    if (!form.type) return false;
    if (!form.name.trim()) return false;
    if (form.type === 'api' && !form.base_url.trim()) return false;
    return true;
  }, [form.type, form.name, form.base_url]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
          style={{ zIndex: 200 }}
          role="dialog"
          aria-modal="true"
          aria-label="Додати постачальника"
        >
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            className={cn(
              'relative z-10 flex w-full max-w-lg flex-col',
              'rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]',
              '[backdrop-filter:blur(var(--glass-blur-heavy))] [-webkit-backdrop-filter:blur(var(--glass-blur-heavy))]',
              'max-h-[90vh] overflow-hidden'
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-3">
                {step > 1 && !showSyncConfirm && (
                  <button
                    onClick={goBack}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg',
                      'text-text-muted hover:text-text-primary hover:bg-[var(--glass-bg-hover)]',
                      'transition-colors duration-150'
                    )}
                    aria-label="Назад"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <h2 className="text-text-primary text-lg font-semibold">
                    {showSyncConfirm ? 'Синхронізація' : 'Додати постачальника'}
                  </h2>
                  {!showSyncConfirm && (
                    <p className="text-text-muted text-xs mt-0.5">
                      Крок {step} з 3
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  'text-text-muted hover:text-text-primary hover:bg-[var(--glass-bg-hover)]',
                  'transition-colors duration-150'
                )}
                aria-label="Закрити"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step progress bar */}
            {!showSyncConfirm && (
              <div className="flex gap-1 px-5 pt-3">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors duration-300',
                      s <= step
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                        : 'bg-white/10'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {showSyncConfirm ? (
                <SyncConfirmStep onNow={handleSyncNow} onLater={handleSyncLater} />
              ) : (
                <AnimatePresence mode="wait" custom={direction}>
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <Step1TypeSelect
                        selectedType={form.type}
                        onSelect={selectType}
                      />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <Step2Config
                        form={form}
                        onChange={updateField}
                        onVerify={handleVerify}
                        verifying={verifying}
                        verified={verified}
                      />
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <Step3Terms form={form} onChange={updateField} />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {!showSyncConfirm && step > 1 && (
              <div className="border-t border-[var(--border)] px-5 py-4 flex gap-3">
                {step === 2 && (
                  <button
                    onClick={goNext}
                    disabled={!canProceedStep2}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
                      'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
                      'transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'min-h-[44px]'
                    )}
                  >
                    Далі
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                {step === 3 && (
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name.trim()}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
                      'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
                      'transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'min-h-[44px]'
                    )}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Збереження...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Зберегти
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Step 1: Type Selection ─────────────────────────────────────────────────

function Step1TypeSelect({
  selectedType,
  onSelect,
}: {
  selectedType: SupplierType | null;
  onSelect: (type: SupplierType) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-text-secondary text-sm">Оберіть тип постачальника:</p>
      <div className="grid gap-2">
        {SUPPLIER_TYPES.map(({ type, icon: Icon, label, description, disabled }) => (
          <GlassCard
            key={type}
            hover={!disabled}
            padding="sm"
            onClick={disabled ? undefined : () => onSelect(type)}
            className={cn(
              disabled && 'opacity-50 cursor-not-allowed',
              selectedType === type && 'border-violet-500/50 bg-violet-500/10',
              !disabled && 'min-h-[44px]'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  disabled ? 'bg-white/5 text-text-muted' : 'bg-violet-500/15 text-violet-400'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary text-sm font-medium">{label}</p>
                <p className="text-text-muted text-xs">{description}</p>
              </div>
              {!disabled && (
                <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Configuration ──────────────────────────────────────────────────

function Step2Config({
  form,
  onChange,
  onVerify,
  verifying,
  verified,
}: {
  form: FormData;
  onChange: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onVerify: () => void;
  verifying: boolean;
  verified: boolean;
}) {
  if (form.type === 'shine_shop') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Назва</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Shine Shop"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Вебсайт</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => onChange('website', e.target.value)}
            placeholder="https://shineshopb2b.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>API-ключ</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.api_key}
              onChange={(e) => onChange('api_key', e.target.value)}
              placeholder="Введіть API-ключ"
              className={cn(inputClass, 'flex-1')}
            />
            <button
              onClick={onVerify}
              disabled={!form.api_key.trim() || verifying}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium',
                verified
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10',
                'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-[44px]'
              )}
            >
              {verifying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              {verified ? 'Перевірено' : 'Перевірити'}
            </button>
          </div>
          <p className="text-text-muted text-xs mt-1.5">
            API-ключ надається адміністратором Shine Shop
          </p>
        </div>
      </div>
    );
  }

  if (form.type === 'prom_ua') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Назва</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Мій постачальник Prom.ua"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>API-ключ</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.api_key}
              onChange={(e) => onChange('api_key', e.target.value)}
              placeholder="Введіть API-ключ Prom.ua"
              className={cn(inputClass, 'flex-1')}
            />
            <button
              onClick={onVerify}
              disabled={!form.api_key.trim() || verifying}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium',
                verified
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10',
                'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-[44px]'
              )}
            >
              {verifying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              {verified ? 'Перевірено' : 'Перевірити'}
            </button>
          </div>
          <p className="text-text-muted text-xs mt-1.5">
            Отримати API-ключ:{' '}
            <a
              href="https://my.prom.ua"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              my.prom.ua
            </a>{' '}
            &rarr; Налаштування &rarr; API
          </p>
        </div>
      </div>
    );
  }

  if (form.type === 'api') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Назва</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Назва постачальника"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Base URL</label>
          <input
            type="url"
            value={form.base_url}
            onChange={(e) => onChange('base_url', e.target.value)}
            placeholder="https://api.supplier.com/v1"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>API-ключ</label>
          <input
            type="text"
            value={form.api_key}
            onChange={(e) => onChange('api_key', e.target.value)}
            placeholder="Введіть API-ключ"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Тип авторизації</label>
          <select
            value={form.auth_type}
            onChange={(e) => onChange('auth_type', e.target.value as 'bearer' | 'x-api-key')}
            className={inputClass}
          >
            <option value="bearer">Bearer Token</option>
            <option value="x-api-key">X-API-Key</option>
          </select>
        </div>
      </div>
    );
  }

  // manual
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Назва</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Назва постачальника"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Телефон</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+380..."
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="email@supplier.com"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Менеджер</label>
        <input
          type="text"
          value={form.manager_name}
          onChange={(e) => onChange('manager_name', e.target.value)}
          placeholder="Ім'я менеджера"
          className={inputClass}
        />
      </div>
    </div>
  );
}

// ─── Step 3: Terms ──────────────────────────────────────────────────────────

function Step3Terms({
  form,
  onChange,
}: {
  form: FormData;
  onChange: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm">
        Умови співпраці (можна заповнити пізніше):
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Мін. замовлення, &#8372;</label>
          <input
            type="number"
            value={form.min_order_amount}
            onChange={(e) => onChange('min_order_amount', e.target.value)}
            placeholder="0"
            min="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Доставка, днів</label>
          <input
            type="number"
            value={form.delivery_days}
            onChange={(e) => onChange('delivery_days', e.target.value)}
            placeholder="0"
            min="0"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Умови оплати</label>
        <select
          value={form.payment_terms}
          onChange={(e) => onChange('payment_terms', e.target.value)}
          className={inputClass}
        >
          {PAYMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Знижка, %</label>
        <input
          type="number"
          value={form.discount_percent}
          onChange={(e) => onChange('discount_percent', e.target.value)}
          placeholder="0"
          min="0"
          max="100"
          className={inputClass}
        />
      </div>
    </div>
  );
}

// ─── Sync Confirm ───────────────────────────────────────────────────────────

function SyncConfirmStep({
  onNow,
  onLater,
}: {
  onNow: () => void;
  onLater: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
        <CheckCircle className="h-7 w-7 text-emerald-400" />
      </div>
      <div>
        <p className="text-text-primary font-semibold">Постачальника створено</p>
        <p className="text-text-secondary text-sm mt-1">
          Синхронізувати каталог зараз?
        </p>
      </div>
      <div className="flex gap-3 w-full">
        <button
          onClick={onLater}
          className={cn(
            'flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium',
            'bg-white/5 border border-white/10 text-text-secondary',
            'transition-colors hover:bg-white/10 hover:text-text-primary',
            'min-h-[44px]'
          )}
        >
          Пізніше
        </button>
        <button
          onClick={onNow}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
            'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
            'transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25',
            'min-h-[44px]'
          )}
        >
          Так
        </button>
      </div>
    </div>
  );
}
