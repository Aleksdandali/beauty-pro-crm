'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  Save,
  Search,
  Link2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type {
  SupplierWithStats,
  SupplierProductWithMapping,
  AutoOrderRuleWithDetails,
  SupplierSyncLog,
} from '@/types/supplier';

// ─── Props ──────────────────────────────────────────────────────────────────

interface SupplierSettingsModalProps {
  supplier: SupplierWithStats | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'general', label: 'Загальне' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'auto-order', label: 'Автозамовлення' },
  { id: 'log', label: 'Журнал' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const SYNC_TYPE_LABELS: Record<string, string> = {
  catalog: 'Каталог',
  prices: 'Ціни',
  stock: 'Залишки',
  order_status: 'Статуси',
};

const SYNC_STATUS_STYLES: Record<string, string> = {
  started: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-rose-500/20 text-rose-400',
};

const SYNC_STATUS_LABELS: Record<string, string> = {
  started: 'В процесі',
  completed: 'Успішно',
  failed: 'Помилка',
};

// ─── Component ──────────────────────────────────────────────────────────────

export function SupplierSettingsModal({
  supplier,
  open,
  onClose,
  onUpdated,
}: SupplierSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map());
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  // Reset tab when opening
  useEffect(() => {
    if (open) setActiveTab('general');
  }, [open]);

  // Sliding underline position
  useEffect(() => {
    const el = tabRefs.current.get(activeTab);
    if (el) {
      setUnderlineStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab]);

  // Prevent body scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && supplier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Налаштування: ${supplier.name}`}
        >
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={cn(
              'relative z-10 flex w-full max-w-2xl flex-col',
              'rounded-xl border border-[var(--glass-border)] bg-[var(--elevated)]',
              '[backdrop-filter:blur(var(--glass-blur-heavy))] [-webkit-backdrop-filter:blur(var(--glass-blur-heavy))]',
              'h-[calc(100dvh-2rem)] sm:h-auto sm:max-h-[85vh]',
            )}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
            exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {supplier.name}
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-[var(--glass-bg-hover)] hover:text-text-primary"
                aria-label="Закрити"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="relative border-b border-[var(--border)] px-5 sm:px-6">
              <div className="relative flex gap-1 rounded-lg bg-white/5 p-1">
                {/* Sliding underline */}
                <motion.div
                  className="absolute bottom-1 top-1 rounded-md bg-white/10"
                  animate={{ left: underlineStyle.left, width: underlineStyle.width }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      if (el) tabRefs.current.set(tab.id, el);
                    }}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'text-text-primary'
                        : 'text-text-muted hover:text-text-secondary',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              {activeTab === 'general' && (
                <GeneralTab supplier={supplier} onUpdated={onUpdated} />
              )}
              {activeTab === 'catalog' && (
                <CatalogTab supplierId={supplier.id} />
              )}
              {activeTab === 'auto-order' && (
                <AutoOrderTab supplierId={supplier.id} salonId={supplier.salon_id} />
              )}
              {activeTab === 'log' && (
                <LogTab supplierId={supplier.id} />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Tab: General ───────────────────────────────────────────────────────────

interface GeneralTabProps {
  supplier: SupplierWithStats;
  onUpdated: () => void;
}

function GeneralTab({ supplier, onUpdated }: GeneralTabProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: supplier.name,
    phone: supplier.phone ?? '',
    email: supplier.email ?? '',
    website: supplier.website ?? '',
    manager_name: supplier.manager_name ?? '',
    payment_terms: supplier.payment_terms ?? '',
    min_order_amount: supplier.min_order_amount ?? 0,
    delivery_days: supplier.delivery_days ?? 0,
    discount_percent: supplier.discount_percent ?? 0,
  });

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          manager_name: form.manager_name || null,
          payment_terms: form.payment_terms || null,
          min_order_amount: form.min_order_amount || null,
          delivery_days: form.delivery_days || null,
          discount_percent: form.discount_percent || null,
        }),
      });
      if (res.ok) onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none';

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Назва *</label>
        <input
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={inputCls}
          placeholder="Назва постачальника"
        />
      </div>

      {/* Contacts */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Телефон</label>
          <input
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputCls}
            placeholder="+380..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputCls}
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Сайт</label>
          <input
            value={form.website}
            onChange={(e) => handleChange('website', e.target.value)}
            className={inputCls}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Менеджер</label>
          <input
            value={form.manager_name}
            onChange={(e) => handleChange('manager_name', e.target.value)}
            className={inputCls}
            placeholder="Ім'я менеджера"
          />
        </div>
      </div>

      {/* Terms */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Умови оплати</label>
        <input
          value={form.payment_terms}
          onChange={(e) => handleChange('payment_terms', e.target.value)}
          className={inputCls}
          placeholder="Передоплата / Оплата при отриманні"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Мін. замовлення, ₴</label>
          <input
            type="number"
            value={form.min_order_amount}
            onChange={(e) => handleChange('min_order_amount', Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Доставка, днів</label>
          <input
            type="number"
            value={form.delivery_days}
            onChange={(e) => handleChange('delivery_days', Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Знижка, %</label>
          <input
            type="number"
            value={form.discount_percent}
            onChange={(e) => handleChange('discount_percent', Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end border-t border-[var(--glass-border)] pt-4">
        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Зберегти
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Catalog ───────────────────────────────────────────────────────────

interface CatalogTabProps {
  supplierId: string;
}

function CatalogTab({ supplierId }: CatalogTabProps) {
  const [products, setProducts] = useState<SupplierProductWithMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const fetchProducts = useCallback(
    async (pageNum: number, query: string) => {
      setLoading(true);
      try {
        const supabase = createClient();
        let q = supabase
          .from('supplier_products')
          .select('*, inventory_items:inventory_item_id(id, name, quantity)')
          .eq('supplier_id', supplierId)
          .order('name')
          .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        if (query.trim()) {
          q = q.ilike('name', `%${query.trim()}%`);
        }

        const { data, error } = await q;
        if (error) {
          console.error('Catalog fetch error:', error.message);
          return;
        }

        const mapped: SupplierProductWithMapping[] = (data ?? []).map((row) => {
          const inv = row.inventory_items as unknown as
            | { id: string; name: string; quantity: number; min_quantity: number }
            | null;
          return {
            ...row,
            inventory_items: undefined,
            inventory_item: inv ?? null,
          } as SupplierProductWithMapping;
        });

        setProducts(pageNum === 0 ? mapped : (prev) => [...prev, ...mapped]);
        setHasMore(mapped.length === PAGE_SIZE);
      } finally {
        setLoading(false);
      }
    },
    [supplierId],
  );

  useEffect(() => {
    setPage(0);
    fetchProducts(0, search);
  }, [search, fetchProducts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(next, search);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 0 }).format(price) + ' ₴';

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук товарів..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none"
        />
      </div>

      {/* Products table */}
      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">Товарів не знайдено</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-text-muted">
                <th className="pb-2 pr-2 font-medium" />
                <th className="pb-2 pr-2 font-medium">Назва</th>
                <th className="pb-2 pr-2 font-medium">Бренд</th>
                <th className="pb-2 pr-2 font-medium text-right">Ціна</th>
                <th className="pb-2 pr-2 font-medium text-center">Наявність</th>
                <th className="pb-2 font-medium">CRM</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 pr-2">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-white/5 text-text-muted text-xs">
                        —
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-2 text-text-primary">{p.name}</td>
                  <td className="py-2 pr-2 text-text-secondary">{p.brand ?? '—'}</td>
                  <td className="py-2 pr-2 text-right text-text-primary">{formatPrice(p.price)}</td>
                  <td className="py-2 pr-2 text-center">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        p.in_stock ? 'bg-emerald-400' : 'bg-rose-400',
                      )}
                      title={p.in_stock ? 'В наявності' : 'Немає'}
                    />
                  </td>
                  <td className="py-2">
                    {p.inventory_item_id ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        <Link2 className="h-3 w-3" />
                        {p.inventory_item?.name ?? 'Прив\'язано'}
                      </span>
                    ) : (
                      <button className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/20">
                        Прив&apos;язати
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load more */}
      {hasMore && products.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Завантажити ще'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Auto-Order ────────────────────────────────────────────────────────

interface AutoOrderTabProps {
  supplierId: string;
  salonId: string;
}

function AutoOrderTab({ supplierId, salonId }: AutoOrderTabProps) {
  const [rules, setRules] = useState<AutoOrderRuleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('auto_order_rules')
        .select(
          '*, supplier_product:supplier_products(id, name, supplier_id), inventory_item:inventory_items(id, name, quantity, min_quantity)',
        )
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Auto-order rules fetch error:', error.message);
        return;
      }

      // Filter by supplier
      const filtered = (data ?? []).filter(
        (r) => {
          const sp = r.supplier_product as unknown as { supplier_id: string } | null;
          return sp?.supplier_id === supplierId;
        },
      ) as unknown as AutoOrderRuleWithDetails[];

      setRules(filtered);
    } finally {
      setLoading(false);
    }
  }, [supplierId, salonId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    const supabase = createClient();
    await supabase
      .from('auto_order_rules')
      .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('id', ruleId);
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, is_enabled: enabled } : r)),
    );
  };

  const deleteRule = async (ruleId: string) => {
    const supabase = createClient();
    await supabase.from('auto_order_rules').delete().eq('id', ruleId);
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          Правил автозамовлення немає
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {rule.supplier_product?.name ?? 'Товар'}
                </p>
                <p className="text-xs text-text-muted">
                  при залишку &lt; {rule.min_stock_threshold} → замовити{' '}
                  {rule.reorder_quantity} шт
                </p>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleRule(rule.id, !rule.is_enabled)}
                className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
                title={rule.is_enabled ? 'Вимкнути' : 'Увімкнути'}
              >
                {rule.is_enabled ? (
                  <ToggleRight className="h-6 w-6 text-violet-400" />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteRule(rule.id)}
                className="shrink-0 text-text-muted transition-colors hover:text-rose-400"
                title="Видалити"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add rule placeholder */}
      <button className="w-full rounded-lg border border-dashed border-white/10 px-4 py-3 text-sm text-text-muted transition-colors hover:border-violet-500/30 hover:text-text-secondary">
        + Додати правило
      </button>
    </div>
  );
}

// ─── Tab: Log ───────────────────────────────────────────────────────────────

interface LogTabProps {
  supplierId: string;
}

function LogTab({ supplierId }: LogTabProps) {
  const [logs, setLogs] = useState<SupplierSyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('supplier_sync_log')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('started_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Sync log fetch error:', error.message);
          return;
        }
        setLogs(data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [supplierId]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (ms: number | null) => {
    if (ms == null) return '—';
    if (ms < 1000) return `${ms}мс`;
    return `${(ms / 1000).toFixed(1)}с`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-text-muted">
        <RefreshCw className="h-8 w-8" />
        <p className="text-sm">Журнал синхронізації порожній</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-text-muted">
            <th className="pb-2 pr-2 font-medium">Дата</th>
            <th className="pb-2 pr-2 font-medium">Тип</th>
            <th className="pb-2 pr-2 font-medium">Статус</th>
            <th className="pb-2 pr-2 font-medium text-right">Додано</th>
            <th className="pb-2 pr-2 font-medium text-right">Оновлено</th>
            <th className="pb-2 font-medium text-right">
              <Clock className="ml-auto h-3.5 w-3.5" />
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-2 pr-2 text-text-secondary">{formatDate(log.started_at)}</td>
              <td className="py-2 pr-2">
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400">
                  {SYNC_TYPE_LABELS[log.sync_type] ?? log.sync_type}
                </span>
              </td>
              <td className="py-2 pr-2">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    SYNC_STATUS_STYLES[log.status] ?? 'bg-white/10 text-white/60',
                  )}
                >
                  {SYNC_STATUS_LABELS[log.status] ?? log.status}
                </span>
              </td>
              <td className="py-2 pr-2 text-right text-text-primary">{log.items_added}</td>
              <td className="py-2 pr-2 text-right text-text-primary">{log.items_updated}</td>
              <td className="py-2 text-right text-text-muted">{formatDuration(log.duration_ms)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
