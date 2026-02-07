-- ─── 003: Add supplier & marketplace fields to inventory ──────────────────

-- inventory_products: supplier fields
ALTER TABLE inventory_products
  ADD COLUMN IF NOT EXISTS supplier TEXT,
  ADD COLUMN IF NOT EXISTS supplier_url TEXT,
  ADD COLUMN IF NOT EXISTS supplier_sku TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS barcode TEXT;

-- inventory_brands: marketplace partner fields
ALTER TABLE inventory_brands
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT false;

-- inventory_transactions: supplier field
ALTER TABLE inventory_transactions
  ADD COLUMN IF NOT EXISTS supplier TEXT;

-- ─── Seed default brands ──────────────────────────────────────────────────

INSERT INTO inventory_brands (salon_id, name, website, is_partner) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'KODI Professional', 'https://kodi-professional.com', false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Komilfo', 'https://komilfo.ua', false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'OXXI', 'https://oxxi.ua', false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Shine Shop', 'https://shine-shop.com.ua', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'DEZIK', 'https://dezik.com.ua', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'GETLOUD', null, false)
ON CONFLICT DO NOTHING;
