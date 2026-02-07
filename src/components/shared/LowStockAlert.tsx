'use client';

import { AlertTriangle, ShoppingCart, ExternalLink } from 'lucide-react';
import { GlassCard, GlassBadge } from '@/components/glass';
import { getSupplierOrderUrl, STOCK_STATUS_CONFIG, type StockStatus } from '@/schemas/inventory';
import type { InventoryItem } from '@/lib/queries/inventory';

interface LowStockAlertProps {
  items: InventoryItem[];
  compact?: boolean;
}

export function LowStockAlert({ items, compact = false }: LowStockAlertProps) {
  if (items.length === 0) return null;

  const shineShopItems = items.filter((i) => i.supplier === 'Shine Shop');

  const handleOrderAll = () => {
    const names = shineShopItems.map((i) => i.name).join(', ');
    const url = `https://shine-shop.com.ua/search?q=${encodeURIComponent(names)}&utm_source=shine_crm&utm_medium=reorder&utm_campaign=bulk`;
    window.open(url, '_blank');
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
          {items.length} товар{items.length === 1 ? '' : items.length < 5 ? 'и' : 'ів'} потребують
          замовлення
        </span>
      </div>
    );
  }

  return (
    <GlassCard className="border-amber-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold">Потребує замовлення</p>
            <p className="text-muted-foreground text-xs">{items.length} позицій</p>
          </div>
        </div>
        {shineShopItems.length > 0 && (
          <button
            onClick={handleOrderAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Замовити в Shine Shop
          </button>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        {items.slice(0, 5).map((item) => {
          const cfg = STOCK_STATUS_CONFIG[item.stockStatus];
          const orderUrl = getSupplierOrderUrl(item.supplier, item.supplier_url, item.name);

          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-[var(--glass-bg)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <GlassBadge variant={cfg.variant} size="sm">
                  {cfg.emoji}
                </GlassBadge>
                <div>
                  <p className="text-foreground text-xs font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-[10px]">
                    Залишок: {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
              {orderUrl && (
                <button
                  onClick={() => window.open(orderUrl, '_blank')}
                  className="text-primary flex items-center gap-1 text-[10px] font-medium"
                >
                  Замовити <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
        {items.length > 5 && (
          <p className="text-muted-foreground text-center text-xs">
            + ще {items.length - 5} позицій
          </p>
        )}
      </div>
    </GlassCard>
  );
}
