'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
  Package,
  Ban,
  ExternalLink,
  Search,
  X,
  ShoppingCart,
  Minus,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass';
import type {
  OrderStatus,
  Supplier,
  SupplierOrder,
  SupplierOrderWithItems,
  SupplierProduct,
} from '@/types/supplier';

// ─── Props ──────────────────────────────────────────────────────────────────

interface SupplierOrdersListProps {
  supplierId?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatAmount = (val: number) =>
  new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 0 }).format(val) + ' ₴';

const formatDate = (dateStr: string) =>
  format(new Date(dateStr), 'd MMM yyyy', { locale: uk });

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Чернетка',
  pending: 'Очікує',
  confirmed: 'Підтверджено',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  completed: 'Завершено',
  cancelled: 'Скасовано',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  draft: 'bg-white/10 text-white/60',
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-violet-500/20 text-violet-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-teal-500/20 text-teal-400',
  cancelled: 'bg-rose-500/20 text-rose-400',
};

// ─── Order list item from API ───────────────────────────────────────────────

interface OrderListItem extends SupplierOrder {
  items_count: number;
  supplier?: { id: string; name: string } | null;
}

// ─── New order modal types ──────────────────────────────────────────────────

interface CartItem {
  supplier_product_id: string;
  name: string;
  quantity: number;
  price_per_unit: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SupplierOrdersList({ supplierId }: SupplierOrdersListProps) {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<SupplierOrderWithItems | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);

  // Receive state
  const [receiving, setReceiving] = useState(false);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (supplierId) params.set('supplier_id', supplierId);
      const res = await fetch(`/api/supplier-orders?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json() as { data: OrderListItem[] };
      setOrders(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = async (orderId: string) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      setExpandedDetails(null);
      return;
    }

    setExpandedId(orderId);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/supplier-orders/${orderId}`);
      if (!res.ok) return;
      const json = await res.json() as { data: SupplierOrderWithItems };
      setExpandedDetails(json.data);

      // Prefill receive quantities
      const quantities: Record<string, number> = {};
      for (const item of json.data.items ?? []) {
        quantities[item.id] = item.quantity_received;
      }
      setReceiveQuantities(quantities);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReceive = async (orderId: string) => {
    if (!expandedDetails) return;
    setReceiving(true);
    try {
      const items = expandedDetails.items.map((item) => ({
        id: item.id,
        quantity_received: receiveQuantities[item.id] ?? 0,
      }));
      const res = await fetch(`/api/supplier-orders/${orderId}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        await fetchOrders();
        // Re-fetch details
        const detailRes = await fetch(`/api/supplier-orders/${orderId}`);
        if (detailRes.ok) {
          const json = await detailRes.json() as { data: SupplierOrderWithItems };
          setExpandedDetails(json.data);
        }
      }
    } finally {
      setReceiving(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    const res = await fetch(`/api/supplier-orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (res.ok) {
      await fetchOrders();
      setExpandedId(null);
      setExpandedDetails(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          Замовлення постачальникам
        </h2>
        <button
          onClick={() => setShowNewOrder(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20"
        >
          <Plus className="h-4 w-4" />
          Нове замовлення
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
          <ShoppingCart className="h-10 w-10" />
          <p className="text-sm">Замовлень поки немає</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const canCancel = order.status === 'draft' || order.status === 'pending';
            const canReceive =
              order.status === 'shipped' ||
              order.status === 'confirmed' ||
              order.status === 'delivered';

            return (
              <GlassCard key={order.id} padding="none" hover={false}>
                {/* Summary row */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {order.order_number}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          STATUS_STYLES[order.status],
                        )}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      {order.supplier && (
                        <span>{order.supplier.name}</span>
                      )}
                      <span>{order.items_count} товарів</span>
                      <span className="font-medium text-text-secondary">
                        {formatAmount(order.total)}
                      </span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-text-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
                  )}
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/10 p-4">
                        {detailsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                          </div>
                        ) : expandedDetails ? (
                          <div className="space-y-3">
                            {/* Items list */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-white/10 text-left text-text-muted">
                                    <th className="pb-2 pr-2 font-medium">Товар</th>
                                    <th className="pb-2 pr-2 font-medium text-right">К-сть</th>
                                    <th className="pb-2 pr-2 font-medium text-right">Ціна</th>
                                    <th className="pb-2 pr-2 font-medium text-right">Сума</th>
                                    <th className="pb-2 font-medium text-right">Отримано</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expandedDetails.items.map((item) => (
                                    <tr
                                      key={item.id}
                                      className="border-b border-white/5"
                                    >
                                      <td className="py-2 pr-2 text-text-primary">
                                        {item.supplier_product?.name ?? '—'}
                                      </td>
                                      <td className="py-2 pr-2 text-right text-text-secondary">
                                        {item.quantity}
                                      </td>
                                      <td className="py-2 pr-2 text-right text-text-secondary">
                                        {formatAmount(item.price_per_unit)}
                                      </td>
                                      <td className="py-2 pr-2 text-right text-text-primary">
                                        {formatAmount(item.total)}
                                      </td>
                                      <td className="py-2 text-right">
                                        {canReceive ? (
                                          <input
                                            type="number"
                                            min={0}
                                            max={item.quantity}
                                            value={receiveQuantities[item.id] ?? 0}
                                            onChange={(e) =>
                                              setReceiveQuantities((prev) => ({
                                                ...prev,
                                                [item.id]: Math.min(
                                                  Number(e.target.value),
                                                  item.quantity,
                                                ),
                                              }))
                                            }
                                            className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-right text-sm text-text-primary focus:border-violet-500/50 focus:outline-none"
                                          />
                                        ) : (
                                          <span
                                            className={cn(
                                              'text-xs',
                                              item.quantity_received >= item.quantity
                                                ? 'text-emerald-400'
                                                : 'text-text-muted',
                                            )}
                                          >
                                            {item.quantity_received}/{item.quantity}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Tracking */}
                            {expandedDetails.tracking_number && (
                              <div className="flex items-center gap-2 rounded-lg bg-white/5 p-3 text-sm">
                                <span className="text-text-muted">Відстеження:</span>
                                {expandedDetails.tracking_url ? (
                                  <a
                                    href={expandedDetails.tracking_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-violet-400 hover:underline"
                                  >
                                    {expandedDetails.tracking_number}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span className="text-text-primary">
                                    {expandedDetails.tracking_number}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              {canReceive && (
                                <button
                                  onClick={() => handleReceive(order.id)}
                                  disabled={receiving}
                                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                                >
                                  {receiving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Package className="h-4 w-4" />
                                  )}
                                  Підтвердити отримання
                                </button>
                              )}
                              {canCancel && (
                                <button
                                  onClick={() => handleCancel(order.id)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-rose-500/20 px-4 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/30"
                                >
                                  <Ban className="h-4 w-4" />
                                  Скасувати
                                </button>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* New Order Modal */}
      <NewOrderModal
        open={showNewOrder}
        preselectedSupplierId={supplierId}
        onClose={() => setShowNewOrder(false)}
        onCreated={() => {
          setShowNewOrder(false);
          fetchOrders();
        }}
      />
    </div>
  );
}

// ─── New Order Modal ────────────────────────────────────────────────────────

interface NewOrderModalProps {
  open: boolean;
  preselectedSupplierId?: string;
  onClose: () => void;
  onCreated: () => void;
}

function NewOrderModal({ open, preselectedSupplierId, onClose, onCreated }: NewOrderModalProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(preselectedSupplierId ?? '');
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SupplierProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch suppliers
  useEffect(() => {
    if (!open) return;
    const fetchSuppliers = async () => {
      const res = await fetch('/api/suppliers');
      if (!res.ok) return;
      const json = await res.json() as { suppliers: Supplier[] };
      setSuppliers(json.suppliers ?? []);
    };
    fetchSuppliers();
  }, [open]);

  // Reset when opening
  useEffect(() => {
    if (open) {
      setSelectedSupplierId(preselectedSupplierId ?? '');
      setCart([]);
      setNotes('');
      setProductSearch('');
      setSearchResults([]);
    }
  }, [open, preselectedSupplierId]);

  // Search products with debounce
  useEffect(() => {
    if (!selectedSupplierId || !productSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/suppliers/${selectedSupplierId}/search?q=${encodeURIComponent(productSearch)}`,
        );
        if (!res.ok) return;
        const json = await res.json() as { data: SupplierProduct[] };
        setSearchResults(json.data ?? []);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedSupplierId, productSearch]);

  const addToCart = (product: SupplierProduct) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.supplier_product_id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.supplier_product_id === product.id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [
        ...prev,
        {
          supplier_product_id: product.id,
          name: product.name,
          quantity: 1,
          price_per_unit: product.price,
        },
      ];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.supplier_product_id === productId
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.supplier_product_id !== productId));
  };

  const total = cart.reduce((sum, c) => sum + c.quantity * c.price_per_unit, 0);

  const handleSubmit = async (asDraft: boolean) => {
    if (!selectedSupplierId || cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/supplier-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: selectedSupplierId,
          status: asDraft ? 'draft' : 'pending',
          notes: notes || null,
          items: cart.map((c) => ({
            supplier_product_id: c.supplier_product_id,
            quantity: c.quantity,
            price_per_unit: c.price_per_unit,
          })),
        }),
      });
      if (res.ok) onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent body scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'relative z-10 flex w-full max-w-lg flex-col',
              'rounded-xl border border-[var(--glass-border)] bg-[var(--elevated)]',
              '[backdrop-filter:blur(var(--glass-blur-heavy))] [-webkit-backdrop-filter:blur(var(--glass-blur-heavy))]',
              'max-h-[85vh]',
            )}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
            exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-lg font-semibold text-text-primary">Нове замовлення</h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-[var(--glass-bg-hover)] hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {/* Supplier select */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Постачальник *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => {
                    setSelectedSupplierId(e.target.value);
                    setCart([]);
                    setProductSearch('');
                    setSearchResults([]);
                  }}
                  className={inputCls}
                >
                  <option value="">Оберіть постачальника</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product search */}
              {selectedSupplierId && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">
                    Додати товари
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Пошук товарів постачальника..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Search results */}
                  {searchLoading && (
                    <div className="mt-2 flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                    </div>
                  )}
                  {!searchLoading && searchResults.length > 0 && (
                    <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2">
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addToCart(p)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/10"
                        >
                          <Plus className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                          <span className="min-w-0 flex-1 truncate text-text-primary">
                            {p.name}
                          </span>
                          <span className="shrink-0 text-text-secondary">
                            {formatAmount(p.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cart */}
              {cart.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-text-secondary">
                    Товари ({cart.length})
                  </span>
                  {cart.map((item) => (
                    <div
                      key={item.supplier_product_id}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-muted">
                          {formatAmount(item.price_per_unit)} × {item.quantity} ={' '}
                          {formatAmount(item.price_per_unit * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateCartQty(item.supplier_product_id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-text-muted hover:text-text-primary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm text-text-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.supplier_product_id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-text-muted hover:text-text-primary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.supplier_product_id)}
                          className="ml-1 flex h-6 w-6 items-center justify-center rounded text-text-muted hover:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-sm font-medium text-text-secondary">Разом</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {formatAmount(total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Коментар
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={inputCls}
                  placeholder="Додатковий коментар..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--glass-border)] px-5 py-4">
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting || cart.length === 0 || !selectedSupplierId}
                className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/20 disabled:opacity-50"
              >
                Зберегти чернетку
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting || cart.length === 0 || !selectedSupplierId}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Надіслати замовлення
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
