-- ============================================================
-- ShinePRO CRM — Supplier Integration System
-- Migration: supplier-tables.sql
-- Description: Full schema for supplier management, ordering,
--              auto-ordering rules, and sync logging.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Helper: reusable updated_at trigger function
--    (create only if not already present)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. SUPPLIERS — supplier registry per salon
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id         UUID           NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  -- Identity
  name             TEXT           NOT NULL,
  slug             TEXT           NOT NULL,                        -- unique per salon, regex [a-z0-9-]+
  type             TEXT           NOT NULL DEFAULT 'manual',      -- 'shine_shop' | 'prom_ua' | 'rozetka' | 'api' | 'manual'
  logo_url         TEXT,

  -- Contact info
  website          TEXT,
  phone            TEXT,
  email            TEXT,
  manager_name     TEXT,

  -- Integration config
  api_config       JSONB          DEFAULT '{}',                   -- credentials, endpoints, tokens
  capabilities     JSONB          DEFAULT '[]',                   -- e.g. ["catalog_sync","auto_order","price_watch"]

  -- Status
  is_active        BOOLEAN        DEFAULT true,
  last_sync_at     TIMESTAMPTZ,
  sync_status      TEXT           DEFAULT 'never',                -- 'never' | 'syncing' | 'success' | 'error'
  sync_error       TEXT,

  -- Commercial terms
  min_order_amount DECIMAL(10,2),
  delivery_days    INTEGER,
  payment_terms    TEXT,
  discount_percent DECIMAL(5,2),

  -- Timestamps
  created_at       TIMESTAMPTZ    DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    DEFAULT NOW(),

  -- Constraints
  CONSTRAINT uq_suppliers_salon_slug UNIQUE (salon_id, slug),
  CONSTRAINT chk_suppliers_slug      CHECK  (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT chk_suppliers_type      CHECK  (type IN ('shine_shop','prom_ua','rozetka','api','manual')),
  CONSTRAINT chk_suppliers_sync      CHECK  (sync_status IN ('never','syncing','success','error'))
);

COMMENT ON TABLE  suppliers IS 'Supplier registry — one row per supplier per salon';
COMMENT ON COLUMN suppliers.slug IS 'URL-friendly unique identifier within a salon';
COMMENT ON COLUMN suppliers.api_config IS 'JSON: API credentials, endpoints, refresh tokens';
COMMENT ON COLUMN suppliers.capabilities IS 'JSON array of supported features';


-- ============================================================
-- 2. SUPPLIER_PRODUCTS — supplier catalog + mapping to local inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS supplier_products (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id          UUID           NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  supplier_id       UUID           NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  inventory_item_id UUID           REFERENCES inventory_items(id) ON DELETE SET NULL,  -- nullable mapping

  -- External catalog data
  external_id       TEXT           NOT NULL,                      -- ID in supplier's system
  external_sku      TEXT,
  external_url      TEXT,

  -- Product info
  name              TEXT           NOT NULL,
  brand             TEXT,
  category          TEXT,
  description       TEXT,
  image_url         TEXT,

  -- Pricing
  price             DECIMAL(10,2)  NOT NULL,
  price_old         DECIMAL(10,2),                                -- previous price for comparison
  currency          TEXT           DEFAULT 'UAH',
  unit              TEXT           DEFAULT 'шт',
  volume            DECIMAL(10,2),

  -- Availability
  in_stock          BOOLEAN        DEFAULT true,
  stock_quantity    INTEGER,

  -- Sync metadata
  last_synced_at    TIMESTAMPTZ    DEFAULT NOW(),
  price_changed_at  TIMESTAMPTZ,
  is_discontinued   BOOLEAN        DEFAULT false,

  -- Timestamps
  created_at        TIMESTAMPTZ    DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    DEFAULT NOW(),

  -- Constraints
  CONSTRAINT uq_supplier_products_ext UNIQUE (supplier_id, external_id)
);

COMMENT ON TABLE  supplier_products IS 'Products from supplier catalogs, optionally mapped to local inventory';
COMMENT ON COLUMN supplier_products.inventory_item_id IS 'Link to local inventory_items row (NULL = not yet mapped)';
COMMENT ON COLUMN supplier_products.price_changed_at IS 'Timestamp of last price change detected during sync';


-- ============================================================
-- 3. SUPPLIER_ORDERS — orders placed to suppliers
-- ============================================================
CREATE TABLE IF NOT EXISTS supplier_orders (
  id                    UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id              UUID           NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  supplier_id           UUID           NOT NULL REFERENCES suppliers(id),

  -- Order identity
  order_number          TEXT           NOT NULL,                  -- auto-generated: "SO-2026-0001"
  status                TEXT           NOT NULL DEFAULT 'draft',  -- draft → pending → confirmed → shipped → delivered → completed | cancelled
  external_order_id     TEXT,                                     -- ID in supplier's system

  -- Financial
  subtotal              DECIMAL(10,2)  NOT NULL DEFAULT 0,
  discount_amount       DECIMAL(10,2)  DEFAULT 0,
  delivery_cost         DECIMAL(10,2)  DEFAULT 0,
  total                 DECIMAL(10,2)  NOT NULL DEFAULT 0,

  -- Details
  notes                 TEXT,
  tracking_number       TEXT,
  tracking_url          TEXT,

  -- Lifecycle timestamps
  ordered_at            TIMESTAMPTZ,
  confirmed_at          TIMESTAMPTZ,
  shipped_at            TIMESTAMPTZ,
  delivered_at          TIMESTAMPTZ,
  expected_delivery_at  TIMESTAMPTZ,

  -- Auto-ordering metadata
  is_auto_generated     BOOLEAN        DEFAULT false,
  auto_order_trigger    TEXT,                                     -- 'low_stock' | 'scheduled' | 'manual'

  -- Timestamps
  created_at            TIMESTAMPTZ    DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_supplier_orders_status CHECK (
    status IN ('draft','pending','confirmed','shipped','delivered','completed','cancelled')
  ),
  CONSTRAINT chk_supplier_orders_trigger CHECK (
    auto_order_trigger IS NULL OR auto_order_trigger IN ('low_stock','scheduled','manual')
  )
);

COMMENT ON TABLE  supplier_orders IS 'Purchase orders sent to suppliers';
COMMENT ON COLUMN supplier_orders.order_number IS 'Auto-generated: SO-YYYY-NNNN';
COMMENT ON COLUMN supplier_orders.is_auto_generated IS 'True if created by auto-order rules';


-- ============================================================
-- 4. SUPPLIER_ORDER_ITEMS — line items in supplier orders
-- ============================================================
CREATE TABLE IF NOT EXISTS supplier_order_items (
  id                       UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                 UUID           NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
  supplier_product_id      UUID           NOT NULL REFERENCES supplier_products(id),
  inventory_item_id        UUID           REFERENCES inventory_items(id),            -- nullable

  -- Quantities & pricing
  quantity                 INTEGER        NOT NULL,
  price_per_unit           DECIMAL(10,2)  NOT NULL,
  total                    DECIMAL(10,2)  NOT NULL,

  -- Receiving
  quantity_received        INTEGER        DEFAULT 0,
  received_at              TIMESTAMPTZ,
  inventory_transaction_id UUID           REFERENCES inventory_transactions(id),     -- nullable

  -- Timestamps
  created_at               TIMESTAMPTZ    DEFAULT NOW()
);

COMMENT ON TABLE  supplier_order_items IS 'Individual line items within a supplier order';
COMMENT ON COLUMN supplier_order_items.quantity_received IS 'How many units physically received so far';
COMMENT ON COLUMN supplier_order_items.inventory_transaction_id IS 'Link to the inventory transaction created on receipt';


-- ============================================================
-- 5. AUTO_ORDER_RULES — automatic reorder rules per product/supplier
-- ============================================================
CREATE TABLE IF NOT EXISTS auto_order_rules (
  id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id             UUID           NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  supplier_product_id  UUID           NOT NULL REFERENCES supplier_products(id),
  inventory_item_id    UUID           NOT NULL REFERENCES inventory_items(id),

  -- Rule config
  is_enabled           BOOLEAN        DEFAULT true,
  min_stock_threshold  INTEGER        NOT NULL,                   -- reorder when stock ≤ this
  reorder_quantity     INTEGER        NOT NULL,                   -- how many to order
  max_price            DECIMAL(10,2),                             -- skip if price exceeds this

  -- Execution tracking
  last_triggered_at    TIMESTAMPTZ,
  last_order_id        UUID           REFERENCES supplier_orders(id),

  -- Timestamps
  created_at           TIMESTAMPTZ    DEFAULT NOW(),
  updated_at           TIMESTAMPTZ    DEFAULT NOW(),

  -- Constraints
  CONSTRAINT uq_auto_order_rules UNIQUE (supplier_product_id, inventory_item_id)
);

COMMENT ON TABLE  auto_order_rules IS 'Automatic reorder rules: when stock drops below threshold, generate a supplier order';
COMMENT ON COLUMN auto_order_rules.min_stock_threshold IS 'Trigger reorder when inventory quantity ≤ this value';
COMMENT ON COLUMN auto_order_rules.max_price IS 'Safety cap: do not auto-order if supplier price exceeds this';


-- ============================================================
-- 6. SUPPLIER_SYNC_LOG — sync activity journal
-- ============================================================
CREATE TABLE IF NOT EXISTS supplier_sync_log (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id       UUID           NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  supplier_id    UUID           NOT NULL REFERENCES suppliers(id),

  -- Sync details
  sync_type      TEXT           NOT NULL,                         -- 'catalog' | 'prices' | 'stock' | 'order_status'
  status         TEXT           NOT NULL,                         -- 'started' | 'completed' | 'failed'
  items_synced   INTEGER        DEFAULT 0,
  items_updated  INTEGER        DEFAULT 0,
  items_added    INTEGER        DEFAULT 0,
  error_message  TEXT,
  duration_ms    INTEGER,

  -- Timestamps
  started_at     TIMESTAMPTZ    DEFAULT NOW(),
  completed_at   TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT chk_sync_log_type   CHECK (sync_type IN ('catalog','prices','stock','order_status')),
  CONSTRAINT chk_sync_log_status CHECK (status IN ('started','completed','failed'))
);

COMMENT ON TABLE supplier_sync_log IS 'Audit log for every supplier synchronization attempt';


-- ============================================================
-- INDEXES
-- ============================================================

-- suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_salon      ON suppliers (salon_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_salon_slug  ON suppliers (salon_id, slug);

-- supplier_products
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier  ON supplier_products (supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_inventory ON supplier_products (inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_external  ON supplier_products (supplier_id, external_id);

-- supplier_orders
CREATE INDEX IF NOT EXISTS idx_supplier_orders_salon  ON supplier_orders (salon_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON supplier_orders (salon_id, status);

-- supplier_order_items
CREATE INDEX IF NOT EXISTS idx_supplier_order_items_order ON supplier_order_items (order_id);

-- auto_order_rules
CREATE INDEX IF NOT EXISTS idx_auto_order_rules_inventory ON auto_order_rules (inventory_item_id);

-- supplier_sync_log
CREATE INDEX IF NOT EXISTS idx_supplier_sync_log_supplier ON supplier_sync_log (supplier_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE suppliers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_order_rules    ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_sync_log   ENABLE ROW LEVEL SECURITY;

-- Development-mode policies: allow all operations
CREATE POLICY "salon_isolation" ON suppliers            FOR ALL USING (true);
CREATE POLICY "salon_isolation" ON supplier_products    FOR ALL USING (true);
CREATE POLICY "salon_isolation" ON supplier_orders      FOR ALL USING (true);
CREATE POLICY "salon_isolation" ON supplier_order_items FOR ALL USING (true);
CREATE POLICY "salon_isolation" ON auto_order_rules     FOR ALL USING (true);
CREATE POLICY "salon_isolation" ON supplier_sync_log    FOR ALL USING (true);


-- ============================================================
-- FUNCTION: Auto-generate supplier order numbers
-- Format: SO-YYYY-NNNN (e.g. SO-2026-0001)
-- ============================================================
CREATE OR REPLACE FUNCTION generate_supplier_order_number(p_salon_id UUID)
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_seq     INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;

  -- Count existing orders for this salon in the current year, then +1
  SELECT COALESCE(MAX(
    NULLIF(
      SUBSTRING(order_number FROM 'SO-' || current_year || '-(\d+)'),
      ''
    )::INTEGER
  ), 0) + 1
  INTO next_seq
  FROM supplier_orders
  WHERE salon_id = p_salon_id
    AND order_number LIKE 'SO-' || current_year || '-%';

  RETURN 'SO-' || current_year || '-' || LPAD(next_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_supplier_order_number IS 'Generates sequential order number SO-YYYY-NNNN per salon per year';


-- ============================================================
-- TRIGGER: Auto-set order_number on INSERT into supplier_orders
-- ============================================================
CREATE OR REPLACE FUNCTION trg_set_supplier_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if order_number was not explicitly provided or is empty
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_supplier_order_number(NEW.salon_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_supplier_order_number
  BEFORE INSERT ON supplier_orders
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_supplier_order_number();


-- ============================================================
-- TRIGGER: Auto-receive inventory when quantity_received changes
-- on supplier_order_items
--
-- Logic:
--   When quantity_received increases and inventory_item_id is set:
--   1. Calculate diff = NEW - OLD received
--   2. INSERT into inventory_transactions
--   3. UPDATE inventory_items quantity
--   4. Set received_at = NOW()
-- ============================================================
CREATE OR REPLACE FUNCTION trg_auto_receive_inventory()
RETURNS TRIGGER AS $$
DECLARE
  diff           INTEGER;
  v_salon_id     UUID;
  v_order_number TEXT;
  v_txn_id       UUID;
BEGIN
  -- Only act when quantity_received actually increased
  IF NEW.quantity_received > OLD.quantity_received AND NEW.inventory_item_id IS NOT NULL THEN
    diff := NEW.quantity_received - OLD.quantity_received;

    -- Look up salon_id and order_number from the parent order
    SELECT so.salon_id, so.order_number
    INTO v_salon_id, v_order_number
    FROM supplier_orders so
    WHERE so.id = NEW.order_id;

    -- 1. Create an inventory transaction record
    INSERT INTO inventory_transactions (
      salon_id,
      product_id,
      type,
      quantity,
      notes
    ) VALUES (
      v_salon_id,
      NEW.inventory_item_id,
      'purchase',
      diff,
      'Автоприхід з замовлення ' || v_order_number
    )
    RETURNING id INTO v_txn_id;

    -- 2. Update the inventory item stock
    UPDATE inventory_items
    SET quantity = quantity + diff
    WHERE id = NEW.inventory_item_id;

    -- 3. Record the transaction link and receipt timestamp
    NEW.inventory_transaction_id := v_txn_id;
    NEW.received_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_receive_inventory
  BEFORE UPDATE ON supplier_order_items
  FOR EACH ROW
  EXECUTE FUNCTION trg_auto_receive_inventory();


-- ============================================================
-- TRIGGERS: Auto-update updated_at on row modification
-- ============================================================

CREATE TRIGGER set_updated_at_suppliers
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_supplier_products
  BEFORE UPDATE ON supplier_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_supplier_orders
  BEFORE UPDATE ON supplier_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_auto_order_rules
  BEFORE UPDATE ON auto_order_rules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- Done! Supplier integration schema is ready.
-- ============================================================
