-- ============================================================================
-- Shine Beauty CRM — Overhead витрати салону
-- Додає JSONB поле overhead до таблиці salons
-- ============================================================================

-- Додати поле overhead до salons
ALTER TABLE salons
ADD COLUMN IF NOT EXISTS overhead JSONB DEFAULT '{}';

-- Коментар для документації
COMMENT ON COLUMN salons.overhead IS 'Overhead cost config: {monthly_expenses, working_days, hours_per_day, masters_per_shift, master_commission_percent, desired_profit_percent}';

-- Seed overhead для тестового салону
UPDATE salons
SET overhead = '{
  "monthly_expenses": 292900,
  "working_days": 30,
  "hours_per_day": 8,
  "masters_per_shift": 5,
  "master_commission_percent": 35,
  "desired_profit_percent": 30
}'::jsonb
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
