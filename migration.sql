-- ============================================================
-- Beauty Pro CRM - Complete Database Migration
-- Полная миграция базы данных
-- ============================================================

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. SALONS (Салоны)
-- ============================================================

CREATE TABLE IF NOT EXISTS salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salons_created_at ON salons(created_at DESC);

-- ============================================================
-- 2. STAFF (Сотрудники)
-- ============================================================

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'master' CHECK (role IN ('owner', 'admin', 'master')),
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, salon_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_salon_id ON staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

-- ============================================================
-- 3. CLIENTS (Клиенты)
-- ============================================================

CREATE TABLE IF NOT EXISTS clients (
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

CREATE INDEX IF NOT EXISTS idx_clients_salon_id ON clients(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_full_name ON clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- ============================================================
-- 4. SERVICES (Услуги)
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
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

CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_title ON services(title);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- ============================================================
-- 5. INVENTORY_ITEMS (Инвентарь/Продукты)
-- ============================================================

CREATE TABLE IF NOT EXISTS inventory_items (
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

CREATE INDEX IF NOT EXISTS idx_inventory_items_salon_id ON inventory_items(salon_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_brand ON inventory_items(brand);
CREATE INDEX IF NOT EXISTS idx_inventory_items_title ON inventory_items(title);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);

-- ============================================================
-- 6. APPOINTMENTS (Записи/Встречи)
-- ============================================================

CREATE TABLE IF NOT EXISTS appointments (
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

CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_master_id ON appointments(master_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_master_time ON appointments(master_id, start_time, end_time);

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Включаем RLS для всех таблиц
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Политики для salons
DROP POLICY IF EXISTS "Users can view their salon" ON salons;
CREATE POLICY "Users can view their salon" 
ON salons FOR SELECT 
USING (id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update their salon" ON salons;
CREATE POLICY "Owners can update their salon" 
ON salons FOR UPDATE 
USING (id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role = 'owner'));

-- Политики для staff
DROP POLICY IF EXISTS "Staff can view salon staff" ON staff;
CREATE POLICY "Staff can view salon staff" 
ON staff FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage staff" ON staff;
CREATE POLICY "Admins can manage staff" 
ON staff FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Политики для clients
DROP POLICY IF EXISTS "Staff can view clients" ON clients;
CREATE POLICY "Staff can view clients" 
ON clients FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can insert clients" ON clients;
CREATE POLICY "Staff can insert clients" 
ON clients FOR INSERT 
WITH CHECK (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can update clients" ON clients;
CREATE POLICY "Staff can update clients" 
ON clients FOR UPDATE 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
CREATE POLICY "Admins can delete clients" 
ON clients FOR DELETE 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Политики для services
DROP POLICY IF EXISTS "Staff can view services" ON services;
CREATE POLICY "Staff can view services" 
ON services FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services" 
ON services FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Политики для inventory_items
DROP POLICY IF EXISTS "Staff can view inventory" ON inventory_items;
CREATE POLICY "Staff can view inventory" 
ON inventory_items FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can manage inventory" ON inventory_items;
CREATE POLICY "Staff can manage inventory" 
ON inventory_items FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

-- Политики для appointments
DROP POLICY IF EXISTS "Staff can view appointments" ON appointments;
CREATE POLICY "Staff can view appointments" 
ON appointments FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;
CREATE POLICY "Staff can manage appointments" 
ON appointments FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

-- ============================================================
-- 8. TRIGGERS (Триггеры)
-- ============================================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для salons
DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
CREATE TRIGGER update_salons_updated_at
    BEFORE UPDATE ON salons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Триггеры для staff
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Триггеры для clients
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Триггеры для services
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Триггеры для inventory_items
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Триггеры для appointments
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

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

DROP TRIGGER IF EXISTS update_client_stats_on_appointment ON appointments;
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

DROP TRIGGER IF EXISTS check_appointment_conflict_trigger ON appointments;
CREATE TRIGGER check_appointment_conflict_trigger
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION check_appointment_conflict();

-- ============================================================
-- МИГРАЦИЯ ЗАВЕРШЕНА ✓
-- ============================================================
