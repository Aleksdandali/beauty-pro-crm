'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Calculator,
  BarChart3,
  Clock,
  Plus,
  Loader2,
  Search,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { GlassCard, GlassBadge, GlassModal } from '@/components/glass';
import { FadeIn, CountUp } from '@/components/animations';
import { MaterialsTable } from '@/components/shared/MaterialsTable';
import { MarginCalculator, MarginBadge } from '@/components/shared/MarginCalculator';
import {
  CATEGORY_LABELS,
  calculateCostBreakdown,
  type SalonOverhead,
  type MaterialCostItem,
} from '@/schemas/service';
import { createClient } from '@/lib/supabase/client';
import { useSalonId } from '@/components/providers/AuthProvider';
import type {
  ServiceWithMaterials,
  InventoryProduct,
  ServiceAppointmentStats,
} from '@/lib/queries/services';

// salon_id comes from useSalonId() hook below

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceDetailProps {
  service: ServiceWithMaterials;
  overhead: SalonOverhead | null;
  products: InventoryProduct[];
  appointmentStats: ServiceAppointmentStats;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'info', label: 'Інформація', icon: FileText },
  { id: 'cost', label: 'Собівартість', icon: Calculator },
  { id: 'stats', label: 'Статистика', icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─── Main ────────────────────────────────────────────────────────────────────

export function ServiceDetail({
  service,
  overhead,
  products,
  appointmentStats,
}: ServiceDetailProps) {
  const salonId = useSalonId();
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [materials, setMaterials] = useState<MaterialCostItem[]>(service.materials);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const materialsCost = materials.reduce((s, m) => s + m.total_cost, 0);
  const bd = calculateCostBreakdown(service.price, materialsCost, service.duration, overhead);
  const margin = bd.realMarginPercent;

  const handleRemoveMaterial = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase.from('service_materials').delete().eq('id', id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleMaterialAdded = useCallback((item: MaterialCostItem) => {
    setMaterials((prev) => [...prev, item]);
    setAddModalOpen(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────── */}
      <FadeIn>
        <Link
          href="/dashboard/services"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад до послуг
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-2 rounded-full" style={{ backgroundColor: service.color }} />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-foreground text-xl font-bold sm:text-2xl">{service.name}</h1>
                <GlassBadge variant="default" size="md">
                  {CATEGORY_LABELS[service.category] ?? service.category}
                </GlassBadge>
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration} хв
                </span>
                <span className="font-mono font-medium">
                  {service.price.toLocaleString('uk-UA')} ₴
                </span>
                <MarginBadge percent={margin} />
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Tabs ──────────────────────────────── */}
      <div className="relative border-b border-[var(--glass-border)]">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex shrink-0 items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {active && (
                  <motion.div
                    layoutId="service-tab-indicator"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────── */}
      <div>
        {activeTab === 'info' && <InfoTab service={service} />}
        {activeTab === 'cost' && (
          <CostTab
            service={service}
            materials={materials}
            overhead={overhead}
            onRemoveMaterial={handleRemoveMaterial}
            onAddClick={() => setAddModalOpen(true)}
          />
        )}
        {activeTab === 'stats' && <StatsTab service={service} stats={appointmentStats} bd={bd} />}
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        products={products}
        serviceId={service.id}
        existingProductIds={materials.map((m) => m.id)}
        onAdded={handleMaterialAdded}
        salonId={salonId}
      />
    </div>
  );
}

// ─── Info Tab ────────────────────────────────────────────────────────────────

function InfoTab({ service }: { service: ServiceWithMaterials }) {
  return (
    <GlassCard padding="md">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InfoField label="Назва" value={service.name} />
        <InfoField
          label="Категорія"
          value={CATEGORY_LABELS[service.category] ?? service.category}
        />
        <InfoField label="Ціна" value={`${service.price.toLocaleString('uk-UA')} ₴`} mono />
        <InfoField label="Тривалість" value={`${service.duration} хв`} />
        <div className="sm:col-span-2">
          <InfoField label="Опис" value={service.description ?? 'Без опису'} />
        </div>
        <InfoField label="Колір в календарі">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded" style={{ backgroundColor: service.color }} />
            <span className="text-foreground font-mono text-sm">{service.color}</span>
          </div>
        </InfoField>
      </div>
    </GlassCard>
  );
}

function InfoField({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-xs font-medium">{label}</p>
      {children ?? <p className={cn('text-foreground text-sm', mono && 'font-mono')}>{value}</p>}
    </div>
  );
}

// ─── Cost Tab ────────────────────────────────────────────────────────────────

function CostTab({
  service,
  materials,
  overhead,
  onRemoveMaterial,
  onAddClick,
}: {
  service: ServiceWithMaterials;
  materials: MaterialCostItem[];
  overhead: SalonOverhead | null;
  onRemoveMaterial: (id: string) => void;
  onAddClick: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Section A: Materials */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary-light flex h-8 w-8 items-center justify-center rounded-lg">
              <Package className="text-primary h-4 w-4" />
            </div>
            <h3 className="text-foreground text-sm font-semibold">Матеріали на процедуру</h3>
          </div>
          <button
            onClick={onAddClick}
            className="text-primary hover:bg-primary/5 border-primary/30 inline-flex items-center gap-1 rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus className="h-3 w-3" />
            Додати матеріал
          </button>
        </div>
        <MaterialsTable materials={materials} onRemove={onRemoveMaterial} />
      </div>

      {/* Section B + C: Overhead + Summary */}
      <MarginCalculator
        price={service.price}
        materials={materials}
        durationMinutes={service.duration}
        overhead={overhead}
      />
    </div>
  );
}

// ─── Stats Tab ───────────────────────────────────────────────────────────────

function StatsTab({
  service,
  stats,
  bd,
}: {
  service: ServiceWithMaterials;
  stats: ServiceAppointmentStats;
  bd: ReturnType<typeof calculateCostBreakdown>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard padding="sm">
          <p className="text-muted-foreground text-xs font-medium">Записів цього місяця</p>
          <p className="text-foreground mt-1 font-mono text-xl font-bold">
            <CountUp end={stats.monthlyCount} />
          </p>
        </GlassCard>
        <GlassCard padding="sm">
          <p className="text-muted-foreground text-xs font-medium">Дохід за місяць</p>
          <p className="text-foreground mt-1 font-mono text-xl font-bold">
            <CountUp end={stats.monthlyRevenue} suffix=" ₴" />
          </p>
        </GlassCard>
        <GlassCard padding="sm">
          <p className="text-muted-foreground text-xs font-medium">Прибуток за місяць</p>
          <p
            className={cn(
              'mt-1 font-mono text-xl font-bold',
              bd.realProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'
            )}
          >
            <CountUp end={bd.realProfit * stats.monthlyCount} suffix=" ₴" />
          </p>
        </GlassCard>
      </div>

      {/* Summary */}
      <GlassCard padding="md">
        <h3 className="text-foreground mb-4 text-sm font-semibold">Рентабельність</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ціна послуги</span>
            <span className="text-foreground font-mono font-medium">
              {service.price.toLocaleString('uk-UA')} ₴
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Повна собівартість</span>
            <span className="text-foreground font-mono">
              {bd.totalCost.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Прибуток на 1 процедуру</span>
            <span
              className={cn(
                'font-mono font-medium',
                bd.realProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {bd.realProfit.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Маржа</span>
            <MarginBadge percent={bd.realMarginPercent} />
          </div>
        </div>
      </GlassCard>

      {stats.monthlyCount === 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            Цього місяця записів з цією послугою ще не було
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Add Material Modal ──────────────────────────────────────────────────────

function AddMaterialModal({
  open,
  onClose,
  products,
  serviceId,
  existingProductIds,
  onAdded,
  salonId,
}: {
  open: boolean;
  onClose: () => void;
  products: InventoryProduct[];
  serviceId: string;
  existingProductIds: string[];
  salonId: string;
  onAdded: (item: MaterialCostItem) => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredProducts = products.filter(
    (p) => !existingProductIds.includes(p.id) && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const unitCost =
    selectedProduct && selectedProduct.quantity > 0
      ? selectedProduct.purchase_price / selectedProduct.quantity
      : 0;
  const totalCost = unitCost * (Number(quantity) || 0);

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity || Number(quantity) <= 0) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('service_materials')
      .insert({
        salon_id: salonId,
        service_id: serviceId,
        product_id: selectedProduct.id,
        quantity: Number(quantity),
      })
      .select('id')
      .single();

    setSubmitting(false);
    if (error) return;

    onAdded({
      id: data.id,
      product_name: selectedProduct.name,
      purchase_price: selectedProduct.purchase_price,
      unit: selectedProduct.unit,
      quantity_in_package: selectedProduct.quantity,
      quantity_per_service: Number(quantity),
      unit_cost: unitCost,
      total_cost: totalCost,
    });

    // Reset
    setSelectedProduct(null);
    setQuantity('');
    setSearch('');
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setQuantity('');
    setSearch('');
    onClose();
  };

  return (
    <GlassModal open={open} onClose={handleClose} title="Додати матеріал" size="md">
      <div className="space-y-5">
        {!selectedProduct ? (
          <>
            {/* Search product */}
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Пошук товару..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] pr-4 pl-10 text-sm"
                autoFocus
              />
            </div>

            <div className="max-h-60 space-y-1 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  {products.length === 0 ? 'Склад порожній' : 'Нічого не знайдено'}
                </p>
              ) : (
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--glass-bg-hover)]"
                  >
                    <div>
                      <p className="text-foreground text-sm font-medium">{p.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {p.brand?.name ? `${p.brand.name} · ` : ''}
                        {p.purchase_price.toLocaleString('uk-UA')} ₴ / {p.quantity} {p.unit}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs">{p.unit}</span>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Selected product details */}
            <GlassCard padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">{selectedProduct.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {selectedProduct.purchase_price.toLocaleString('uk-UA')} ₴ /{' '}
                    {selectedProduct.quantity} {selectedProduct.unit}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  Змінити
                </button>
              </div>
            </GlassCard>

            {/* Quantity input */}
            <div>
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                Витрата на 1 процедуру ({selectedProduct.unit})
              </label>
              <input
                type="number"
                step="0.1"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Наприклад: 2"
                className="text-foreground placeholder:text-muted-foreground h-10 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 font-mono text-sm"
                autoFocus
              />
            </div>

            {/* Auto-calculated cost */}
            {Number(quantity) > 0 && (
              <GlassCard padding="sm" className="bg-primary/5">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ціна за 1 {selectedProduct.unit}:</span>
                    <span className="text-foreground font-mono">
                      {unitCost.toLocaleString('uk-UA', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      ₴
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground font-medium">Вартість на процедуру:</span>
                    <span className="text-foreground font-mono font-bold">
                      {totalCost.toLocaleString('uk-UA', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      ₴
                    </span>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--glass-border)] pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !quantity || Number(quantity) <= 0}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Додати
              </button>
            </div>
          </>
        )}
      </div>
    </GlassModal>
  );
}
