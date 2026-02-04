#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ndrqxlawxvfnloyzrpyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcnF4bGF3eHZmbmxveXpycHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTM0MTQsImV4cCI6MjA1NDA2OTQxNH0.FQHpdt4E7Ny3_Vny4oSrMvCPyLbOGNzd4J7Xmzq7iZo';

console.log('🚀 Применяю миграцию 002_add_city_to_salons.sql...\n');

// Читаем SQL файл
const sqlPath = path.join(__dirname, '../supabase/migrations/002_add_city_to_salons.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8').trim();

console.log('📝 SQL запрос:');
console.log(sql);
console.log('\n' + '='.repeat(60) + '\n');

console.log('❌ К сожалению, Supabase не позволяет выполнять DDL (ALTER TABLE)');
console.log('   через JavaScript client с anon key по соображениям безопасности.\n');

console.log('✅ РЕШЕНИЕ: Просто скопируй и выполни в Supabase Dashboard\n');
console.log('🔗 Ссылка: https://supabase.com/dashboard/project/ndrqxlawxvfnloyzrpyo/sql/new\n');
console.log('📋 SQL для копирования:');
console.log('┌' + '─'.repeat(58) + '┐');
console.log('│ ' + sql.padEnd(56) + ' │');
console.log('└' + '─'.repeat(58) + '┘\n');

console.log('⏱️  Займет 10 секунд:');
console.log('   1. Открыть ссылку выше');
console.log('   2. Вставить SQL');
console.log('   3. Нажать RUN');
console.log('   4. Готово! ✅\n');

console.log('💡 Альтернатива: Дай мне Service Role Key и я сделаю автоматически');
