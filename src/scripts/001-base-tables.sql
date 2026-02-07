-- ============================================================================
-- Shine Beauty CRM — База даних MVP
-- Всі таблиці, індекси, тригери, RLS
--
-- Порядок створення враховує залежності між таблицями.
-- Виконувати ОДНИМ запитом в Supabase SQL Editor.
-- ============================================================================

-- ─── 0. Extensions ──────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. salons — головна таблиця, все прив'язане до неї ─────────────────────

CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,                        -- для публічних сторінок /m/[slug]
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  cover_url TEXT,
  description TEXT,

  -- Налаштування
  working_hours JSONB DEFAULT '{"mon":{"start":"09:00","end":"19:00"},"tue":{"start":"09:00","end":"19:00"},"wed":{"start":"09:00","end":"19:00"},"thu":{"start":"09:00","end":"19:00"},"fri":{"start":"09:00","end":"19:00"},"sat":{"start":"10:00","end":"17:00"},"sun":null}',
  accent_color TEXT DEFAULT '#8B5CF6',     -- кастомний колір бренду
  currency TEXT DEFAULT 'UAH',
  timezone TEXT DEFAULT 'Europe/Kyiv',
  locale TEXT DEFAULT 'uk',

  -- Інтеграції
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,

  -- Підписка
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'business')),
  subscription_expires_at TIMESTAMPTZ,

  -- Налаштування запису
  booking_enabled BOOLEAN DEFAULT true,
  booking_advance_days INTEGER DEFAULT 30,       -- за скільки днів можна записатись
  booking_slot_duration INTEGER DEFAULT 30,      -- крок слотів в хвилинах
  booking_confirmation_required BOOLEAN DEFAULT true,

  -- Нотифікації
  notifications_email BOOLEAN DEFAULT true,
  notifications_telegram BOOLEAN DEFAULT false,
  notifications_sms BOOLEAN DEFAULT false,

  owner_id UUID,                           -- Supabase Auth user id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. staff — майстри ─────────────────────────────────────────────────────

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  specialization TEXT,                     -- 'nail', 'hair', 'brow', 'lash', 'cosmetology', 'massage'
  bio TEXT,                                -- опис для міні-сайту
  slug TEXT,                               -- для персональної сторінки

  role TEXT DEFAULT 'master' CHECK (role IN ('owner', 'admin', 'master', 'intern')),
  is_active BOOLEAN DEFAULT true,

  -- Зарплата
  commission_rate NUMERIC(5,2) DEFAULT 50.00,  -- % від послуг
  salary_fixed NUMERIC(10,2) DEFAULT 0,        -- фікс частина

  -- Supabase Auth (якщо має доступ до CRM)
  auth_user_id UUID,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_salon ON staff(salon_id);
CREATE INDEX idx_staff_auth ON staff(auth_user_id);
CREATE UNIQUE INDEX idx_staff_slug ON staff(slug) WHERE slug IS NOT NULL;

-- ─── 3. clients — клієнти ───────────────────────────────────────────────────

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,

  birthday DATE,
  notes TEXT,                              -- загальні нотатки
  source TEXT DEFAULT 'manual',            -- 'manual', 'online_booking', 'instagram', 'referral'

  -- Формула клієнта (killer feature)
  -- Структура: {
  --   "nail": {"base":"KODI Base Extra","color":"Komilfo 045","top":"Матовий","design":"Френч","nail_plate":"Тонка"},
  --   "hair": {"color_formula":"6/1+7/44","developer":"6%","brand":"Wella"},
  --   "allergies": ["гель-лак X brand", "латекс"],
  --   "preferences": "Любить мінімалізм, не любить стрази"
  -- }
  formulas JSONB DEFAULT '{}',

  -- RFM (розраховується автоматично)
  rfm_segment TEXT DEFAULT 'new' CHECK (rfm_segment IN ('vip', 'loyal', 'regular', 'new', 'sleeping', 'lost')),
  rfm_recency INTEGER,                    -- днів з останнього візиту
  rfm_frequency INTEGER,                  -- кількість візитів
  rfm_monetary NUMERIC(10,2),             -- загальна сума
  rfm_updated_at TIMESTAMPTZ,

  total_visits INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  last_visit_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_salon ON clients(salon_id);
CREATE INDEX idx_clients_phone ON clients(salon_id, phone);
CREATE INDEX idx_clients_rfm ON clients(salon_id, rfm_segment);
CREATE INDEX idx_clients_last_visit ON clients(salon_id, last_visit_at);

-- ─── 4. services — послуги ──────────────────────────────────────────────────

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  category TEXT NOT NULL,                  -- 'manicure', 'pedicure', 'nail_extension', 'brow', 'lash', 'hair', 'cosmetology', 'massage', 'other'
  description TEXT,

  price NUMERIC(10,2) NOT NULL,
  duration INTEGER NOT NULL,               -- хвилини

  -- Калькулятор маржі
  cost NUMERIC(10,2) DEFAULT 0,            -- собівартість матеріалів
  margin NUMERIC(5,2) DEFAULT 100,         -- маржа %

  color TEXT DEFAULT '#8B5CF6',            -- колір в календарі
  icon TEXT,                               -- emoji або lucide icon name
  is_active BOOLEAN DEFAULT true,
  is_online_booking BOOLEAN DEFAULT true,  -- доступна для онлайн-запису

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_salon ON services(salon_id);
CREATE INDEX idx_services_category ON services(salon_id, category);

-- ─── 5. staff_services — зв'язок many-to-many ──────────────────────────────

CREATE TABLE staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  custom_price NUMERIC(10,2),              -- персональна ціна
  custom_duration INTEGER,                 -- персональна тривалість

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, service_id)
);

CREATE INDEX idx_staff_services_staff ON staff_services(staff_id);
CREATE INDEX idx_staff_services_service ON staff_services(service_id);

-- ─── 6. staff_schedules — графік роботи ─────────────────────────────────────

CREATE TABLE staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,

  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon, 6=Sun
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  is_day_off BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week)
);

CREATE INDEX idx_staff_schedules_staff ON staff_schedules(staff_id);

-- ─── 7. staff_time_off — відпустки, лікарняні ──────────────────────────────

CREATE TABLE staff_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,                             -- 'vacation', 'sick', 'personal', 'other'
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_time_off_staff ON staff_time_off(staff_id);
CREATE INDEX idx_staff_time_off_dates ON staff_time_off(start_date, end_date);

-- ─── 8. appointments — записи ───────────────────────────────────────────────

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),

  price NUMERIC(10,2) NOT NULL,            -- фактична ціна
  discount NUMERIC(10,2) DEFAULT 0,
  final_price NUMERIC(10,2),               -- price - discount

  notes TEXT,                              -- нотатки до запису
  client_notes TEXT,                       -- побажання клієнта (з онлайн-запису)

  -- Формула (копія на момент запису)
  formula_snapshot JSONB,

  -- Авто-списання матеріалів
  materials_deducted BOOLEAN DEFAULT false,

  -- Джерело
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'online', 'telegram', 'phone')),

  -- Оплата
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'mixed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_salon ON appointments(salon_id);
CREATE INDEX idx_appointments_staff_time ON appointments(staff_id, start_time);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_status ON appointments(salon_id, status);
CREATE INDEX idx_appointments_date ON appointments(salon_id, start_time);

-- ─── 9. Інвентар — бренди, продукти, транзакції ─────────────────────────────

CREATE TABLE inventory_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_brands_salon ON inventory_brands(salon_id);

CREATE TABLE inventory_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES inventory_brands(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  sku TEXT,                                -- артикул
  category TEXT,                           -- 'base', 'color', 'top', 'liquid', 'tool', 'disposable', 'other'

  unit TEXT DEFAULT 'шт' CHECK (unit IN ('шт', 'мл', 'г', 'упак')),
  quantity NUMERIC(10,2) DEFAULT 0,        -- поточний залишок
  min_quantity NUMERIC(10,2) DEFAULT 0,    -- мін. залишок (алерт)

  purchase_price NUMERIC(10,2) DEFAULT 0,  -- ціна закупки
  retail_price NUMERIC(10,2) DEFAULT 0,    -- ціна продажу

  -- Для авто-списання
  usage_per_service NUMERIC(10,4),         -- скільки одиниць на 1 послугу

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_products_salon ON inventory_products(salon_id);
CREATE INDEX idx_inventory_products_brand ON inventory_products(brand_id);
CREATE INDEX idx_inventory_products_low_stock ON inventory_products(salon_id, quantity, min_quantity) WHERE is_active = true;

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'adjustment', 'return', 'auto_deduction')),
  quantity NUMERIC(10,2) NOT NULL,         -- додатнє для приходу, від'ємне для списання

  -- Зв'язок з записом (для авто-списання)
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

  notes TEXT,
  cost NUMERIC(10,2),                      -- загальна вартість (для purchase)

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_salon ON inventory_transactions(salon_id);

-- ─── 10. service_materials — зв'язок послуга↔матеріали ──────────────────────

CREATE TABLE service_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,

  quantity NUMERIC(10,4) NOT NULL,         -- скільки одиниць витрачається на послугу

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, product_id)
);

CREATE INDEX idx_service_materials_service ON service_materials(service_id);

-- ─── 11. work_photos — фото робіт ──────────────────────────────────────────

CREATE TABLE work_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,

  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  tags TEXT[],                             -- ['nail_art', 'french', 'ombre']

  is_portfolio BOOLEAN DEFAULT true,       -- показувати на міні-сайті
  is_public BOOLEAN DEFAULT true,          -- клієнт дозволив публікувати

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_work_photos_salon ON work_photos(salon_id);
CREATE INDEX idx_work_photos_staff ON work_photos(staff_id);
CREATE INDEX idx_work_photos_client ON work_photos(client_id);
CREATE INDEX idx_work_photos_portfolio ON work_photos(salon_id, is_portfolio) WHERE is_portfolio = true;

-- ─── 12. expenses — витрати ─────────────────────────────────────────────────

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  category TEXT NOT NULL CHECK (category IN ('rent', 'utilities', 'materials', 'salary', 'marketing', 'equipment', 'tax', 'other')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  receipt_url TEXT,                         -- фото чека
  is_recurring BOOLEAN DEFAULT false,
  recurring_period TEXT CHECK (recurring_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),

  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_salon ON expenses(salon_id);
CREATE INDEX idx_expenses_date ON expenses(salon_id, date);
CREATE INDEX idx_expenses_category ON expenses(salon_id, category);

-- ─── 13. payroll — зарплатна відомість ──────────────────────────────────────

CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  total_revenue NUMERIC(10,2) DEFAULT 0,   -- загальний дохід від послуг
  commission_amount NUMERIC(10,2) DEFAULT 0, -- % від послуг
  salary_fixed NUMERIC(10,2) DEFAULT 0,    -- фікс частина
  bonus NUMERIC(10,2) DEFAULT 0,
  deductions NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) DEFAULT 0,    -- фінальна сума

  appointments_count INTEGER DEFAULT 0,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  paid_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payroll_salon ON payroll(salon_id);
CREATE INDEX idx_payroll_staff ON payroll(staff_id);
CREATE INDEX idx_payroll_period ON payroll(salon_id, period_start, period_end);

-- ─── 14. Пакети послуг ──────────────────────────────────────────────────────

CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  name TEXT NOT NULL,                      -- "Комплекс манікюр + педикюр"
  description TEXT,
  price NUMERIC(10,2) NOT NULL,            -- ціна пакету (зі знижкою)
  original_price NUMERIC(10,2),            -- сума окремих послуг

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  UNIQUE(package_id, service_id)
);

CREATE INDEX idx_package_items_package ON service_package_items(package_id);

-- ─── 15. Повідомлення ───────────────────────────────────────────────────────

CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  name TEXT NOT NULL,                      -- "Нагадування за 24 год"
  type TEXT NOT NULL CHECK (type IN ('reminder', 'confirmation', 'cancellation', 'birthday', 'reactivation', 'review', 'custom')),
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'telegram', 'email')),

  subject TEXT,                            -- для email
  body TEXT NOT NULL,                      -- "{{client_name}}, нагадуємо про запис {{date}} о {{time}}"

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_message_templates_salon ON message_templates(salon_id);

CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,                 -- телефон або email
  message TEXT NOT NULL,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_log_salon ON notification_log(salon_id);

-- ─── 16. Стерилізація — 5 таблиць ──────────────────────────────────────────

-- Обладнання
CREATE TABLE sterilization_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  name TEXT NOT NULL,                      -- "Автоклав MELAG Euroklav 23 VS+"
  type TEXT NOT NULL CHECK (type IN ('autoclave', 'dry_heat', 'uv', 'ultrasonic', 'glass_bead')),
  brand TEXT,
  model TEXT,
  serial_number TEXT,

  -- Параметри стерилізації
  parameters JSONB DEFAULT '{}',           -- {"temperature": 134, "pressure": 2.1, "time_minutes": 5}

  certification_number TEXT,
  certification_expires_at DATE,

  purchase_date DATE,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sterilization_equipment_salon ON sterilization_equipment(salon_id);

-- Набори інструментів
CREATE TABLE sterilization_instrument_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  name TEXT NOT NULL,                      -- "Набір для манікюру #1"
  category TEXT DEFAULT 'manicure',        -- 'manicure', 'pedicure', 'cosmetology', 'other'
  instruments JSONB NOT NULL,              -- ["Кусачки", "Пушер", "Шабер", "Фреза"]

  quantity INTEGER DEFAULT 1,              -- скільки таких наборів
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sterilization_sets_salon ON sterilization_instrument_sets(salon_id);

-- Головний журнал стерилізації
CREATE TABLE sterilization_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  -- Номер циклу: ST-2026-0001
  cycle_number TEXT NOT NULL,

  equipment_id UUID REFERENCES sterilization_equipment(id) ON DELETE SET NULL,
  instrument_set_id UUID REFERENCES sterilization_instrument_sets(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'disinfection', 'pso', 'sterilization', 'completed', 'failed')),

  started_at TIMESTAMPTZ DEFAULT NOW(),

  -- Етап 1: Дезінфекція
  disinfection_started_at TIMESTAMPTZ,
  disinfection_completed_at TIMESTAMPTZ,
  disinfection_solution TEXT,              -- "Дезактин 1%"
  disinfection_exposure_minutes INTEGER,   -- час витримки

  -- Етап 2: Передстерилізаційна обробка (ПСО)
  pso_started_at TIMESTAMPTZ,
  pso_completed_at TIMESTAMPTZ,
  pso_method TEXT,                         -- 'manual', 'ultrasonic', 'combined'

  -- Азопірамова проба (якість ПСО)
  azopyramine_test TEXT CHECK (azopyramine_test IN ('positive', 'negative', 'not_done')),
  azopyramine_photo_url TEXT,

  -- Етап 3: Стерилізація
  sterilization_started_at TIMESTAMPTZ,
  sterilization_completed_at TIMESTAMPTZ,
  sterilization_temperature NUMERIC(5,1),  -- 134°C
  sterilization_pressure NUMERIC(5,2),     -- 2.1 бар
  sterilization_time_minutes INTEGER,      -- 5 хв

  -- Хімічний індикатор
  chemical_indicator TEXT CHECK (chemical_indicator IN ('passed', 'failed', 'not_used')),
  chemical_indicator_photo_url TEXT,

  -- Пакування
  packaging_type TEXT,                     -- 'kraft_bag', 'pouch', 'container', 'wrap'
  package_label TEXT,                      -- мітка на пакеті

  -- Фото ДО і ПІСЛЯ
  photos_before TEXT[],
  photos_after TEXT[],

  -- Результат
  result TEXT CHECK (result IN ('sterile', 'failed', 'repeat_required')),
  notes TEXT,

  -- Блокування — після завершення НІХТО не може змінити
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMPTZ,

  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sterilization_cycles_salon ON sterilization_cycles(salon_id);
CREATE INDEX idx_sterilization_cycles_date ON sterilization_cycles(salon_id, started_at);
CREATE INDEX idx_sterilization_cycles_status ON sterilization_cycles(salon_id, status);
CREATE INDEX idx_sterilization_cycles_number ON sterilization_cycles(salon_id, cycle_number);

-- Зберігання стерильних пакетів
CREATE TABLE sterilization_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES sterilization_cycles(id) ON DELETE CASCADE,

  package_label TEXT NOT NULL,             -- "М-001-2026"
  instrument_set_id UUID REFERENCES sterilization_instrument_sets(id),

  sterilized_at TIMESTAMPTZ NOT NULL,      -- коли стерилізовано
  expires_at TIMESTAMPTZ NOT NULL,         -- строк придатності (+30 днів)

  status TEXT DEFAULT 'sterile' CHECK (status IN ('sterile', 'used', 'expired')),
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  used_for_appointment UUID REFERENCES appointments(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sterilization_storage_salon ON sterilization_storage(salon_id);
CREATE INDEX idx_sterilization_storage_status ON sterilization_storage(status) WHERE status = 'sterile';
CREATE INDEX idx_sterilization_storage_expires ON sterilization_storage(expires_at) WHERE status = 'sterile';

-- Обслуговування обладнання
CREATE TABLE equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES sterilization_equipment(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('calibration', 'repair', 'inspection', 'certification', 'cleaning')),
  date DATE NOT NULL,
  next_date DATE,                          -- дата наступного обслуговування

  cost NUMERIC(10,2),
  document_url TEXT,                       -- скан документа
  notes TEXT,

  performed_by TEXT,                       -- "ТОВ Медтехніка"

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_maintenance_equipment ON equipment_maintenance(equipment_id);
CREATE INDEX idx_equipment_maintenance_next ON equipment_maintenance(next_date);

-- ─── 17. Activity Log — аудит ───────────────────────────────────────────────

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  user_id UUID,                            -- auth user
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

  action TEXT NOT NULL,                    -- 'create', 'update', 'delete', 'login', 'export'
  entity_type TEXT NOT NULL,               -- 'client', 'appointment', 'sterilization', 'inventory'
  entity_id UUID,

  details JSONB,                           -- що саме змінилося
  ip_address INET,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_salon ON activity_log(salon_id);
CREATE INDEX idx_activity_log_date ON activity_log(salon_id, created_at);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- ТРИГЕРИ
-- ═══════════════════════════════════════════════════════════════════════════

-- Автоматичне оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON inventory_products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sterilization_equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sterilization_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON service_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Блокування завершеного циклу стерилізації
CREATE OR REPLACE FUNCTION prevent_locked_cycle_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true AND NEW.is_locked = true THEN
    RAISE EXCEPTION 'Цикл стерилізації заблоковано. Зміни неможливі після завершення.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_locked_cycle
  BEFORE UPDATE ON sterilization_cycles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_cycle_update();

-- Автоматична генерація номера циклу стерилізації: ST-2026-0001
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

CREATE TRIGGER set_cycle_number
  BEFORE INSERT ON sterilization_cycles
  FOR EACH ROW
  WHEN (NEW.cycle_number IS NULL OR NEW.cycle_number = '')
  EXECUTE FUNCTION generate_cycle_number();


-- ═══════════════════════════════════════════════════════════════════════════
-- RLS (Row Level Security)
-- ═══════════════════════════════════════════════════════════════════════════

-- Включити RLS на всіх таблицях
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sterilization_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE sterilization_instrument_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sterilization_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sterilization_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Політика для розробки: дозволяє все через anon ключ
-- ⚠️ В ПРОДАКШНІ замінити на salon_id ізоляцію через auth.uid()
CREATE POLICY "Allow all for development" ON salons FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON staff FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON clients FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON services FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON staff_services FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON staff_schedules FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON staff_time_off FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON appointments FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON inventory_brands FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON inventory_products FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON inventory_transactions FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON service_materials FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON work_photos FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON expenses FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON payroll FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON service_packages FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON service_package_items FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON message_templates FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON notification_log FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON sterilization_equipment FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON sterilization_instrument_sets FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON sterilization_cycles FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON sterilization_storage FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON equipment_maintenance FOR ALL USING (true);
CREATE POLICY "Salon isolation" ON activity_log FOR ALL USING (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- Готово! 25 таблиць, 40+ індексів, 13 тригерів, RLS на всіх таблицях.
-- ═══════════════════════════════════════════════════════════════════════════
