'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Search,
  Plus,
  DollarSign,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  ShoppingCart,
  ChevronRight,
  Upload,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { GlassCard, GlassBadge } from '@/components/glass';
import { StatCard } from '@/components/glass/StatCard';
import { FadeIn, StaggerList } from '@/components/animations';
import { NewInventoryItemModal } from '@/components/shared/NewInventoryItemModal';
import { InventoryTransactionModal } from '@/components/shared/InventoryTransactionModal';
import { ImportInventoryModal } from '@/components/shared/ImportInventoryModal';
import { ExportInventoryModal } from '@/components/shared/ExportInventoryModal';
import {
  INVENTORY_CATEGORIES,
  STOCK_STATUS_CONFIG,
  getSupplierOrderUrl,
  type StockStatus,
} from '@/schemas/inventory';
import type { InventoryItem, InventoryBrand, InventoryStats } from '@/lib/queries/inventory';

// ─── Types ───────────────────────────────────────────────────────────────────

interface InventoryContentProps {
  items: InventoryItem[];
  stats: InventoryStats;
  brands: InventoryBrand[];
}

type StatusFilter = 'all' | StockStatus;

// ─── Component ───────────────────────────────────────────────────────────────

export function InventoryContent({ items, stats, brands }: InventoryContentProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [txModal, setTxModal] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    type: 'purchase' | 'usage';
  } | null>(null);

  // Filtering
  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.sku ?? '').toLowerCase().includes(q) ||
          (i.brand?.name ?? '').toLowerCase().includes(q)
      );
    }
    if (category !== 'all') result = result.filter((i) => i.category === category);
    if (statusFilter !== 'all') result = result.filter((i) => i.stockStatus === statusFilter);
    if (supplierFilter !== 'all') {
      if (supplierFilter === 'other') {
        result = result.filter(
          (i) => i.supplier && i.supplier !== 'Shine Shop' && i.supplier !== 'DEZIK'
        );
      } else {
        result = result.filter((i) => i.supplier === supplierFilter);
      }
    }
    return result;
  }, [items, search, category, statusFilter, supplierFilter]);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-2xl font-bold">Склад</h1>
            <GlassBadge variant="primary" size="md">
              {items.length} позицій
            </GlassBadge>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop: Import/Export buttons */}
            <button
              onClick={() => setImportOpen(true)}
              className="text-muted-foreground hover:text-foreground hidden items-center gap-1.5 rounded-lg border border-[var(--glass-border)] px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-bg-hover)] sm:inline-flex"
            >
              <Upload className="h-3.5 w-3.5" />
              Імпорт
            </button>
            <button
              onClick={() => setExportOpen(true)}
              className="text-muted-foreground hover:text-foreground hidden items-center gap-1.5 rounded-lg border border-[var(--glass-border)] px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass-bg-hover)] sm:inline-flex"
            >
              <Download className="h-3.5 w-3.5" />
              Експорт
            </button>

            {/* Mobile: overflow menu */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setMobileMenu((v) => !v)}
                className="text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--glass-border)]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {mobileMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMobileMenu(false)} />
                  <div className="bg-background absolute right-0 z-40 mt-1 w-40 rounded-lg border border-[var(--glass-border)] p-1 shadow-lg">
                    <button
                      onClick={() => {
                        setImportOpen(true);
                        setMobileMenu(false);
                      }}
                      className="text-foreground flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium hover:bg-[var(--glass-bg-hover)]"
                    >
                      <Upload className="h-3.5 w-3.5" /> Імпорт
                    </button>
                    <button
                      onClick={() => {
                        setExportOpen(true);
                        setMobileMenu(false);
                      }}
                      className="text-foreground flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium hover:bg-[var(--glass-bg-hover)]"
                    >
                      <Download className="h-3.5 w-3.5" /> Експорт
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40"
            >
              <Plus className="h-4 w-4" />
              Новий товар
            </button>
          </div>
        </div>
      </FadeIn>

      {/* ── Stat Cards ──────────────────────── */}
      <StaggerList delay={0.06} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Всього позицій"
          value={stats.totalItems}
          icon={<Package className="h-5 w-5" />}
          accentColor="primary"
        />
        <StatCard
          title="На складі"
          value={`${Math.round(stats.totalValue).toLocaleString('uk-UA')} ₴`}
          icon={<DollarSign className="h-5 w-5" />}
          accentColor="success"
        />
        <StatCard
          title="Потребує замовлення"
          value={stats.lowStockCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          accentColor="warning"
        />
        <StatCard
          title="Списано за місяць"
          value={Math.round(stats.usedThisMonth)}
          icon={<ArrowUpFromLine className="h-5 w-5" />}
          accentColor="error"
        />
      </StaggerList>

      {/* ── Filters ─────────────────────────── */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук по назві, SKU, бренду..."
            className="text-foreground placeholder:text-muted-foreground w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] py-2.5 pr-3 pl-10 text-sm"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          <FilterPill active={category === 'all'} onClick={() => setCategory('all')}>
            Всі
          </FilterPill>
          {INVENTORY_CATEGORIES.map((c) => (
            <FilterPill
              key={c.value}
              active={category === c.value}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </FilterPill>
          ))}
        </div>

        {/* Status + Supplier filters */}
        <div className="flex flex-wrap gap-1.5">
          <FilterPill active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            Всі статуси
          </FilterPill>
          <FilterPill
            active={statusFilter === 'in_stock'}
            onClick={() => setStatusFilter('in_stock')}
          >
            ✅ В наявності
          </FilterPill>
          <FilterPill active={statusFilter === 'low'} onClick={() => setStatusFilter('low')}>
            ⚠️ Мало
          </FilterPill>
          <FilterPill active={statusFilter === 'out'} onClick={() => setStatusFilter('out')}>
            🔴 Закінчився
          </FilterPill>
          <div className="mx-1 h-6 w-px bg-[var(--glass-border)]" />
          <FilterPill active={supplierFilter === 'all'} onClick={() => setSupplierFilter('all')}>
            Всі постачальники
          </FilterPill>
          <FilterPill
            active={supplierFilter === 'Shine Shop'}
            onClick={() => setSupplierFilter('Shine Shop')}
          >
            Shine Shop
          </FilterPill>
          <FilterPill
            active={supplierFilter === 'DEZIK'}
            onClick={() => setSupplierFilter('DEZIK')}
          >
            DEZIK
          </FilterPill>
        </div>
      </div>

      {/* ── Table (Desktop) ─────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState onAdd={() => setModalOpen(true)} />
      ) : (
        <>
          <div className="hidden lg:block">
            <GlassCard padding="none" hover={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)]">
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold">
                        Товар
                      </th>
                      <th className="text-muted-foreground px-3 py-3 text-left text-xs font-semibold">
                        Бренд
                      </th>
                      <th className="text-muted-foreground px-3 py-3 text-right text-xs font-semibold">
                        Закупка
                      </th>
                      <th className="text-muted-foreground px-3 py-3 text-right text-xs font-semibold">
                        Продаж
                      </th>
                      <th className="text-muted-foreground px-3 py-3 text-right text-xs font-semibold">
                        Залишок
                      </th>
                      <th className="text-muted-foreground px-3 py-3 text-center text-xs font-semibold">
                        Статус
                      </th>
                      <th className="text-muted-foreground px-3 py-3 text-center text-xs font-semibold">
                        Постачальник
                      </th>
                      <th className="text-muted-foreground px-3 py-3 text-right text-xs font-semibold">
                        Дії
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onPurchase={() =>
                          setTxModal({
                            productId: item.id,
                            productName: item.name,
                            quantity: item.quantity,
                            unit: item.unit,
                            type: 'purchase',
                          })
                        }
                        onUsage={() =>
                          setTxModal({
                            productId: item.id,
                            productName: item.name,
                            quantity: item.quantity,
                            unit: item.unit,
                            type: 'usage',
                          })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* ── Cards (Mobile) ──────────────────── */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((item) => (
              <MobileItemCard
                key={item.id}
                item={item}
                onPurchase={() =>
                  setTxModal({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    type: 'purchase',
                  })
                }
                onUsage={() =>
                  setTxModal({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    type: 'usage',
                  })
                }
              />
            ))}
          </div>
        </>
      )}

      {/* FAB mobile */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed right-4 bottom-20 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 lg:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modals */}
      <NewInventoryItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        brands={brands}
        onCreated={() => router.refresh()}
      />
      <ImportInventoryModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onCompleted={() => router.refresh()}
      />
      <ExportInventoryModal open={exportOpen} onClose={() => setExportOpen(false)} />
      {txModal && (
        <InventoryTransactionModal
          open={!!txModal}
          onClose={() => setTxModal(null)}
          productId={txModal.productId}
          productName={txModal.productName}
          currentQuantity={txModal.quantity}
          unit={txModal.unit}
          defaultType={txModal.type}
          onCompleted={() => {
            setTxModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-all',
        active
          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm'
          : 'text-muted-foreground hover:text-foreground border border-[var(--glass-border)] bg-[var(--glass-bg)]'
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
        <Package className="h-8 w-8 text-violet-400" />
      </div>
      <p className="text-foreground text-lg font-semibold">Склад порожній</p>
      <p className="text-muted-foreground mt-1 text-sm">Додайте перший товар</p>
      <button
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white"
      >
        <Plus className="h-4 w-4" />
        Додати товар
      </button>
    </div>
  );
}

// ─── Table Row ───────────────────────────────────────────────────────────────

function ItemRow({
  item,
  onPurchase,
  onUsage,
}: {
  item: InventoryItem;
  onPurchase: () => void;
  onUsage: () => void;
}) {
  const statusCfg = STOCK_STATUS_CONFIG[item.stockStatus];
  const orderUrl = getSupplierOrderUrl(item.supplier, item.supplier_url, item.name);
  const catLabel =
    INVENTORY_CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category;
  const needsOrder = item.stockStatus !== 'in_stock';

  return (
    <tr className="border-b border-[var(--glass-border)] transition-colors hover:bg-[var(--glass-bg-hover)]">
      {/* Product */}
      <td className="px-4 py-3">
        <Link href={`/dashboard/inventory/${item.id}`} className="group flex items-center gap-2">
          <span className="text-foreground group-hover:text-primary text-sm font-medium transition-colors">
            {item.name}
          </span>
          <GlassBadge variant="default" size="sm">
            {catLabel}
          </GlassBadge>
        </Link>
        {item.sku && <p className="text-muted-foreground mt-0.5 text-[10px]">SKU: {item.sku}</p>}
      </td>
      {/* Brand */}
      <td className="text-muted-foreground px-3 py-3 text-xs">{item.brand?.name ?? '—'}</td>
      {/* Purchase price */}
      <td className="text-foreground px-3 py-3 text-right font-mono text-xs">
        {item.purchase_price.toLocaleString('uk-UA')} ₴
      </td>
      {/* Retail price */}
      <td className="text-muted-foreground px-3 py-3 text-right font-mono text-xs">
        {item.retail_price > 0 ? `${item.retail_price.toLocaleString('uk-UA')} ₴` : '—'}
      </td>
      {/* Quantity */}
      <td className="text-foreground px-3 py-3 text-right font-mono text-sm font-bold">
        {item.quantity}{' '}
        <span className="text-muted-foreground text-[10px] font-normal">{item.unit}</span>
      </td>
      {/* Status */}
      <td className="px-3 py-3 text-center">
        <GlassBadge variant={statusCfg.variant} size="sm">
          {statusCfg.label}
        </GlassBadge>
      </td>
      {/* Supplier */}
      <td className="px-3 py-3 text-center">
        {item.supplier ? (
          <SupplierBadge supplier={item.supplier} />
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onPurchase}
            title="Прихід"
            className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-500 transition-colors hover:bg-emerald-500/10"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onUsage}
            title="Списати"
            className="flex h-7 w-7 items-center justify-center rounded-md text-rose-500 transition-colors hover:bg-rose-500/10"
          >
            <ArrowUpFromLine className="h-3.5 w-3.5" />
          </button>
          {needsOrder && orderUrl && (
            <button
              onClick={() => window.open(orderUrl, '_blank')}
              title="Замовити"
              className="flex h-7 items-center gap-1 rounded-md bg-violet-500/10 px-2 text-[10px] font-medium text-violet-500 transition-colors hover:bg-violet-500/20"
            >
              <ShoppingCart className="h-3 w-3" />
              Замовити
            </button>
          )}
          <Link
            href={`/dashboard/inventory/${item.id}`}
            className="text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--glass-bg-hover)]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

// ─── Mobile Card ─────────────────────────────────────────────────────────────

function MobileItemCard({
  item,
  onPurchase,
  onUsage,
}: {
  item: InventoryItem;
  onPurchase: () => void;
  onUsage: () => void;
}) {
  const statusCfg = STOCK_STATUS_CONFIG[item.stockStatus];
  const orderUrl = getSupplierOrderUrl(item.supplier, item.supplier_url, item.name);
  const needsOrder = item.stockStatus !== 'in_stock';

  return (
    <GlassCard className="space-y-2.5">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/dashboard/inventory/${item.id}`}
            className="text-foreground text-sm font-medium hover:underline"
          >
            {item.name}
          </Link>
          <div className="mt-0.5 flex items-center gap-2">
            {item.brand && <span className="text-muted-foreground text-xs">{item.brand.name}</span>}
            {item.supplier && <SupplierBadge supplier={item.supplier} />}
          </div>
        </div>
        <GlassBadge variant={statusCfg.variant} size="sm">
          {statusCfg.label}
        </GlassBadge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-foreground font-mono text-lg font-bold">
            {item.quantity}{' '}
            <span className="text-muted-foreground text-xs font-normal">{item.unit}</span>
          </span>
          <span className="text-muted-foreground font-mono text-xs">
            {item.purchase_price.toLocaleString('uk-UA')} ₴/шт
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--glass-border)] pt-2">
        <button
          onClick={onPurchase}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 py-2 text-xs font-medium text-emerald-500 transition-colors hover:bg-emerald-500/5"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" />
          Прихід
        </button>
        <button
          onClick={onUsage}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 py-2 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-500/5"
        >
          <ArrowUpFromLine className="h-3.5 w-3.5" />
          Списати
        </button>
        {needsOrder && orderUrl && (
          <button
            onClick={() => window.open(orderUrl, '_blank')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2 text-xs font-medium text-white"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Замовити
          </button>
        )}
      </div>
    </GlassCard>
  );
}

function SupplierBadge({ supplier }: { supplier: string }) {
  if (supplier === 'Shine Shop') {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-500">
        {supplier}
      </span>
    );
  }
  if (supplier === 'DEZIK') {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
        {supplier}
      </span>
    );
  }
  return (
    <span className="text-muted-foreground inline-flex rounded-full bg-[var(--glass-bg)] px-2 py-0.5 text-[10px] font-medium">
      {supplier}
    </span>
  );
}
