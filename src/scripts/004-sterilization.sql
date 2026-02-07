-- ============================================================================
-- Shine Beauty CRM — Стерилізація (Промт 9)
-- Електронний журнал стерилізації — KILLER FEATURE
-- ============================================================================

-- ПРИМІТКА: таблиці sterilization_equipment, sterilization_instrument_sets,
-- sterilization_cycles, sterilization_storage, equipment_maintenance
-- вже створені в 001-base-tables.sql.
-- Цей скрипт ДОДАЄ поля яких не вистачає та оновлює тригери.

-- ─── 1. Додати поля до sterilization_cycles ──────────────────────────────────

-- Етап
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS stage VARCHAR DEFAULT 'preparation';

-- Підготовка
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS preparation_notes TEXT;

-- Дезінфекція (розширення)
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS disinfection_concentration VARCHAR;

-- Стерилізація (розширення)
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS sterilization_mode VARCHAR;

-- Пакування
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS packaging_photo TEXT;

-- Результат
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS result_notes TEXT;

-- Пакети стерилізації (JSONB масив: [{set_id, set_name, packaging}, {instruments, packaging}])
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS packages JSONB DEFAULT '[]';

-- Сушка (НОВИЙ ЕТАП — інструменти мають бути абсолютно сухими)
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS drying_started_at TIMESTAMPTZ;
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS drying_completed_at TIMESTAMPTZ;
ALTER TABLE sterilization_cycles ADD COLUMN IF NOT EXISTS drying_method VARCHAR;

-- ─── 2. Додати поля до sterilization_storage ─────────────────────────────────

ALTER TABLE sterilization_storage ADD COLUMN IF NOT EXISTS storage_location VARCHAR DEFAULT '';
ALTER TABLE sterilization_storage ADD COLUMN IF NOT EXISTS used_by_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

-- ─── 3. Оновити тригер блокування (якщо потрібно перестворити) ────────────────

CREATE OR REPLACE FUNCTION prevent_locked_cycle_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true THEN
    RAISE EXCEPTION 'Цикл заблоковано. Зміни заборонені після завершення.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер вже існує з 001, але recreate для безпеки
DROP TRIGGER IF EXISTS check_locked_cycle ON sterilization_cycles;
CREATE TRIGGER check_locked_cycle
  BEFORE UPDATE ON sterilization_cycles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_cycle_update();

-- ─── 4. Автонумерація циклів ST-2026-XXXX ───────────────────────────────────

CREATE OR REPLACE FUNCTION generate_cycle_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT;
  next_num INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;

  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(cycle_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM sterilization_cycles
  WHERE salon_id = NEW.salon_id
    AND cycle_number LIKE 'ST-' || current_year || '-%';

  NEW.cycle_number := 'ST-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cycle_number ON sterilization_cycles;
CREATE TRIGGER set_cycle_number
  BEFORE INSERT ON sterilization_cycles
  FOR EACH ROW
  WHEN (NEW.cycle_number IS NULL OR NEW.cycle_number = '')
  EXECUTE FUNCTION generate_cycle_number();

-- ─── 5. Додаткові індекси ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_stage
  ON sterilization_cycles(salon_id, stage);

CREATE INDEX IF NOT EXISTS idx_sterilization_storage_expires
  ON sterilization_storage(expires_at)
  WHERE status = 'sterile';

CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_next
  ON equipment_maintenance(next_due_at)
  WHERE next_due_at IS NOT NULL;

-- ─── 6. Seed data ────────────────────────────────────────────────────────────

-- Обладнання
INSERT INTO sterilization_equipment (salon_id, name, type, brand, model, serial_number, parameters, certification_expires_at)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Autoclave Pro 22L', 'autoclave', 'Melag', 'Euroklav 23 VS+', 'AC-2024-001',
   '{"temperature": 134, "pressure": 2.2, "time_minutes": 5}', '2027-01-15'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Сухожарова шафа ГП-10', 'dry_heat', 'Мікромед', 'ГП-10', 'GP-2023-042',
   '{"temperature": 180, "time_minutes": 60}', '2026-12-01')
ON CONFLICT DO NOTHING;

-- Набори інструментів
INSERT INTO sterilization_instrument_sets (salon_id, name, instruments, category)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Манікюрний базовий',
   '["Ножиці", "Кусачки", "Пушер", "Шабер"]', 'manicure'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Педикюрний',
   '["Кусачки педикюрні", "Скальпель", "Пилка", "Фреза"]', 'pedicure'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Фрезерний набір',
   '["Фреза конус", "Фреза куля", "Фреза циліндр", "Мандрель"]', 'manicure')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Готово! Стерилізація повністю готова.
-- ============================================================================
