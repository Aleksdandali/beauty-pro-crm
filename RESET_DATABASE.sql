-- ============================================================
-- ПОЛНАЯ ПЕРЕСБОРКА БАЗЫ ДАННЫХ
-- Удаление старых таблиц и создание новых из кода проекта
-- ============================================================

-- ВНИМАНИЕ: Это удалит все данные в существующих таблицах!
-- Используйте только для первоначальной настройки!

-- ============================================================
-- ШАГ 1: Удаление всех существующих таблиц
-- ============================================================

-- Удаляем в правильном порядке (сначала зависимые таблицы)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory_products CASCADE;
DROP TABLE IF EXISTS inventory_brands CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS salons CASCADE;

-- Удаляем функции если есть
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_client_statistics() CASCADE;
DROP FUNCTION IF EXISTS check_appointment_conflict() CASCADE;

-- ============================================================
-- ШАГ 2: Расширения
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ШАГ 3: Создание таблиц из кода проекта
-- ============================================================

-- 1. SALONS (Базовая таблица)
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT,
    phone TEXT,
    email TEXT,
    currency TEXT DEFAULT 'UAH',
    timezone TEXT DEFAULT 'Europe/Kiev',
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_salons_owner_id ON salons(owner_id);
CREATE INDEX idx_salons_slug ON salons(slug);

-- 2. STAFF (Сотрудники)
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'master')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    specialization TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, user_id)
);

CREATE INDEX idx_staff_salon_id ON staff(salon_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_role ON staff(role);

-- 3. CLIENTS (Клиенты)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    birthday DATE,
    discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    last_visit TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, phone)
);

CREATE INDEX idx_clients_salon_id ON clients(salon_id);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_full_name ON clients(full_name);
CREATE INDEX idx_clients_email ON clients(email);

-- 4. SERVICES (Услуги)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    duration_min INTEGER NOT NULL CHECK (duration_min > 0),
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('nails', 'lashes', 'hair', 'makeup', 'massage', 'other')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_salon_id ON services(salon_id);
CREATE INDEX idx_services_title ON services(title);
CREATE INDEX idx_services_category ON services(category);

-- 5. INVENTORY_ITEMS (Инвентарь)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    brand TEXT DEFAULT 'GETLOUD',
    title TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    stock_quantity DECIMAL(10, 2) DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_alert DECIMAL(10, 2) DEFAULT 0 CHECK (min_stock_alert >= 0),
    unit TEXT DEFAULT 'pcs' CHECK (unit IN ('ml', 'pcs', 'g', 'kg', 'l')),
    cost_price DECIMAL(10, 2) DEFAULT 0 CHECK (cost_price >= 0),
    retail_price DECIMAL(10, 2),
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, sku)
);

CREATE INDEX idx_inventory_items_salon_id ON inventory_items(salon_id);
CREATE INDEX idx_inventory_items_brand ON inventory_items(brand);
CREATE INDEX idx_inventory_items_title ON inventory_items(title);

-- 6. APPOINTMENTS (Записи)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    master_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE INDEX idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_master_id ON appointments(master_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_master_time ON appointments(master_id, start_time, end_time);

-- ============================================================
-- ШАГ 4: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Salons
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their salon" 
ON salons FOR SELECT 
USING (id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

CREATE POLICY "Owners can update their salon" 
ON salons FOR UPDATE 
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert salons" 
ON salons FOR INSERT 
WITH CHECK (owner_id = auth.uid());

-- Staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view salon staff" 
ON staff FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage staff" 
ON staff FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage clients" 
ON clients FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

-- Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view services" 
ON services FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage services" 
ON services FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Inventory Items
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage inventory" 
ON inventory_items FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage appointments" 
ON appointments FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

-- ============================================================
-- ШАГ 5: ТРИГГЕРЫ
-- ============================================================

-- Функция для auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для всех таблиц
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Функция для обновления статистики клиентов
CREATE OR REPLACE FUNCTION update_client_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE clients
        SET 
            total_visits = total_visits + 1,
            total_spent = total_spent + NEW.total_price,
            last_visit = NEW.end_time,
            updated_at = NOW()
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_stats_on_appointment
    AFTER UPDATE OF status ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_client_statistics();

-- Функция для проверки конфликтов записей
CREATE OR REPLACE FUNCTION check_appointment_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE master_id = NEW.master_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND status NOT IN ('cancelled', 'no_show')
        AND (
            (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
            (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
            (NEW.start_time <= start_time AND NEW.end_time >= end_time)
        )
    ) THEN
        RAISE EXCEPTION 'Мастер уже занят в это время';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_appointment_conflict_trigger
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION check_appointment_conflict();

-- ============================================================
-- ГОТОВО! ✓
-- База данных полностью пересоздана из кода проекта
-- ============================================================
