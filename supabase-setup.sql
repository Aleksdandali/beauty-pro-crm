-- Supabase Setup Script для Beauty Pro CRM
-- SALON_ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890

-- 1. Очистити та створити таблицю services
DROP TABLE IF EXISTS services CASCADE;

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  duration INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  color VARCHAR(7) DEFAULT '#8B5CF6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Налаштувати RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_all" ON services;
CREATE POLICY "services_all" ON services FOR ALL USING (true) WITH CHECK (true);

-- 3. Вставити тестові послуги
INSERT INTO services (salon_id, name, category, duration, price, color) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Манікюр класичний', 'Манікюр', 60, 350, '#EC4899'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Манікюр з покриттям', 'Манікюр', 90, 500, '#EC4899'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Нарощування нігтів', 'Манікюр', 180, 1200, '#EC4899'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Зняття гель-лаку', 'Манікюр', 30, 150, '#EC4899'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Педикюр класичний', 'Педикюр', 90, 450, '#F59E0B'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Педикюр з покриттям', 'Педикюр', 120, 650, '#F59E0B'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Нарощування вій', 'Вії', 150, 900, '#8B5CF6'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Корекція вій', 'Вії', 90, 600, '#8B5CF6'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ламінування вій', 'Вії', 60, 500, '#8B5CF6'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Корекція брів', 'Брови', 45, 300, '#10B981'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Фарбування брів', 'Брови', 30, 200, '#10B981'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ламінування брів', 'Брови', 60, 450, '#10B981');

-- Перевірити результат
SELECT COUNT(*) as total_services, 
       COUNT(DISTINCT category) as total_categories 
FROM services;
