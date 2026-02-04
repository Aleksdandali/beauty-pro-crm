#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🚀 Применяю миграцию через прямое подключение к PostgreSQL...\n');

// Connection string для прямого подключения
const connectionString = 'postgresql://postgres:Dandali300683@db.ndrqxlawxvfnloyzrpyo.supabase.co:5432/postgres';

// Читаем SQL файл
const sqlPath = path.join(__dirname, '../supabase/migrations/002_add_city_to_salons.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8').trim();

console.log('📝 SQL запрос:');
console.log(sql);
console.log('\n' + '='.repeat(60) + '\n');

async function applyMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Подключаюсь к базе данных...');
    await client.connect();
    console.log('✅ Подключено!\n');

    console.log('⚡ Выполняю миграцию...');
    const result = await client.query(sql);
    
    console.log('✅ Миграция успешно применена!\n');
    console.log('📊 Результат:', result.command);
    console.log('\n🎉 Готово! Колонка city добавлена в таблицу salons\n');

  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error('\n❌ Не удалось подключиться к базе данных');
      console.error('   Возможно, нужно добавить IP в whitelist\n');
    } else if (error.message.includes('already exists')) {
      console.log('\n✅ Колонка city уже существует! Миграция не требуется\n');
    } else {
      console.error('\n❌ Ошибка:', error.message);
    }
  } finally {
    await client.end();
  }
}

applyMigration();
