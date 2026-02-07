'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Package,
  ArrowUpDown,
  BarChart3,
  ShoppingCart,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Zap,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { GlassCard, GlassBadge } from '@/components/glass';
import { FadeIn } from '@/components/animations';
import { InventoryTransactionModal } from '@/components/shared/InventoryTransactionModal';
import {
  INVENTORY_CATEGORIES,
  STOCK_STATUS_CONFIG,
  getSupplierOrderUrl,
} from '@/schemas/inventory';
import type { InventoryItem, InventoryTransaction, ServiceUsage } from '@/lib/queries/inventory';

// ─── Tab Config ──────────────────────────────────────────────────────────────

type TabId = 'info' | 'transactions' | 'usage' | 'order';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'info', label: 'Інформація', icon: Package },
  { id: 'transactions', label: 'Рух товару', icon: ArrowUpDown },
  { id: 'usage', label: 'Використання', icon: BarChart3 },
  { id: 'order', label: 'Замовлення', icon: ShoppingCart },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface InventoryDetailProps {
  item: InventoryItem;
  transactions: InventoryTransaction[];
  serviceUsage: ServiceUsage[];
}

export function InventoryDetail({ item, transactions, serviceUsage }: InventoryDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [txModal, setTxModal] = useState<'purchase' | 'usage' | null>(null);

  const statusCfg = STOCK_STATUS_CONFIG[item.stockStatus];
  const catLabel =
    INVENTORY_CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────── */}
      <FadeIn>
        <Link
          href="/dashboard/inventory"
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад до складу
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
              <Package className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-bold">{item.name}</h1>
              <div className="mt-0.5 flex items-center gap-2">
                <GlassBadge variant="default" size="sm">
                  {catLabel}
                </GlassBadge>
                <GlassBadge variant={statusCfg.variant} size="sm">
                  {statusCfg.label}
                </GlassBadge>
                {item.brand && (
                  <span className="text-muted-foreground text-xs">{item.brand.name}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTxModal('purchase')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-500 transition-colors hover:bg-emerald-500/5"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              Прихід
            </button>
            <button
              onClick={() => setTxModal('usage')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-2 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-500/5"
            >
              <ArrowUpFromLine className="h-3.5 w-3.5" />
              Списати
            </button>
          </div>
        </div>
      </FadeIn>

      {/* ── Tabs ────────────────────────────── */}
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
                  'relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {active && (
                  <motion.div
                    layoutId="inv-detail-tab"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────── */}
      {activeTab === 'info' && <InfoTab item={item} />}
      {activeTab === 'transactions' && <TransactionsTab transactions={transactions} />}
      {activeTab === 'usage' && (
        <UsageTab item={item} transactions={transactions} serviceUsage={serviceUsage} />
      )}
      {activeTab === 'order' && <OrderTab item={item} />}

      {/* Transaction Modal */}
      {txModal && (
        <InventoryTransactionModal
          open={!!txModal}
          onClose={() => setTxModal(null)}
          productId={item.id}
          productName={item.name}
          currentQuantity={item.quantity}
          unit={item.unit}
          defaultType={txModal}
          onCompleted={() => {
            setTxModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: INFO
// ═══════════════════════════════════════════════════════════════════════════════

function InfoTab({ item }: { item: InventoryItem }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GlassCard>
        <h3 className="text-foreground mb-3 text-sm font-semibold">Основне</h3>
        <div className="space-y-2.5">
          <InfoRow label="Назва" value={item.name} />
          <InfoRow
            label="Категорія"
            value={
              INVENTORY_CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category
            }
          />
          <InfoRow label="Бренд" value={item.brand?.name ?? '—'} />
          <InfoRow label="SKU" value={item.sku ?? '—'} />
          <InfoRow label="Штрихкод" value={item.barcode ?? '—'} />
          <InfoRow label="Одиниці" value={item.unit} />
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-foreground mb-3 text-sm font-semibold">Фінанси та склад</h3>
        <div className="space-y-2.5">
          <InfoRow
            label="Ціна закупки"
            value={`${item.purchase_price.toLocaleString('uk-UA')} ₴`}
            mono
          />
          <InfoRow
            label="Ціна продажу"
            value={item.retail_price > 0 ? `${item.retail_price.toLocaleString('uk-UA')} ₴` : '—'}
            mono
          />
          <InfoRow label="Залишок" value={`${item.quantity} ${item.unit}`} mono bold />
          <InfoRow label="Мін. залишок" value={`${item.min_quantity} ${item.unit}`} />
          <InfoRow
            label="Вартість на складі"
            value={`${Math.round(item.quantity * item.purchase_price).toLocaleString('uk-UA')} ₴`}
            mono
          />
        </div>
      </GlassCard>

      {(item.supplier || item.supplier_url) && (
        <GlassCard className="lg:col-span-2">
          <h3 className="text-foreground mb-3 text-sm font-semibold">Постачальник</h3>
          <div className="space-y-2.5">
            <InfoRow label="Постачальник" value={item.supplier ?? '—'} />
            {item.supplier_url && (
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground text-xs">URL</span>
                <a
                  href={item.supplier_url}
                  target="_blank"
                  rel="noopener"
                  className="text-primary flex items-center gap-1 text-xs hover:underline"
                >
                  {item.supplier_url.slice(0, 40)}... <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            <InfoRow label="SKU постачальника" value={item.supplier_sku ?? '—'} />
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={cn('text-foreground text-sm', mono && 'font-mono', bold && 'font-bold')}>
        {value}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const TX_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  purchase: { icon: ArrowDownToLine, color: 'text-emerald-500', label: 'Прихід' },
  usage: { icon: ArrowUpFromLine, color: 'text-rose-500', label: 'Списання' },
  auto_deduction: { icon: Zap, color: 'text-amber-500', label: 'Авто-списання' },
  adjustment: { icon: RefreshCw, color: 'text-blue-500', label: 'Коригування' },
  return: { icon: ArrowDownToLine, color: 'text-violet-500', label: 'Повернення' },
};

function TransactionsTab({ transactions }: { transactions: InventoryTransaction[] }) {
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered =
    typeFilter === 'all' ? transactions : transactions.filter((t) => t.type === typeFilter);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setTypeFilter('all')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-all',
            typeFilter === 'all'
              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
              : 'text-muted-foreground border border-[var(--glass-border)] bg-[var(--glass-bg)]'
          )}
        >
          Всі
        </button>
        {Object.entries(TX_ICONS).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-all',
              typeFilter === key
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
                : 'text-muted-foreground border border-[var(--glass-border)] bg-[var(--glass-bg)]'
            )}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">Немає транзакцій</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const defaultCfg = { icon: RefreshCw, color: 'text-blue-500', label: 'Інше' };
            const cfg = TX_ICONS[tx.type] ?? defaultCfg;
            const Icon = cfg.icon;
            const isPositive = tx.quantity > 0;

            return (
              <GlassCard key={tx.id} padding="sm" className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    `${cfg.color.replace('text-', 'bg-')}/10`
                  )}
                >
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-sm font-medium">{cfg.label}</span>
                    <span
                      className={cn(
                        'font-mono text-sm font-bold',
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
                      )}
                    >
                      {isPositive ? '+' : ''}
                      {tx.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[10px]">
                      {format(new Date(tx.created_at), 'dd.MM.yyyy HH:mm', { locale: uk })}
                    </span>
                    {tx.notes && (
                      <span className="text-muted-foreground max-w-[200px] truncate text-[10px] italic">
                        {tx.notes}
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: USAGE
// ═══════════════════════════════════════════════════════════════════════════════

function UsageTab({
  item,
  transactions,
  serviceUsage,
}: {
  item: InventoryItem;
  transactions: InventoryTransaction[];
  serviceUsage: ServiceUsage[];
}) {
  // Calculate usage stats
  const usageStats = useMemo(() => {
    const usageTx = transactions.filter((t) => t.type === 'usage' || t.type === 'auto_deduction');
    const totalUsed = usageTx.reduce((s, t) => s + Math.abs(t.quantity), 0);

    // Daily usage (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsage = usageTx
      .filter((t) => new Date(t.created_at) >= thirtyDaysAgo)
      .reduce((s, t) => s + Math.abs(t.quantity), 0);
    const dailyUsage = recentUsage / 30;

    // Procedures left
    const avgPerProcedure =
      serviceUsage.length > 0
        ? serviceUsage.reduce((s, u) => s + u.quantityPerService, 0) / serviceUsage.length
        : 0;
    const proceduresLeft = avgPerProcedure > 0 ? Math.floor(item.quantity / avgPerProcedure) : null;
    const daysLeft = dailyUsage > 0 ? Math.floor(item.quantity / dailyUsage) : null;

    return { totalUsed, dailyUsage, recentUsage, proceduresLeft, daysLeft };
  }, [item, transactions, serviceUsage]);

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat
          label="Списано всього"
          value={`${Math.round(usageStats.totalUsed)} ${item.unit}`}
        />
        <MiniStat label="За місяць" value={`${Math.round(usageStats.recentUsage)} ${item.unit}`} />
        <MiniStat
          label="Залишилось на"
          value={
            usageStats.proceduresLeft !== null ? `~${usageStats.proceduresLeft} процедур` : '—'
          }
          highlight
        />
        <MiniStat
          label="Закінчиться через"
          value={usageStats.daysLeft !== null ? `~${usageStats.daysLeft} днів` : '—'}
          highlight
          warn={usageStats.daysLeft !== null && usageStats.daysLeft < 14}
        />
      </div>

      {/* Services that use this product */}
      <GlassCard>
        <h3 className="text-foreground mb-3 text-sm font-semibold">Використовується в послугах</h3>
        {serviceUsage.length === 0 ? (
          <p className="text-muted-foreground text-xs">Не прив&apos;язаний до жодної послуги</p>
        ) : (
          <div className="space-y-2">
            {serviceUsage.map((su) => (
              <div
                key={su.serviceId}
                className="flex items-center justify-between rounded-lg bg-[var(--glass-bg)] px-3 py-2"
              >
                <span className="text-foreground text-sm">{su.serviceName}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {su.quantityPerService} {item.unit}/процедуру
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3',
        warn && 'border-amber-500/30'
      )}
    >
      <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-sm font-bold',
          warn ? 'text-amber-500' : highlight ? 'text-primary' : 'text-foreground'
        )}
      >
        {value}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: ORDER (Marketplace prep)
// ═══════════════════════════════════════════════════════════════════════════════

function OrderTab({ item }: { item: InventoryItem }) {
  const [copied, setCopied] = useState(false);
  const orderUrl = getSupplierOrderUrl(item.supplier, item.supplier_url, item.name);
  const recommendedQty = Math.max(0, item.min_quantity * 3 - item.quantity);

  const handleCopyList = async () => {
    const text = `${item.name}\nКількість: ${recommendedQty} ${item.unit}\nSKU: ${item.sku ?? '—'}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Supplier info */}
      <GlassCard>
        <h3 className="text-foreground mb-3 text-sm font-semibold">Постачальник</h3>
        <div className="space-y-2.5">
          <InfoRow label="Постачальник" value={item.supplier ?? 'Не вказаний'} />
          {item.brand?.website && (
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-xs">Сайт бренду</span>
              <a
                href={item.brand.website}
                target="_blank"
                rel="noopener"
                className="text-primary text-xs hover:underline"
              >
                {item.brand.website}
              </a>
            </div>
          )}
          {item.supplier_url && (
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-xs">Лінк на товар</span>
              <a
                href={item.supplier_url}
                target="_blank"
                rel="noopener"
                className="text-primary flex items-center gap-1 text-xs hover:underline"
              >
                Відкрити <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          <InfoRow label="SKU постачальника" value={item.supplier_sku ?? '—'} />
        </div>
      </GlassCard>

      {/* Recommended order */}
      <GlassCard className={recommendedQty > 0 ? 'border-amber-500/20' : ''}>
        <div className="flex items-center gap-2">
          {recommendedQty > 0 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          <h3 className="text-foreground text-sm font-semibold">
            {recommendedQty > 0 ? 'Рекомендуємо замовити' : 'Запас достатній'}
          </h3>
        </div>
        {recommendedQty > 0 && (
          <div className="mt-3 space-y-3">
            <div className="rounded-lg bg-[var(--glass-bg)] p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground text-xs">Залишок</span>
                <span className="text-foreground font-mono text-sm font-bold">
                  {item.quantity} {item.unit}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground text-xs">Оптимальний запас (×3)</span>
                <span className="text-muted-foreground font-mono text-sm">
                  {item.min_quantity * 3} {item.unit}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-[var(--glass-border)] pt-2">
                <span className="text-foreground text-xs font-semibold">Замовити</span>
                <span className="text-primary font-mono text-lg font-bold">
                  {recommendedQty} {item.unit}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {orderUrl && (
                <button
                  onClick={() => window.open(orderUrl, '_blank')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/20"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {item.supplier === 'Shine Shop'
                    ? 'Замовити в Shine Shop'
                    : 'Замовити у постачальника'}
                </button>
              )}
              <button
                onClick={handleCopyList}
                className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 rounded-lg border border-[var(--glass-border)] px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--glass-bg-hover)]"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Скопійовано' : 'Копіювати'}
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* No supplier configured */}
      {!item.supplier && (
        <div className="rounded-lg bg-amber-500/10 p-4 text-center">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-amber-500" />
          <p className="text-foreground text-sm font-medium">Постачальник не вказаний</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Додайте постачальника в налаштуваннях товару для швидкого замовлення
          </p>
        </div>
      )}
    </div>
  );
}
