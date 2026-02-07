-- ============================================================================
-- Shine Beauty CRM — Фінанси + маржинальність (Промт 10)
-- ============================================================================

-- ─── 1. Таблиця витрат ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period VARCHAR, -- monthly, weekly
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Зарплатна відомість ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue DECIMAL(10,2) DEFAULT 0,
  commission_percent DECIMAL(5,2) DEFAULT 35,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft','approved','paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Індекси ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_expenses_salon_date
  ON expenses(salon_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_category
  ON expenses(salon_id, category);

CREATE INDEX IF NOT EXISTS idx_payroll_salon_period
  ON payroll(salon_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_payroll_staff
  ON payroll(staff_id, period_start);

-- ─── 4. RLS ────────────────────────────────────────────────────────────────

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON expenses;
CREATE POLICY "allow_all" ON expenses FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all" ON payroll;
CREATE POLICY "allow_all" ON payroll FOR ALL USING (true);

-- ─── 5. Seed expenses для demo ─────────────────────────────────────────────

INSERT INTO expenses (salon_id, category, amount, description, date, is_recurring, recurring_period)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'rent', 30000, 'Оренда приміщення', '2026-02-01', true, 'monthly'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'utilities', 6000, 'Комунальні послуги', '2026-02-03', true, 'monthly'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'advertising', 16000, 'Реклама Instagram + Google', '2026-02-01', true, 'monthly'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'internet', 400, 'Інтернет Укртелеком', '2026-02-05', true, 'monthly'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'security', 1500, 'Охоронна система', '2026-02-01', true, 'monthly'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cleaning', 7000, 'Клінінг — щотижнева прибирання', '2026-02-01', true, 'monthly'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'materials', 4500, 'Закупка одноразових матеріалів', '2026-02-04', false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'equipment', 2800, 'Ремонт стерилізатора', '2026-01-28', false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'taxes', 8500, 'Єдиний податок 3 група', '2026-02-05', true, 'monthly'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'other', 1200, 'Канцтовари + друк', '2026-02-02', false, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Готово! Фінанси + маржинальність.
-- ============================================================================
