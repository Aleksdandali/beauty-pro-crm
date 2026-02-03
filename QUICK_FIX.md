# 🚀 БЫСТРОЕ РЕШЕНИЕ - Миграция Базы Данных

## ⚡ Проблема
Не удаётся подключиться к базе данных через скрипт.

## ✅ Решение (5 минут)

### Шаг 1: Откройте Supabase SQL Editor

**Ссылка:**
```
https://supabase.com/dashboard/project/ndrqxlawxvfnloyzrpyo/editor
```

Или:
1. Перейдите на https://supabase.com/dashboard
2. Выберите проект `ndrqxlawxvfnloyzrpyo`
3. Нажмите **SQL Editor** в левом меню

---

### Шаг 2: Скопируйте SQL Код

**Откройте файл в проекте:**
```
supabase/migrations/001_initial_schema.sql
```

Или используйте этот SQL (базовая структура):

```sql
-- Базовая структура
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица салонов
CREATE TABLE IF NOT EXISTS salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица сотрудников
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'master' CHECK (role IN ('owner', 'admin', 'master')),
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS для salons
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their salon" 
ON salons FOR SELECT 
USING (id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

-- RLS для staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their salon staff" 
ON staff FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));
```

---

### Шаг 3: Выполните SQL

1. Вставьте код в SQL Editor
2. Нажмите **Run** (или `Ctrl/Cmd + Enter`)
3. Дождитесь сообщения "Success"

---

### Шаг 4: CRM Таблицы

Теперь добавьте CRM таблицы. Вставьте и выполните:

```sql
-- ============================================================
-- CLIENTS (Клиенты)
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

CREATE INDEX idx_clients_salon_id ON clients(salon_id);
CREATE INDEX idx_clients_phone ON clients(phone);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their salon clients" 
ON clients FOR SELECT 
USING (salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Users can insert clients" 
ON clients FOR INSERT 
WITH CHECK (salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Users can update clients" 
ON clients FOR UPDATE 
USING (salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1));

-- ============================================================
-- SERVICES (Услуги)
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    duration_min INTEGER NOT NULL CHECK (duration_min > 0),
    category TEXT NOT NULL DEFAULT 'other',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_salon_id ON services(salon_id);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view salon services" 
ON services FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage services" 
ON services FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- ============================================================
-- INVENTORY (Инвентарь)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    brand TEXT DEFAULT 'GETLOUD',
    title TEXT NOT NULL,
    sku TEXT,
    stock_quantity DECIMAL(10, 2) DEFAULT 0,
    min_stock_alert DECIMAL(10, 2) DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    cost_price DECIMAL(10, 2) DEFAULT 0,
    retail_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salon_id, sku)
);

CREATE INDEX idx_inventory_salon_id ON inventory_items(salon_id);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage inventory" 
ON inventory_items FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

-- ============================================================
-- APPOINTMENTS (Записи)
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    master_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE INDEX idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX idx_appointments_master_time ON appointments(master_id, start_time);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage appointments" 
ON appointments FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

-- ============================================================
-- ТРИГГЕРЫ
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### Шаг 5: Проверьте Результат

В SQL Editor выполните:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Вы должны увидеть:**
- appointments
- clients
- inventory_items
- salons
- services
- staff

---

## 🎯 Готово!

Теперь запустите приложение:

```bash
npm run dev
```

Откройте: http://localhost:3000

Вы должны увидеть: **"Beauty Pro CRM is working!"**

---

## 🔄 Обновите TypeScript Типы (опционально)

```bash
npx supabase gen types typescript --project-id ndrqxlawxvfnloyzrpyo --schema public > src/types/database.ts
```

Или установите Supabase CLI:
```bash
npm install -g supabase
```

---

**Всё готово! 🚀**
