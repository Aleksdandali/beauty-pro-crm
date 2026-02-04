#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
const SERVICE_ROLE_KEY = 'sbp_v0_08b0dc26371bf18cbb25179e9b4677dfc36e5a4f';

console.log('🚀 Применяю миграцию через Service Role Key...\n');

// Создаем клиент с service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Читаем SQL файл
const sqlPath = path.join(__dirname, '../supabase/migrations/002_add_city_to_salons.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8').trim();

console.log('📝 SQL запрос:');
console.log(sql);
console.log('\n' + '='.repeat(60) + '\n');

async function applyMigration() {
  try {
    // Supabase JS client не поддерживает прямое выполнение ALTER TABLE
    // Используем RPC или прямой SQL endpoint
    
    console.log('⚠️  Supabase JS client не поддерживает DDL операции напрямую\n');
    console.log('✅ Но я могу показать вам простой способ:\n');
    console.log('🔗 Откройте: https://supabase.com/dashboard/project/ndrqxlawxvfnloyzrpyo/sql/new');
    console.log('\n📋 Вставьте этот SQL:');
    console.log('┌' + '─'.repeat(58) + '┐');
    console.log('│ ALTER TABLE salons ADD COLUMN IF NOT EXISTS city TEXT; │');
    console.log('└' + '─'.repeat(58) + '┘\n');
    console.log('▶️  Нажмите RUN\n');
    console.log('✅ Готово! Займет 10 секунд\n');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

applyMigration();
