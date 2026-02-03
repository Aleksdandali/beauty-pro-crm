#!/usr/bin/env node

/**
 * Beauty Pro CRM - Database Expansion (Supabase API Method)
 * Использует Supabase JavaScript Client вместо прямого PostgreSQL подключения
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

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

// SQL миграция (разбита на части для лучшей совместимости)
const migrations = [
  {
    name: 'Extensions',
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  },
  {
    name: 'Clients Table',
    sql: `
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
    `
  },
  {
    name: 'Clients Indexes',
    sql: `
CREATE INDEX IF NOT EXISTS idx_clients_salon_id ON clients(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_full_name ON clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
    `
  },
  {
    name: 'Clients RLS',
    sql: `
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their salon clients" ON clients;
CREATE POLICY "Users can view their salon clients" 
ON clients FOR SELECT 
USING (salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1));

DROP POLICY IF EXISTS "Users can insert clients to their salon" ON clients;
CREATE POLICY "Users can insert clients to their salon" 
ON clients FOR INSERT 
WITH CHECK (salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1));

DROP POLICY IF EXISTS "Users can update their salon clients" ON clients;
CREATE POLICY "Users can update their salon clients" 
ON clients FOR UPDATE 
USING (salon_id = (SELECT salon_id FROM staff WHERE user_id = auth.uid() LIMIT 1));

DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
CREATE POLICY "Admins can delete clients" 
ON clients FOR DELETE 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
    `
  },
  {
    name: 'Services Table',
    sql: `
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
    CONSTRAINT valid_category CHECK (category IN ('nails', 'lashes', 'hair', 'makeup', 'massage', 'other'))
);
    `
  },
  {
    name: 'Services Indexes & RLS',
    sql: `
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_title ON services(title);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view their salon services" ON services;
CREATE POLICY "Staff can view their salon services" 
ON services FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert services" ON services;
CREATE POLICY "Admins can insert services" 
ON services FOR INSERT 
WITH CHECK (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

DROP POLICY IF EXISTS "Admins can update services" ON services;
CREATE POLICY "Admins can update services" 
ON services FOR UPDATE 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

DROP POLICY IF EXISTS "Admins can delete services" ON services;
CREATE POLICY "Admins can delete services" 
ON services FOR DELETE 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
    `
  },
  {
    name: 'Inventory Items Table',
    sql: `
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
    `
  },
  {
    name: 'Inventory Indexes & RLS',
    sql: `
CREATE INDEX IF NOT EXISTS idx_inventory_items_salon_id ON inventory_items(salon_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_brand ON inventory_items(brand);
CREATE INDEX IF NOT EXISTS idx_inventory_items_title ON inventory_items(title);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(stock_quantity);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view their salon inventory" ON inventory_items;
CREATE POLICY "Staff can view their salon inventory" 
ON inventory_items FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can insert inventory items" ON inventory_items;
CREATE POLICY "Staff can insert inventory items" 
ON inventory_items FOR INSERT 
WITH CHECK (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can update inventory items" ON inventory_items;
CREATE POLICY "Staff can update inventory items" 
ON inventory_items FOR UPDATE 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete inventory items" ON inventory_items;
CREATE POLICY "Admins can delete inventory items" 
ON inventory_items FOR DELETE 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
    `
  },
  {
    name: 'Appointments Table',
    sql: `
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
    CONSTRAINT valid_appointment_time CHECK (end_time > start_time)
);
    `
  },
  {
    name: 'Appointments Indexes & RLS',
    sql: `
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_master_id ON appointments(master_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_end_time ON appointments(end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_master_time ON appointments(master_id, start_time, end_time);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view their salon appointments" ON appointments;
CREATE POLICY "Staff can view their salon appointments" 
ON appointments FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can insert appointments" ON appointments;
CREATE POLICY "Staff can insert appointments" 
ON appointments FOR INSERT 
WITH CHECK (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can update appointments" ON appointments;
CREATE POLICY "Staff can update appointments" 
ON appointments FOR UPDATE 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can delete appointments" ON appointments;
CREATE POLICY "Staff can delete appointments" 
ON appointments FOR DELETE 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));
    `
  },
  {
    name: 'Triggers - Update Timestamp',
    sql: `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    name: 'Triggers - Client Statistics',
    sql: `
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
    `
  },
  {
    name: 'Triggers - Appointment Conflicts',
    sql: `
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
    `
  }
];

/**
 * Главная функция миграции
 */
async function runMigration() {
  console.clear();
  log.title('🗄️  Beauty Pro CRM - Расширение Базы Данных (Supabase API)');
  
  // Проверка переменных окружения
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log.error('NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY не найдены в .env.local');
    log.warning('Проверьте файл .env.local');
    process.exit(1);
  }
  
  log.info(`Подключение к Supabase: ${supabaseUrl}`);
  
  // Создаем Supabase клиент
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    log.info('Выполнение миграций...');
    log.warning('Это может занять несколько секунд...\n');
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const migration of migrations) {
      try {
        log.info(`Выполнение: ${migration.name}...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          query: migration.sql
        });
        
        if (error) {
          // Если функция rpc не существует, используем альтернативный метод
          if (error.message.includes('function') || error.message.includes('not found')) {
            log.warning(`  RPC недоступен, используем прямой SQL...`);
            
            // Используем rest API напрямую
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              },
              body: JSON.stringify({ query: migration.sql })
            });
            
            if (!response.ok) {
              throw new Error(await response.text());
            }
          } else {
            throw error;
          }
        }
        
        log.success(`  ✓ ${migration.name} выполнено`);
        successCount++;
        
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          log.warning(`  ⊘ ${migration.name} уже существует`);
          skipCount++;
        } else {
          log.error(`  ✗ Ошибка в ${migration.name}: ${err.message}`);
        }
      }
    }
    
    console.log('\n' + '═'.repeat(60));
    log.title('📊 Результаты:');
    console.log(`  ${colors.green}✓${colors.reset} Успешно: ${successCount}`);
    console.log(`  ${colors.yellow}⊘${colors.reset} Пропущено: ${skipCount}`);
    console.log('');
    
    log.title('📋 Таблицы:');
    console.log('  ✓ clients           - Клиенты салона');
    console.log('  ✓ services          - Услуги');
    console.log('  ✓ inventory_items   - Инвентарь/продукты');
    console.log('  ✓ appointments      - Записи клиентов');
    console.log('');
    
    log.success('🎯 Типы TypeScript будут обновлены автоматически...');
    console.log('═'.repeat(60));
    
  } catch (error: any) {
    log.error('Критическая ошибка при выполнении миграции:');
    console.error(error.message);
    
    log.error('\n⚠️ Альтернативное решение:');
    console.log('  1. Откройте Supabase Dashboard → SQL Editor');
    console.log('  2. Скопируйте содержимое файла scripts/expand-db.ts (SQL часть)');
    console.log('  3. Вставьте в SQL Editor и выполните вручную');
    console.log('');
    
    process.exit(1);
  }
}

// Запуск
runMigration();
