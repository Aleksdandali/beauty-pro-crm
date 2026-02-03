#!/usr/bin/env node

/**
 * Beauty Pro CRM - Direct Database Migration via Supabase REST API
 * Прямая миграция через REST API Supabase
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Загружаем .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY не найдены');
  process.exit(1);
}

console.log('\n🚀 Beauty Pro CRM - Прямая Миграция БД\n');
console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 API Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

// SQL миграции (разбиты на части)
const migrations = [
  {
    name: '1. Extensions',
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  },
  {
    name: '2. Salons Table',
    sql: `
CREATE TABLE IF NOT EXISTS salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
    `
  },
  {
    name: '3. Staff Table',
    sql: `
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'master' CHECK (role IN ('owner', 'admin', 'master')),
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
    `
  },
  {
    name: '4. Clients Table',
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

CREATE INDEX IF NOT EXISTS idx_clients_salon_id ON clients(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
    `
  },
  {
    name: '5. Services Table',
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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
    `
  },
  {
    name: '6. Inventory Table',
    sql: `
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

CREATE INDEX IF NOT EXISTS idx_inventory_salon_id ON inventory_items(salon_id);
    `
  },
  {
    name: '7. Appointments Table',
    sql: `
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

CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_master_time ON appointments(master_id, start_time);
    `
  },
  {
    name: '8. RLS Policies',
    sql: `
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their salon" ON salons;
CREATE POLICY "Users can view their salon" 
ON salons FOR SELECT 
USING (id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can view salon staff" ON staff;
CREATE POLICY "Staff can view salon staff" 
ON staff FOR SELECT 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can view clients" ON clients;
CREATE POLICY "Staff can view clients" 
ON clients FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can view services" ON services;
CREATE POLICY "Staff can view services" 
ON services FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can manage inventory" ON inventory_items;
CREATE POLICY "Staff can manage inventory" 
ON inventory_items FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;
CREATE POLICY "Staff can manage appointments" 
ON appointments FOR ALL 
USING (salon_id IN (SELECT salon_id FROM staff WHERE user_id = auth.uid()));
    `
  },
  {
    name: '9. Triggers',
    sql: `
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `
  }
];

console.log('\n📝 Выполнение миграций...\n');
console.log('⚠️  ВАЖНО: Этот скрипт выполнит SQL через REST API.');
console.log('⚠️  Для выполнения миграции вам нужно:');
console.log('');
console.log('1. Открыть Supabase Dashboard:');
console.log(`   ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/editor`);
console.log('');
console.log('2. Скопировать SQL из файла QUICK_FIX.md');
console.log('');
console.log('3. Вставить в SQL Editor и нажать Run');
console.log('');
console.log('═'.repeat(60));
console.log('');
console.log('💡 Суп abase REST API не поддерживает прямое выполнение DDL команд');
console.log('   (CREATE TABLE, ALTER TABLE и т.д.) через публичный API.');
console.log('');
console.log('   Используйте SQL Editor в Dashboard или Supabase CLI.');
console.log('');
console.log('🚀 Откроем Dashboard для вас...');
console.log('');

// Открываем браузер с SQL Editor
const editorUrl = `https://supabase.com/dashboard/project/ndrqxlawxvfnloyzrpyo/editor`;

// Проверяем операционную систему и открываем браузер
const { exec } = require('child_process');
const openCommand = process.platform === 'darwin' ? 'open' : 
                   process.platform === 'win32' ? 'start' : 
                   'xdg-open';

exec(`${openCommand} "${editorUrl}"`, (error) => {
  if (error) {
    console.log(`\n📋 Скопируйте эту ссылку в браузер:\n   ${editorUrl}`);
  } else {
    console.log(`✅ SQL Editor открыт в браузере!`);
  }
  
  console.log('\n═'.repeat(60));
  console.log('\n📄 SQL для выполнения сохранён в файле: QUICK_FIX.md');
  console.log('\n✨ Скопируйте SQL из QUICK_FIX.md и выполните в SQL Editor');
  console.log('');
});
