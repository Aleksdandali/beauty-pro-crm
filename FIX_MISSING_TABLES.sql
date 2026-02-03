-- ============================================================
-- ИСПРАВЛЕНИЕ: Создание недостающих таблиц salons и staff
-- ============================================================

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SALONS (Салоны) - КРИТИЧНО ВАЖНАЯ ТАБЛИЦА
-- ============================================================

CREATE TABLE IF NOT EXISTS salons (
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

-- Индексы для salons
CREATE INDEX IF NOT EXISTS idx_salons_owner_id ON salons(owner_id);
CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons(slug);

-- RLS для salons
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their salon" ON salons;
CREATE POLICY "Users can view their salon" 
ON salons FOR SELECT 
USING (id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update their salon" ON salons;
CREATE POLICY "Owners can update their salon" 
ON salons FOR UPDATE 
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert salons" ON salons;
CREATE POLICY "Users can insert salons" 
ON salons FOR INSERT 
WITH CHECK (owner_id = auth.uid());

-- ============================================================
-- STAFF (Сотрудники) - КРИТИЧНО ВАЖНАЯ ТАБЛИЦА
-- ============================================================

CREATE TABLE IF NOT EXISTS staff (
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

-- Индексы для staff
CREATE INDEX IF NOT EXISTS idx_staff_salon_id ON staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

-- RLS для staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view salon staff" ON staff;
CREATE POLICY "Staff can view salon staff" 
ON staff FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage staff" ON staff;
CREATE POLICY "Admins can manage staff" 
ON staff FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- ============================================================
-- INVENTORY_ITEMS (если еще не создана)
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

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage inventory" ON inventory_items;
CREATE POLICY "Staff can manage inventory" 
ON inventory_items FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

-- ============================================================
-- ТРИГГЕРЫ для auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
CREATE TRIGGER update_salons_updated_at
    BEFORE UPDATE ON salons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ГОТОВО! ✓
-- ============================================================
