'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Plus,
  Loader2,
  X,
  PackagePlus,
  PackageSearch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Supplier, SupplierCapability } from '@/types/supplier';

// ─── Props ──────────────────────────────────────────────────────────────────

interface SupplierProductSearchProps {
  onProductAdded?: () => void;
}

// ─── Search result type (from API) ──────────────────────────────────────────

interface SearchResult {
  externalId: string;
  name: string;
  brand: string | null;
  price: number;
  imageUrl: string | null;
  inStock: boolean;
  linkedInventoryItemId: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 0 }).format(price) + ' ₴';

// ─── Component ──────────────────────────────────────────────────────────────

export function SupplierProductSearch({ onProductAdded }: SupplierProductSearchProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  // Add-to-inventory modal
  const [addingProduct, setAddingProduct] = useState<SearchResult | null>(null);
  const [addForm, setAddForm] = useState({ quantity: 1, minStock: 5, autoOrder: false });
  const [addSubmitting, setAddSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch suppliers with catalog_sync capability
  useEffect(() => {
    const fetchSuppliers = async () => {
      setSuppliersLoading(true);
      try {
        const res = await fetch('/api/suppliers');
        if (!res.ok) return;
        const json = await res.json() as { suppliers: Supplier[] };
        const filtered = (json.suppliers ?? []).filter((s: Supplier) =>
          s.capabilities.includes('catalog_sync' as SupplierCapability),
        );
        setSuppliers(filtered);
        if (filtered.length === 1 && filtered[0]) {
          setSelectedSupplierId(filtered[0].id);
        }
      } finally {
        setSuppliersLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  // Debounced search
  const performSearch = useCallback(
    async (supplierId: string, searchQuery: string) => {
      if (!supplierId || !searchQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/suppliers/${supplierId}/search?q=${encodeURIComponent(searchQuery.trim())}`,
        );
        if (!res.ok) {
          setResults([]);
          return;
        }
        const json = await res.json() as { data: SearchResult[] };
        setResults(json.data ?? []);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || !selectedSupplierId) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(selectedSupplierId, query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedSupplierId, performSearch]);

  // Open add-to-inventory mini modal
  const openAddModal = (product: SearchResult) => {
    setAddingProduct(product);
    setAddForm({ quantity: 1, minStock: 5, autoOrder: false });
  };

  const handleAddToInventory = async () => {
    if (!addingProduct || !selectedSupplierId) return;
    setAddSubmitting(true);
    try {
      // Create inventory item and link supplier product
      const res = await fetch('/api/suppliers/' + selectedSupplierId + '/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          external_id: addingProduct.externalId,
          name: addingProduct.name,
          quantity: addForm.quantity,
          min_quantity: addForm.minStock,
          auto_order: addForm.autoOrder,
          auto_order_threshold: addForm.minStock,
        }),
      });

      if (res.ok) {
        setAddingProduct(null);
        onProductAdded?.();
        // Re-search to update linked statuses
        if (query.trim()) {
          performSearch(selectedSupplierId, query);
        }
      }
    } finally {
      setAddSubmitting(false);
    }
  };

  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none';

  return (
    <div className="space-y-4">
      {/* Supplier select */}
      {suppliersLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Завантаження постачальників...
        </div>
      ) : suppliers.length === 0 ? (
        <p className="text-sm text-text-muted">
          Немає постачальників із синхронізацією каталогу
        </p>
      ) : (
        <>
          {suppliers.length > 1 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Постачальник
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => {
                  setSelectedSupplierId(e.target.value);
                  setQuery('');
                  setResults([]);
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
          )}

          {/* Search input */}
          {selectedSupplierId && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Пошук товарів у каталозі постачальника..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none"
              />
            </div>
          )}
        </>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 animate-pulse"
            >
              <div className="h-12 w-12 rounded bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-white/10" />
                <div className="h-2.5 w-1/3 rounded bg-white/10" />
              </div>
              <div className="h-8 w-8 rounded bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((product) => (
            <div
              key={product.externalId}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/[0.07]"
            >
              {/* Image */}
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white/10 text-text-muted">
                  <PackageSearch className="h-5 w-5" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {product.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {product.brand && (
                    <span className="text-xs text-text-muted">{product.brand}</span>
                  )}
                  <span className="text-xs font-medium text-text-secondary">
                    {formatPrice(product.price)}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                      product.inStock
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400',
                    )}
                  >
                    {product.inStock ? 'В наявності' : 'Немає'}
                  </span>
                </div>
              </div>

              {/* Action */}
              {product.linkedInventoryItemId ? (
                <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  На складі
                </span>
              ) : (
                <button
                  onClick={() => openAddModal(product)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-xs font-medium text-white transition-shadow hover:shadow-lg hover:shadow-violet-500/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Додати на склад</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && query.trim() && selectedSupplierId && results.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-text-muted">
          <PackageSearch className="h-8 w-8" />
          <p className="text-sm">Нічого не знайдено</p>
        </div>
      )}

      {/* Add-to-inventory mini modal */}
      <AnimatePresence>
        {addingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddingProduct(null)}
            />
            <motion.div
              className={cn(
                'relative z-10 w-full max-w-sm',
                'rounded-xl border border-[var(--glass-border)] bg-[var(--elevated)]',
                '[backdrop-filter:blur(var(--glass-blur-heavy))] [-webkit-backdrop-filter:blur(var(--glass-blur-heavy))]',
              )}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
              exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                <h4 className="text-sm font-semibold text-text-primary">
                  Додати на склад
                </h4>
                <button
                  onClick={() => setAddingProduct(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-[var(--glass-bg-hover)] hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-3 px-4 py-3">
                {/* Product info */}
                <div className="flex items-center gap-3 rounded-lg bg-white/5 p-2">
                  {addingProduct.imageUrl ? (
                    <img
                      src={addingProduct.imageUrl}
                      alt={addingProduct.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-white/10 text-text-muted">
                      <PackagePlus className="h-4 w-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {addingProduct.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatPrice(addingProduct.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">
                      Кількість
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={addForm.quantity}
                      onChange={(e) =>
                        setAddForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">
                      Мін. залишок
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={addForm.minStock}
                      onChange={(e) =>
                        setAddForm((prev) => ({ ...prev, minStock: Number(e.target.value) }))
                      }
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Auto-order checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.autoOrder}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, autoOrder: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-violet-500 focus:ring-violet-500/50"
                  />
                  <span className="text-sm text-text-secondary">
                    Автозамовлення при залишку &lt; {addForm.minStock} шт
                  </span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-[var(--glass-border)] px-4 py-3">
                <button
                  onClick={() => setAddingProduct(null)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleAddToInventory}
                  disabled={addSubmitting || addForm.quantity < 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-60"
                >
                  {addSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Додати
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
