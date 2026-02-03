#!/usr/bin/env node

/**
 * Beauty Pro CRM - Auto Database Expansion
 * Автоматическое расширение базы данных
 * 
 * Создаёт таблицы:
 * - clients (клиенты)
 * - services (услуги)
 * - inventory_items (инвентарь)
 * - appointments (записи)
 * 
 * + RLS политики + индексы + триггеры
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Загружаем переменные окружения
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
};

// SQL миграция
const migrationSQL = `
-- ============================================================
-- Beauty Pro CRM - Auto Database Expansion
-- Автоматическое создание CRM-структуры
-- ============================================================

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CLIENTS (Клиенты)
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
    
    -- Уникальность телефона в рамках одного салона
    UNIQUE(salon_id, phone)
);

-- Индексы для clients
CREATE INDEX IF NOT EXISTS idx_clients_salon_id ON clients(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_full_name ON clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- RLS для clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Политика: пользователь видит только клиентов своего салона
CREATE POLICY IF NOT EXISTS "Users can view their salon clients" 
ON clients FOR SELECT 
USING (
    salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1)
);

-- Политика: пользователь может добавлять клиентов в свой салон
CREATE POLICY IF NOT EXISTS "Users can insert clients to their salon" 
ON clients FOR INSERT 
WITH CHECK (
    salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1)
);

-- Политика: пользователь может обновлять клиентов своего салона
CREATE POLICY IF NOT EXISTS "Users can update their salon clients" 
ON clients FOR UPDATE 
USING (
    salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1)
);

-- Политика: только owner/admin могут удалять клиентов
CREATE POLICY IF NOT EXISTS "Admins can delete clients" 
ON clients FOR DELETE 
USING (
    salon_id IN (
        SELECT salon_id FROM staff 
        WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);

-- ============================================================
-- 2. SERVICES (Услуги)
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Категории: nails, lashes, hair, makeup, massage, other
    CONSTRAINT valid_category CHECK (
        category IN ('nails', 'lashes', 'hair', 'makeup', 'massage', 'other')
    )
);

-- Индексы для services
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_title ON services(title);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price);

-- RLS для services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Политика: все сотрудники видят услуги своего салона
CREATE POLICY IF NOT EXISTS "Staff can view their salon services" 
ON services FOR SELECT 
USING (
    salon_id IN (
        SELECT salon_id FROM staff WHERE user_id = auth.uid()
    )
);

-- Политика: только owner/admin могут добавлять услуги
CREATE POLICY IF NOT EXISTS "Admins can insert services" 
ON services FOR INSERT 
WITH CHECK (
    salon_id IN (
        SELECT salon_id FROM staff 
        WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);

-- Политика: только owner/admin могут обновлять услуги
CREATE POLICY IF NOT EXISTS "Admins can update services" 
ON services FOR UPDATE 
USING (
    salon_id IN (
        SELECT salon_id FROM staff 
        WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);

-- Политика: только owner/admin могут удалять услуги
CREATE POLICY IF NOT EXISTS "Admins can delete services" 
ON services FOR DELETE 
USING (
    salon_id IN (
        SELECT salon_id FROM staff 
        WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);

-- ============================================================
-- 3. INVENTORY_ITEMS (Инвентарь/Продукты)
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
    
    -- SKU уникален в рамках салона (если указан)
    UNIQUE(salon_id, sku)
);

-- Индексы для inventory_items
CREATE INDEX IF NOT EXISTS idx_inventory_items_salon_id ON inventory_items(salon_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_brand ON inventory_items(brand);
CREATE INDEX IF NOT EXISTS idx_inventory_items_title ON inventory_items(title);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(stock_quantity);

-- RLS для inventory_items
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Политика: все сотрудники видят инвентарь своего салона
CREATE POLICY IF NOT EXISTS "Staff can view their salon inventory" 
ON inventory_items FOR SELECT 
USING (
    salon_id IN (
        SELECT salon_id FROM staff WHERE user_id = auth.uid()
    )
);

-- Политика: все сотрудники могут добавлять инвентарь
CREATE POLICY IF NOT EXISTS "Staff can insert inventory items" 
ON inventory_items FOR INSERT 
WITH CHECK (
    salon_id IN (
        SELECT salon_id FROM staff WHERE user_id = auth.uid()
    )
);

-- Политика: все сотрудники могут обновлять инвентарь
CREATE POLICY IF NOT EXISTS "Staff can update inventory items" 
ON inventory_items FOR UPDATE 
USING (
    salon_id IN (
        SELECT salon_id FROM staff WHERE user_id = auth.uid()
    )
);

-- Политика: только owner/admin могут удалять инвентарь
CREATE POLICY IF NOT EXISTS "Admins can delete inventory items" 
ON inventory_items FOR DELETE 
USING (
    salon_id IN (
        SELECT salon_id FROM staff 
        WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);

-- ============================================================
-- 4. APPOINTMENTS (Записи/Встречи)
-- ============================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    master_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
    ),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Проверка: конец записи после начала
    CONSTRAINT valid_appointment_time CHECK (end_time > start_time)
);

-- Индексы для appointments
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_master_id ON appointments(master_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_end_time ON appointments(end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

-- Составной индекс для поиска свободного времени мастера
CREATE INDEX IF NOT EXISTS idx_appointments_master_time ON appointments(master_id, start_time, end_time);

-- RLS для appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Политика: все сотрудники видят записи своего салона
CREATE POLICY IF NOT EXISTS "Staff can view their salon appointments" 
ON appointments FOR SELECT 
USING (
    salon_id IN (
        SELECT salon_id FROM staff WHERE user_id = auth.uid()
    )
);

-- Политика: все сотрудники могут создавать записи
CREATE POLICY IF NOT EXISTS "Staff can insert appointments" 
ON appointments FOR INSERT 
WITH CHECK (
    salon_id IN (
        SELECT salon_id FROM staff WHERE user_id = auth.uid()
    )
);

-- Политика: все сотрудники могут обновлять записи
CREATE POLICY IF NOT EXISTS "Staff can update appointments" 
ON appointments FOR UPDATE 
USING (
    salon_id IN (
        SELECT salon_id FROM staff WHERE user_id = auth.uid()
    )
);

-- Политика: все сотрудники могут удалять записи
CREATE POLICY IF NOT EXISTS "Staff can delete appointments" 
ON appointments FOR DELETE 
USING (
    salon_id IN (
        SELECT salon_id FROM staff WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- 5. ТРИГГЕРЫ для auto-update timestamp
-- ============================================================

-- Функция для обновления updated_at (если ещё не создана)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для clients
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Триггеры для services
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Триггеры для inventory_items
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Триггеры для appointments
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. ТРИГГЕР для обновления статистики клиентов
-- ============================================================

CREATE OR REPLACE FUNCTION update_client_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем только при завершении записи
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

-- ============================================================
-- 7. ФУНКЦИЯ для проверки конфликтов записей
-- ============================================================

CREATE OR REPLACE FUNCTION check_appointment_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Проверяем, нет ли пересечений по времени у мастера
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
-- МИГРАЦИЯ ЗАВЕРШЕНА
-- ============================================================
`;

/**
 * Главная функция миграции
 */
async function runMigration() {
    console.clear();
    log.title('🗄️  Beauty Pro CRM - Расширение Базы Данных');
    
    // Проверка переменных окружения
    const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!databaseUrl) {
        log.error('DATABASE_URL не найден в .env.local');
        log.warning('Запустите сначала: npm run setup');
        process.exit(1);
    }
    
    log.info('Подключение к базе данных...');
    
    const client = new Client({
        connectionString: databaseUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        // Подключение
        await client.connect();
        log.success('Подключение установлено');
        
        // Выполнение миграции
        log.info('Выполнение SQL миграции...');
        log.warning('Это может занять несколько секунд...');
        
        await client.query(migrationSQL);
        
        log.success('✨ Миграция успешно выполнена!');
        
        // Показываем созданные таблицы
        console.log('\n' + '═'.repeat(60));
        log.title('📊 Созданные таблицы:');
        console.log('  ✓ clients           - Клиенты салона');
        console.log('  ✓ services          - Услуги');
        console.log('  ✓ inventory_items   - Инвентарь/продукты');
        console.log('  ✓ appointments      - Записи клиентов');
        console.log('');
        
        log.title('🔒 Настроено:');
        console.log('  ✓ Row Level Security (RLS) для всех таблиц');
        console.log('  ✓ Foreign Keys (связи между таблицами)');
        console.log('  ✓ Индексы для оптимизации поиска');
        console.log('  ✓ Триггеры для auto-update timestamp');
        console.log('  ✓ Автоматическое обновление статистики клиентов');
        console.log('  ✓ Проверка конфликтов записей по времени');
        console.log('');
        
        log.success('🎯 Типы TypeScript будут обновлены автоматически...');
        console.log('');
        console.log('═'.repeat(60));
        
    } catch (error: any) {
        log.error('Ошибка при выполнении миграции:');
        console.error(error.message);
        
        if (error.message.includes('already exists')) {
            log.warning('\nТаблицы уже существуют. Миграция пропущена.');
        } else {
            log.error('\nПопробуйте:');
            console.log('  1. Проверить DATABASE_URL в .env.local');
            console.log('  2. Убедиться, что базовая миграция выполнена (таблица salons существует)');
            console.log('  3. Проверить подключение к Supabase');
        }
        
        process.exit(1);
    } finally {
        await client.end();
        log.info('Подключение закрыто');
    }
}

// Обработка ошибок
process.on('unhandledRejection', (error: any) => {
    log.error(`Необработанная ошибка: ${error.message}`);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n\nМиграция прервана пользователем.');
    process.exit(0);
});

// Запуск
runMigration();
